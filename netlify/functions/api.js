import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { v4 as uuidv4 } from 'uuid';
import serverless from 'serverless-http';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

// Initialize Express App
const app = express();
app.use(cors());
app.use(express.json());

// Initialize Clients from Environment Variables
const supabase = createClient(process.env.REELCV_SUPABASE_URL, process.env.REELCV_SUPABASE_ANON_KEY);
const s3Client = new S3Client({
    region: process.env.REELCV_AWS_REGION,
    credentials: {
        accessKeyId: process.env.REELCV_AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.REELCV_AWS_SECRET_ACCESS_KEY,
    },
});

const router = express.Router();

// --- AUTH MIDDLEWARE (with Role Check) ---
const authenticateToken = (allowedRoles = ['candidate', 'proctor', 'admin']) => (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (token == null) return res.sendStatus(401); // if there isn't any token

    jwt.verify(token, process.env.REELCV_JWT_SECRET, (err, user) => {
        if (err) {
            console.error("JWT Verification Error:", err);
            return res.sendStatus(403);
        }
        if (!allowedRoles.includes(user.role)) {
            return res.sendStatus(403); // Forbidden
        }
        req.user = user;
        next();
    });
};

// --- AUTH ROUTES ---
router.post('/auth/register', async (req, res) => {
    const { email, password, firstName, lastName, role = 'candidate' } = req.body;
    
    console.log('Registration attempt:', { email, firstName, lastName, role });
    
    if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required.' });
    }

    if (!firstName || !lastName) {
        return res.status(400).json({ error: 'First name and last name are required.' });
    }

    try {
        // Check if user already exists
        const { data: existingUser, error: checkError } = await supabase
            .from('User')
            .select('id')
            .eq('email', email)
            .single();

        if (existingUser) {
            return res.status(409).json({ error: 'User with this email already exists.' });
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        // Create user with proper field mapping
        const { data, error } = await supabase
            .from('User')
            .insert([{ 
                email, 
                passwordHash, 
                firstName, 
                lastName, 
                role: role || 'candidate'
            }])
            .select('id, email, firstName, lastName, role')
            .single();

        if (error) {
            console.error("Supabase insert error:", error);
            if (error.code === '23505') { // Unique constraint violation
                return res.status(409).json({ error: 'User with this email already exists.' });
            }
            return res.status(500).json({ error: 'Failed to create user account. Please try again.' });
        }

        console.log('User created successfully:', data);
        res.status(201).json({ message: 'User created successfully', user: data });
    } catch (error) {
        console.error("Registration error:", error);
        res.status(500).json({ error: 'Failed to create user account. Please try again.' });
    }
});

router.post('/auth/login', async (req, res) => {
    const { email, password } = req.body;
    
    console.log('Login attempt for:', email);
    
    try {
        const { data: user, error } = await supabase
            .from('User')
            .select('*')
            .eq('email', email)
            .single();

        if (error || !user) {
            console.log('User not found:', error);
            return res.status(404).json({ error: 'User not found.' });
        }

        const validPassword = await bcrypt.compare(password, user.passwordHash);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid password.' });
        }

        const payload = { id: user.id, email: user.email, role: user.role, firstName: user.firstName };
        const accessToken = jwt.sign(payload, process.env.REELCV_JWT_SECRET, { expiresIn: '1d' });

        console.log('Login successful for:', email);
        res.json({
            accessToken,
            user: { 
                id: user.id, 
                email: user.email, 
                firstName: user.firstName, 
                lastName: user.lastName,
                role: user.role 
            },
        });
    } catch (error) {
        console.error("Login error:", error);
        res.status(500).json({ error: 'Failed to log in.' });
    }
});

// --- CORE APPLICATION ROUTES ---
router.post('/get-signed-url', authenticateToken(), async (req, res) => {
    const { fileName, fileType } = req.body;
    const uniqueFileName = `${uuidv4()}-${fileName}`;
    const command = new PutObjectCommand({
        Bucket: process.env.REELCV_AWS_S3_BUCKET_NAME,
        Key: uniqueFileName,
        ContentType: fileType,
    });
    try {
        const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 600 });
        const publicUrl = `https://${process.env.REELCV_AWS_S3_BUCKET_NAME}.s3.${process.env.REELCV_AWS_REGION}.amazonaws.com/${uniqueFileName}`;
        res.json({ signedUrl, publicUrl });
    } catch (error) {
        console.error("Get Signed URL error:", error);
        res.status(500).json({ error: 'Could not generate upload URL.' });
    }
});

router.get('/skills', authenticateToken(), async (req, res) => {
    try {
        const { data, error } = await supabase.from('Skill').select('*').order('name');
        if (error) {
            console.error("Fetch skills error:", error);
            return res.status(500).json({ error: error.message });
        }
        res.json(data);
    } catch (error) {
        console.error("Catch block fetch skills error:", error);
        res.status(500).json({ error: 'Failed to fetch skills.' });
    }
});

router.post('/skills/submit', authenticateToken(['candidate']), async (req, res) => {
    const { skillId, videoUrl } = req.body;
    const candidateId = req.user.id;
    
    try {
        const { data, error } = await supabase
            .from('Assessment')
            .insert([{ skillId, videoUrl, candidateId, status: 'pending_AI_analysis' }])
            .select('id')
            .single();
        
        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: error.message });
        }
        
        simulateAIAssessment(data.id);
        res.status(201).json(data);
    } catch (error) {
        console.error('Error in /skills/submit endpoint:', error);
        res.status(500).json({ error: 'Failed to submit assessment.' });
    }
});

// --- DASHBOARD & PROCTORING APIS ---
router.get('/assessments', authenticateToken(['candidate']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Assessment')
            .select('*, Skill(name)')
            .eq('candidateId', req.user.id)
            .order('created_at', { ascending: false });
        
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assessments.' });
    }
});

router.get('/assessments/:id', authenticateToken(), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Assessment')
            .select('*, Skill(name), User(firstName, lastName)')
            .eq('id', req.params.id)
            .single();
        
        if (error || !data) return res.status(404).json({ error: 'Assessment not found' });
        
        if (req.user.role === 'candidate' && data.candidateId !== req.user.id) {
            return res.status(403).json({ error: 'Access denied' });
        }
        
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch assessment details.' });
    }
});

router.post('/assessments/:id/request-proctor', authenticateToken(['candidate']), async (req, res) => {
    try {
        const { error } = await supabase
            .from('Assessment')
            .update({ status: 'proctor_requested' })
            .eq('id', req.params.id)
            .eq('candidateId', req.user.id);
        
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: 'Proctor request sent successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to request proctor verification.' });
    }
});

router.get('/proctor/requests/pending', authenticateToken(['proctor']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Assessment')
            .select('*, Skill(name), User(firstName, lastName)')
            .eq('status', 'proctor_requested')
            .order('created_at', { ascending: true });
        
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch pending requests.' });
    }
});

router.post('/assessments/:id/proctor-verify', authenticateToken(['proctor']), async (req, res) => {
    const { proctorRating, proctorComments, integrityStatus } = req.body;
    
    try {
        const { error } = await supabase
            .from('Assessment')
            .update({
                status: 'proctor_verified',
                proctorId: req.user.id,
                proctorRating: parseFloat(proctorRating),
                proctorComments,
                integrityStatus,
            })
            .eq('id', req.params.id);
        
        if (error) return res.status(500).json({ error: error.message });
        res.status(200).json({ message: 'Assessment verified successfully.' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to verify assessment.' });
    }
});

router.get('/proctor/verifications', authenticateToken(['proctor']), async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('Assessment')
            .select('*, Skill(name), User(firstName, lastName)')
            .eq('proctorId', req.user.id)
            .eq('status', 'proctor_verified')
            .order('created_at', { ascending: false });
        
        if (error) return res.status(500).json({ error: error.message });
        res.json(data);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch verifications.' });
    }
});

// Health check endpoint
router.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        environment: {
            hasSupabaseUrl: !!process.env.REELCV_SUPABASE_URL,
            hasSupabaseKey: !!process.env.REELCV_SUPABASE_ANON_KEY,
            hasJwtSecret: !!process.env.REELCV_JWT_SECRET
        }
    });
});

// AI Simulation Function
const simulateAIAssessment = (assessmentId) => {
    console.log(`Starting AI simulation for Assessment ID: ${assessmentId}`);
    
    // UPDATED: Reduced timeout from 10 seconds to 5 seconds
    setTimeout(async () => {
        const aiRating = (Math.random() * (4.9 - 3.5) + 3.5).toFixed(1);
        const aiFeedback = "AI observed strong eye contact (85% consistency), fluent speech pace (130-140 WPM), and 90% positive sentiment. Area for development: minimize filler words at start of sentences.";
        
        const { error } = await supabase
            .from('Assessment')
            .update({ AI_rating: aiRating, AI_feedback: aiFeedback, status: 'AI_rated' })
            .eq('id', assessmentId);

        if (error) {
            console.error(`AI simulation failed for Assessment ID ${assessmentId}:`, error);
        } else {
            console.log(`AI simulation finished for Assessment ID: ${assessmentId}`);
        }
    }, 5000); // Changed to 5 seconds
};

app.use('/.netlify/functions/api', router);
export const handler = serverless(app);
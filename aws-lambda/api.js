const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { createClient } = require('@supabase/supabase-js');
const serverless = require('serverless-http');

const app = express();

// Initialize Supabase client
const supabase = createClient(
  process.env.REELCV_SUPABASE_URL,
  process.env.REELCV_SUPABASE_SERVICE_ROLE_KEY
);

// Middleware
app.use(cors({
  origin: process.env.REELCV_FRONTEND_URL || '*',
  credentials: true
}));
app.use(express.json());

// Enhanced permission-checking middleware
const checkPermission = (requiredPermission) => async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.REELCV_JWT_SECRET);
    req.user = decoded;

    // Fetch user's permissions from the database using the new RBAC system
    const { data: permissions, error } = await supabase
      .rpc('get_user_permissions', { user_id: decoded.id });

    if (error) {
      console.error('Permission check error:', error);
      return res.status(500).json({ error: 'Could not verify permissions' });
    }

    const userPermissions = permissions.map(p => p.permission_name);

    // Check if user has the required permission
    if (!userPermissions.includes(requiredPermission)) {
      return res.status(403).json({ 
        error: 'Insufficient permissions',
        required: requiredPermission,
        available: userPermissions
      });
    }

    // Add permissions to request object for further use
    req.userPermissions = userPermissions;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    if (error.name === 'JsonWebTokenError') {
      return res.status(403).json({ error: 'Invalid token' });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(403).json({ error: 'Token expired' });
    }
    return res.status(500).json({ error: 'Authentication failed' });
  }
};

// Authentication routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get user from Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Get user details from User table with role information
    const { data: userData, error: userError } = await supabase
      .from('User')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('id', authData.user.id)
      .single();

    if (userError || !userData) {
      return res.status(404).json({ error: 'User profile not found' });
    }

    // Create JWT token with user info and role_id
    const tokenPayload = {
      id: userData.id,
      email: userData.email,
      role: userData.role,
      role_id: userData.role_id,
      firstName: userData.firstName,
      lastName: userData.lastName
    };

    const token = jwt.sign(tokenPayload, process.env.REELCV_JWT_SECRET, {
      expiresIn: '24h'
    });

    res.json({
      token,
      user: tokenPayload,
      role_info: userData.roles
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Register user with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          firstName,
          lastName,
          role: 'candidate'
        }
      }
    });

    if (authError) {
      return res.status(400).json({ error: authError.message });
    }

    res.json({
      message: 'Registration successful',
      user: authData.user
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed' });
  }
});

// Skills routes
app.get('/skills', checkPermission('skill:read'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Skill')
      .select('*')
      .order('name');

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Skills fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch skills' });
  }
});

// Assessment routes
app.post('/assessments', checkPermission('assessment:create'), async (req, res) => {
  try {
    const { skillId, videoUrl } = req.body;

    if (!skillId || !videoUrl) {
      return res.status(400).json({ error: 'Skill ID and video URL are required' });
    }

    const { data, error } = await supabase
      .from('Assessment')
      .insert([{
        candidateId: req.user.id,
        skillId,
        videoUrl,
        status: 'pending_AI_analysis'
      }])
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Assessment creation error:', error);
    res.status(500).json({ error: 'Failed to create assessment' });
  }
});

app.get('/assessments', checkPermission('assessment:read_own'), async (req, res) => {
  try {
    let query = supabase
      .from('Assessment')
      .select(`
        *,
        Skill (
          name
        ),
        User!Assessment_candidateId_fkey (
          firstName,
          lastName
        )
      `);

    // Apply filters based on user permissions
    if (req.userPermissions.includes('assessment:read_all')) {
      // Admin/Proctor can see all assessments
      query = query.order('created_at', { ascending: false });
    } else if (req.userPermissions.includes('assessment:read_verified')) {
      // Recruiter can see only verified assessments
      query = query.eq('status', 'proctor_verified').order('created_at', { ascending: false });
    } else {
      // Candidate can see only their own assessments
      query = query.eq('candidateId', req.user.id).order('created_at', { ascending: false });
    }

    const { data, error } = await query;

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Assessments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessments' });
  }
});

app.get('/assessments/:id', checkPermission('assessment:read_own'), async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('Assessment')
      .select(`
        *,
        Skill (
          name
        ),
        User!Assessment_candidateId_fkey (
          firstName,
          lastName
        )
      `)
      .eq('id', id)
      .single();

    if (error) throw error;

    // Check access permissions
    if (!req.userPermissions.includes('assessment:read_all') && 
        !req.userPermissions.includes('assessment:verify') &&
        data.candidateId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json(data);
  } catch (error) {
    console.error('Assessment fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch assessment' });
  }
});

app.put('/assessments/:id', checkPermission('assessment:update_own'), async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    // Get current assessment to check permissions
    const { data: currentAssessment, error: fetchError } = await supabase
      .from('Assessment')
      .select('candidateId')
      .eq('id', id)
      .single();

    if (fetchError) throw fetchError;

    // Check if user can update this assessment
    if (!req.userPermissions.includes('assessment:verify') && 
        !req.userPermissions.includes('assessment:read_all') &&
        currentAssessment.candidateId !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // If this is a proctor verification, add proctor ID
    if (req.userPermissions.includes('assessment:verify') && updates.status === 'proctor_verified') {
      updates.proctorId = req.user.id;
    }

    const { data, error } = await supabase
      .from('Assessment')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Assessment update error:', error);
    res.status(500).json({ error: 'Failed to update assessment' });
  }
});

// Recruiter-specific routes
app.get('/recruiter/assessments', checkPermission('assessment:read_verified'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('Assessment')
      .select(`
        *,
        Skill (
          id,
          name
        ),
        User!Assessment_candidateId_fkey (
          id,
          firstName,
          lastName,
          email
        )
      `)
      .eq('status', 'proctor_verified')
      .order('created_at', { ascending: false });

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Recruiter assessments fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch verified assessments' });
  }
});

// User profile routes
app.get('/users/profile', checkPermission('user:read_own'), async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('User')
      .select(`
        *,
        roles (
          id,
          name,
          description
        )
      `)
      .eq('id', req.user.id)
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/users/profile', checkPermission('user:update_own'), async (req, res) => {
  try {
    const updates = req.body;
    
    // Remove sensitive fields that shouldn't be updated via this endpoint
    delete updates.id;
    delete updates.role_id;
    delete updates.created_at;

    const { data, error } = await supabase
      .from('User')
      .update(updates)
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '2.0.0-rbac'
  });
});

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Export for AWS Lambda
module.exports.handler = serverless(app);
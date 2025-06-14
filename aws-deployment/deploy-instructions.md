# AWS Lambda Deployment Instructions

## Phase 3: AWS Infrastructure Provisioning

### Step 1: Create IAM Role

1. Go to AWS IAM Console
2. Create a new role with the following settings:
   - **Trusted entity**: AWS Lambda
   - **Permissions**: `AWSLambdaBasicExecutionRole`
   - **Role name**: `ReelCV-Lambda-ExecutionRole`

### Step 2: Create Lambda Function

1. Go to AWS Lambda Console
2. Create function with these settings:
   - **Function name**: `reelcv-api`
   - **Runtime**: Node.js 18.x or later
   - **Execution role**: Use existing role `ReelCV-Lambda-ExecutionRole`

### Step 3: Configure Environment Variables

In the Lambda function configuration, add these environment variables:

```
REELCV_SUPABASE_URL=your_supabase_url
REELCV_SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
REELCV_JWT_SECRET=your_jwt_secret
REELCV_FRONTEND_URL=your_frontend_url
NODE_ENV=production
```

### Step 4: Create API Gateway

1. Go to AWS API Gateway Console
2. Create a new HTTP API with these settings:
   - **API name**: `reelcv-api-gateway`
   - **Description**: ReelCV API Gateway with RBAC

3. Create a route:
   - **Method**: ANY
   - **Resource path**: `/{proxy+}`
   - **Integration**: Lambda function `reelcv-api`

4. Enable CORS if needed for your frontend domain

### Step 5: Deploy the Code

1. Create deployment package:
   ```bash
   cd aws-lambda
   npm install --production
   zip -r reelcv-api.zip . -x "*.md" "deploy-instructions.md"
   ```

2. Upload to Lambda:
   - Go to Lambda function console
   - Upload the `reelcv-api.zip` file
   - Set handler to `api.handler`

### Step 6: Test the Deployment

1. Get the API Gateway invoke URL
2. Test the health endpoint: `GET /health`
3. Verify authentication endpoints work

## Phase 4: Frontend Configuration

Update your frontend environment variables:

```env
VITE_API_BASE_URL=https://your-api-gateway-url
```

## Phase 5: Cleanup

1. Remove `netlify/functions` directory
2. Update `netlify.toml` to remove functions configuration
3. Update any hardcoded API URLs in the frontend

## Security Considerations

1. **API Gateway Throttling**: Configure rate limiting
2. **Lambda Timeout**: Set appropriate timeout (30 seconds recommended)
3. **Environment Variables**: Ensure all secrets are properly configured
4. **CORS**: Configure CORS for your specific frontend domain
5. **Monitoring**: Set up CloudWatch logs and alarms

## Cost Optimization

1. **Lambda Memory**: Start with 512MB and adjust based on performance
2. **API Gateway Caching**: Enable caching for frequently accessed endpoints
3. **Dead Letter Queue**: Configure for failed invocations
4. **Reserved Concurrency**: Set if needed to control costs

## Monitoring and Logging

1. Enable CloudWatch logs for Lambda function
2. Set up CloudWatch alarms for errors and latency
3. Consider using AWS X-Ray for distributed tracing
4. Monitor API Gateway metrics for request patterns
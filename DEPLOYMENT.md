# Deployment Guide for TeaLeak.com

## Issues Fixed

1. **405 Error Resolution**: Removed unnecessary Authorization header from client-side requests
2. **Supabase Function Configuration**: Added proper CORS headers and method validation
3. **Environment Variables**: Configured proper build process for Vercel deployment

## Vercel Deployment Steps

### 1. Set Environment Variables in Vercel

In your Vercel dashboard, go to your project settings and add these environment variables:

- `SUPABASE_FUNCTION_URL`: Your Supabase Edge Function URL
- `SUPABASE_ANON_KEY`: Your Supabase anonymous key (optional for this setup)
- `GEMINI_API_KEY`: Your Google Gemini API key (set this in Supabase dashboard)

### 2. Supabase Function Deployment

Make sure your Supabase function is properly deployed:

```bash
# Install Supabase CLI if not already installed
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Deploy the function
supabase functions deploy gemini-tea
```

### 3. Set Gemini API Key in Supabase

In your Supabase dashboard:
1. Go to Project Settings > Edge Functions
2. Add environment variable: `GEMINI_API_KEY` with your Google AI API key

### 4. Verify Deployment

1. Check that your Supabase function URL is accessible
2. Test the chatbot functionality
3. Monitor Vercel deployment logs for any issues

## Troubleshooting

- **405 Error**: Usually means the function URL is incorrect or the function isn't deployed
- **CORS Issues**: Check that the function has proper CORS headers
- **Environment Variables**: Ensure they're set in both Vercel and Supabase dashboards

## Local Development

```bash
# Build the project
npm run build

# Start local server
npm run dev
```

The build process will inject environment variables into the HTML file for proper deployment.
# TeaLeak.com - Satirical News Site

A modern, interactive website featuring an AI-powered chatbot named Tea for the satirical news site TeaLeak.com.

## Features

- 🤖 AI-powered chatbot with personality (powered by Google Gemini)
- 🎨 Modern, responsive design with glassmorphism effects
- 🔒 Security-focused implementation with proper sanitization
- ⚡ Fast loading with optimized assets
- 📱 Mobile-friendly responsive design

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **AI Backend**: Supabase Edge Functions with Google Gemini API
- **Deployment**: Vercel
- **Styling**: Custom CSS with glassmorphism and animations

## Deployment on Vercel

### 1. Environment Variables Setup

In your Vercel dashboard, add these environment variables:

```bash
SUPABASE_FUNCTION_URL=https://your-project.supabase.co/functions/v1/gemini-tea
SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

### 2. Vercel CLI Deployment

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables
vercel env add SUPABASE_FUNCTION_URL
vercel env add SUPABASE_ANON_KEY

# Redeploy with environment variables
vercel --prod
```

### 3. GitHub Integration

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - Go to Project Settings → Environment Variables
   - Add `SUPABASE_FUNCTION_URL` and `SUPABASE_ANON_KEY`
3. Trigger a new deployment

## Local Development

```bash
# Start local server
npm run dev
# or
python -m http.server 8000
```

## Security Features

- ✅ HTML entity escaping to prevent XSS
- ✅ Environment variables for sensitive data
- ✅ Request timeout handling
- ✅ Security headers (CSP, XSS Protection, etc.)
- ✅ Safe DOM manipulation

## File Structure

```
tea/
├── index.html          # Main website file
├── tealeak.png         # Logo image
├── robots.txt          # SEO robots file
├── sitemap.xml         # SEO sitemap
├── package.json        # Node.js dependencies and scripts
├── build.js           # Build script for environment variables
├── vercel.json        # Vercel deployment configuration
├── supabase/
│   └── functions/
│       └── gemini-tea/
│           └── index.ts # Supabase Edge Function
└── README.md          # This file
```

## Supabase Setup

1. Create a new Supabase project
2. Deploy the Edge Function in `supabase/functions/gemini-tea/`
3. Set up your Google Gemini API key in Supabase environment variables
4. Update the function URL in your Vercel environment variables

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally
5. Submit a pull request

## License

MIT License - see LICENSE file for details

---

**Note**: This is a satirical/parody website. All content is for entertainment purposes only.
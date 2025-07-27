// Build script to inject environment variables into HTML for Vercel deployment
const fs = require('fs');
const path = require('path');

// Read the HTML file
const htmlPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Get environment variables
const supabaseFunctionUrl = process.env.SUPABASE_FUNCTION_URL || 'https://keuxuonslkcvdeysdoge.supabase.co/functions/v1/gemini-tea';
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || '';

// Debug logging for Vercel
console.log('Environment variables during build:');
console.log('SUPABASE_FUNCTION_URL:', supabaseFunctionUrl);
console.log('SUPABASE_ANON_KEY:', supabaseAnonKey ? '[SET]' : '[NOT SET]');

// Create the environment variables script
const envScript = `
    <script>
        window.SUPABASE_FUNCTION_URL = '${supabaseFunctionUrl}';
        window.SUPABASE_ANON_KEY = '${supabaseAnonKey}';
    </script>`;

// Inject the script before the closing head tag
htmlContent = htmlContent.replace('</head>', `${envScript}\n</head>`);

// Write the modified HTML to a build directory
const buildDir = path.join(__dirname, 'dist');
if (!fs.existsSync(buildDir)) {
    fs.mkdirSync(buildDir);
}

fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);

// Copy other static files
const staticFiles = ['tealeak.png', 'robots.txt', 'sitemap.xml', 'styles.css', 'script.js'];
staticFiles.forEach(file => {
    if (fs.existsSync(path.join(__dirname, file))) {
        fs.copyFileSync(path.join(__dirname, file), path.join(buildDir, file));
    }
});

console.log('Build completed successfully!');
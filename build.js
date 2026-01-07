// build.js - Injects credentials directly into index.html
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY environment variables are required!');
  process.exit(1);
}

// Read the index.html file
const indexPath = path.join(__dirname, 'index.html');
let htmlContent = fs.readFileSync(indexPath, 'utf8');

// Replace placeholders with actual values
htmlContent = htmlContent.replace('__SUPABASE_URL__', supabaseUrl);
htmlContent = htmlContent.replace('__SUPABASE_KEY__', supabaseKey);

// Write the modified HTML back
fs.writeFileSync(indexPath, htmlContent);

console.log('✅ Credentials injected into index.html successfully');
console.log('⚠️  Note: index.html now contains real credentials - do not commit this file!');

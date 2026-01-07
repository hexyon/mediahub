// build.js - Injects configuration directly into index.html from environment variables
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY environment variables are required!');
  process.exit(1);
}

// Read the template index.html
const indexPath = path.join(__dirname, 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');

// Create inline config script
const inlineConfig = `<script>
    // MediaHub Configuration - Injected at build time
    const CONFIG = {
        SUPABASE_URL: '${supabaseUrl}',
        SUPABASE_KEY: '${supabaseKey}'
    };
  </script>`;

// Replace the config.js script tag with inline config
indexContent = indexContent.replace(
  '<script src="config.js"></script>',
  inlineConfig
);

// Write the modified index.html back
fs.writeFileSync(indexPath, indexContent);
console.log('✅ Configuration injected into index.html successfully');
console.log('⚠️  Note: config.js is no longer generated or needed');

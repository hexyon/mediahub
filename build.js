// build.js - Generates config.js from environment variables
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('ERROR: SUPABASE_URL and SUPABASE_KEY environment variables are required!');
  process.exit(1);
}

const configContent = `// MediaHub Configuration
// This file is auto-generated during build from environment variables

const CONFIG = {
    SUPABASE_URL: '${supabaseUrl}',
    SUPABASE_KEY: '${supabaseKey}'
};
`;

fs.writeFileSync(path.join(__dirname, 'config.js'), configContent);
console.log('✅ config.js generated successfully from environment variables');

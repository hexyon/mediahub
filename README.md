# MediaHub

A modern media viewer/gallery application with AI-powered image descriptions.

## Features

- Upload and view images and videos
- Full-screen viewing with navigation
- Optional background blur effect
- AI-powered image descriptions via Supabase
- Clean, modern UI with smooth animations

## Setup

1. **Configure Credentials**
   - Copy `config.example.txt` to `config.txt`
   - Fill in your Supabase URL and API key in `config.txt`
   - The `config.txt` file is gitignored and will not be committed

2. **Create config.js**
   - Create a file named `config.js` with the following content:
   ```javascript
   const CONFIG = {
     SUPABASE_URL: 'your_supabase_url',
     SUPABASE_KEY: 'your_supabase_anon_key'
   };
   ```
   - Replace the placeholder values with your actual Supabase credentials
   - This file is also gitignored for security

3. **Open the Application**
   - Simply open `index.html` in your web browser

## Security Note

⚠️ **IMPORTANT**: Never commit `config.txt` or `config.js` to version control. These files contain sensitive credentials and are protected by `.gitignore`.

## License

Copyright (c) 2024 Hexy. All rights reserved.

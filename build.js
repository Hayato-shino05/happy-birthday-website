#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Build script để inject environment variables vào Supabase config
function injectEnvironmentVariables() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
        // Inject vào supabase-config.js
        const configPath = path.join(__dirname, 'assets/js/supabase-config.js');
        let configContent = fs.readFileSync(configPath, 'utf8');
        
        configContent = configContent.replace(
            /const SUPABASE_URL = "\$\{SUPABASE_URL\}";/,
            `const SUPABASE_URL = '${supabaseUrl}';`
        );
        configContent = configContent.replace(
            /const SUPABASE_KEY = "\$\{SUPABASE_ANON_KEY\}";/,
            `const SUPABASE_KEY = '${supabaseKey}';`
        );
        
        fs.writeFileSync(configPath, configContent);
        
        // Inject vào album.js
        const albumPath = path.join(__dirname, 'assets/js/album.js');
        let albumContent = fs.readFileSync(albumPath, 'utf8');
        
        albumContent = albumContent.replace(
            /supabaseStorageUrl: '\$\{SUPABASE_URL\}\/storage\/v1\/object\/public\/media\/',/,
            `supabaseStorageUrl: '${supabaseUrl}/storage/v1/object/public/media/',`
        );
        
        fs.writeFileSync(albumPath, albumContent);
        
        console.log('✅ Environment variables injected successfully!');
        console.log('🔗 SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');
        console.log('🔑 SUPABASE_KEY:', supabaseKey.substring(0, 20) + '...');
        console.log('📸 Storage URL:', `${supabaseUrl}/storage/v1/object/public/media/`.substring(0, 50) + '...');
    } else {
        console.log('⚠️  Environment variables not found, keeping default values');
        console.log('Make sure to set SUPABASE_URL and SUPABASE_ANON_KEY in Vercel dashboard');
    }
}

// Chạy build script
injectEnvironmentVariables();

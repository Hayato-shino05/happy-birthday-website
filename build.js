#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// 環境変数をSupabase設定に注入するビルドスクリプト
function injectEnvironmentVariables() {
    const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;
    
    if (supabaseUrl && supabaseKey) {
        // supabase-config.jsに注入
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
        
        // album.jsに注入
        const albumPath = path.join(__dirname, 'assets/js/album.js');
        let albumContent = fs.readFileSync(albumPath, 'utf8');
        
        albumContent = albumContent.replace(
            /supabaseStorageUrl: '\$\{SUPABASE_URL\}\/storage\/v1\/object\/public\/media\/',/,
            `supabaseStorageUrl: '${supabaseUrl}/storage/v1/object/public/media/',`
        );
        
        fs.writeFileSync(albumPath, albumContent);
        
        console.log('✅ 環境変数の注入が完了しました！');
        console.log('🔗 SUPABASE_URL:', supabaseUrl.substring(0, 30) + '...');
        console.log('🔑 SUPABASE_KEY:', supabaseKey.substring(0, 20) + '...');
        console.log('📸 Storage URL:', `${supabaseUrl}/storage/v1/object/public/media/`.substring(0, 50) + '...');
    } else {
        console.log('⚠️  環境変数が見つかりません。デフォルト値を保持します');
        console.log('VercelダッシュボードでSUPABASE_URLとSUPABASE_ANON_KEYを設定してください');
    }
}

injectEnvironmentVariables();

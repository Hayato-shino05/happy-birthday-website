// 基本的なSupabase設定ファイル

// Supabase接続情報 - クライアントサイドJavaScriptで使用する固定値
// Environment variables configuration  
const SUPABASE_URL = "${SUPABASE_URL}";
const SUPABASE_KEY = "${SUPABASE_ANON_KEY}";
// Supabaseクライアントの初期化
let supabase;

// ドキュメントの準備ができたらSupabaseを初期化
document.addEventListener('DOMContentLoaded', () => {
    // Environment variables validation
    if (SUPABASE_URL === '${SUPABASE_URL}' || SUPABASE_KEY === '${SUPABASE_ANON_KEY}') {
        console.warn('⚠️ Supabase configuration not set! Make sure environment variables are configured.');
        console.warn('📋 Required environment variables:');
        console.warn('   • SUPABASE_URL - Your Supabase project URL');
        console.warn('   • SUPABASE_ANON_KEY - Your Supabase anonymous key');
        console.warn('🔧 Set these in Vercel dashboard: Project Settings → Environment Variables');
    }
    initSupabase();
});

/**
 * Supabase接続の初期化
 */
function initSupabase() {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabaseが初期化されました');
        
        // 接続確認
        checkSupabaseConnection();
    } catch (error) {
        console.error('Supabaseの初期化エラー:', error);
        alert('データベースに接続できません。ネットワーク接続を確認し、後でもう一度お試しください。');
    }
}

/**
 * Supabase接続を確認
 * @returns {Promise<boolean>} 接続ステータス
 */
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('birthdays').select('count');
        if (error) throw error;
        console.log('Supabase接続成功！');
        return true;
    } catch (error) {
        console.error('Supabase接続エラー:', error);
        return false;
    }
}

/**
 * Supabaseから誕生日リストを取得
 * @returns {Promise<Array>} 誕生日リスト
 */
async function getBirthdays() {
    try {
        const { data, error } = await supabase
            .from('birthdays')
            .select('*')
            .order('month')
            .order('day');
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('誕生日リスト取得エラー:', error);
        return [];
    }
}

/**
 * テキストメッセージを保存
 * @param {string} sender 送信者
 * @param {string} message メッセージ内容
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveCustomMessage(sender, message, birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('custom_messages')
            .insert([
                { 
                    sender: sender,
                    message: message,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('メッセージ保存エラー:', error);
        return false;
    }
}

/**
 * 誕生日の人に対する最新のテキストメッセージを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Object>} メッセージ
 */
async function getLatestCustomMessage(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('custom_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false })
            .limit(1);
            
        if (error) throw error;
        return data && data.length > 0 ? data[0] : null;
    } catch (error) {
        console.error('メッセージ取得エラー:', error);
        return null;
    }
}

/**
 * 音声データをSupabase Storageに保存
 * @param {Blob} audioBlob 音声データ
 * @param {string} sender 送信者
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveAudioMessageToSupabase(audioBlob, sender, birthdayPerson) {
    try {
        // ユニークなファイル名を作成
        const fileName = `audio_${Date.now()}.webm`;
        
        // 音声ファイルをアップロード
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('audio')
            .upload(fileName, audioBlob);
            
        if (fileError) throw fileError;
        
        // 公開URLを取得
        const { data: urlData } = await supabase
            .storage
            .from('audio')
            .getPublicUrl(fileName);
            
        const audioUrl = urlData.publicUrl;
        
        // データベースに情報を保存
        const { data, error } = await supabase
            .from('audio_messages')
            .insert([
                { 
                    sender: sender,
                    audio_data: audioUrl,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('音声メッセージ保存エラー:', error);
        return false;
    }
}

/**
 * 音声メッセージリストを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Array>} 音声メッセージリスト
 */
async function getAudioMessages(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('audio_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('音声メッセージ取得エラー:', error);
        return [];
    }
}

/**
 * 動画データをSupabase Storageに保存
 * @param {Blob} videoBlob 動画データ
 * @param {string} videoName 動画名
 * @param {string} sender 送信者
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<boolean>} 保存結果
 */
async function saveVideoMessageToSupabase(videoBlob, videoName, sender, birthdayPerson) {
    try {
        // 動画サイズを確認
        if (videoBlob.size > 10 * 1024 * 1024) { // 10MB制限
            throw new Error('動画が大きすぎます。サイズまたは長さを減らしてください。');
        }
        
        // ユニークなファイル名を作成
        const fileName = `video_${Date.now()}.webm`;
        
        // 動画ファイルをアップロード
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('video')
            .upload(fileName, videoBlob);
            
        if (fileError) throw fileError;
        
        // 公開URLを取得
        const { data: urlData } = await supabase
            .storage
            .from('video')
            .getPublicUrl(fileName);
            
        const videoUrl = urlData.publicUrl;
        
        // データベースに情報を保存
        const { data, error } = await supabase
            .from('video_messages')
            .insert([
                { 
                    sender: sender,
                    video_name: videoName,
                    video_url: videoUrl,
                    birthday_person: birthdayPerson
                }
            ]);
            
        if (error) throw error;
        return true;
    } catch (error) {
        console.error('動画メッセージ保存エラー:', error);
        alert('動画保存エラー: ' + error.message);
        return false;
    }
}

/**
 * 動画メッセージリストを取得
 * @param {string} birthdayPerson 受信者
 * @returns {Promise<Array>} 動画リスト
 */
async function getVideoMessages(birthdayPerson) {
    try {
        const { data, error } = await supabase
            .from('video_messages')
            .select('*')
            .eq('birthday_person', birthdayPerson)
            .order('created_at', { ascending: false });
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error('動画メッセージ取得エラー:', error);
        return [];
    }
}

/**
 * チャットのリアルタイムチャネルを設定
 */
function setupRealtimeChat() {
    const chatChannel = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload) => {
                // 新しいメッセージをUIに追加
                appendNewChatMessage(payload.new);
            }
        )
        .subscribe();
}

/**
 * 掲示板のリアルタイムチャネルを設定
 */
function setupRealtimeBulletin() {
    const bulletinChannel = supabase
        .channel('public:bulletin_posts')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'bulletin_posts' },
            (payload) => {
                // 掲示板を更新
                updateBulletinBoard(payload);
            }
        )
        .subscribe();
}

/**
 * バケットからメディアファイルのリストを取得
 * @param {string} bucketName バケット名（デフォルト: media）
 * @returns {Promise<Array>} メディアファイルリスト
 */
async function getMediaFiles(bucketName = 'media') {
    try {
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .list();
            
        if (error) throw error;
        return data || [];
    } catch (error) {
        console.error(`${bucketName}バケットからファイルリスト取得エラー:`, error);
        return [];
    }
}

/**
 * メディアファイルの公開URLを取得
 * @param {string} path ファイルパス
 * @param {string} bucketName バケット名（デフォルト: media）
 * @returns {string} 公開URL
 */
function getMediaUrl(path, bucketName = 'media') {
    try {
        const { data } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(path);
            
        return data.publicUrl;
    } catch (error) {
        console.error(`ファイル${path}のURL取得エラー:`, error);
        return null;
    }
}

/**
 * メディアバケット内のファイル数と種類を確認
 * @param {string} bucketName バケット名（デフォルト: media）
 * @returns {Promise<Object>} ファイル数情報
 */
async function getMediaStats(bucketName = 'media') {
    try {
        // バケット内のすべてのファイルを取得
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .list('', { limit: 1000 }); // より多くのファイルを取得するために制限を増やす
            
        if (error) throw error;
        
        if (!data || data.length === 0) {
            return {
                total: 0,
                images: 0,
                videos: 0,
                others: 0,
                fileList: []
            };
        }
        
        console.log(`${bucketName}バケット内に${data.length}ファイルが見つかりました`);
        
        // ファイルをフィルタリング（フォルダを除外）
        const files = data.filter(item => !item.metadata || item.metadata.mimetype);
        
        // タイプ別にファイル数をカウント
        const stats = {
            total: files.length,
            images: 0,
            videos: 0, 
            others: 0,
            fileList: files
        };
        
        files.forEach(file => {
            const name = file.name.toLowerCase();
            if (name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.png') || name.endsWith('.gif')) {
                stats.images++;
            } else if (name.endsWith('.mp4') || name.endsWith('.webm') || name.endsWith('.mov')) {
                stats.videos++;
            } else {
                stats.others++;
            }
        });
        
        console.log(`統計: ${stats.images}画像, ${stats.videos}動画, ${stats.others}その他のファイル`);
        
        return stats;
    } catch (error) {
        console.error(`${bucketName}バケットからメディア情報取得エラー:`, error);
        return {
            total: 0,
            images: 0,
            videos: 0,
            others: 0,
            error: error.message,
            fileList: []
        };
    }
}
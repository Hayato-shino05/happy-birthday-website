// Basic Supabase config file

// Thông tin kết nối Supabase - sử dụng giá trị cố định cho client-side JavaScript
const SUPABASE_URL = '';
const SUPABASE_KEY = '';

// Khởi tạo Supabase client
let supabase;

// Khởi tạo Supabase khi document đã sẵn sàng
document.addEventListener('DOMContentLoaded', () => {
    initSupabase();
});

/**
 * Khởi tạo kết nối Supabase
 */
function initSupabase() {
    try {
        supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
        console.log('Supabase đã được khởi tạo');
        
        // Kiểm tra kết nối
        checkSupabaseConnection();
    } catch (error) {
        console.error('Lỗi khi khởi tạo Supabase:', error);
        alert('Không thể kết nối đến cơ sở dữ liệu. Vui lòng kiểm tra kết nối mạng và thử lại sau.');
    }
}

/**
 * Kiểm tra kết nối Supabase
 * @returns {Promise<boolean>} Trạng thái kết nối
 */
async function checkSupabaseConnection() {
    try {
        const { data, error } = await supabase.from('birthdays').select('count');
        if (error) throw error;
        console.log('Supabase kết nối thành công!');
        return true;
    } catch (error) {
        console.error('Lỗi kết nối Supabase:', error);
        return false;
    }
}

/**
 * Lấy danh sách sinh nhật từ Supabase
 * @returns {Promise<Array>} Danh sách sinh nhật
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
        console.error('Lỗi khi lấy danh sách sinh nhật:', error);
        return [];
    }
}

/**
 * Lưu lời chúc văn bản
 * @param {string} sender Người gửi
 * @param {string} message Nội dung lời chúc
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<boolean>} Kết quả lưu
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
        console.error('Lỗi khi lưu lời chúc:', error);
        return false;
    }
}

/**
 * Lấy lời chúc văn bản mới nhất cho người sinh nhật
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<Object>} Lời chúc
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
        console.error('Lỗi khi lấy lời chúc:', error);
        return null;
    }
}

/**
 * Lưu file âm thanh vào Supabase Storage
 * @param {Blob} audioBlob Dữ liệu âm thanh
 * @param {string} sender Người gửi
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<boolean>} Kết quả lưu
 */
async function saveAudioMessageToSupabase(audioBlob, sender, birthdayPerson) {
    try {
        // Tạo tên file duy nhất
        const fileName = `audio_${Date.now()}.webm`;
        
        // Tải lên file âm thanh
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('audio')
            .upload(fileName, audioBlob);
            
        if (fileError) throw fileError;
        
        // Lấy URL công khai
        const { data: urlData } = await supabase
            .storage
            .from('audio')
            .getPublicUrl(fileName);
            
        const audioUrl = urlData.publicUrl;
        
        // Lưu thông tin vào cơ sở dữ liệu
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
        console.error('Lỗi khi lưu tin nhắn âm thanh:', error);
        return false;
    }
}

/**
 * Lấy danh sách tin nhắn âm thanh
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<Array>} Danh sách tin nhắn âm thanh
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
        console.error('Lỗi khi lấy tin nhắn âm thanh:', error);
        return [];
    }
}

/**
 * Lưu video chúc mừng vào Supabase Storage
 * @param {Blob} videoBlob Dữ liệu video
 * @param {string} videoName Tên video
 * @param {string} sender Người gửi
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<boolean>} Kết quả lưu
 */
async function saveVideoMessageToSupabase(videoBlob, videoName, sender, birthdayPerson) {
    try {
        // Kiểm tra kích thước video
        if (videoBlob.size > 10 * 1024 * 1024) { // Giới hạn 10MB
            throw new Error('Video quá lớn, vui lòng giảm kích thước hoặc thời lượng.');
        }
        
        // Tạo tên file duy nhất
        const fileName = `video_${Date.now()}.webm`;
        
        // Tải lên file video
        const { data: fileData, error: fileError } = await supabase
            .storage
            .from('video')
            .upload(fileName, videoBlob);
            
        if (fileError) throw fileError;
        
        // Lấy URL công khai
        const { data: urlData } = await supabase
            .storage
            .from('video')
            .getPublicUrl(fileName);
            
        const videoUrl = urlData.publicUrl;
        
        // Lưu thông tin vào cơ sở dữ liệu
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
        console.error('Lỗi khi lưu video chúc mừng:', error);
        alert('Lỗi khi lưu video: ' + error.message);
        return false;
    }
}

/**
 * Lấy danh sách video chúc mừng
 * @param {string} birthdayPerson Người nhận
 * @returns {Promise<Array>} Danh sách video
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
        console.error('Lỗi khi lấy video chúc mừng:', error);
        return [];
    }
}

/**
 * Thiết lập kênh real-time cho chat
 */
function setupRealtimeChat() {
    const chatChannel = supabase
        .channel('public:chat_messages')
        .on('postgres_changes', 
            { event: 'INSERT', schema: 'public', table: 'chat_messages' },
            (payload) => {
                // Thêm tin nhắn mới vào giao diện
                appendNewChatMessage(payload.new);
            }
        )
        .subscribe();
}

/**
 * Thiết lập kênh real-time cho bảng tin
 */
function setupRealtimeBulletin() {
    const bulletinChannel = supabase
        .channel('public:bulletin_posts')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'bulletin_posts' },
            (payload) => {
                // Cập nhật bảng tin
                updateBulletinBoard(payload);
            }
        )
        .subscribe();
}

/**
 * Lấy danh sách các file media từ bucket
 * @param {string} bucketName Tên bucket (mặc định: media)
 * @returns {Promise<Array>} Danh sách các file media
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
        console.error(`Lỗi khi lấy danh sách file từ bucket ${bucketName}:`, error);
        return [];
    }
}

/**
 * Lấy URL công khai cho file media
 * @param {string} path Đường dẫn file
 * @param {string} bucketName Tên bucket (mặc định: media)
 * @returns {string} URL công khai
 */
function getMediaUrl(path, bucketName = 'media') {
    try {
        const { data } = supabase
            .storage
            .from(bucketName)
            .getPublicUrl(path);
            
        return data.publicUrl;
    } catch (error) {
        console.error(`Lỗi khi lấy URL cho file ${path}:`, error);
        return null;
    }
}

/**
 * Kiểm tra có bao nhiêu file trong bucket media và từng loại
 * @param {string} bucketName Tên bucket (mặc định: media)
 * @returns {Promise<Object>} Thông tin về số lượng file
 */
async function getMediaStats(bucketName = 'media') {
    try {
        // Lấy danh sách tất cả các file trong bucket
        const { data, error } = await supabase
            .storage
            .from(bucketName)
            .list('', { limit: 1000 }); // Tăng giới hạn để lấy nhiều file hơn
            
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
        
        console.log(`Đã tìm thấy ${data.length} files trong bucket ${bucketName}`);
        
        // Lọc các file (loại bỏ các thư mục)
        const files = data.filter(item => !item.metadata || item.metadata.mimetype);
        
        // Đếm số lượng file theo loại
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
        
        console.log(`Thống kê: ${stats.images} ảnh, ${stats.videos} video, ${stats.others} file khác`);
        
        return stats;
    } catch (error) {
        console.error(`Lỗi khi lấy thông tin media từ bucket ${bucketName}:`, error);
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
 
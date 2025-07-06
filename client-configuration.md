# Hướng dẫn cấu hình Supabase Client an toàn

Dựa trên phân tích bảo mật từ giai đoạn 1, file `supabase-config.js` hiện tại đang lưu trữ API key công khai trong mã nguồn và sử dụng cách tiếp cận không an toàn để quản lý phiên người dùng. Dưới đây là hướng dẫn để cập nhật cấu hình client theo các tiêu chuẩn bảo mật cao nhất.

## 1. Cấu trúc file mới

File `supabase-config.js` mới sẽ được cập nhật như sau:

```javascript
// Cấu hình kết nối Supabase
const SUPABASE_URL = 'https://your-supabase-url.supabase.co';
const SUPABASE_ANON_KEY = 'your-public-anon-key'; // Chỉ sử dụng anon key, KHÔNG sử dụng service_role key

// Import thư viện Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

// Khởi tạo client
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true, // Sử dụng lưu trữ phiên mặc định của Supabase
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storageKey: 'supabase.auth.token',
  },
  global: {
    fetch: (...args) => fetch(...args),
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Helpers for auth
const auth = {
  /**
   * Đăng ký người dùng mới
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @param {Object} metadata - Thông tin thêm về người dùng
   * @returns {Promise<Object>} Kết quả đăng ký
   */
  async signUp(email, password, metadata = {}) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: metadata }
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing up:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Đăng nhập với email và password
   * @param {string} email - Email người dùng
   * @param {string} password - Mật khẩu
   * @returns {Promise<Object>} Kết quả đăng nhập
   */
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error signing in:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Đăng nhập với OAuth provider
   * @param {string} provider - Provider (google, facebook, github, etc.)
   * @returns {Promise<void>}
   */
  async signInWithProvider(provider) {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: window.location.origin,
        },
      });
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error signing in with ${provider}:`, error.message);
    }
  },

  /**
   * Đăng xuất người dùng hiện tại
   * @returns {Promise<Object>} Kết quả đăng xuất
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lấy phiên người dùng hiện tại
   * @returns {Promise<Object>} Thông tin phiên
   */
  async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      return { success: true, session: data.session };
    } catch (error) {
      console.error('Error getting session:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cập nhật thông tin người dùng
   * @param {Object} userData - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateUser(userData) {
    try {
      const { data, error } = await supabase.auth.updateUser(userData);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating user:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Gửi email reset mật khẩu
   * @param {string} email - Email cần reset mật khẩu
   * @returns {Promise<Object>} Kết quả gửi email
   */
  async resetPassword(email) {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error resetting password:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Helpers for database operations
const db = {
  /**
   * Lấy danh sách sinh nhật sắp tới
   * @param {number} days - Số ngày tới
   * @param {number} limit - Giới hạn số lượng kết quả
   * @returns {Promise<Object>} Danh sách sinh nhật
   */
  async getUpcomingBirthdays(days = 30, limit = 10) {
    try {
      const { data, error } = await supabase
        .rpc('get_upcoming_birthdays', { days_ahead: days })
        .limit(limit);
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching upcoming birthdays:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lấy sinh nhật hôm nay
   * @returns {Promise<Object>} Danh sách sinh nhật hôm nay
   */
  async getTodayBirthdays() {
    try {
      const { data, error } = await supabase
        .from('birthdays_today')
        .select('*');
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching today birthdays:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Thêm sinh nhật mới
   * @param {Object} birthdayData - Thông tin sinh nhật mới
   * @returns {Promise<Object>} Kết quả thêm mới
   */
  async addBirthday(birthdayData) {
    try {
      // Đảm bảo user_id là người dùng hiện tại nếu không có
      const session = await auth.getSession();
      if (session.success && session.session) {
        birthdayData.user_id = birthdayData.user_id || session.session.user.id;
      }

      const { data, error } = await supabase
        .from('birthdays')
        .insert(birthdayData)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error adding birthday:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Cập nhật thông tin sinh nhật
   * @param {string} id - ID của sinh nhật
   * @param {Object} updates - Dữ liệu cập nhật
   * @returns {Promise<Object>} Kết quả cập nhật
   */
  async updateBirthday(id, updates) {
    try {
      const { data, error } = await supabase
        .from('birthdays')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error updating birthday:', error.message);
      return { success: false, error: error.message };
    }
  }
};

// Helpers for storage operations
const storage = {
  /**
   * Tải file lên bucket
   * @param {string} bucket - Tên bucket
   * @param {string} path - Đường dẫn lưu trữ
   * @param {File} file - File cần upload
   * @param {Object} options - Tùy chọn upload
   * @returns {Promise<Object>} Kết quả upload
   */
  async uploadFile(bucket, path, file, options = {}) {
    try {
      // Tạo tên file duy nhất nếu không có path
      if (!path) {
        const ext = file.name.split('.').pop();
        path = `${crypto.randomUUID()}.${ext}`;
      }

      const { data, error } = await supabase.storage
        .from(bucket)
        .upload(path, file, {
          cacheControl: '3600',
          upsert: options.upsert || false
        });
      
      if (error) throw error;
      
      // Thêm vào bảng media_files nếu cần
      if (options.trackInDatabase) {
        const session = await auth.getSession();
        
        const metadata = {
          contentType: file.type,
          size: file.size,
          ...options.metadata
        };
        
        const mediaFile = {
          storage_path: `${bucket}/${path}`,
          original_name: file.name,
          file_type: file.type,
          size_bytes: file.size,
          metadata,
          owner_id: session.success && session.session ? session.session.user.id : null,
          is_public: options.isPublic !== undefined ? options.isPublic : true
        };
        
        const { data: mediaData, error: mediaError } = await supabase
          .from('media_files')
          .insert(mediaFile)
          .select()
          .single();
          
        if (mediaError) console.error('Error tracking file in database:', mediaError);
        
        return { success: true, data: { ...data, mediaFile: mediaData } };
      }
      
      return { success: true, data };
    } catch (error) {
      console.error('Error uploading file:', error.message);
      return { success: false, error: error.message };
    }
  },

  /**
   * Lấy URL công khai của file
   * @param {string} bucket - Tên bucket
   * @param {string} path - Đường dẫn của file
   * @returns {string} URL của file
   */
  getPublicUrl(bucket, path) {
    const { data } = supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }
};

// Xuất các helper functions
export { supabase, auth, db, storage }; 
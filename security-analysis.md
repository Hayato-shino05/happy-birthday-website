# Đánh giá bảo mật Supabase trong Happy Birthday Website

## Phân tích Row Level Security (RLS)

### Tình trạng hiện tại

Dựa trên phân tích mã nguồn, không tìm thấy bằng chứng về việc cấu hình Row Level Security (RLS) trong dự án. Điều này có nghĩa là:

1. **Không có giới hạn truy cập dữ liệu:**
   - Bất kỳ người dùng nào có API key đều có thể truy cập tất cả dữ liệu
   - Không có phân quyền dựa trên người dùng hoặc vai trò

2. **Cấu hình mặc định tiềm ẩn rủi ro:**
   - Khi RLS không được kích hoạt, Supabase mặc định cho phép truy cập toàn bộ dữ liệu đối với anon key
   - Không có hạn chế trong việc đọc, ghi, sửa hoặc xóa dữ liệu

3. **Khóa API public:**
   - SUPABASE_KEY được lưu trực tiếp trong code phía client
   - Key này là anon key cho phép truy cập không xác thực

## Phân tích quyền truy cập API

### Cấu hình API hiện tại

```javascript
const SUPABASE_URL = 'https://fmvqrwztdoyoworobsix.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZtdnFyd3p0ZG95b3dvcm9ic2l4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA3OTY4NDgsImV4cCI6MjA2NjM3Mjg0OH0.n968lj-vMDg5002ontDKeYO6-DTslAsvEv2DW3Bn6iE';
```

### Vấn đề về quyền truy cập API

1. **Sử dụng anon key không an toàn:**
   - Dự án sử dụng anon key cho tất cả các truy vấn
   - Không có xác thực người dùng trước khi cho phép truy cập dữ liệu

2. **Thiếu hạn chế API dựa trên endpoint:**
   - Không có giới hạn API nào được áp dụng
   - Tiềm ẩn nguy cơ lạm dụng API để trích xuất dữ liệu

3. **Thiếu kiểm soát rate limit:**
   - Không có cấu hình rate limiting rõ ràng
   - Tiềm ẩn nguy cơ tấn công DoS/DDoS

4. **Không có kiểm tra nguồn gốc (CORS):**
   - Không thấy cấu hình CORS trong mã nguồn
   - Có thể cho phép các trang web khác truy cập API

## Đánh giá xác thực người dùng

### Phương pháp xác thực hiện tại

Dựa trên mã nguồn, hệ thống hiện không sử dụng xác thực người dùng Supabase Auth. Thay vào đó:

1. **Lưu trữ tên người dùng trong localStorage:**
   ```javascript
   function saveUsername(name) {
       localStorage.setItem('birthdayChatUserName', name);
   }
   ```

2. **Không có đăng nhập/đăng ký chính thức:**
   - Không sử dụng Auth API của Supabase
   - Không có quản lý session hoặc token
   - Không có password hoặc phương tiện xác thực khác

3. **Không có phân quyền người dùng:**
   - Không có khái niệm về admin, moderator hoặc user
   - Tất cả người dùng có quyền truy cập như nhau

### Các lỗ hổng tiềm ẩn

1. **Mạo danh người dùng:**
   - Bất kỳ ai cũng có thể mạo danh người dùng khác bằng cách thay đổi tên
   - Không có xác minh danh tính

2. **Cross-Site Scripting (XSS):**
   - Dữ liệu người dùng được hiển thị mà không có sanitization đầy đủ
   - Có thể tiêm mã JavaScript qua lời chúc và tin nhắn

3. **Không có bảo vệ CSRF:**
   - Không thấy token CSRF hoặc biện pháp bảo vệ
   - Dễ bị tấn công Cross-Site Request Forgery

4. **Lưu trữ dữ liệu nhạy cảm không an toàn:**
   - Lưu thông tin người dùng trong localStorage mà không mã hóa
   - localStorage dễ bị truy cập bởi XSS

## Đánh giá bảo mật Storage

### Tình trạng hiện tại của Storage

1. **URL công khai cho tất cả file:**
   ```javascript
   const { data: urlData } = await supabase
       .storage
       .from('audio')
       .getPublicUrl(fileName);
   ```

2. **Không có giới hạn truy cập file:**
   - Tất cả file đều có thể truy cập công khai
   - Không có signed URLs với thời hạn

3. **Không có kiểm tra loại file:**
   - Thiếu kiểm tra loại MIME
   - Tiềm ẩn nguy cơ tải lên file độc hại

4. **Không có policies cho Storage:**
   - Không có RLS cho Storage buckets
   - Không có hạn chế truy cập dựa trên người dùng

### Vấn đề về bảo mật Storage

1. **Truy cập file không xác thực:**
   - Bất kỳ ai cũng có thể truy cập, tải xuống hoặc xóa file
   - Không có xác thực hoặc phân quyền

2. **Tải lên file không an toàn:**
   - Không kiểm tra kích thước và loại file một cách nghiêm ngặt
   - Tiềm ẩn nguy cơ lưu trữ mã độc hoặc nội dung không phù hợp

3. **Mất kiểm soát metadata:**
   - Không lưu trữ metadata đầy đủ cho files
   - Khó khăn trong việc xác định người tải lên file

## Đề xuất cải thiện bảo mật

### Thiết lập Row Level Security

1. **Kích hoạt RLS cho tất cả bảng:**
   ```sql
   ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
   ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
   ALTER TABLE video_messages ENABLE ROW LEVEL SECURITY;
   ```

2. **Tạo policies phù hợp:**
   ```sql
   -- Ví dụ policy cho custom_messages
   CREATE POLICY "Users can view messages for public birthdays" 
   ON custom_messages FOR SELECT 
   USING (true); -- Hoặc điều kiện cụ thể hơn
   
   CREATE POLICY "Users can insert their own messages" 
   ON custom_messages FOR INSERT 
   WITH CHECK (auth.uid() = sender_id);
   ```

3. **Tạo bảng và quan hệ người dùng:**
   ```sql
   CREATE TABLE user_profiles (
     id UUID REFERENCES auth.users NOT NULL PRIMARY KEY,
     username TEXT UNIQUE,
     display_name TEXT,
     avatar_url TEXT,
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   
   -- Thêm RLS cho user_profiles
   ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
   ```

### Triển khai Auth

1. **Sử dụng Supabase Auth:**
   ```javascript
   // Đăng ký
   const { user, error } = await supabase.auth.signUp({
     email: 'email@example.com',
     password: 'password'
   });
   
   // Đăng nhập
   const { user, error } = await supabase.auth.signIn({
     email: 'email@example.com',
     password: 'password'
   });
   ```

2. **Cài đặt middleware xác thực:**
   ```javascript
   // Kiểm tra session trước khi cho phép truy cập
   const { data: { session } } = await supabase.auth.getSession();
   if (!session) {
     // Chuyển hướng tới trang đăng nhập
   }
   ```

3. **Sử dụng JWT đúng cách:**
   ```javascript
   // Lấy token JWT
   const { data: { session } } = await supabase.auth.getSession();
   const token = session?.access_token;
   
   // Sử dụng token cho các yêu cầu khác
   headers: {
     Authorization: `Bearer ${token}`
   }
   ```

### Bảo mật Storage

1. **Thiết lập policies cho Storage:**
   ```sql
   -- Chỉ cho phép người dùng đã xác thực tải lên
   CREATE POLICY "Authenticated users can upload files"
   ON storage.objects FOR INSERT
   WITH CHECK (auth.role() = 'authenticated');
   
   -- Giới hạn truy cập file theo người dùng
   CREATE POLICY "Users can access their own files"
   ON storage.objects FOR SELECT
   USING (auth.uid()::text = (storage.foldername)[1]);
   ```

2. **Sử dụng signed URLs:**
   ```javascript
   const { data } = await supabase
     .storage
     .from('media')
     .createSignedUrl(filePath, 60); // Hết hạn sau 60 giây
   ```

3. **Kiểm tra file trước khi tải lên:**
   ```javascript
   const validateFile = (file) => {
     // Kiểm tra loại MIME
     const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4'];
     if (!allowedTypes.includes(file.type)) {
       throw new Error('File type not allowed');
     }
     
     // Kiểm tra kích thước
     const maxSize = 5 * 1024 * 1024; // 5MB
     if (file.size > maxSize) {
       throw new Error('File size too large');
     }
     
     return true;
   };
   ```

### Biện pháp bảo mật chung

1. **Cấu hình CORS:**
   ```javascript
   // Trong Supabase Dashboard > API Settings > CORS
   // Thêm origins được phép
   ["https://yourdomain.com"]
   ```

2. **Rate limiting:**
   ```sql
   -- Sử dụng pg_cron hoặc các extensions khác để triển khai rate limiting
   ```

3. **Sanitize đầu vào và đầu ra:**
   ```javascript
   // Sử dụng thư viện như DOMPurify
   import DOMPurify from 'dompurify';
   
   const sanitizedMessage = DOMPurify.sanitize(userMessage);
   ```

4. **Ẩn thông tin nhạy cảm:**
   ```javascript
   // Ẩn SUPABASE_KEY
   // Sử dụng environment variables và server-side rendering
   ```

## Kết luận

Hệ thống hiện tại thiếu nhiều biện pháp bảo mật cần thiết, đặc biệt là Row Level Security và xác thực người dùng. Cần triển khai một chiến lược bảo mật toàn diện, bao gồm RLS, xác thực, kiểm soát truy cập Storage, và các biện pháp bảo vệ từ tấn công web phổ biến. Điều này sẽ giúp đảm bảo dữ liệu người dùng được bảo vệ đầy đủ và hệ thống an toàn hơn trước các mối đe dọa. 
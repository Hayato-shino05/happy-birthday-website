# Phân tích cấu trúc dữ liệu Supabase hiện tại

## Bảng dữ liệu đã xác định

Dựa trên việc phân tích mã nguồn của dự án Happy Birthday Website, chúng tôi đã xác định các bảng dữ liệu sau trong Supabase:

### 1. `birthdays`
**Mô tả:** Lưu trữ thông tin về ngày sinh nhật của người dùng.
**Các trường đã xác định:**
- `name` (string): Tên người dùng
- `month` (integer): Tháng sinh nhật (1-12)
- `day` (integer): Ngày sinh nhật
- `year` (integer): Năm sinh (có thể null)
- `message` (string, optional): Lời chúc mặc định
- `created_at` (timestamp): Thời điểm tạo bản ghi (mặc định của Supabase)
- `id` (uuid): Khóa chính (mặc định của Supabase)

**Truy vấn mẫu:**
```javascript
const { data, error } = await supabase
    .from('birthdays')
    .select('*')
    .order('month')
    .order('day');
```

### 2. `custom_messages`
**Mô tả:** Lưu trữ lời chúc văn bản do người dùng gửi.
**Các trường đã xác định:**
- `sender` (string): Người gửi lời chúc
- `message` (string): Nội dung lời chúc
- `birthday_person` (string): Người nhận lời chúc
- `created_at` (timestamp): Thời điểm gửi lời chúc
- `id` (uuid): Khóa chính

**Truy vấn mẫu:**
```javascript
const { data, error } = await supabase
    .from('custom_messages')
    .select('*')
    .eq('birthday_person', birthdayPerson)
    .order('created_at', { ascending: false });
```

### 3. `audio_messages`
**Mô tả:** Lưu trữ thông tin về lời chúc bằng âm thanh.
**Các trường đã xác định:**
- `sender` (string): Người gửi lời chúc
- `audio_data` (string): URL đến file âm thanh
- `birthday_person` (string): Người nhận lời chúc
- `created_at` (timestamp): Thời điểm gửi
- `id` (uuid): Khóa chính

**Truy vấn mẫu:**
```javascript
const { data, error } = await supabase
    .from('audio_messages')
    .select('*')
    .eq('birthday_person', birthdayPerson)
    .order('created_at', { ascending: false });
```

### 4. `video_messages`
**Mô tả:** Lưu trữ thông tin về lời chúc bằng video.
**Các trường đã xác định:**
- `sender` (string): Người gửi video
- `video_name` (string): Tên video
- `video_url` (string): URL đến file video
- `birthday_person` (string): Người nhận lời chúc
- `created_at` (timestamp): Thời điểm gửi
- `id` (uuid): Khóa chính

**Truy vấn mẫu:**
```javascript
const { data, error } = await supabase
    .from('video_messages')
    .select('*')
    .eq('birthday_person', birthdayPerson)
    .order('created_at', { ascending: false });
```

### 5. Bảng dữ liệu khác (có thể tồn tại)
Dựa trên code, có thể còn một số bảng khác đang được sử dụng nhưng chưa được xác định rõ:
- Có thể có bảng `tags` cho việc lưu trữ thẻ của ảnh/video
- Có thể có bảng `virtual_gifts` cho tính năng quà tặng ảo

## Storage Buckets

Dự án sử dụng các storage buckets sau trong Supabase:

### 1. `media`
**Mục đích:** Lưu trữ hình ảnh và video cho album kỷ niệm.
**Cấu trúc file:** Được lưu trữ trong thư mục gốc, không có phân cấp rõ ràng.

### 2. `audio`
**Mục đích:** Lưu trữ file âm thanh từ lời chúc.
**Định dạng:** Chủ yếu là `.webm`.
**Quy ước đặt tên:** `audio_[timestamp].webm`

### 3. `video`
**Mục đích:** Lưu trữ video lời chúc.
**Định dạng:** Chủ yếu là `.webm`.
**Quy ước đặt tên:** `video_[timestamp].webm`

## Phân tích mối quan hệ

Dựa trên cấu trúc hiện tại, chúng tôi đã xác định các mối quan hệ sau:

1. Các bảng `custom_messages`, `audio_messages`, và `video_messages` liên kết với `birthdays` thông qua trường `birthday_person` (không có khóa ngoại chính thức).

2. Không có mối quan hệ rõ ràng giữa `media` trong storage và bảng dữ liệu, dẫn đến khó quản lý metadata của media.

## Các vấn đề hiện tại

1. **Thiếu khóa ngoại chính thức:**
   - Không có khóa ngoại giữa `birthday_person` và bảng `birthdays`
   - Sử dụng chuỗi thay vì UUID cho liên kết

2. **Thiếu cấu trúc cho Storage:**
   - Media được lưu trữ phẳng trong bucket, không có phân cấp thư mục
   - Thiếu metadata cho files trong storage

3. **Thiếu chỉ mục (indexes):**
   - Không có chỉ mục rõ ràng trên các trường tìm kiếm phổ biến
   - Có thể dẫn đến vấn đề hiệu suất khi dữ liệu phát triển

4. **Thiếu RLS (Row Level Security):**
   - Không thấy cấu hình RLS rõ ràng trong code
   - Tiềm ẩn rủi ro bảo mật dữ liệu

5. **Thiếu chuẩn hóa dữ liệu:**
   - Trùng lặp thông tin người dùng qua nhiều bảng (không có bảng `users` tập trung)
   - Không rõ cách xác thực và quản lý người dùng

## Đề xuất cải thiện

1. **Chuẩn hóa cơ sở dữ liệu:**
   - Tạo bảng `users` để quản lý thông tin người dùng tập trung
   - Sử dụng UUID làm khóa ngoại thay vì chuỗi văn bản

2. **Thêm ràng buộc và khóa ngoại:**
   - Thiết lập khóa ngoại từ các bảng tin nhắn đến bảng `users`
   - Thêm ràng buộc dữ liệu (NOT NULL, UNIQUE) cho các trường quan trọng

3. **Thêm metadata cho media:**
   - Tạo bảng `media_files` để lưu trữ metadata cho files
   - Liên kết media với người dùng và album

4. **Thiết lập RLS:**
   - Cấu hình RLS cho tất cả các bảng để đảm bảo an toàn dữ liệu
   - Xác định rõ quyền truy cập cho từng loại người dùng

5. **Cải thiện cấu trúc Storage:**
   - Tạo cấu trúc thư mục phân cấp theo người dùng hoặc mục đích sử dụng
   - Triển khai metadata và policies cho storage

## Sơ đồ ERD (Entity Relationship Diagram)

```
┌─────────────┐       ┌────────────────┐       ┌────────────────┐
│  birthdays  │       │ custom_messages │       │ audio_messages │
├─────────────┤       ├────────────────┤       ├────────────────┤
│ id          │       │ id             │       │ id             │
│ name        │       │ sender         │       │ sender         │
│ month       │       │ message        │<──┐   │ audio_data     │<──┐
│ day         │<──────│ birthday_person│   │   │ birthday_person│   │
│ year        │       │ created_at     │   │   │ created_at     │   │
│ message     │       └────────────────┘   │   └────────────────┘   │
│ created_at  │                            │                        │
└─────────────┘                            │                        │
                                           │   ┌────────────────┐   │
                                           └───│ video_messages │   │
                                               ├────────────────┤   │
                                               │ id             │   │
                                               │ sender         │   │
                                               │ video_name     │   │
                                               │ video_url      │   │
                                               │ birthday_person│───┘
                                               │ created_at     │
                                               └────────────────┘
```

## Kết luận

Cơ sở dữ liệu hiện tại đã phục vụ được các chức năng cơ bản của ứng dụng nhưng cần được cải thiện để đảm bảo tính toàn vẹn dữ liệu, bảo mật và khả năng mở rộng. Việc thiết kế lại schema với các mối quan hệ rõ ràng và ràng buộc phù hợp sẽ giúp ứng dụng hoạt động hiệu quả hơn khi quy mô phát triển. 
# Tài Liệu Kỹ Thuật Backend

## Tổng quan hệ thống

Happy Birthday Website sử dụng Supabase làm backend để lưu trữ và quản lý dữ liệu. Hệ thống bao gồm các thành phần chính sau:

1. **Database PostgreSQL**: Lưu trữ dữ liệu về sinh nhật, lời chúc và thông tin người dùng
2. **Storage**: Lưu trữ file media (âm thanh, video, hình ảnh)
3. **Row Level Security (RLS)**: Đảm bảo bảo mật dữ liệu
4. **API RESTful**: Cung cấp các endpoint để tương tác với dữ liệu

## Cấu trúc Database

### Bảng dữ liệu

#### 1. `birthdays`
- `id`: UUID (primary key)
- `name`: TEXT - Tên người nhận
- `month`: INTEGER - Tháng sinh nhật (1-12)
- `day`: INTEGER - Ngày sinh nhật (1-31)
- `year`: INTEGER - Năm sinh (có thể null)
- `message`: TEXT - Thông điệp sinh nhật mặc định
- `created_at`: TIMESTAMP - Thời điểm tạo
- `updated_at`: TIMESTAMP - Thời điểm cập nhật gần nhất

#### 2. `custom_messages`
- `id`: UUID (primary key)
- `sender`: TEXT - Người gửi lời chúc
- `message`: TEXT - Nội dung lời chúc
- `birthday_person`: TEXT - Người nhận (tham chiếu đến birthdays.name)
- `created_at`: TIMESTAMP - Thời điểm tạo
- `metadata`: JSONB - Metadata bổ sung

#### 3. `audio_messages`
- `id`: UUID (primary key)
- `sender`: TEXT - Người gửi lời chúc
- `audio_data`: TEXT - URL đến file âm thanh
- `birthday_person`: TEXT - Người nhận (tham chiếu đến birthdays.name)
- `created_at`: TIMESTAMP - Thời điểm tạo
- `metadata`: JSONB - Metadata bổ sung

#### 4. `video_messages`
- `id`: UUID (primary key)
- `sender`: TEXT - Người gửi video
- `video_name`: TEXT - Tên video
- `video_url`: TEXT - URL đến file video
- `birthday_person`: TEXT - Người nhận (tham chiếu đến birthdays.name)
- `created_at`: TIMESTAMP - Thời điểm tạo
- `metadata`: JSONB - Metadata bổ sung

### Views

#### 1. `birthdays_today`
```sql
CREATE VIEW birthdays_today AS
SELECT * FROM birthdays
WHERE month = EXTRACT(MONTH FROM CURRENT_DATE)
AND day = EXTRACT(DAY FROM CURRENT_DATE);
```

#### 2. `media_statistics`
```sql
CREATE VIEW media_statistics AS
SELECT 
  birthday_person,
  COUNT(DISTINCT custom_messages.id) as text_count,
  COUNT(DISTINCT audio_messages.id) as audio_count,
  COUNT(DISTINCT video_messages.id) as video_count
FROM birthdays
LEFT JOIN custom_messages ON birthdays.name = custom_messages.birthday_person
LEFT JOIN audio_messages ON birthdays.name = audio_messages.birthday_person
LEFT JOIN video_messages ON birthdays.name = video_messages.birthday_person
GROUP BY birthday_person;
```

## Storage Buckets

### 1. `audio`
Lưu trữ các file âm thanh lời chúc với cấu trúc thư mục:
```
audio/{user_name}/{year}/{month}/audio/{file_name}
```

### 2. `video`
Lưu trữ các file video lời chúc với cấu trúc thư mục:
```
video/{user_name}/{year}/{month}/video/{file_name}
```

### 3. `media`
Lưu trữ các file hình ảnh và media khác với cấu trúc thư mục:
```
media/{user_name}/{year}/{month}/{media_type}/{file_name}
```

## API Endpoints

### Birthdays

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/birthdays` | GET | Lấy danh sách sinh nhật |
| `/birthdays?month=5&day=15` | GET | Lọc sinh nhật theo ngày tháng |
| `/birthdays` | POST | Thêm sinh nhật mới |
| `/birthdays/{id}` | PUT | Cập nhật thông tin sinh nhật |
| `/birthdays/{id}` | DELETE | Xóa sinh nhật |

### Custom Messages

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/custom_messages?birthday_person=name` | GET | Lấy lời chúc cho người nhận |
| `/custom_messages` | POST | Thêm lời chúc mới |
| `/custom_messages/{id}` | DELETE | Xóa lời chúc |

### Audio Messages

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/audio_messages?birthday_person=name` | GET | Lấy tin nhắn âm thanh cho người nhận |
| `/audio_messages` | POST | Thêm tin nhắn âm thanh mới |
| `/audio_messages/{id}` | DELETE | Xóa tin nhắn âm thanh |

### Video Messages

| Endpoint | Method | Mô tả |
|----------|--------|-------|
| `/video_messages?birthday_person=name` | GET | Lấy video chúc mừng cho người nhận |
| `/video_messages` | POST | Thêm video chúc mừng mới |
| `/video_messages/{id}` | DELETE | Xóa video chúc mừng |

## Supabase Client

### Khởi tạo

```javascript
// Singleton pattern cho Supabase client
function getSupabaseClient() {
    if (!supabaseInstance) {
        supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    }
    return supabaseInstance;
}
```

### Caching

Hệ thống sử dụng caching để tối ưu hiệu suất:

```javascript
async function cachedQuery(cacheKey, queryFn, duration = 60000) {
    // Kiểm tra cache
    if (queryCache.has(cacheKey)) {
        const cached = queryCache.get(cacheKey);
        if (Date.now() - cached.timestamp < duration) {
            return cached.data;
        }
    }
    
    // Thực hiện truy vấn mới
    const result = await queryFn();
    
    // Lưu vào cache
    queryCache.set(cacheKey, {
        data: result.data,
        timestamp: Date.now()
    });
    
    return result.data;
}
```

## Xử lý lỗi

Hệ thống sử dụng cơ chế xử lý lỗi tập trung:

```javascript
function handleError(operation, error) {
    console.error(`Lỗi Supabase [${operation}]:`, error);
    
    // Gọi tất cả error handlers đã đăng ký
    errorHandlers.forEach(handler => {
        try {
            handler(operation, error);
        } catch (handlerError) {
            console.error('Lỗi trong error handler:', handlerError);
        }
    });
}
```

## Bảo mật dữ liệu người dùng

Dữ liệu người dùng được lưu trữ trong localStorage với mã hóa đơn giản:

```javascript
function encryptData(text) {
    // Mã hóa đơn giản sử dụng XOR với khóa
    let result = '';
    for (let i = 0; i < text.length; i++) {
        const charCode = text.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length);
        result += String.fromCharCode(charCode);
    }
    // Chuyển sang Base64 để lưu trữ an toàn
    return btoa(result);
}
```

## Đồng bộ dữ liệu giữa các tab

Hệ thống sử dụng BroadcastChannel API để đồng bộ dữ liệu giữa các tab:

```javascript
function broadcastDataChange(key, value, isRemoved = false) {
    if (typeof BroadcastChannel !== 'undefined') {
        const bc = new BroadcastChannel('happy_birthday_storage_sync');
        bc.postMessage({
            key,
            value,
            isRemoved,
            timestamp: Date.now()
        });
        bc.close();
    }
}
```

## Hướng dẫn triển khai

1. Tạo project Supabase mới
2. Thực thi migration script để tạo schema
3. Thiết lập Row Level Security (RLS)
4. Cấu hình Storage buckets và policies
5. Cập nhật thông tin kết nối trong file `js/supabase-config.js`
6. Triển khai website lên hosting

## Bảo trì và cập nhật

1. Backup database định kỳ (hàng tuần)
2. Kiểm tra và dọn dẹp storage không sử dụng (hàng tháng)
3. Cập nhật Supabase client khi có phiên bản mới
4. Giám sát usage và performance 
# Thiết kế Schema Tối Ưu cho Happy Birthday Website

Dựa trên phân tích từ giai đoạn 1, tôi đề xuất một thiết kế schema tối ưu cho hệ thống với các thay đổi cần thiết để cải thiện hiệu suất, tính toàn vẹn dữ liệu và bảo mật.

## 1. Tái Cấu Trúc Schema

### Bảng `users` (Mới)

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE
);

-- Index cho tìm kiếm email
CREATE INDEX idx_users_email ON users(email);
-- Index cho tìm kiếm tên hiển thị
CREATE INDEX idx_users_display_name ON users(display_name);
```

### Bảng `birthdays` (Cải tiến)

```sql
CREATE TABLE birthdays (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
  day INTEGER NOT NULL CHECK (day BETWEEN 1 AND 31),
  year INTEGER,
  message TEXT,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho tìm kiếm ngày sinh nhật
CREATE INDEX idx_birthdays_date ON birthdays(month, day);
-- Index cho user_id để tìm nhanh sinh nhật theo người dùng
CREATE INDEX idx_birthdays_user ON birthdays(user_id);
-- Index cho is_public để lọc nhanh những sinh nhật công khai
CREATE INDEX idx_birthdays_public ON birthdays(is_public);
```

### Bảng `custom_messages` (Cải tiến)

```sql
CREATE TABLE custom_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho birthday_id để tìm nhanh tin nhắn cho một sinh nhật
CREATE INDEX idx_custom_messages_birthday ON custom_messages(birthday_id);
-- Index cho sender_id để tìm nhanh tin nhắn của một người gửi
CREATE INDEX idx_custom_messages_sender ON custom_messages(sender_id);
-- Index cho thời gian tạo để sắp xếp theo thứ tự thời gian
CREATE INDEX idx_custom_messages_created ON custom_messages(created_at);
```

### Bảng `media_files` (Mới)

```sql
CREATE TABLE media_files (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  storage_path TEXT NOT NULL UNIQUE,
  original_name TEXT,
  file_type TEXT NOT NULL,
  size_bytes INTEGER NOT NULL,
  metadata JSONB DEFAULT '{}'::jsonb,
  owner_id UUID REFERENCES users(id) ON DELETE SET NULL,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho owner_id để tìm nhanh file của một người dùng
CREATE INDEX idx_media_files_owner ON media_files(owner_id);
-- Index cho file_type để lọc theo loại file
CREATE INDEX idx_media_files_type ON media_files(file_type);
-- Index cho is_public để lọc nhanh những file công khai
CREATE INDEX idx_media_files_public ON media_files(is_public);
-- Index cho metadata để tìm kiếm trong metadata
CREATE INDEX idx_media_files_metadata ON media_files USING GIN (metadata);
```

### Bảng `audio_messages` (Cải tiến)

```sql
CREATE TABLE audio_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho birthday_id để tìm nhanh tin nhắn âm thanh cho một sinh nhật
CREATE INDEX idx_audio_messages_birthday ON audio_messages(birthday_id);
-- Index cho sender_id để tìm nhanh tin nhắn âm thanh của một người gửi
CREATE INDEX idx_audio_messages_sender ON audio_messages(sender_id);
-- Index cho media_id để tìm nhanh tin nhắn âm thanh theo file
CREATE INDEX idx_audio_messages_media ON audio_messages(media_id);
```

### Bảng `video_messages` (Cải tiến)

```sql
CREATE TABLE video_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho birthday_id để tìm nhanh video cho một sinh nhật
CREATE INDEX idx_video_messages_birthday ON video_messages(birthday_id);
-- Index cho sender_id để tìm nhanh video của một người gửi
CREATE INDEX idx_video_messages_sender ON video_messages(sender_id);
-- Index cho media_id để tìm nhanh tin nhắn video theo file
CREATE INDEX idx_video_messages_media ON video_messages(media_id);
```

### Bảng `albums` (Mới)

```sql
CREATE TABLE albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho owner_id để tìm nhanh album của một người dùng
CREATE INDEX idx_albums_owner ON albums(owner_id);
-- Index cho is_public để lọc nhanh những album công khai
CREATE INDEX idx_albums_public ON albums(is_public);
```

### Bảng `album_media` (Mới - Quan hệ nhiều-nhiều)

```sql
CREATE TABLE album_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(album_id, media_id)
);

-- Index cho album_id để tìm nhanh media trong một album
CREATE INDEX idx_album_media_album ON album_media(album_id);
-- Index cho media_id để tìm nhanh album chứa một media
CREATE INDEX idx_album_media_media ON album_media(media_id);
-- Index cho display_order để sắp xếp theo thứ tự hiển thị
CREATE INDEX idx_album_media_order ON album_media(album_id, display_order);
```

### Bảng `tags` (Mới)

```sql
CREATE TABLE tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho name để tìm kiếm tag theo tên
CREATE INDEX idx_tags_name ON tags(name);
```

### Bảng `media_tags` (Mới - Quan hệ nhiều-nhiều)

```sql
CREATE TABLE media_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, tag_id)
);

-- Index cho media_id để tìm nhanh tất cả tag của một media
CREATE INDEX idx_media_tags_media ON media_tags(media_id);
-- Index cho tag_id để tìm nhanh tất cả media có một tag
CREATE INDEX idx_media_tags_tag ON media_tags(tag_id);
```

### Bảng `virtual_gifts` (Mới)

```sql
CREATE TABLE virtual_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho is_premium để lọc nhanh quà tặng premium
CREATE INDEX idx_virtual_gifts_premium ON virtual_gifts(is_premium);
```

### Bảng `gift_transactions` (Mới)

```sql
CREATE TABLE gift_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES virtual_gifts(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index cho birthday_id để tìm nhanh quà tặng cho một sinh nhật
CREATE INDEX idx_gift_transactions_birthday ON gift_transactions(birthday_id);
-- Index cho sender_id để tìm nhanh quà tặng của một người gửi
CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_id);
-- Index cho gift_id để tìm nhanh các lần tặng một loại quà
CREATE INDEX idx_gift_transactions_gift ON gift_transactions(gift_id);
```

## 2. Triggers và Functions

### Function theo dõi thời gian cập nhật

```sql
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Trigger cho các bảng để tự động cập nhật thời gian

```sql
-- Ví dụ cho bảng users
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Thêm trigger tương tự cho các bảng khác có trường updated_at
```

### Function tìm kiếm sinh nhật sắp tới

```sql
CREATE OR REPLACE FUNCTION get_upcoming_birthdays(days_ahead INTEGER DEFAULT 30)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  name TEXT,
  month INTEGER,
  day INTEGER,
  year INTEGER,
  days_until INTEGER
) AS $$
DECLARE
  current_date_val DATE := CURRENT_DATE;
  current_year INTEGER := EXTRACT(YEAR FROM current_date_val);
  current_month INTEGER := EXTRACT(MONTH FROM current_date_val);
  current_day INTEGER := EXTRACT(DAY FROM current_date_val);
BEGIN
  RETURN QUERY
  WITH birthdays_with_date AS (
    SELECT
      b.id,
      b.user_id,
      b.name,
      b.month,
      b.day,
      b.year,
      CASE
        WHEN (b.month > current_month) OR (b.month = current_month AND b.day >= current_day)
        THEN MAKE_DATE(current_year, b.month, b.day)
        ELSE MAKE_DATE(current_year + 1, b.month, b.day)
      END as next_date
    FROM
      birthdays b
    WHERE
      b.is_public = TRUE
  )
  SELECT
    bwd.id,
    bwd.user_id,
    bwd.name,
    bwd.month,
    bwd.day,
    bwd.year,
    (bwd.next_date - current_date_val)::INTEGER as days_until
  FROM
    birthdays_with_date bwd
  WHERE
    (bwd.next_date - current_date_val) <= days_ahead
  ORDER BY
    days_until;
END;
$$ LANGUAGE plpgsql;
```

## 3. Views

### View các sinh nhật hôm nay

```sql
CREATE VIEW birthdays_today AS
SELECT 
  b.id,
  b.user_id,
  u.display_name as user_display_name,
  b.name,
  b.message,
  b.year
FROM
  birthdays b
JOIN
  users u ON b.user_id = u.id
WHERE
  b.month = EXTRACT(MONTH FROM CURRENT_DATE)
  AND b.day = EXTRACT(DAY FROM CURRENT_DATE)
  AND b.is_public = TRUE;
```

### View thống kê media

```sql
CREATE VIEW media_statistics AS
SELECT
  u.id as user_id,
  u.display_name,
  COUNT(DISTINCT mf.id) as total_media,
  COUNT(DISTINCT am.id) as audio_messages,
  COUNT(DISTINCT vm.id) as video_messages,
  COUNT(DISTINCT gf.id) as gifts
FROM
  users u
LEFT JOIN
  media_files mf ON u.id = mf.owner_id
LEFT JOIN
  audio_messages am ON u.id = am.sender_id
LEFT JOIN
  video_messages vm ON u.id = vm.sender_id
LEFT JOIN
  gift_transactions gf ON u.id = gf.sender_id
GROUP BY
  u.id, u.display_name;
```

## 4. Row Level Security (RLS)

Các policies sẽ được triển khai sau khi schema được tạo, trong phần tiếp theo của giai đoạn 2.

## Kế hoạch Migration

### 1. Tạo các bảng mới

Tạo các bảng mới trước: `users`, `media_files`, `albums`, `tags`, `virtual_gifts`.

### 2. Di chuyển dữ liệu

Từ schema cũ sang schema mới, với các bước:

1. Tạo người dùng ẩn danh cho dữ liệu không có người dùng
2. Di chuyển dữ liệu từ `birthdays` cũ sang `birthdays` mới
3. Di chuyển dữ liệu từ các bảng message cũ sang các bảng mới

### 3. Thiết lập foreign keys

Sau khi di chuyển dữ liệu, thiết lập các ràng buộc foreign key.

### 4. Tạo triggers, functions và views

Sau khi hoàn thành cấu trúc bảng và di chuyển dữ liệu.

### 5. Thiết lập RLS

Cuối cùng, thiết lập các chính sách RLS.

## Kiểm tra tính toàn vẹn dữ liệu

Sau mỗi bước migration, cần chạy các truy vấn kiểm tra để đảm bảo không mất dữ liệu và tính toàn vẹn được duy trì.

## Rollback Plan

Trong trường hợp có vấn đề:

1. Duy trì bản sao của dữ liệu gốc
2. Tạo các script rollback cho mỗi bước migration
3. Thiết lập các checkpoint để có thể rollback từng phần

## Kết luận

Schema mới giải quyết các vấn đề được xác định trong giai đoạn 1:

1. Chuẩn hóa dữ liệu với các khóa ngoại và ràng buộc phù hợp
2. Tổ chức dữ liệu hiệu quả hơn với cấu trúc thư mục và metadata
3. Thiết lập các chỉ mục để tối ưu hiệu suất truy vấn
4. Cung cấp cơ sở để triển khai RLS một cách hiệu quả

Các bước tiếp theo sẽ là việc triển khai RLS policies và tạo các SQL Functions để hỗ trợ logic phức tạp. 
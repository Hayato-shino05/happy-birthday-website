# Chính sách Row Level Security (RLS)

Dựa trên phân tích từ giai đoạn 1 và thiết kế schema mới, chúng ta cần triển khai các chính sách RLS để đảm bảo bảo mật dữ liệu cho Happy Birthday Website.

## Bật RLS trên các bảng

Trước khi triển khai các chính sách, chúng ta cần bật RLS trên tất cả các bảng:

```sql
-- Bật RLS cho các bảng
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE birthdays ENABLE ROW LEVEL SECURITY;
ALTER TABLE custom_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE audio_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE video_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE albums ENABLE ROW LEVEL SECURITY;
ALTER TABLE album_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE media_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE virtual_gifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE gift_transactions ENABLE ROW LEVEL SECURITY;
```

## Chính sách cho bảng `users`

```sql
-- Người dùng chỉ có thể xem hồ sơ công khai hoặc của chính họ
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (
        auth.uid() = id  -- Người dùng có thể xem dữ liệu của chính họ
        OR is_admin = FALSE  -- Hoặc dữ liệu công khai (không phải admin)
        OR auth.jwt()->>'role' = 'admin'  -- Admin có thể xem tất cả
    );

-- Người dùng chỉ có thể cập nhật hồ sơ của chính họ
CREATE POLICY users_update_policy ON users
    FOR UPDATE
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

-- Chỉ admin mới có thể xóa tài khoản người dùng
CREATE POLICY users_delete_policy ON users
    FOR DELETE
    USING (auth.jwt()->>'role' = 'admin');

-- Chỉ cho phép API service tạo người dùng mới (thông qua trigger)
CREATE POLICY users_insert_policy ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'service');
```

## Chính sách cho bảng `birthdays`

```sql
-- Xem các sinh nhật công khai hoặc sinh nhật của người dùng hiện tại
CREATE POLICY birthdays_select_policy ON birthdays
    FOR SELECT
    USING (
        is_public = TRUE
        OR user_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người tạo và admin mới có thể cập nhật sinh nhật
CREATE POLICY birthdays_update_policy ON birthdays
    FOR UPDATE
    USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Chỉ người tạo và admin mới có thể xóa sinh nhật
CREATE POLICY birthdays_delete_policy ON birthdays
    FOR DELETE
    USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Người dùng đã xác thực có thể thêm sinh nhật mới
CREATE POLICY birthdays_insert_policy ON birthdays
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');
```

## Chính sách cho bảng `custom_messages`

```sql
-- Xem tin nhắn cho sinh nhật công khai hoặc của người dùng hiện tại
CREATE POLICY custom_messages_select_policy ON custom_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM birthdays b
            WHERE b.id = custom_messages.birthday_id
            AND (b.is_public = TRUE OR b.user_id = auth.uid())
        )
        OR sender_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người gửi và admin mới có thể cập nhật tin nhắn
CREATE POLICY custom_messages_update_policy ON custom_messages
    FOR UPDATE
    USING (sender_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Người gửi, người nhận và admin có thể xóa tin nhắn
CREATE POLICY custom_messages_delete_policy ON custom_messages
    FOR DELETE
    USING (
        sender_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM birthdays b
            WHERE b.id = custom_messages.birthday_id AND b.user_id = auth.uid()
        )
        OR auth.jwt()->>'role' = 'admin'
    );

-- Người dùng đã xác thực có thể thêm tin nhắn mới
CREATE POLICY custom_messages_insert_policy ON custom_messages
    FOR INSERT
    WITH CHECK (
        auth.uid() = sender_id
        AND EXISTS (
            SELECT 1 FROM birthdays b
            WHERE b.id = custom_messages.birthday_id
        )
    );
```

## Chính sách cho bảng `media_files`

```sql
-- Xem file công khai hoặc của người dùng hiện tại
CREATE POLICY media_files_select_policy ON media_files
    FOR SELECT
    USING (
        is_public = TRUE
        OR owner_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người sở hữu và admin mới có thể cập nhật file
CREATE POLICY media_files_update_policy ON media_files
    FOR UPDATE
    USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Chỉ người sở hữu và admin mới có thể xóa file
CREATE POLICY media_files_delete_policy ON media_files
    FOR DELETE
    USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Người dùng đã xác thực có thể tải lên file mới
CREATE POLICY media_files_insert_policy ON media_files
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id OR auth.jwt()->>'role' = 'admin');
```

## Chính sách cho bảng `audio_messages` và `video_messages`

```sql
-- Chính sách cho audio_messages
-- Xem tin nhắn cho sinh nhật công khai hoặc của người dùng hiện tại
CREATE POLICY audio_messages_select_policy ON audio_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM birthdays b
            WHERE b.id = audio_messages.birthday_id
            AND (b.is_public = TRUE OR b.user_id = auth.uid())
        )
        OR sender_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Các chính sách tương tự cho update, delete, insert

-- Chính sách cho video_messages (tương tự như audio_messages)
CREATE POLICY video_messages_select_policy ON video_messages
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM birthdays b
            WHERE b.id = video_messages.birthday_id
            AND (b.is_public = TRUE OR b.user_id = auth.uid())
        )
        OR sender_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Các chính sách tương tự cho update, delete, insert
```

## Chính sách cho bảng `albums`

```sql
-- Xem album công khai hoặc của người dùng hiện tại
CREATE POLICY albums_select_policy ON albums
    FOR SELECT
    USING (
        is_public = TRUE
        OR owner_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người sở hữu và admin mới có thể cập nhật album
CREATE POLICY albums_update_policy ON albums
    FOR UPDATE
    USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Chỉ người sở hữu và admin mới có thể xóa album
CREATE POLICY albums_delete_policy ON albums
    FOR DELETE
    USING (owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

-- Người dùng đã xác thực có thể tạo album mới
CREATE POLICY albums_insert_policy ON albums
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id OR auth.jwt()->>'role' = 'admin');
```

## Chính sách cho bảng quan hệ `album_media`

```sql
-- Xem mối quan hệ album-media cho album hoặc media công khai
CREATE POLICY album_media_select_policy ON album_media
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM albums a
            WHERE a.id = album_media.album_id AND (a.is_public = TRUE OR a.owner_id = auth.uid())
        )
        OR EXISTS (
            SELECT 1 FROM media_files m
            WHERE m.id = album_media.media_id AND (m.is_public = TRUE OR m.owner_id = auth.uid())
        )
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người sở hữu album và admin mới có thể cập nhật mối quan hệ
CREATE POLICY album_media_update_policy ON album_media
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM albums a
            WHERE a.id = album_media.album_id AND a.owner_id = auth.uid()
        )
        OR auth.jwt()->>'role' = 'admin'
    );

-- Chỉ người sở hữu album và admin mới có thể xóa mối quan hệ
CREATE POLICY album_media_delete_policy ON album_media
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM albums a
            WHERE a.id = album_media.album_id AND a.owner_id = auth.uid()
        )
        OR auth.jwt()->>'role' = 'admin'
    );

-- Người dùng đã xác thực có thể thêm media vào album mà họ sở hữu
CREATE POLICY album_media_insert_policy ON album_media
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM albums a
            WHERE a.id = album_media.album_id AND a.owner_id = auth.uid()
        )
        OR auth.jwt()->>'role' = 'admin'
    );
```

## Chính sách cho các bảng khác

Tương tự, các chính sách bảo mật cũng được thiết lập cho các bảng còn lại như `tags`, `media_tags`, `virtual_gifts` và `gift_transactions`.

## Cài đặt cho Admin và Service Roles

Để đảm bảo hệ thống hoạt động với RLS, chúng ta cần tạo các role cho admin và service:

```sql
-- Tạo role cho admin
CREATE ROLE admin;

-- Cấp quyền bypass RLS cho admin
ALTER ROLE admin BYPASSRLS;

-- Tạo role cho service API
CREATE ROLE service;

-- Cấp quyền bypass RLS cho service trên một số bảng cụ thể
GRANT ALL ON TABLE users TO service;
GRANT ALL ON TABLE media_files TO service;
-- Thêm các quyền cần thiết khác
```

## Hàm SQL để kiểm tra quyền

```sql
-- Hàm kiểm tra quyền truy cập vào birthday
CREATE OR REPLACE FUNCTION can_access_birthday(birthday_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    public_status BOOLEAN;
    owner_id UUID;
BEGIN
    SELECT b.is_public, b.user_id INTO public_status, owner_id
    FROM birthdays b WHERE b.id = birthday_id;
    
    RETURN public_status = TRUE OR owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Hàm kiểm tra quyền chỉnh sửa media
CREATE OR REPLACE FUNCTION can_edit_media(media_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    owner_id UUID;
BEGIN
    SELECT m.owner_id INTO owner_id
    FROM media_files m WHERE m.id = media_id;
    
    RETURN owner_id = auth.uid() OR auth.jwt()->>'role' = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

## Mức độ quyền truy cập

| Bảng | Public | Authenticated | Owner | Admin |
|------|--------|--------------|-------|-------|
| users | Chỉ xem | Chỉ xem | Xem, sửa | Tất cả |
| birthdays | Chỉ xem public | Xem public, thêm | Tất cả | Tất cả |
| custom_messages | Chỉ xem public | Xem public, thêm | Tất cả | Tất cả |
| media_files | Chỉ xem public | Xem public, thêm | Tất cả | Tất cả |
| albums | Chỉ xem public | Xem public, thêm | Tất cả | Tất cả |
| album_media | Chỉ xem public | Xem public, thêm vào album của mình | Tất cả | Tất cả |

## Kết luận

Các chính sách RLS được thiết kế để:

1. Bảo vệ dữ liệu người dùng khỏi truy cập trái phép
2. Cho phép chia sẻ thông tin công khai một cách an toàn
3. Cung cấp quyền truy cập dựa trên vai trò
4. Đảm bảo người dùng chỉ có thể thao tác với dữ liệu của họ

Các chính sách này cần được triển khai cùng với việc cải tiến xác thực người dùng bằng Supabase Auth để đảm bảo bảo mật toàn diện cho hệ thống. 
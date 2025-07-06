# Policies Bảo Mật Cho Storage

Tài liệu này mô tả các policies bảo mật được áp dụng cho Storage buckets trong Supabase.

## Cấu trúc thư mục

Để tổ chức dữ liệu tốt hơn và dễ quản lý, chúng tôi đã triển khai cấu trúc thư mục phân cấp:

```
{bucket_name}/
  └── {user_name}/
      └── {year}/
          └── {month}/
              └── {file_type}/
                  └── {file_name}
```

Ví dụ: `audio/nguyen_van_a/2023/05/audio/audio_1683456789.webm`

## Policies cho Storage

### 1. Bucket `audio`

```sql
-- Policy cho phép đọc file audio
CREATE POLICY "Audio files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'audio');

-- Policy cho phép tải lên file audio với kích thước giới hạn
CREATE POLICY "Anyone can upload audio with size limit"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'audio' AND
  (octet_length(COALESCE(file, '')) <= 5242880) -- 5MB limit
);

-- Policy cho phép người tạo xóa file của họ
CREATE POLICY "Creator can delete their own audio files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'audio' AND
  (storage.foldername(name))[1] = (SELECT current_setting('request.jwt.claims', true)::json->>'sub')
);
```

### 2. Bucket `video`

```sql
-- Policy cho phép đọc file video
CREATE POLICY "Video files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'video');

-- Policy cho phép tải lên file video với kích thước giới hạn
CREATE POLICY "Anyone can upload video with size limit"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'video' AND
  (octet_length(COALESCE(file, '')) <= 10485760) -- 10MB limit
);

-- Policy cho phép người tạo xóa file của họ
CREATE POLICY "Creator can delete their own video files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'video' AND
  (storage.foldername(name))[1] = (SELECT current_setting('request.jwt.claims', true)::json->>'sub')
);
```

### 3. Bucket `media`

```sql
-- Policy cho phép đọc file media
CREATE POLICY "Media files are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'media');

-- Policy cho phép tải lên file media với kích thước giới hạn
CREATE POLICY "Anyone can upload media with size limit"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'media' AND
  (octet_length(COALESCE(file, '')) <= 5242880) -- 5MB limit
);

-- Policy cho phép người tạo xóa file của họ
CREATE POLICY "Creator can delete their own media files"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'media' AND
  (storage.foldername(name))[1] = (SELECT current_setting('request.jwt.claims', true)::json->>'sub')
);
```

## Giới hạn kích thước file

Để đảm bảo hiệu suất và ngăn chặn việc lạm dụng dịch vụ, chúng tôi đã thiết lập các giới hạn kích thước file:

| Bucket | Giới hạn kích thước | Mô tả |
|--------|---------------------|-------|
| audio  | 5MB                 | Lưu trữ file âm thanh lời chúc |
| video  | 10MB                | Lưu trữ video lời chúc |
| media  | 5MB                 | Lưu trữ hình ảnh và media khác |

## Kiểm soát MIME Type

Để đảm bảo chỉ các loại file an toàn được tải lên, chúng tôi kiểm tra MIME type:

```sql
-- Function kiểm tra MIME type hợp lệ
CREATE OR REPLACE FUNCTION storage.is_valid_mime_type(file_name text, mime_type text)
RETURNS boolean AS $$
DECLARE
  extension text;
  valid_types text[];
BEGIN
  -- Lấy phần mở rộng của file
  extension := lower(substring(file_name from '\.([^\.]+)$'));
  
  -- Kiểm tra MIME type dựa trên phần mở rộng
  CASE extension
    WHEN 'webm' THEN
      valid_types := ARRAY['audio/webm', 'video/webm'];
    WHEN 'mp3' THEN
      valid_types := ARRAY['audio/mpeg', 'audio/mp3'];
    WHEN 'mp4' THEN
      valid_types := ARRAY['video/mp4'];
    WHEN 'jpg', 'jpeg' THEN
      valid_types := ARRAY['image/jpeg'];
    WHEN 'png' THEN
      valid_types := ARRAY['image/png'];
    WHEN 'gif' THEN
      valid_types := ARRAY['image/gif'];
    ELSE
      RETURN false;
  END CASE;
  
  -- Kiểm tra MIME type có nằm trong danh sách hợp lệ không
  RETURN mime_type = ANY(valid_types);
END;
$$ LANGUAGE plpgsql;

-- Áp dụng kiểm tra MIME type vào policy
ALTER POLICY "Anyone can upload audio with size limit"
ON storage.objects
WITH CHECK (
  bucket_id = 'audio' AND
  (octet_length(COALESCE(file, '')) <= 5242880) AND
  storage.is_valid_mime_type(name, mimetype)
);
```

## Quản lý metadata

Để dễ dàng quản lý và tìm kiếm file, chúng tôi lưu trữ metadata cho mỗi file:

```json
{
  "sender": "Người gửi",
  "size": 1234567,
  "type": "audio/webm",
  "created": "2023-05-07T10:30:00Z",
  "tags": ["birthday", "friend"]
}
```

Metadata này được lưu trong cột `metadata` của các bảng tương ứng trong database.

## Giám sát và Báo cáo

Chúng tôi đã thiết lập view để giám sát việc sử dụng storage:

```sql
CREATE OR REPLACE VIEW storage_usage AS
SELECT
  bucket_id,
  COUNT(*) as file_count,
  SUM(octet_length(file)) as total_size_bytes,
  (SUM(octet_length(file)) / (1024*1024))::numeric(10,2) as total_size_mb
FROM storage.objects
GROUP BY bucket_id;
``` 
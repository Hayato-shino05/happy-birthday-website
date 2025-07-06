-- Migration Script để triển khai schema cơ sở dữ liệu mới
-- Chạy script này trong SQL Editor của Supabase

-- Tạo các extension cần thiết (nếu chưa có)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Bước 1: Tạo các bảng mới

-- Tạo bảng users
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT UNIQUE,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_admin BOOLEAN DEFAULT FALSE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_display_name ON users(display_name);

-- Tạo bảng media_files
CREATE TABLE IF NOT EXISTS media_files (
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

CREATE INDEX idx_media_files_owner ON media_files(owner_id);
CREATE INDEX idx_media_files_type ON media_files(file_type);
CREATE INDEX idx_media_files_public ON media_files(is_public);
CREATE INDEX idx_media_files_metadata ON media_files USING GIN (metadata);

-- Tạo bảng albums
CREATE TABLE IF NOT EXISTS albums (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  owner_id UUID REFERENCES users(id) ON DELETE CASCADE,
  is_public BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_albums_owner ON albums(owner_id);
CREATE INDEX idx_albums_public ON albums(is_public);

-- Tạo bảng tags
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tags_name ON tags(name);

-- Tạo bảng virtual_gifts
CREATE TABLE IF NOT EXISTS virtual_gifts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  emoji TEXT NOT NULL,
  description TEXT,
  is_premium BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_virtual_gifts_premium ON virtual_gifts(is_premium);

-- Tạo anonymous user để chuyển dữ liệu cũ không có user_id
INSERT INTO users (id, display_name, is_admin)
VALUES ('00000000-0000-0000-0000-000000000000', 'Anonymous', FALSE)
ON CONFLICT (id) DO NOTHING;

-- Tạo bảng birthdays mới (tạm thời)
CREATE TABLE IF NOT EXISTS birthdays_new (
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

-- Bước 2: Chuyển dữ liệu từ bảng cũ sang bảng mới
DO $$
BEGIN
  -- Kiểm tra xem bảng birthdays có tồn tại không
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'birthdays') THEN
    -- Chuyển dữ liệu từ bảng birthdays cũ sang mới
    INSERT INTO birthdays_new (id, user_id, name, month, day, year, message, is_public, created_at, updated_at)
    SELECT 
      id, 
      '00000000-0000-0000-0000-000000000000'::uuid, -- Anonymous user
      name, 
      month, 
      day, 
      year, 
      message, 
      TRUE, -- Mặc định là public
      created_at, 
      COALESCE(updated_at, created_at)
    FROM birthdays;
  END IF;
END $$;

-- Kiểm tra và xóa bảng cũ, đổi tên bảng mới
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'birthdays') THEN
    -- Lưu tên các bảng cũ với tiền tố _old để backup
    ALTER TABLE IF EXISTS birthdays RENAME TO birthdays_old;
    
    -- Đổi tên bảng mới thành tên chính thức
    ALTER TABLE IF EXISTS birthdays_new RENAME TO birthdays;
    
    -- Tạo các indexes cho bảng birthdays
    CREATE INDEX idx_birthdays_date ON birthdays(month, day);
    CREATE INDEX idx_birthdays_user ON birthdays(user_id);
    CREATE INDEX idx_birthdays_public ON birthdays(is_public);
  END IF;
END $$;

-- Tạo các bảng custom_messages, audio_messages, video_messages mới
CREATE TABLE IF NOT EXISTS custom_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_custom_messages_birthday ON custom_messages(birthday_id);
CREATE INDEX idx_custom_messages_sender ON custom_messages(sender_id);
CREATE INDEX idx_custom_messages_created ON custom_messages(created_at);

CREATE TABLE IF NOT EXISTS audio_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audio_messages_birthday ON audio_messages(birthday_id);
CREATE INDEX idx_audio_messages_sender ON audio_messages(sender_id);
CREATE INDEX idx_audio_messages_media ON audio_messages(media_id);

CREATE TABLE IF NOT EXISTS video_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_video_messages_birthday ON video_messages(birthday_id);
CREATE INDEX idx_video_messages_sender ON video_messages(sender_id);
CREATE INDEX idx_video_messages_media ON video_messages(media_id);

-- Tạo các bảng liên kết
CREATE TABLE IF NOT EXISTS album_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  album_id UUID REFERENCES albums(id) ON DELETE CASCADE,
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(album_id, media_id)
);

CREATE INDEX idx_album_media_album ON album_media(album_id);
CREATE INDEX idx_album_media_media ON album_media(media_id);
CREATE INDEX idx_album_media_order ON album_media(album_id, display_order);

CREATE TABLE IF NOT EXISTS media_tags (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  media_id UUID REFERENCES media_files(id) ON DELETE CASCADE,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(media_id, tag_id)
);

CREATE INDEX idx_media_tags_media ON media_tags(media_id);
CREATE INDEX idx_media_tags_tag ON media_tags(tag_id);

CREATE TABLE IF NOT EXISTS gift_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  birthday_id UUID REFERENCES birthdays(id) ON DELETE CASCADE,
  gift_id UUID REFERENCES virtual_gifts(id) ON DELETE CASCADE,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gift_transactions_birthday ON gift_transactions(birthday_id);
CREATE INDEX idx_gift_transactions_sender ON gift_transactions(sender_id);
CREATE INDEX idx_gift_transactions_gift ON gift_transactions(gift_id);

-- Bước 3: Tạo triggers và functions
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Thêm triggers cho các bảng
CREATE TRIGGER update_users_modtime
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_birthdays_modtime
BEFORE UPDATE ON birthdays
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_custom_messages_modtime
BEFORE UPDATE ON custom_messages
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_media_files_modtime
BEFORE UPDATE ON media_files
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_albums_modtime
BEFORE UPDATE ON albums
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

CREATE TRIGGER update_virtual_gifts_modtime
BEFORE UPDATE ON virtual_gifts
FOR EACH ROW
EXECUTE FUNCTION update_modified_column();

-- Function tìm kiếm sinh nhật sắp tới
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

-- Bước 4: Tạo views
CREATE OR REPLACE VIEW birthdays_today AS
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

CREATE OR REPLACE VIEW media_statistics AS
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

-- Bước 5: Kích hoạt RLS và tạo policies
-- Bật RLS cho tất cả các bảng
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

-- Ví dụ policies cho bảng users
CREATE POLICY users_select_policy ON users
    FOR SELECT
    USING (
        auth.uid() = id
        OR is_admin = FALSE
        OR auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY users_update_policy ON users
    FOR UPDATE
    USING (auth.uid() = id OR auth.jwt()->>'role' = 'admin');

CREATE POLICY users_delete_policy ON users
    FOR DELETE
    USING (auth.jwt()->>'role' = 'admin');

CREATE POLICY users_insert_policy ON users
    FOR INSERT
    WITH CHECK (auth.uid() = id OR auth.jwt()->>'role' = 'service');

-- Policies cho bảng birthdays
CREATE POLICY birthdays_select_policy ON birthdays
    FOR SELECT
    USING (
        is_public = TRUE
        OR user_id = auth.uid()
        OR auth.jwt()->>'role' = 'admin'
    );

CREATE POLICY birthdays_update_policy ON birthdays
    FOR UPDATE
    USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY birthdays_delete_policy ON birthdays
    FOR DELETE
    USING (user_id = auth.uid() OR auth.jwt()->>'role' = 'admin');

CREATE POLICY birthdays_insert_policy ON birthdays
    FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.jwt()->>'role' = 'admin');

-- Bước 6: Tạo helper functions bảo mật
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

-- Bước 7: Di chuyển dữ liệu từ custom_messages_old sang custom_messages (nếu cần)
-- Thêm code di chuyển dữ liệu cho các bảng audio_messages và video_messages từ schema cũ (nếu cần)

-- Bước 8: Các câu lệnh kiểm tra dữ liệu để xác nhận tính toàn vẹn sau khi migration
-- SELECT COUNT(*) FROM birthdays_old; 
-- SELECT COUNT(*) FROM birthdays;
-- (Và các câu lệnh kiểm tra khác) 
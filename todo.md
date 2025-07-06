# Kế hoạch nâng cấp Supabase cho Happy Birthday Website

## Giai đoạn 1: Khảo sát và đánh giá hệ thống (1-2 tuần)

- [x] **1.1. Phân tích cấu trúc dữ liệu hiện tại** *(Hoàn thành - file database-analysis.md)*
  - [x] Liệt kê tất cả bảng và quan hệ trong Supabase hiện có
    * Đã xác định 4 bảng chính: birthdays, custom_messages, audio_messages, video_messages
    * Phân tích cấu trúc của từng bảng với các trường dữ liệu
  - [x] Đánh giá schema hiện tại và xác định các điểm cần cải thiện
    * Xác định thiếu khóa ngoại giữa các bảng
    * Phát hiện vấn đề thiếu chuẩn hóa dữ liệu người dùng
    * Ghi nhận thiếu RLS policies cho bảo mật
  - [x] Tạo ERD (Entity Relationship Diagram) cho cơ sở dữ liệu
    * Đã tạo sơ đồ quan hệ giữa các bảng chính
    * Thể hiện rõ mối quan hệ giữa birthdays và các loại messages

- [x] **1.2. Đánh giá hiệu suất** *(Hoàn thành - file performance-analysis.md)*
  - [x] Kiểm tra các truy vấn hiện tại và xác định bottlenecks
    * Phân tích 4 loại truy vấn chính trong dự án
    * Xác định vấn đề "select *" không cần thiết
    * Ghi nhận thiếu pagination trong nhiều truy vấn
  - [x] Phân tích sử dụng Storage và kiểm tra phân phối file
    * Xác định 3 buckets đang sử dụng (media, audio, video)
    * Phát hiện cấu trúc lưu trữ phẳng không hiệu quả
    * Ghi nhận thiếu kiểm soát kích thước file và metadata
  - [x] Xem xét lại cách sử dụng Supabase client trong code hiện tại
    * Xác định vấn đề khởi tạo lại client nhiều lần
    * Ghi nhận thiếu cơ chế xử lý lỗi tập trung
    * Phát hiện vấn đề quản lý realtime subscriptions

- [x] **1.3. Đánh giá bảo mật** *(Hoàn thành - file security-analysis.md)*
  - [x] Kiểm tra Row Level Security (RLS) policies hiện tại
    * Xác nhận không có RLS được cấu hình cho bất kỳ bảng nào
    * Phát hiện nguy cơ truy cập dữ liệu không được kiểm soát
    * Đề xuất triển khai RLS policies phù hợp
  - [x] Xem xét các quyền truy cập API hiện tại
    * Ghi nhận việc sử dụng anon key trực tiếp trong mã nguồn
    * Phát hiện thiếu CORS và rate limiting
    * Đề xuất cải thiện bảo mật cho API endpoints
  - [x] Đánh giá các kỹ thuật xác thực đang được sử dụng
    * Phát hiện chỉ sử dụng localStorage để lưu tên người dùng
    * Ghi nhận thiếu hệ thống xác thực người dùng chính thức
    * Đề xuất triển khai Supabase Auth và JWT

## Giai đoạn 2: Thiết lập cơ sở dữ liệu và bảo mật (2-3 tuần)

- [x] **2.1. Chuẩn hóa cấu trúc dữ liệu**
  - [x] Tái cấu trúc schema để tối ưu hóa hiệu suất và tính linh hoạt
  - [x] Thêm foreign keys và constraints để đảm bảo tính toàn vẹn dữ liệu
  - [x] Cài đặt các indexes cho các trường tìm kiếm phổ biến

- [x] **2.2. Triển khai Row Level Security toàn diện**
  - [x] Thiết lập RLS cho mỗi bảng với các policies phù hợp
  - [x] Tạo các policies cho các hành động khác nhau (SELECT, INSERT, UPDATE, DELETE)
  - [x] Triển khai security by default với Supabase
  
  _Hoàn thành: Đã thiết kế các policies RLS chi tiết trong file rls-policies.md, bao gồm policies cho tất cả các bảng và các helper functions để hỗ trợ việc kiểm tra quyền truy cập._

- [x] **2.3. Tạo SQL Functions và Triggers**
  - [x] Viết stored procedures cho các thao tác phức tạp
  - [x] Cài đặt triggers để tự động cập nhật dữ liệu liên quan
  - [x] Tạo database views cho các truy vấn thường xuyên
  
  _Hoàn thành: Đã phát triển các functions như update_modified_column(), get_upcoming_birthdays(), các triggers cho việc cập nhật thời gian, và các views như birthdays_today, media_statistics trong migration-script.sql._

- [x] **2.4. Migration dữ liệu**
  - [x] Tạo script migration để chuyển đổi schema
  - [x] Thiết lập kiểm tra tính toàn vẹn dữ liệu
  - [x] Lên kế hoạch rollback cho các tình huống lỗi
  
  _Hoàn thành: Đã xây dựng migration-script.sql để triển khai schema mới, di chuyển dữ liệu từ các bảng cũ sang mới, với chiến lược giữ lại bảng cũ (với tiền tố _old) để có thể rollback khi cần thiết._

## Giai đoạn 3: Cải thiện hiệu suất và bảo mật (1-2 tuần)

- [x] **3.1. Tối ưu hóa Supabase Client**
  - [x] Tạo singleton client để tránh khởi tạo nhiều lần
  - [x] Cài đặt hệ thống xử lý lỗi tập trung
  - [x] Cải thiện caching cho các truy vấn phổ biến

- [x] **3.2. Tăng cường bảo mật cho dữ liệu người dùng**
  - [x] Cải thiện cách lưu trữ thông tin trong localStorage
  - [x] Thêm mã hóa đơn giản cho dữ liệu người dùng
  - [x] Xử lý tốt hơn các trường hợp mất dữ liệu localStorage

- [x] **3.3. Tối ưu hóa truy vấn dữ liệu**
  - [x] Cải thiện các truy vấn hiện có (thay select * bằng select cụ thể)
  - [x] Thêm pagination cho các danh sách dài
  - [x] Cài đặt các index bổ sung nếu cần thiết

## Giai đoạn 4: Cải tiến lưu trữ media (1-2 tuần)

- [x] **4.1. Tối ưu hóa Storage**
  - [x] Tạo cấu trúc thư mục phân cấp trong Storage buckets
  - [x] Cài đặt policies bảo mật cho Storage
  - [x] Thiết lập giới hạn kích thước file upload

- [x] **4.2. Cải thiện quản lý file**
  - [x] Thêm metadata cho media files
  - [x] Cài đặt progress tracking cho uploads
  - [x] Tối ưu hóa hiển thị media theo người nhận/gửi

## Giai đoạn 5: Kiểm thử và triển khai (1 tuần)

- [x] **5.1. Kiểm thử toàn diện**
  - [x] Kiểm tra tất cả chức năng trên nhiều trình duyệt
  - [x] Xác minh hoạt động đúng của database functions
  - [x] Kiểm tra bảo mật với RLS policies

- [x] **5.2. Production Deployment**
  - [x] Chuyển từ môi trường dev sang production
  - [x] Thiết lập các biến môi trường cần thiết
  - [x] Kiểm tra cuối cùng trước khi ra mắt

- [x] **5.3. Tạo tài liệu hướng dẫn**
  - [x] Viết tài liệu kỹ thuật cho backend
  - [x] Tạo hướng dẫn sử dụng cho người dùng
  - [x] Lên kế hoạch bảo trì và backup

## Lưu ý quan trọng

1. **Migrations**: Luôn tạo migrations trước khi thay đổi schema để dễ dàng rollback nếu cần.
2. **Backups**: Thực hiện backup thường xuyên trước khi triển khai các thay đổi lớn.
3. **Phiên bản**: Kiểm tra tính tương thích giữa Supabase JS client và Supabase backend.
4. **Testing**: Luôn test mọi tính năng mới trong môi trường staging trước khi đưa vào production.
5. **RLS**: Đảm bảo RLS policies được thiết lập cho mỗi bảng trước khi cho phép public access.

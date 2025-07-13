

---

# Mô tả dự án  (Cập nhật ngày 13/07/2025)

## 1. Tổng quan

**WellVerse** là một dự án xây dựng website thương mại điện tử hoàn chỉnh, tập trung vào lĩnh vực dược phẩm và các sản phẩm chăm sóc sức khỏe. Dự án được thực hiện trong khuôn khổ bài tập lớn của trường đại học, với mục tiêu không chỉ là tạo ra một sản phẩm khả dụng mà còn là cơ hội để các thành viên áp dụng và nâng cao kỹ năng với các công nghệ web hiện đại.

Dự án bao gồm việc phát triển một hệ thống đầy đủ từ Frontend (giao diện người dùng), Backend (logic máy chủ và API), cho đến Cơ sở dữ liệu, đi kèm với bộ tài liệu thiết kế chi tiết và báo cáo cuối kỳ.

## 2. Thông tin dự án

-   **Loại dự án:** Bài tập lớn môn học
-   **Thời gian thực hiện:** 4 tuần (Hiện còn 3 tuần)
-   **Tên dự án:** WellVerse
-   **Lĩnh vực:** E-commerce (Dược phẩm & Chăm sóc sức khỏe)
-   **Thành viên nhóm:** 4 thành viên (Trọng, Thiên, Hào, Triết)

## 3. Mục tiêu dự án

### Mục tiêu nghiệp vụ (Business Goals)
-   Xây dựng một nền tảng mua sắm thuốc và thực phẩm chức năng trực tuyến tiện lợi, an toàn và dễ sử dụng cho người dùng cuối.
-   Cung cấp cho quản trị viên (chủ cửa hàng) một công cụ mạnh mẽ để quản lý sản phẩm, đơn hàng, khách hàng và theo dõi hiệu quả kinh doanh.
-   Mô phỏng thành công các tính năng nổi bật của các chuỗi nhà thuốc lớn như Pharmacity, Long Châu.

### Mục tiêu kỹ thuật (Technical Goals)
-   Áp dụng thành công stack công nghệ hiện đại: **ReactJS (Vite), Spring Boot, và MongoDB**.
-   Xây dựng hệ thống theo kiến trúc **RESTful API**, đảm bảo sự tách biệt rõ ràng giữa Frontend và Backend.
-   Thực hành quy trình làm việc chuyên nghiệp: quản lý mã nguồn bằng Git, theo dõi công việc qua bảng (Trello/Jira), và viết tài liệu thiết kế bài bản.
-   Triển khai thành công ứng dụng lên các nền tảng đám mây (Vercel, Render...).

## 4. Phạm vi và Tính năng

### Giai đoạn 1: MVP (Sản phẩm Khả dụng Tối thiểu - Mục tiêu trong 2 tuần tới)

#### Chức năng của Người dùng (User)
-   **Xác thực:** Đăng ký, Đăng nhập bằng email và mật khẩu thông thường.
-   **Sản phẩm:** Xem danh sách sản phẩm (có phân trang), xem chi tiết sản phẩm, xem sản phẩm liên quan.
-   **Tìm kiếm & Lọc:** Tìm kiếm sản phẩm theo tên, có gợi ý khi gõ. Lọc sản phẩm theo danh mục và khoảng giá.
-   **Giỏ hàng:** Thêm/xóa/sửa sản phẩm trong giỏ hàng. **Hỗ trợ cho cả khách vãng lai (chưa đăng nhập).**
-   **Đặt hàng (Giả lập):** Tạo đơn hàng từ giỏ hàng. Hệ thống lưu đơn hàng vào database với trạng thái "Chờ xử lý".
-   **Quản lý tài khoản:** Xem và theo dõi trạng thái các đơn hàng đã đặt, xem lịch sử mua hàng.

#### Chức năng của Quản trị viên (Admin)
-   **Xác thực:** Đăng nhập vào trang quản trị riêng biệt.
-   **Quản lý Sản phẩm (Kho):** CRUD (Tạo, Xem, Cập nhật, Xóa) cho sản phẩm.
-   **Quản lý Đơn hàng:** Xem danh sách đơn hàng. Thay đổi trạng thái đơn hàng (Xác nhận, Đang giao, Hoàn thành, Hủy).
-   **Quản lý Người dùng:** Xem danh sách người dùng, có thể xóa tài khoản người dùng.
-   **Quản lý Khuyến mãi (Cơ bản):** Thêm trường `discountPercent` vào sản phẩm để hiển thị giá cũ/giá mới.
-   **Báo cáo (Cơ bản):** Xem báo cáo doanh thu theo ngày/tháng/quý.

### Giai đoạn 2: Các tính năng nâng cao (Thời gian còn lại)
-   **Xác thực nâng cao:** Đăng nhập/Đăng ký thông qua Google, Facebook.
-   **Tương tác sản phẩm:** Người dùng viết đánh giá (review) cho sản phẩm. Admin trả lời các đánh giá.
-   **Khuyến mãi nâng cao:** Quản lý các chiến dịch khuyến mãi (thêm banner quảng cáo, khung khuyến mãi vào ảnh sản phẩm, icon đặc biệt...).
-   **Thanh toán thực:** Tích hợp cổng thanh toán (Momo, ZaloPay...).

## 5. Kiến trúc & Công nghệ

-   **Frontend:** **ReactJS** (Khởi tạo và phát triển với **Vite**).
    -   *Thư viện UI:* Sẽ quyết định giữa Material-UI (MUI) hoặc Tailwind CSS.
-   **Backend:** **Spring Boot** (Java).
    -   *Bảo mật:* Spring Security với JSON Web Token (JWT).
-   **Database:** **MongoDB** (Cloud: MongoDB Atlas).
-   **Kiến trúc hệ thống:**
    `Frontend (Client) <---> RESTful API (Backend Server) <---> Database`
-   **Công cụ khác:**
    -   **Postman:** Kiểm thử API.
    -   **Git & GitHub/GitLab:** Quản lý mã nguồn.
    -   **Trello/Jira/Notion:** Quản lý công việc.

## 6. Thiết kế Dữ liệu & API

Thiết kế chi tiết của hệ thống được quy định trong các tài liệu riêng biệt và được xem là "nguồn chân lý" (source of truth) cho quá trình phát triển.

-   `database.md`: Mô tả chi tiết schema cho từng collection trong MongoDB.
-   `api-description.md`: Đặc tả chi tiết từng endpoint của RESTful API.
-   `demo_json_for_api.md`: Cung cấp các ví dụ JSON mẫu cho request và response.

**Thay đổi Kiến trúc Quan trọng:**
-   Để hỗ trợ tính năng giỏ hàng cho khách vãng lai và tăng khả năng mở rộng, collection **`carts` đã được tách riêng** thay vì nhúng trong collection `users`. Toàn bộ các tài liệu thiết kế nêu trên **đã được cập nhật** để phản ánh thay đổi này.

## 7. Tình trạng Hiện tại

-   **Frontend:** Dự án đã được khởi tạo bằng `React + Vite`. Cấu trúc thư mục cơ bản đã được thiết lập. Chưa xây dựng các thành phần giao diện (components) hoặc trang (pages).
-   **Backend:**
    -   Đã hoàn thành việc viết code cho các API thuộc modules: **User, Category, và Product** *dựa trên thiết kế cũ (giỏ hàng nhúng)*.
    -   Phần code này **chưa được kiểm thử** và **cần được tái cấu trúc** để phù hợp với kiến trúc tách giỏ hàng mới.
-   **Tài liệu:** Toàn bộ tài liệu thiết kế (database, API, JSON examples) **đã được cập nhật** để phản ánh kiến trúc mới. Đây là nguồn tham khảo chính thức cho giai đoạn tái cấu trúc và phát triển tiếp theo.
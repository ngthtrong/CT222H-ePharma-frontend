# Đặc tả Giao diện Chi tiết - Dự án WellVerse

-   **Tài liệu tham khảo chính:** [https://www.pharmacity.vn/](https://www.pharmacity.vn/)
-   **Thư viện UI:** **Material-UI (MUI)**. Tất cả các gợi ý đều dựa trên hệ sinh thái của MUI.
-   **Mục tiêu:** Cung cấp một bộ khung và đặc tả chi tiết để xây dựng giao diện người dùng (UI) cho dự án, đảm bảo tính nhất quán, chuyên nghiệp và đẩy nhanh tiến độ.

---

## 1. Hệ thống Thiết kế Chung (Global Design System)

Đây là nền tảng cho toàn bộ giao diện, cần được thiết lập đầu tiên trong `theme` của MUI.

### a. Bảng màu (Palette)

Dựa trên `pharmacity.vn`, chúng ta sẽ sử dụng tông màu xanh lá cây làm chủ đạo, tạo cảm giác an toàn, thiên nhiên và liên quan đến sức khỏe.

-   **Primary (Màu chủ đạo):** Xanh lá cây. Dùng cho các nút chính, link, icon đang hoạt động, và các yếu tố thương hiệu.
    -   *Gợi ý MUI Theme:* `{ palette: { primary: { main: '#0D47A1' } } }` (Một màu xanh lá đậm, sang trọng).
-   **Secondary (Màu phụ):** Cam. Dùng cho các tag khuyến mãi, banner đặc biệt để tạo điểm nhấn.
    -   *Gợi ý MUI Theme:* `{ palette: { secondary: { main: '#6dbd45' } } }`
-   **Background:** Màu nền chính là trắng (`#f4f6f8`), nền phụ (cho các section, card) là xám rất nhạt.
    -   *Gợi ý MUI Theme:* `{ palette: { background: { default: '#f4f6f8', paper: '#F5F5F5' } } }`
-   **Text:** Màu đen đậm cho tiêu đề và xám cho các văn bản phụ.
    -   *Gợi ý MUI Theme:* `{ palette: { text: { primary: '#212B36', secondary: '#637381' } } }`

### b. Kiểu chữ (Typography)

Sử dụng font chữ rõ ràng, dễ đọc trên mọi thiết bị.

-   **H1, H2 (Tiêu đề trang, section lớn):** Chữ to, in đậm.
    -   *Gợi ý MUI Component:* `<Typography variant="h4" fontWeight="700">`
-   **H3 (Tên sản phẩm, tiêu đề nhỏ):** Chữ vừa, in đậm.
    -   *Gợi ý MUI Component:* `<Typography variant="h6" fontWeight="600">`
-   **Body (Văn bản thường):**
    -   *Gợi ý MUI Component:* `<Typography variant="body1">`
-   **Giá sản phẩm:** Luôn in đậm để nổi bật.
    -   *Gợi ý MUI Component:* `<Typography variant="subtitle1" fontWeight="700">`

### c. Bố cục chung (Main Layout)

-   **Header (`<AppBar>`):** Luôn cố định (sticky) ở trên cùng khi người dùng cuộn trang.
-   **Main Content (`<Container>`):** Sử dụng `<Container maxWidth="lg">` (hoặc `xl`) để nội dung chính được căn giữa và không bị quá rộng trên màn hình lớn.
-   **Footer (`<Box>`):** Phần chân trang có màu nền xám nhạt (`background.paper`).

---

## 2. Các Thành phần Tái sử dụng (Reusable Components)

Đây là những "viên gạch" cốt lõi. Xây dựng chúng trước sẽ giúp các trang được lắp ráp nhanh chóng và nhất quán.

### a. Header

Header của Pharmacity có nhiều thông tin, chúng ta sẽ chắt lọc những gì quan trọng nhất.

-   **Cấu trúc:**
    1.  **Logo:** Đặt bên trái, click để về trang chủ.
    2.  **Thanh tìm kiếm (`<Autocomplete>`):** **Rất quan trọng.** Chiếm diện tích lớn nhất, nằm ở trung tâm. Có icon tìm kiếm và placeholder rõ ràng ("Tìm kiếm sản phẩm, thương hiệu..."). Phải có chức năng gợi ý sản phẩm khi người dùng gõ.
    3.  **Hành động người dùng (User Actions):**
        -   **Tài khoản (`<Button>`):** Icon người dùng kèm chữ "Tài khoản". Khi đã đăng nhập, hiển thị tên người dùng. Click vào sẽ mở `<Menu>` với các lựa chọn (Đơn hàng, Thông tin tài khoản, Đăng xuất).
        -   **Giỏ hàng (`<Badge>`):** Icon giỏ hàng với một chỉ báo (badge) màu `secondary` (cam) hiển thị số lượng sản phẩm. Click vào sẽ mở ra một `<Drawer>` từ bên phải, hiển thị tóm tắt giỏ hàng.
-   **Thanh điều hướng danh mục (`<Tabs>` hoặc `<Button>` group):** Ngay bên dưới header chính, hiển thị các danh mục cấp 1. Có một nút "Danh mục sản phẩm" với icon 3 gạch ngang để mở ra một Mega Menu chi tiết hơn.

### b. Product Card (Thẻ Sản phẩm)

-   **Cấu trúc:** Bọc trong `<Card>` với viền nhẹ và hiệu ứng nổi lên khi hover (`sx={{ '&:hover': { boxShadow: 6 } }}`).
-   **Tag Khuyến mãi:** Nếu có `discountPercent > 0`, hiển thị một tag nhỏ màu `secondary` (cam) ở góc trên bên trái của thẻ.
-   **Hình ảnh:** Chiếm 50-60% chiều cao thẻ. Dùng `<CardMedia>`.
-   **Tên sản phẩm:** Ngay dưới ảnh, giới hạn 2 dòng chữ, sử dụng `textOverflow: 'ellipsis'`.
-   **Giá:**
    -   Giá sau khuyến mãi: To, đậm, màu `text.primary`.
    -   Giá gốc: Nhỏ hơn, gạch ngang, màu `text.secondary`.
-   **Nút "Thêm vào giỏ":** Một nút `<Button>` với màu `primary` (xanh lá) và icon giỏ hàng, chiếm toàn bộ chiều rộng cuối thẻ.

### c. Footer

-   **Cấu trúc:** Chia thành nhiều cột (`<Grid container>`).
-   **Các cột:** Thông tin công ty, Chính sách (đổi trả, bảo mật...), Tổng đài hỗ trợ, Kết nối mạng xã hội, Phương thức thanh toán.

---

## 3. Đặc tả Chi tiết từng Trang (Page Specifications)

### a. Trang chủ (`/`)

-   **Mục đích:** Tạo ấn tượng đầu tiên, giới thiệu sản phẩm/chương trình hot và điều hướng người dùng.
-   **Cấu trúc theo thứ tự từ trên xuống:**
    1.  **Hero Banner Carousel:** Một thanh trượt ảnh lớn, toàn chiều rộng, tự động chạy.
    2.  **Danh mục nổi bật:** Một `<Grid>` hiển thị các icon và tên của những danh mục chính (Dược phẩm, Chăm sóc cá nhân, Mẹ và bé...).
    3.  **Flash Sale / Khuyến mãi hot:** Một section có nền màu nổi bật, chứa một thanh trượt sản phẩm (`Product Card`) đang giảm giá sâu, có thể kèm đồng hồ đếm ngược.
    4.  **Sản phẩm bán chạy:** Một thanh trượt các `Product Card`.
    5.  **Thương hiệu nổi bật:** Một `<Grid>` hoặc thanh trượt hiển thị logo của các thương hiệu lớn.
    6.  **"Góc sức khỏe" (Blog/Tin tức):** (Giai đoạn 2) Một section hiển thị các bài viết mới.

### b. Trang Danh sách Sản phẩm (PLP - `/category/:slug`)

-   **Bố cục:** 2 cột.
-   **Cột Trái (20-25%): Bộ lọc (`<Paper>`)**
    -   **Danh mục con:** Dạng cây (Tree View) hoặc danh sách lồng nhau.
    -   **Thương hiệu:** Danh sách các `<Checkbox>` có chức năng tìm kiếm thương hiệu.
    -   **Khoảng giá:** Dùng `<Slider range>`.
    -   **Các thuộc tính khác:** Dạng `<Checkbox>` (nếu có).
-   **Cột Phải (75-80%): Kết quả**
    -   **Breadcrumbs (`<Breadcrumbs>`):** Hiển thị đường dẫn: `Trang chủ > Dược phẩm > Thuốc không kê đơn`.
    -   **Tiêu đề và Sắp xếp:** Tiêu đề danh mục, bên phải là một `<Select>` dropdown cho phép sắp xếp (Mặc định, Bán chạy, Giá tăng dần...).
    -   **Lưới sản phẩm (`<Grid container spacing={2}>`):** Hiển thị các `ProductCard`.
    -   **Phân trang (`<Pagination>`):** Nằm ở cuối, căn giữa, hiển thị rõ ràng.

### c. Trang Chi tiết Sản phẩm (PDP - `/product/:slug`)

-   **Bố cục:** 2 cột trên màn hình lớn.
-   **Cột Trái (40%): Hình ảnh sản phẩm**
    -   Một ảnh lớn chính.
    -   Một hàng các ảnh thumbnail bên dưới, click vào để thay đổi ảnh chính.
-   **Cột Phải (60%): Thông tin và Hành động**
    -   **Breadcrumbs**.
    -   **Tên sản phẩm (`<Typography variant="h4">`)**.
    -   **Thông tin phụ:** Mã SKU, Thương hiệu (là link), Tình trạng kho.
    -   **Giá sản phẩm:** Hiển thị nổi bật, tương tự `ProductCard`.
    -   **Bộ chọn số lượng:** Dùng `<TextField size="small">` ở giữa và 2 `<IconButton>` hai bên cho phép tăng/giảm.
    -   **Nút "Thêm vào giỏ hàng":** Nút lớn, màu `primary`.
    -   **Chính sách đi kèm:** Các icon nhỏ và text về cam kết (Chính hãng 100%, Giao hàng nhanh...).
-   **Phần dưới (toàn chiều rộng): Thông tin chi tiết**
    -   Sử dụng `<Tabs>` để chia các mục: **Mô tả sản phẩm**, **Thành phần**, **Hướng dẫn sử dụng**, **Đánh giá của khách hàng**. Giúp giao diện gọn gàng và không bị quá dài.

### d. Trang Đăng nhập / Đăng ký (`/login`, `/register`)

-   **Mục đích:** Xác thực người dùng.
-   **Cấu trúc:** Một layout đơn giản, tập trung vào form ở giữa màn hình.
    -   Sử dụng `<Paper>` hoặc `<Card>` để chứa form.
    -   Tiêu đề "Đăng nhập" hoặc "Đăng ký".
    -   Các ô nhập liệu: `<TextField label="Email" variant="outlined" fullWidth margin="normal">` (Tương tự cho Mật khẩu, Họ tên...).
    -   Nút submit: `<Button type="submit" variant="contained" size="large" fullWidth>`.
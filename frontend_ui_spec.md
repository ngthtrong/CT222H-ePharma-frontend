

---

### **`frontend_ui_spec.md`**

# Tài liệu Đặc tả Giao diện (UI Specification) - Dự án WellVerse

-   **Dành cho:** Trọng (Frontend Developer)
-   **Mục tiêu:** Cung cấp một bộ khung và đặc tả chi tiết cho việc xây dựng giao diện người dùng (UI) của dự án WellVerse.
-   **Thư viện UI:** **Material-UI (MUI)**. Tất cả các gợi ý về component đều dựa trên hệ sinh thái của MUI.

---

## 1. Nguyên tắc & Hệ thống Thiết kế Chung (Global Design System)

Trước khi xây dựng từng trang, chúng ta cần định nghĩa các yếu tố chung để đảm bảo sự nhất quán.

### a. Bảng màu (Palette)

Chúng ta sẽ sử dụng một theme sạch sẽ, chuyên nghiệp, gợi cảm giác tin tưởng của ngành y tế. Màu xanh dương của Long Châu là một lựa chọn tốt.

-   **Primary (Màu chủ đạo):** Xanh dương. Dùng cho các nút bấm chính, link, header, các yếu tố cần nhấn mạnh.
    -   *Gợi ý MUI Theme:* `{ palette: { primary: { main: '#0D47A1' } } }` (Một màu xanh đậm, chuyên nghiệp).
-   **Secondary (Màu phụ):** Xám nhạt. Dùng cho nền, đường viền, các text phụ.
    -   *Gợi ý MUI Theme:* `{ palette: { background: { default: '#f4f6f8' } } }`
-   **Error:** Đỏ. Dùng cho thông báo lỗi.
-   **Success:** Xanh lá. Dùng cho thông báo thành công.
-   **Text:** Màu đen cho tiêu đề (`#212121`) và xám đậm cho văn bản thường (`#424242`).

### b. Bố cục chung (Main Layout)

Tất cả các trang người dùng sẽ chia sẻ một bố cục chung:

-   **Header (Thanh đầu trang):**
    -   Luôn hiển thị ở trên cùng và "dính" lại (sticky) khi cuộn trang.
    -   **MUI Component:** `<AppBar position="sticky">`
-   **Main Content (Nội dung chính):**
    -   Nằm giữa Header và Footer. Phần này sẽ thay đổi tùy theo trang.
    -   **MUI Component:** `<Container maxWidth="lg">` để giữ nội dung không bị quá rộng trên màn hình lớn.
-   **Footer (Chân trang):**
    -   Luôn ở dưới cùng. Chứa các thông tin về công ty, link chính sách, mạng xã hội.
    -   **MUI Component:** `<Box component="footer">` với màu nền xám.

---

## 2. Các Thành phần Tái sử dụng (Reusable Components)

Đây là những "viên gạch" sẽ được sử dụng ở nhiều nơi. Xây dựng chúng trước sẽ tiết kiệm rất nhiều thời gian.

### a. Header

-   **Cấu trúc (Từ trái qua phải):**
    1.  **Logo:** Click vào để về trang chủ.
    2.  **Search Bar (Thanh tìm kiếm):** Chiếm phần lớn diện tích. Có gợi ý sản phẩm (autocomplete) khi người dùng gõ.
        -   **MUI Component:** `<TextField>` kết hợp với `<Autocomplete>` của MUI.
    3.  **Hotline:** Hiển thị số điện thoại.
    4.  **User Actions (Hành động người dùng):**
        -   **Giỏ hàng:** Icon giỏ hàng với một chỉ báo (badge) hiển thị số lượng sản phẩm. Click vào sẽ mở ra một Popover hoặc Drawer xem trước giỏ hàng.
            -   **MUI Component:** `<IconButton>` chứa `<ShoppingCartIcon />` và được bọc bởi `<Badge badgeContent={cartItemCount} color="error">`.
        -   **Tài khoản:**
            -   Nếu chưa đăng nhập: Nút "Đăng nhập / Đăng ký".
                -   **MUI Component:** `<Button variant="outlined">`
            -   Nếu đã đăng nhập: Hiển thị tên người dùng và avatar. Click vào sẽ mở ra một Menu với các lựa chọn (Tài khoản của tôi, Đơn hàng, Đăng xuất).
                -   **MUI Component:** `<Chip>` hoặc `<Button>` với `<Avatar>` và `<KeyboardArrowDownIcon />`. Menu dùng `<Menu>` và `<MenuItem>`.

### b. Product Card (Thẻ Sản phẩm)

Component quan trọng nhất, hiển thị một sản phẩm trong danh sách.

-   **Cấu trúc:**
    -   Toàn bộ được bọc trong một thẻ có hiệu ứng nổi nhẹ.
        -   **MUI Component:** `<Card sx={{ '&:hover': { boxShadow: 6 } }}>`
    -   **Hình ảnh:** Chiếm phần lớn diện tích trên cùng.
        -   **MUI Component:** `<CardMedia component="img" />`
    -   **Tên sản phẩm:** Ngay dưới ảnh, tối đa 2 dòng.
        -   **MUI Component:** `<Typography variant="body1" fontWeight="medium">`
    -   **Giá:**
        -   Nếu có khuyến mãi: Hiển thị giá mới (màu đỏ, to) và giá cũ (gạch ngang, màu xám).
        -   Nếu không: Chỉ hiển thị giá bình thường.
        -   **MUI Component:** `<Typography color="error">` và `<Typography sx={{ textDecoration: 'line-through' }} color="text.secondary">`.
    -   **Nút "Thêm vào giỏ":** Nút bấm ở dưới cùng.
        -   **MUI Component:** `<Button variant="contained" startIcon={<AddShoppingCartIcon />}>`

---

## 3. Đặc tả Chi tiết từng Trang (Page Specifications)

### a. Trang chủ (`/`)

-   **Mục đích:** Giới thiệu các sản phẩm và chương trình nổi bật, điều hướng người dùng.
-   **Cấu trúc:**
    1.  **Hero Section (Banner chính):** Một carousel (thanh trượt) hiển thị các banner khuyến mãi lớn, toàn màn hình.
        -   **MUI Component:** Có thể dùng thư viện ngoài như `react-slick` hoặc tự xây dựng với `<Box>`.
    2.  **Danh mục nổi bật:** Một lưới hiển thị các danh mục sản phẩm chính (ví dụ: Dược phẩm, Chăm sóc cá nhân, Thiết bị y tế...). Mỗi danh mục là một hình ảnh và tên.
        -   **MUI Component:** `<Grid container spacing={2}>` chứa các `<Grid item>` là các `<Card>` hoặc `<Paper>`.
    3.  **Product Sliders (Thanh trượt sản phẩm):**
        -   Các section như "Khuyến mãi hot", "Bán chạy nhất", được trình bày dưới dạng thanh trượt ngang.
        -   Mỗi thanh trượt chứa một loạt các `ProductCard`.
        -   **MUI Component:** Dùng `react-slick` để bọc một `<Grid>` chứa các `ProductCard`.

### b. Trang Danh sách Sản phẩm (`/category/:slug`)

-   **Mục đích:** Hiển thị tất cả sản phẩm thuộc một danh mục, cho phép lọc và sắp xếp.
-   **Cấu trúc (Layout 2 cột):**
    1.  **Cột Trái - Bộ lọc (Filters - khoảng 25% chiều rộng):**
        -   **MUI Component:** `<Paper elevation={0} variant="outlined">` chứa các bộ lọc.
        -   **Lọc theo danh mục con:** Dạng cây hoặc danh sách.
            -   **MUI Component:** `<List>` và `<ListItemButton>`.
        -   **Lọc theo khoảng giá:** Một thanh trượt.
            -   **MUI Component:** `<Slider>`.
        -   **Lọc theo thương hiệu:** Danh sách các checkbox.
            -   **MUI Component:** `<FormGroup>` chứa các `<FormControlLabel control={<Checkbox />}>`.
    2.  **Cột Phải - Danh sách sản phẩm (Products - khoảng 75% chiều rộng):**
        -   **Breadcrumbs:** Hiển thị đường dẫn (ví dụ: `Trang chủ > Dược phẩm > Thuốc không kê đơn`).
            -   **MUI Component:** `<Breadcrumbs>`.
        -   **Sắp xếp:** Dropdown cho phép sắp xếp (Mới nhất, Giá tăng dần, Giá giảm dần).
            -   **MUI Component:** `<Select>`.
        -   **Lưới sản phẩm:** Hiển thị các `ProductCard`.
            -   **MUI Component:** `<Grid container spacing={2}>`.
        -   **Phân trang:**
            -   **MUI Component:** `<Pagination count={totalPages}>` ở dưới cùng, căn giữa.

### c. Trang Chi tiết Sản phẩm (`/product/:slug`)

-   **Mục đích:** Cung cấp mọi thông tin về một sản phẩm và cho phép thêm vào giỏ hàng.
-   **Cấu trúc (Layout 2 cột):**
    1.  **Cột Trái - Hình ảnh sản phẩm:**
        -   Một ảnh lớn và một loạt ảnh thu nhỏ (thumbnail) bên dưới. Click vào ảnh nhỏ sẽ đổi ảnh lớn.
    2.  **Cột Phải - Thông tin và hành động:**
        -   **Breadcrumbs:** Tương tự trang danh sách.
        -   **Tên sản phẩm:**
            -   **MUI Component:** `<Typography variant="h4">`.
        -   **Thương hiệu, Tình trạng kho:**
            -   **MUI Component:** `<Typography variant="body2">`.
        -   **Giá:** Tương tự `ProductCard`.
        -   **Bộ chọn số lượng:**
            -   **MUI Component:** Một `<TextField size="small">` ở giữa, hai bên là `<IconButton>` với icon `<AddIcon />` và `<RemoveIcon />`.
        -   **Nút Thêm vào giỏ:** Nút lớn, màu chủ đạo.
            -   **MUI Component:** `<Button variant="contained" size="large">`.
    3.  **Phần dưới - Thông tin chi tiết:**
        -   Sử dụng Tabs để chia các mục: "Mô tả chi tiết", "Thành phần", "Hướng dẫn sử dụng", "Đánh giá".
        -   **MUI Component:** `<Tabs>` và `<TabPanel>`.

### d. Trang Đăng nhập / Đăng ký (`/login`, `/register`)

-   **Mục đích:** Xác thực người dùng.
-   **Cấu trúc:** Một layout đơn giản, tập trung vào form.
    -   Một `<Paper>` hoặc `<Card>` ở giữa màn hình.
    -   Tiêu đề "Đăng nhập" hoặc "Đăng ký".
    -   Các ô nhập liệu:
        -   **MUI Component:** `<TextField label="Email" variant="outlined" fullWidth margin="normal">` (Tương tự cho Mật khẩu, Họ tên...).
    -   Nút submit:
        -   **MUI Component:** `<Button type="submit" variant="contained" size="large" fullWidth>`.
    -   Link để chuyển đổi giữa form đăng nhập và đăng ký.
    -   (GĐ 2) Các nút đăng nhập bằng Google/Facebook.

### e. Trang Giỏ hàng (`/cart`)

-   **Mục đích:** Cho người dùng xem lại các sản phẩm đã chọn và tiến hành đặt hàng.
-   **Cấu trúc (Layout 2 cột):**
    1.  **Cột Trái - Danh sách sản phẩm trong giỏ:**
        -   Mỗi sản phẩm là một hàng, bao gồm: Ảnh, Tên, Giá, Bộ chọn số lượng, Nút xóa.
        -   **MUI Component:** Có thể dùng `<List>` hoặc `<Table>`.
    2.  **Cột Phải - Tóm tắt đơn hàng:**
        -   Một `<Paper>` hoặc `<Card>` "dính" lại khi cuộn.
        -   Hiển thị: Tạm tính, Phí vận chuyển (tạm tính), Tổng cộng.
        -   Nút "Tiến hành đặt hàng" lớn, rõ ràng.
            -   **MUI Component:** `<Button variant="contained" size="large" fullWidth>`.
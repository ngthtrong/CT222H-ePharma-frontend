



# ePharma Frontend - React Application

🏥 **ePharma** - Hệ thống nhà thuốc trực tuyến uy tín, cung cấp thuốc và dược phẩm chất lượng cao với dịch vụ tận tâm.

## 🐳 Docker Setup (Đã được đơn giản hóa)

Dự án đã được đơn giản hóa với một kịch bản Docker duy nhất hỗ trợ cả development và production mode.

### Cấu trúc Docker
- **Dockerfile**: Multi-stage build duy nhất
- **docker-compose.yml**: File compose chung với environment variables
- **.env.development**: Cấu hình cho development
- **.env.production**: Cấu hình cho production

### Lệnh sử dụng nhanh

```bash
# Development mode (với hot-reload)
npm run docker:dev

# Production mode (chạy nền)
npm run docker:prod

# Dừng containers
npm run docker:stop

# Xem logs
npm run docker:logs

# Dọn dẹp hoàn toàn
npm run docker:clean

# Truy cập shell container
npm run docker:shell
```

### Hoặc sử dụng script quản lý

```bash
# Windows
docker-manager-simple.bat [dev|prod|stop|clean|logs|shell]

# Linux/Mac
chmod +x docker-manager-simple.sh
./docker-manager-simple.sh [dev|prod|stop|clean|logs|shell]
```

### Truy cập ứng dụng
- **Development**: http://localhost:5173
- **Production**: http://localhost:80

Xem thêm chi tiết trong [DOCKER_SIMPLE.md](DOCKER_SIMPLE.md)

---

# Kế hoạch Hành động - Dự án 

-   **Ngày bắt đầu:** 13/07/2025
-   **Ngày kết thúc (Hạn chót báo cáo):** 02/08/2025
-   **Tổng thời gian còn lại:** 3 tuần (21 ngày)


### Nguyên tắc chỉ đạo (Mantra)
> **"Hoàn thành hơn Hoàn hảo"** - Chúng ta sẽ tập trung vào việc hoàn thành các tính năng cốt lõi để đảm bảo có sản phẩm chạy được để báo cáo. Các tính năng nâng cao hoặc các chi tiết nhỏ sẽ được xem xét sau nếu còn thời gian.



## **Tuần 1 (13/07 - 19/07): Nền móng & Tái cấu trúc**

*   **Mục tiêu chính:** Đây là tuần quan trọng nhất. Backend phải được tái cấu trúc thành công theo thiết kế mới. Frontend phải xây dựng xong bộ khung và các trang giao diện tĩnh.
*   **Kết quả cần đạt cuối tuần:**
    *   Backend đã tái cấu trúc, chạy ổn định và có tài liệu API tự động.
    *   Frontend có thể điều hướng qua lại giữa các trang, có giao diện cho các trang chính.
    *   Toàn bộ API của User, Category, Product, và Cart (sau tái cấu trúc) đã được kiểm thử bởi Triết.

### Nhiệm vụ chi tiết:


#### **Frontend**
1.  **Thiết lập môi trường:**
    -   **Nhiệm vụ:** Cài đặt các thư viện cần thiết: `react-router-dom`, `axios`, và quyết định thư viện UI (MUI hoặc Tailwind CSS).
2.  **Xây dựng Bộ khung (Layout & Routing):**
    -   **Nhiệm vụ:** Tạo layout chung (Header, Footer). Cấu hình các routes (đường dẫn) cho các trang chính.
3.  **Xây dựng Giao diện Tĩnh:**
    -   **Nhiệm vụ:** Xây dựng giao diện (chưa cần gọi API) cho các trang:
        -   Trang chủ (HomePage)
        -   Trang Đăng ký (RegisterPage)
        -   Trang Đăng nhập (LoginPage)
        -   Trang Danh sách Sản phẩm (ProductsPage)
4.  **Chuẩn bị Dữ liệu:**
    -   **Nhiệm vụ:** Hoàn thành file dữ liệu mẫu (JSON/Excel) cho ít nhất 50 sản phẩm thuộc nhiều danh mục. Import dữ liệu này vào MongoDB Atlas.
5.  **Kiểm thử API:**
    -   **Nhiệm vụ:** Sử dụng Postman. Sẵn sàng kiểm thử ngay khi Backend hoàn thành tái cấu trúc và cung cấp link Swagger.
    -   Kiểm tra kỹ lưỡng các API của User, Category, Product và **toàn bộ API Cart mới**.
    -   Báo cáo lỗi (bug) một cách chi tiết (endpoint, request body, response nhận được, response mong muốn) cho team Backend.

---

## **Tuần 2 (20/07 - 26/07): Tích hợp & Hoàn thiện Luồng Mua hàng**

*   **Mục tiêu chính:** Kết nối Frontend và Backend. Hoàn thiện toàn bộ luồng chức năng của người dùng từ xem sản phẩm đến quản lý giỏ hàng.
*   **Kết quả cần đạt cuối tuần:**
    *   Người dùng có thể xem, tìm kiếm, lọc sản phẩm trên giao diện.
    *   Người dùng (cả khách và đã đăng nhập) có thể thêm, sửa, xóa sản phẩm trong giỏ hàng.
    *   Chức năng `merge` giỏ hàng sau khi đăng nhập hoạt động trơn tru.

### Nhiệm vụ chi tiết:

#### **Frontend (Trọng)**
1.  **Tích hợp API Xác thực:**
    -   **Nhiệm vụ:** Gọi API đăng ký, đăng nhập. Lưu `accessToken` và thông tin người dùng.
2.  **Tích hợp API Sản phẩm:**
    -   **Nhiệm vụ:** Lấy và hiển thị dữ liệu sản phẩm, danh mục lên giao diện. Hoàn thiện chức năng tìm kiếm, lọc.
3.  **Tích hợp API Giỏ hàng (Phần phức tạp nhất):**
    -   **Nhiệm vụ:**
        -   Triển khai logic tạo và quản lý `cartSessionId` trong `localStorage` cho khách vãng lai.
        -   Gọi API thêm/sửa/xóa sản phẩm trong giỏ hàng, gửi kèm header tương ứng.
        -   Gọi API `/cart/merge` ngay sau khi người dùng đăng nhập thành công.
4.  **Kiểm thử Luồng chức năng:**
    -   **Nhiệm vụ:** Phối hợp với Trọng, thực hiện kiểm thử toàn diện luồng người dùng trên giao diện web. Ghi nhận và báo cáo lỗi UI/UX và logic.
5.  **Soạn thảo Báo cáo:**
    -   **Nhiệm vụ:** Bắt đầu viết dàn ý chi tiết và các phần nội dung cơ bản cho file báo cáo Word (giới thiệu, phân tích thiết kế...).

---

## **Tuần 3 (27/07 - 02/08): Hoàn thiện MVP, Đánh bóng & Báo cáo**

*   **Mục tiêu chính:** Hoàn thành nốt các chức năng Admin, sửa lỗi, triển khai sản phẩm và hoàn thiện mọi tài liệu để sẵn sàng báo cáo.
*   **Kết quả cần đạt cuối tuần (Thứ Sáu, 01/08):**
    *   Sản phẩm MVP được triển khai online và hoạt động.
    *   File báo cáo và slide thuyết trình đã hoàn thiện.
    *   Kịch bản demo đã được tổng duyệt.

### Nhiệm vụ chi tiết:

#### **Hoàn thiện Tính năng (Đến Thứ Tư, 30/07)**
-   Hoàn thành tất cả các API còn lại của MVP (Orders, CRUD Admin cho sản phẩm, quản lý đơn hàng, báo cáo cơ bản).
-   Xây dựng giao diện và tích hợp các API cho luồng Đặt hàng và các trang quản lý của Admin.

#### **Ổn định & Triển khai (Thứ Năm, 31/07)**
-   Ngưng phát triển tính năng mới. Tập trung sửa các lỗi tồn đọng quan trọng nhất.
-   Dọn dẹp code, kiểm tra lại cấu hình và triển khai lên nền tảng **Render** hoặc **Heroku**.
-   Tinh chỉnh UI/UX, kiểm tra responsive. Triển khai lên nền tảng **Vercel** hoặc **Netlify**.

#### **Hoàn thiện Tài liệu (Cả tuần)**
-   Chịu trách nhiệm chính hoàn thiện nội dung file báo cáo Word và slide PowerPoint.
-   Cung cấp thông tin, hình ảnh, sơ đồ cần thiết cho Triết. Cùng nhau review và chỉnh sửa tài liệu.

#### **Tổng duyệt (Thứ Sáu, 01/08)**
-   **Cả nhóm:** Họp offline.
-   Chạy thử kịch bản demo sản phẩm từ A đến Z trên môi trường đã triển khai.
-   Phân công người trình bày từng phần.
-   Thuyết trình thử và góp ý, tính toán thời gian.

#### **Ngày báo cáo (Thứ Bảy, 02/08)**
-   Tự tin, bình tĩnh và trình bày thành quả của cả nhóm.
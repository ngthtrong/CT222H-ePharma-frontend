# Hướng dẫn GitHub Copilot cho Frontend Dự án WellVerse

Mục tiêu: Hướng dẫn này giúp GitHub Copilot (và các thành viên trong nhóm) tạo ra code React nhất quán, dễ bảo trì và tương tác chính xác với Backend API của dự án WellVerse.

## 1. Tổng quan về Công nghệ (Tech Stack)
- **Framework:** React 18+ (khởi tạo bằng Vite).
- **Ngôn ngữ:** JavaScript (ES6+).
- **Thư viện UI:** **Material-UI (MUI) v5**. Luôn ưu tiên sử dụng component của MUI.
- **Routing:** `react-router-dom` v6.
- **HTTP Client:** `axios` để gọi API.
- **State Management:**
    - `useState` cho state cục bộ của component.
    - `useContext` + `useReducer` cho state toàn cục (ví dụ: thông tin người dùng, giỏ hàng).

## 2. Quy ước về UI & Thiết kế (UI & Design Conventions)
Luôn tuân thủ theo file `frontend_ui_spec.md`.
- **Hệ thống thiết kế:**
    - **Màu chủ đạo (Primary):** Xanh dương đậm (`#0D47A1`).
    - **Nền (Background):** Xám rất nhạt (`#f4f6f8`).
- **Bố cục chung (Layout):**
    - **Header:** Dùng `<AppBar position="sticky">`.
    - **Content:** Bọc trong `<Container maxWidth="lg">` để giữ nội dung ở giữa và không quá rộng.
    - **Footer:** Dùng `<Box component="footer">`.
- **Component tái sử dụng:**
    - **ProductCard:** Dùng `<Card>`, `<CardMedia>`, `<Typography>`, `<Button>`.
    - **Header:** Dùng `<Autocomplete>` cho thanh tìm kiếm, `<Badge>` cho icon giỏ hàng.

## 3. Kiến trúc Thư mục (Folder Architecture)
Để đảm bảo tính tổ chức, hãy tuân theo cấu trúc thư mục sau:
- `src/api`: Chứa các file định nghĩa và gọi API bằng `axios` (ví dụ: `productApi.js`, `authApi.js`).
- `src/assets`: Chứa hình ảnh tĩnh, icons, fonts.
- `src/components`: Chứa các component UI tái sử dụng (ví dụ: `ProductCard`, `Header`, `Footer`).
- `src/contexts`: Chứa các file định nghĩa Context API (ví dụ: `AuthContext.js`, `CartContext.js`).
- `src/hooks`: Chứa các custom hook (ví dụ: `useApi.js` để quản lý loading/error state).
- `src/layouts`: Chứa các component layout chính (ví dụ: `MainLayout.js`).
- `src/pages`: Chứa các component tương ứng với một trang (route) của ứng dụng (ví dụ: `HomePage.js`, `ProductDetailPage.js`).
- `src/routes`: Chứa file cấu hình routing của `react-router-dom`.
- `src/utils`: Chứa các hàm tiện ích (ví dụ: `formatCurrency.js`, `localStorage.js`).

---

## 4. NGỮ CẢNH DỰ ÁN CỐT LÕI (QUAN TRỌNG NHẤT)

### 4.1. Tương tác với WellVerse API
Luôn tạo các hàm gọi API theo các đặc tả trong `api-description.md` và `demo_json_for_api.md`.

- **Base URL:** Tạo một instance `axios` với `baseURL` là `import.meta.env.VITE_API_URL`.
- **Lọc sản phẩm:** Khi gọi `GET /api/v1/products`, hãy xây dựng một object `params` chứa các bộ lọc (`categoryId`, `minPrice`, `sortBy`...) và truyền nó cho `axios`.
- **Giỏ hàng của khách (Guest Cart):**
  - Khi người dùng chưa đăng nhập, **phải** tạo một mã `sessionId` (dùng `crypto.randomUUID()`) và lưu vào `localStorage`.
  - Khi gọi API giỏ hàng cho khách (`GET /cart`, `POST /cart/items`...), phải thêm header: `headers: { 'X-Cart-Session-ID': sessionId }`.
- **Giỏ hàng của người dùng (User Cart):**
  - Khi người dùng đã đăng nhập, mọi request API yêu cầu xác thực phải có header: `headers: { 'Authorization': 'Bearer ' + accessToken }`.
- **Gộp giỏ hàng (Merge Cart):**
  - Ngay **sau khi người dùng đăng nhập thành công**, kiểm tra xem có `sessionId` của giỏ hàng khách trong `localStorage` hay không.
  - Nếu có, gọi ngay API `POST /api/v1/cart/merge` với **cả hai header** `Authorization` và `X-Cart-Session-ID`.
  - Sau khi gọi merge thành công, **phải xóa `sessionId`** khỏi `localStorage`.

### 4.2. Cấu trúc Dữ liệu chính (API Responses)
Hãy kỳ vọng API trả về dữ liệu có cấu trúc như sau.

- **Đối tượng `Product`:** `{ _id, name, slug, images, price, discountPercent, stockQuantity, categoryId, brand }`
- **Đối tượng `Category`:** `{ _id, name, slug, parentCategoryId }`
- **Đối tượng `Cart`:** `{ _id, items: [ { productId: { _id, name, images, price, slug }, quantity: 1 } ], userId, anonymousSessionId }`
- **Phân trang (Pagination):** Khi gọi API danh sách (ví dụ: products, orders), response sẽ có dạng: `{ data: [...], pagination: { currentPage, totalPages, totalItems } }`. Luôn xử lý cả `data` và `pagination` để hiển thị component `<Pagination>` của MUI.
- **Login Response:** Khi đăng nhập, API trả về `{ data: { user: {...}, accessToken: "..." } }`. Hãy lưu `accessToken` vào `localStorage` và thông tin `user` vào `AuthContext`.

## 5. Quy trình logic quan trọng
- **Loading & Error State:** Mọi hàm gọi API phải quản lý các state `loading`, `error`, và `data`. Nên tạo một custom hook `useApi(apiFunc)` để tái sử dụng logic này.
- **Conditional Rendering:** Dựa vào state `user` từ `AuthContext` để hiển thị nút "Đăng nhập" hoặc "Tài khoản của tôi" trên Header.
- **Protected Routes:** Tạo một component `ProtectedRoute` để bọc các route yêu cầu đăng nhập (ví dụ: `/profile`, `/orders`). Component này sẽ kiểm tra `user` trong `AuthContext`, nếu không có sẽ điều hướng về trang `/login`.
- **Router:** Sử dụng các hook của `react-router-dom` v6:
    - `useNavigate()` để điều hướng chương trình.
    - `useParams()` để lấy tham số từ URL (ví dụ: `/product/:slug` -> `const { slug } = useParams()`).
    - `useSearchParams()` để đọc và ghi query string (ví dụ: `/products?category=thuoc` -> `searchParams.get('category')`).
- **Xử lý tiền tệ:** Luôn định dạng giá sản phẩm hiển thị cho người dùng bằng cách sử dụng `Intl.NumberFormat` (ví dụ: `120000` -> `120.000 ₫`).
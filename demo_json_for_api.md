

---

# Tài liệu ví dụ API (JSON Payloads) - Dự án 

## Quy ước chung

-   **Placeholders**:
    -   `"ObjectId(...)"`: Đại diện cho một ID của MongoDB, ví dụ: `"653a0f3d9154a16f2e4971c2"`.
    -   `"jwt.token.string"`: Đại diện cho chuỗi JSON Web Token.
    -   `"uuid-string-for-guest"`: Đại diện cho chuỗi ID phiên của khách vãng lai.
    -   `...`: Biểu thị có thể có các trường khác không được liệt kê để giữ cho ví dụ ngắn gọn.
-   **Cấu trúc lỗi chung (4xx, 5xx)**:
    ```json
    // Ví dụ cấu trúc lỗi 400 Bad Request
    {
      "statusCode": 400,
      "message": "Dữ liệu không hợp lệ.",
      "errors": { "fieldName": "Mô tả lỗi của trường đó." }
    }
    ```

---

## 1. API Xác thực (Authentication)

### `POST /api/v1/auth/register` (GĐ 1)
-   **Request Body:**
    ```json
    { "fullName": "Nguyễn Văn An", "email": "nguyenvana@example.com", "password": "password123" }
    ```
-   **Response `201 Created`:**
    ```json
    {
      "message": "Đăng ký tài khoản thành công!",
      "data": {
        "user": {
          "_id": "ObjectId(newUser)",
          "fullName": "Nguyễn Văn An",
          "email": "nguyenvana@example.com",
          "role": "USER"
        },
        "accessToken": "jwt.token.string"
      }
    }
    ```

### `POST /api/v1/auth/login` (GĐ 1)
-   **Request Body:**
    ```json
    { "email": "nguyenvana@example.com", "password": "password123" }
    ```
-   **Response `200 OK`:**
    ```json
    {
      "message": "Đăng nhập thành công!",
      "data": {
        "user": { "_id": "ObjectId(user)", "fullName": "Nguyễn Văn An", "role": "USER" },
        "accessToken": "jwt.token.string"
      }
    }
    ```

### `GET /api/v1/auth/oauth2/...` (GĐ 2)
-   **Request/Response:** Không có Request/Response Body. Các API này sẽ redirect người dùng đến trang xác thực của Google/Facebook.

---

## 2. API Người dùng (Users)

### `GET /api/v1/users/me` (GĐ 1)
-   **Request:** Yêu cầu `Authorization: Bearer jwt.token.string` header.
-   **Response `200 OK`:** (Lưu ý: Không còn trường `cart`)
    ```json
    {
      "_id": "ObjectId(user)",
      "fullName": "Nguyễn Văn An",
      "email": "nguyenvana@example.com",
      "phoneNumber": "0909123456",
      "addresses": [
        {
          "_id": "ObjectId(address1)",
          "isDefault": true,
          "recipientName": "Nguyễn Văn An",
          "street": "123 Đường ABC",
          ...
        }
      ],
      "role": "USER",
      "createdAt": "2023-10-28T10:00:00.000Z"
    }
    ```

### `POST /api/v1/users/me/addresses` (GĐ 1)
-   **Request Body:**
    ```json
    {
      "recipientName": "Trần Thị B",
      "phoneNumber": "0987654321",
      "street": "456 Đường XYZ",
      "ward": "Phường Bến Nghé",
      "district": "Quận 1",
      "city": "TP. Hồ Chí Minh"
    }
    ```
-   **Response `201 Created`:** (Trả về toàn bộ danh sách địa chỉ đã cập nhật)
    ```json
    [
      { "_id": "ObjectId(address1)", "isDefault": true, ... },
      { "_id": "ObjectId(newAddress)", "recipientName": "Trần Thị B", ..., "isDefault": false }
    ]
    ```

---

## 3. API Danh mục & Sản phẩm (Categories & Products)

(Các ví dụ JSON cho Categories và Products giữ nguyên như cũ vì không bị ảnh hưởng bởi thay đổi)

### `GET /api/v1/products` (GĐ 1)
-   **Request:** `?categoryId=ObjectId(vitamin)&sortBy=price&order=asc`
-   **Response `200 OK`:**
    ```json
    {
      "data": [
        {
          "_id": "ObjectId(prod1)",
          "name": "Vitamin C 500mg",
          "slug": "vitamin-c-500mg",
          "images": ["url/to/image1.jpg"],
          "price": 120000,
          "discountPercent": 10,
          "stockQuantity": 99
        }
      ],
      "pagination": { "currentPage": 1, "totalPages": 5, "totalItems": 50 }
    }
    ```

### `GET /api/v1/products/:slug` (GĐ 1)
-   **Request:** `GET /api/v1/products/vitamin-c-500mg`
-   **Response `200 OK`:**
    ```json
    {
      "_id": "ObjectId(prod1)",
      "name": "Vitamin C 500mg",
      "slug": "vitamin-c-500mg",
      "description": "Bổ sung Vitamin C, tăng cường sức đề kháng...",
      "images": ["url/to/image1.jpg", "url/to/image2.jpg"],
      "price": 120000,
      "discountPercent": 10,
      "stockQuantity": 99,
      ...
    }
    ```

---

## 4. API Giỏ hàng (Cart) - ĐÃ CẬP NHẬT

### `GET /api/v1/cart` (GĐ 1)
-   **Request:**
    -   *Nếu đã đăng nhập:* Gửi `Authorization: Bearer jwt.token.string` header.
    -   *Nếu là khách:* Gửi `X-Cart-Session-ID: "uuid-string-for-guest"` header.
-   **Response `200 OK` (Cho người dùng đã đăng nhập):**
    ```json
    {
      "_id": "ObjectId(cartForUser)",
      "userId": "ObjectId(user)",
      "items": [
        {
          "productId": {
             "_id": "ObjectId(prod1)", "name": "Vitamin C 500mg", "images": [...], "price": 120000, ...
          },
          "quantity": 2
        }
      ]
    }
    ```
-   **Response `200 OK` (Cho khách vãng lai, hoặc giỏ hàng trống):**
    ```json
    {
      "_id": "ObjectId(cartForGuest)",
      "userId": null,
      "anonymousSessionId": "uuid-string-for-guest",
      "items": []
    }
    ```

### `POST /api/v1/cart/items` (GĐ 1)
-   **Request Body:** `{ "productId": "ObjectId(prod2)", "quantity": 1 }`
-   **Response `200 OK`:** (Trả về giỏ hàng đã được cập nhật)
    ```json
    {
      "_id": "ObjectId(cart)",
      "items": [
        { "productId": { "_id": "ObjectId(prod1)", ... }, "quantity": 2 },
        { "productId": { "_id": "ObjectId(prod2)", ... }, "quantity": 1 }
      ]
    }
    ```

### `POST /api/v1/cart/merge` (GĐ 1)
-   **Request:**
    -   Header `Authorization: Bearer jwt.token.string` (Bắt buộc).
    -   Header `X-Cart-Session-ID: "uuid-string-for-guest"` (Bắt buộc, lấy từ localStorage).
-   **Response `200 OK`:** (Trả về giỏ hàng đã được gộp, giờ đã thuộc về người dùng)
    ```json
    {
      "_id": "ObjectId(mergedCart)",
      "userId": "ObjectId(user)",
      "anonymousSessionId": null,
      "items": [
        { "productId": { "_id": "ObjectId(prod1)", ... }, "quantity": 1 },
        { "productId": { "_id": "ObjectId(prod2)", ... }, "quantity": 3 }
      ]
    }
    ```

---

## 5. API Đơn hàng (Orders)

### `POST /api/v1/orders` (GĐ 1)
-   **Lưu ý:** Backend sẽ tự động lấy giỏ hàng của người dùng đang đăng nhập để tạo đơn hàng.
-   **Request Body:**
    ```json
    { "shippingAddressId": "ObjectId(address1)", "notes": "Vui lòng gọi trước khi giao." }
    ```
-   **Response `201 Created`:**
    ```json
    {
      "_id": "ObjectId(newOrder)",
      "orderCode": "DH-20231028-001",
      "userId": "ObjectId(user)",
      "shippingAddress": { "recipientName": "Nguyễn Văn An", ... },
      "items": [
        { "productId": "ObjectId(prod1)", "productName": "Vitamin C 500mg", "priceAtPurchase": 108000, "quantity": 2 }
      ],
      "totalAmount": 231000,
      "status": "PENDING",
      ...
    }
    ```

---

## 6. API Đánh giá & Phản hồi (Reviews)

### `POST /api/v1/reviews` (GĐ 2)
-   **Request Body:**
    ```json
    { "productId": "ObjectId(prod1)", "rating": 5, "comment": "Sản phẩm tốt, giao hàng nhanh." }
    ```
-   **Response `201 Created`:**
    ```json
    {
      "_id": "ObjectId(newReview)",
      "productId": "ObjectId(prod1)",
      "userId": "ObjectId(user)",
      "rating": 5,
      "comment": "Sản phẩm tốt, giao hàng nhanh.",
      "createdAt": "2023-10-29T10:00:00.000Z"
    }
    ```

### `PUT /api/v1/admin/reviews/:id/reply` (GĐ 2)
-   **Request Body:** `{ "responseText": "Cảm ơn bạn đã tin dùng WellVerse!" }`
-   **Response `200 OK`:**
    ```json
    {
      "_id": "ObjectId(review)",
      "comment": "Sản phẩm tốt, giao hàng nhanh.",
      "adminReply": {
        "responseText": "Cảm ơn bạn đã tin dùng WellVerse!",
        "repliedAt": "2023-10-29T11:00:00.000Z"
      },
      ...
    }
    ```

---

## 7. API Khuyến mãi (Promotions)

### `GET /api/v1/promotions` (GĐ 2)
-   **Response `200 OK`:**
    ```json
    [
      {
        "_id": "ObjectId(promo1)",
        "name": "Chào hè rực rỡ - Giảm đến 20%",
        "bannerImageUrl": "url/to/summer-banner.jpg",
        "startDate": "2023-06-01T00:00:00.000Z",
        "endDate": "2023-06-30T23:59:59.000Z",
        "isActive": true
      }
    ]
    ```

### `POST /api/v1/admin/promotions` (GĐ 2)
-   **Request Body:**
    ```json
    {
      "name": "Back to School Sale",
      "description": "Giảm giá các sản phẩm bổ não, tăng cường trí nhớ.",
      "bannerImageUrl": "url/to/back-to-school.jpg",
      "startDate": "2023-08-15T00:00:00.000Z",
      "endDate": "2023-09-15T23:59:59.000Z",
      "applicableProductIds": ["ObjectId(prodOmega3)", "ObjectId(prodGinkgo)"]
    }
    ```
-   **Response `201 Created`:** `{ "_id": "ObjectId(newPromo)", "name": "Back to School Sale", ... }`

---

## 8. API Báo cáo & Thống kê (Reports)

### `GET /api/v1/admin/reports/revenue` (GĐ 1)
-   **Request:** `?period=MONTHLY&date=2023-10-01`
-   **Response `200 OK`:**
    ```json
    {
      "reportType": "MONTHLY",
      "periodStart": "2023-10-01T00:00:00.000Z",
      "totalRevenue": 150750000,
      "totalOrders": 350,
      "productPerformance": [
        { "productId": "ObjectId(prod1)", "productName": "Vitamin C 500mg", "quantitySold": 520, "revenue": 56160000 }
      ],
      ...
    }
    ```

---

## 9. API Lịch sử tìm kiếm & Thông báo (Search History & Notifications)

### `GET /api/v1/search-history` (GĐ 2)
-   **Response `200 OK`:**
    ```json
    [
      { "searchQuery": "vitamin c", "timestamp": "2023-10-30T09:00:00.000Z" },
      { "searchQuery": "omega 3", "timestamp": "2023-10-29T15:30:00.000Z" }
    ]
    ```

### `GET /api/v1/notifications` (GĐ 2)
-   **Response `200 OK`:**
    ```json
    [
      {
        "_id": "ObjectId(notif1)",
        "title": "Đơn hàng đã được xác nhận",
        "message": "Đơn hàng DH-20231028-001 của bạn đang được xử lý.",
        "type": "ORDER_STATUS",
        "relatedId": "ObjectId(order1)",
        "isRead": false,
        "createdAt": "2023-10-28T14:00:00.000Z"
      }
    ]
    ```

### `POST /api/v1/notifications/:id/read` (GĐ 2)
-   **Request:** Không có body.
-   **Response `200 OK`:**
    ```json
    {
      "_id": "ObjectId(notif1)",
      "message": "Đơn hàng DH-20231028-001 của bạn đang được xử lý.",
      "isRead": true,
      ...
    }
    ```
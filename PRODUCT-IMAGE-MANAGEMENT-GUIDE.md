# Hướng dẫn sử dụng tính năng quản lý hình ảnh sản phẩm

## Tổng quan

Tính năng quản lý hình ảnh cho phép admin thêm, xóa, sắp xếp và quản lý hình ảnh sản phẩm một cách trực quan và dễ dàng.

## Tính năng chính

### 1. **Thêm hình ảnh từ URL**
- Hỗ trợ thêm hình ảnh từ URL bên ngoài
- Validation URL tự động
- Preview hình ảnh trước khi thêm
- Hỗ trợ các định dạng: JPG, PNG, GIF, WebP, SVG

### 2. **Quản lý hình ảnh**
- **Hình chính**: Hình đầu tiên được đánh dấu là hình chính
- **Drag & Drop**: Kéo thả để sắp xếp thứ tự
- **Đặt làm hình chính**: Click vào icon sao để đặt hình làm hình chính
- **Xóa hình ảnh**: Xóa từng hình ảnh không cần thiết
- **Xem trước**: Preview hình ảnh ở kích thước lớn

### 3. **Giới hạn và validation**
- Tối đa 8 hình ảnh mỗi sản phẩm
- Bắt buộc phải có ít nhất 1 hình ảnh
- Validation URL tự động
- Hiển thị placeholder khi không tải được hình

## Nguồn hình ảnh miễn phí

### Được khuyến nghị:
- **Unsplash.com** - Hình ảnh chất lượng cao, miễn phí thương mại
- **Pexels.com** - Thư viện hình ảnh đa dạng
- **Pixabay.com** - Hình ảnh và vector miễn phí

### URL mẫu để test:
```
https://images.unsplash.com/photo-1559181567-c3190ca9959b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80
https://images.unsplash.com/photo-1584017911766-d451b3d0e843?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80
https://images.unsplash.com/photo-1471864190281-a93a3070b6de?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80
```

## Giao diện người dùng

### 1. **Trạng thái trống**
Khi chưa có hình ảnh nào, hiển thị:
- Icon hình ảnh lớn
- Text hướng dẫn
- Nút "Thêm hình ảnh"

### 2. **Danh sách hình ảnh**
Mỗi hình ảnh hiển thị:
- **Badge "Hình chính"** cho hình đầu tiên
- **Icon kéo thả** ở góc phải trên
- **Nút xem trước** (Preview)
- **Nút đặt làm hình chính** (Star icon)
- **Nút xóa** (Delete icon)

### 3. **Dialog thêm hình ảnh**
- Input URL với validation
- Preview hình ảnh real-time
- Gợi ý nguồn hình ảnh miễn phí
- Validation và thông báo lỗi

## Best Practices

### 1. **Chất lượng hình ảnh**
- Sử dụng hình ảnh có độ phân giải cao (ít nhất 800x600px)
- Đảm bảo hình ảnh rõ nét và chất lượng tốt
- Sử dụng format WebP hoặc JPG để tối ưu tốc độ tải

### 2. **Tối ưu SEO**
- Đặt hình chính là hình đẹp và đại diện nhất
- Sắp xếp thứ tự hình ảnh theo độ quan trọng
- Sử dụng hình ảnh có liên quan đến sản phẩm

### 3. **User Experience**
- Thêm đủ hình ảnh để khách hàng có cái nhìn toàn diện
- Đa dạng góc chụp: chính diện, cận cảnh, bao bì, etc.
- Đảm bảo hình ảnh tải nhanh

## Thông báo và validation

### ✅ **Thành công**
- "Thêm hình ảnh thành công"
- "Cập nhật thứ tự hình ảnh thành công"
- "Đặt hình chính thành công"

### ❌ **Lỗi thường gặp**
- "URL không hợp lệ. Vui lòng nhập URL hình ảnh đúng định dạng."
- "Chỉ được phép tối đa 8 hình ảnh."
- "Phải có ít nhất một hình ảnh sản phẩm"
- "URL hình ảnh thứ X không hợp lệ"

## Tích hợp với form sản phẩm

### **Form validation**
- Kiểm tra có ít nhất 1 hình ảnh
- Validate tất cả URL hình ảnh
- Disable nút "Thêm/Cập nhật" khi thiếu hình ảnh

### **Data structure**
```javascript
formData = {
  // ... other fields
  images: [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg",
    "https://example.com/image3.jpg"
  ]
}
```

### **API payload**
Khi submit form, mảng `images` sẽ được gửi đến backend với thứ tự đã sắp xếp.

## Responsive Design

- **Desktop**: Hiển thị 3 cột hình ảnh
- **Tablet**: Hiển thị 2 cột hình ảnh  
- **Mobile**: Hiển thị 1 cột hình ảnh
- Drag & drop hoạt động tốt trên tất cả thiết bị

## Accessibility

- Alt text tự động cho tất cả hình ảnh
- Keyboard navigation hỗ trợ
- Screen reader friendly
- High contrast mode support

---

**Version**: 1.0  
**Last Updated**: August 1, 2025  
**Compatible**: All modern browsers, Mobile responsive

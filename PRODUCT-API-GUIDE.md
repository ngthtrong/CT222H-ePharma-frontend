# Hướng Dẫn Sử Dụng Product API cho Frontend

## Tổng Quan

API Product hỗ trợ quản lý sản phẩm đầy đủ cho cả **User** và **Admin**. Hệ thống sử dụng JWT token để xác thực và phân quyền.

- **Public**: Xem danh sách sản phẩm, tìm kiếm, xem chi tiết (không cần đăng nhập)
- **User**: Có quyền như Public (hiện tại chưa có endpoint đặc biệt cho User)
- **Admin**: Quản lý tất cả sản phẩm, tạo, cập nhật, xóa sản phẩm

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication & Authorization

### Public Access (Xem sản phẩm)
```javascript
// Không cần authentication cho các endpoint public
const headers = {
    'Content-Type': 'application/json'
};
```

### Admin Authentication
```javascript
const headers = {
    'Authorization': 'Bearer <ADMIN_JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

## Product Status & Properties

### Trạng Thái Sản Phẩm
- `published: true`: Sản phẩm được hiển thị công khai
- `published: false`: Sản phẩm ẩn (chỉ admin có thể thấy)
- `stockQuantity > 0`: Còn hàng
- `stockQuantity = 0`: Hết hàng

### Thuộc Tính Sản Phẩm
- **SKU**: Mã định danh duy nhất của sản phẩm
- **Slug**: URL-friendly identifier
- **Discount**: Phần trăm giảm giá (0-100%)
- **Attributes**: Thuộc tính tùy chỉnh (màu sắc, kích thước, v.v.)

---

## PUBLIC API ENDPOINTS

### 1. Lấy Danh Sách Tất Cả Sản Phẩm

**GET** `/products`

**Mô tả**: Lấy tất cả sản phẩm đã được publish (không cần đăng nhập)

```javascript
async function getAllProducts() {
    const response = await fetch('/api/v1/products', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of ProductResponse
}
```

**Response Example**:
```json
{
    "success": true,
    "message": "Lấy danh sách sản phẩm thành công",
    "data": [
        {
            "id": "prod_001",
            "name": "Vitamin C 1000mg",
            "sku": "VIT-C-1000",
            "slug": "vitamin-c-1000mg",
            "description": "Vitamin C tăng cường sức đề kháng, bổ sung vitamin cho cơ thể",
            "images": [
                "https://example.com/vitamin-c-1.jpg",
                "https://example.com/vitamin-c-2.jpg"
            ],
            "price": 250000.0,
            "discountPercent": 10,
            "stockQuantity": 100,
            "categoryId": "cat_001",
            "categoryName": "Vitamin & Thực phẩm chức năng",
            "brand": "Blackmores",
            "attributes": [
                {
                    "name": "Xuất xứ",
                    "value": "Australia"
                },
                {
                    "name": "Hạn sử dụng",
                    "value": "24 tháng"
                }
            ],
            "published": true,
            "relatedProducts": ["prod_002", "prod_003"],
            "createdAt": "2025-01-31T10:00:00Z",
            "updatedAt": "2025-01-31T10:30:00Z"
        }
    ]
}
```

### 2. Tìm Kiếm Sản Phẩm

**GET** `/products/search`

**Query Parameters**:
- `q` (required): Từ khóa tìm kiếm

**Mô tả**: Tìm kiếm sản phẩm theo tên, mô tả, thương hiệu

```javascript
async function searchProducts(keyword) {
    const response = await fetch(`/api/v1/products/search?q=${encodeURIComponent(keyword)}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of ProductResponse
}

// Example usage
searchProducts("vitamin c");
searchProducts("thuốc cảm");
```

### 3. Lấy Chi Tiết Sản Phẩm Theo Slug

**GET** `/products/{slug}`

**Mô tả**: Lấy thông tin chi tiết sản phẩm theo slug

```javascript
async function getProductBySlug(slug) {
    const response = await fetch(`/api/v1/products/${slug}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // ProductResponse object
}

// Example usage
getProductBySlug("vitamin-c-1000mg");
```

### 4. Lấy Sản Phẩm Liên Quan

**GET** `/products/{id}/related`

**Query Parameters** (tất cả đều optional):
- `brand`: Lọc theo thương hiệu
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa
- `inStock`: Chỉ lấy sản phẩm còn hàng (true/false)

**Mô tả**: Lấy danh sách sản phẩm liên quan với bộ lọc

```javascript
async function getRelatedProducts(productId, filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
            params.append(key, filters[key]);
        }
    });
    
    const queryString = params.toString();
    const url = `/api/v1/products/${productId}/related${queryString ? '?' + queryString : ''}`;
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of ProductResponse
}

// Example usage
getRelatedProducts("prod_001", {
    brand: "Blackmores",
    minPrice: 100000,
    maxPrice: 500000,
    inStock: true
});
```

---

## ADMIN API ENDPOINTS

### 1. Lấy Tất Cả Sản Phẩm (Admin với Bộ Lọc)

**GET** `/admin/products`

**Query Parameters** (tất cả đều optional):
- `category`: Lọc theo danh mục
- `brand`: Lọc theo thương hiệu
- `minPrice`: Giá tối thiểu
- `maxPrice`: Giá tối đa
- `inStock`: Chỉ lấy sản phẩm còn hàng (true/false)
- `published`: Lọc theo trạng thái publish (true/false)
- `search`: Tìm kiếm theo từ khóa

**Mô tả**: Admin lấy tất cả sản phẩm (bao gồm cả unpublished) với bộ lọc mạnh mẽ

```javascript
async function getAllProductsAdmin(filters = {}) {
    const params = new URLSearchParams();
    
    Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null && filters[key] !== '') {
            params.append(key, filters[key]);
        }
    });
    
    const response = await fetch(`/api/v1/admin/products?${params}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of ProductResponse
}

// Examples
await getAllProductsAdmin({ published: false }); // Lấy sản phẩm chưa publish
await getAllProductsAdmin({ category: "cat_001", inStock: true });
await getAllProductsAdmin({ search: "vitamin", brand: "Blackmores" });
```

### 2. Lấy Chi Tiết Sản Phẩm Theo ID (Admin)

**GET** `/admin/products/{id}`

**Mô tả**: Admin lấy chi tiết sản phẩm theo ID (bao gồm cả unpublished)

```javascript
async function getProductByIdAdmin(productId) {
    const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // ProductResponse object
}
```

### 3. Tạo Sản Phẩm Mới

**POST** `/admin/products`

**Mô tả**: Admin tạo sản phẩm mới

**Request Body**:
```json
{
    "name": "Omega-3 Fish Oil",
    "sku": "OMEGA-3-1000",
    "slug": "omega-3-fish-oil",
    "description": "Dầu cá Omega-3 hỗ trợ tim mạch và não bộ",
    "images": [
        "https://example.com/omega3-1.jpg",
        "https://example.com/omega3-2.jpg"
    ],
    "price": 350000.0,
    "discountPercent": 15,
    "stockQuantity": 50,
    "categoryId": "cat_001",
    "brand": "Nordic Naturals",
    "attributes": [
        {
            "name": "Xuất xứ",
            "value": "USA"
        },
        {
            "name": "Thành phần",
            "value": "EPA 500mg, DHA 250mg"
        }
    ],
    "published": true,
    "relatedProducts": ["prod_001", "prod_004"]
}
```

```javascript
async function createProduct(productData) {
    const response = await fetch('/api/v1/admin/products', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productData)
    });
    
    const data = await response.json();
    return data.data; // Created ProductResponse
}
```

**Validation Rules**:
- `name`: Bắt buộc, tối đa 150 ký tự
- `sku`: Bắt buộc, tối đa 100 ký tự, phải unique
- `slug`: Bắt buộc, tối đa 150 ký tự, phải unique
- `description`: Tùy chọn, tối đa 500 ký tự
- `images`: Bắt buộc, array URLs
- `price`: Bắt buộc, phải > 0
- `discountPercent`: 0-100
- `stockQuantity`: >= 0
- `categoryId`: Bắt buộc, phải tồn tại
- `brand`: Tùy chọn, tối đa 100 ký tự

### 4. Cập Nhật Sản Phẩm

**PUT** `/admin/products/{id}`

**Mô tả**: Admin cập nhật thông tin sản phẩm

**Request Body**: Tương tự như tạo sản phẩm

```javascript
async function updateProduct(productId, updateData) {
    const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData)
    });
    
    const data = await response.json();
    return data.data; // Updated ProductResponse
}
```

### 5. Xóa Sản Phẩm

**DELETE** `/admin/products/{id}`

**Mô tả**: Admin xóa sản phẩm

```javascript
async function deleteProduct(productId) {
    const response = await fetch(`/api/v1/admin/products/${productId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${adminToken}`,
            'Content-Type': 'application/json'
        }
    });
    
    return response.ok;
}
```

---

## Data Models

### ProductRequest
```javascript
{
    name: string,                   // Bắt buộc - Tên sản phẩm (max 150 chars)
    sku: string,                    // Bắt buộc - Mã SKU unique (max 100 chars)
    slug: string,                   // Bắt buộc - URL slug unique (max 150 chars)
    description: string,            // Tùy chọn - Mô tả (max 500 chars)
    images: string[],               // Bắt buộc - Danh sách URLs hình ảnh
    price: number,                  // Bắt buộc - Giá sản phẩm (> 0)
    discountPercent: number,        // Tùy chọn - % giảm giá (0-100)
    stockQuantity: number,          // Tùy chọn - Số lượng tồn kho (>= 0)
    categoryId: string,             // Bắt buộc - ID danh mục
    brand: string,                  // Tùy chọn - Thương hiệu (max 100 chars)
    attributes: [                   // Tùy chọn - Thuộc tính tùy chỉnh
        {
            name: string,
            value: string
        }
    ],
    published: boolean,             // Tùy chọn - Trạng thái publish (default: true)
    relatedProducts: string[]       // Tùy chọn - Danh sách ID sản phẩm liên quan
}
```

### ProductResponse
```javascript
{
    id: string,                     // ID sản phẩm
    name: string,                   // Tên sản phẩm
    sku: string,                    // Mã SKU
    slug: string,                   // URL slug
    description: string,            // Mô tả sản phẩm
    images: string[],               // Danh sách URLs hình ảnh
    price: number,                  // Giá gốc
    discountPercent: number,        // % giảm giá
    stockQuantity: number,          // Số lượng tồn kho
    categoryId: string,             // ID danh mục
    categoryName: string,           // Tên danh mục
    brand: string,                  // Thương hiệu
    attributes: [                   // Thuộc tính
        {
            name: string,
            value: string
        }
    ],
    published: boolean,             // Trạng thái publish
    relatedProducts: string[],      // Danh sách ID sản phẩm liên quan
    createdAt: string,              // Thời gian tạo
    updatedAt: string               // Thời gian cập nhật
}
```

---

## Error Handling

### Common Error Responses

**404 Not Found** - Không tìm thấy sản phẩm:
```json
{
    "success": false,
    "message": "Không tìm thấy sản phẩm",
    "data": null
}
```

**400 Bad Request** - Dữ liệu không hợp lệ:
```json
{
    "success": false,
    "message": "Tên sản phẩm không được để trống",
    "data": null
}
```

**409 Conflict** - SKU hoặc slug đã tồn tại:
```json
{
    "success": false,
    "message": "SKU đã tồn tại",
    "data": null
}
```

**401 Unauthorized** - Chưa đăng nhập:
```json
{
    "success": false,
    "message": "Token không hợp lệ",
    "data": null
}
```

**403 Forbidden** - Không có quyền Admin:
```json
{
    "success": false,
    "message": "Bạn không có quyền truy cập tính năng này",
    "data": null
}
```

---

## Frontend Integration Examples

### React Hook cho Product Management

```javascript
import { useState, useEffect, useCallback } from 'react';

export const useProducts = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchProducts = useCallback(async (filters = {}) => {
        setLoading(true);
        try {
            const data = await getAllProducts();
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    const searchProducts = useCallback(async (keyword) => {
        setLoading(true);
        try {
            const data = await searchProducts(keyword);
            setProducts(data);
            setError(null);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProducts();
    }, [fetchProducts]);

    return {
        products,
        loading,
        error,
        fetchProducts,
        searchProducts
    };
};
```

### Product Card Component

```javascript
const ProductCard = ({ product }) => {
    const discountedPrice = product.price * (1 - product.discountPercent / 100);
    const isOutOfStock = product.stockQuantity === 0;

    return (
        <div className={`product-card ${isOutOfStock ? 'out-of-stock' : ''}`}>
            <div className="product-images">
                <img 
                    src={product.images[0]} 
                    alt={product.name}
                    loading="lazy"
                />
                {product.discountPercent > 0 && (
                    <span className="discount-badge">
                        -{product.discountPercent}%
                    </span>
                )}
                {isOutOfStock && (
                    <span className="stock-badge">Hết hàng</span>
                )}
            </div>

            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-brand">{product.brand}</p>
                <p className="product-category">{product.categoryName}</p>

                <div className="product-price">
                    {product.discountPercent > 0 ? (
                        <>
                            <span className="discounted-price">
                                {discountedPrice.toLocaleString()} VNĐ
                            </span>
                            <span className="original-price">
                                {product.price.toLocaleString()} VNĐ
                            </span>
                        </>
                    ) : (
                        <span className="price">
                            {product.price.toLocaleString()} VNĐ
                        </span>
                    )}
                </div>

                <div className="product-attributes">
                    {product.attributes?.map((attr, index) => (
                        <span key={index} className="attribute">
                            {attr.name}: {attr.value}
                        </span>
                    ))}
                </div>

                <div className="product-actions">
                    <button 
                        className="btn-add-cart"
                        disabled={isOutOfStock}
                        onClick={() => addToCart(product.id)}
                    >
                        {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ'}
                    </button>
                    <button 
                        className="btn-view-detail"
                        onClick={() => viewProduct(product.slug)}
                    >
                        Xem chi tiết
                    </button>
                </div>
            </div>
        </div>
    );
};
```

### Product Search Component

```javascript
const ProductSearch = ({ onSearchResults }) => {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [loading, setLoading] = useState(false);

    const debounceSearch = useCallback(
        debounce(async (searchQuery) => {
            if (searchQuery.trim().length > 2) {
                setLoading(true);
                try {
                    const results = await searchProducts(searchQuery);
                    onSearchResults(results);
                } catch (error) {
                    console.error('Search failed:', error);
                } finally {
                    setLoading(false);
                }
            }
        }, 500),
        [onSearchResults]
    );

    useEffect(() => {
        debounceSearch(query);
    }, [query, debounceSearch]);

    return (
        <div className="product-search">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="search-input"
                />
                {loading && <div className="search-loading">Đang tìm...</div>}
            </div>

            {suggestions.length > 0 && (
                <div className="search-suggestions">
                    {suggestions.map(product => (
                        <div 
                            key={product.id} 
                            className="suggestion-item"
                            onClick={() => selectProduct(product)}
                        >
                            <img src={product.images[0]} alt={product.name} />
                            <div>
                                <h4>{product.name}</h4>
                                <p>{product.price.toLocaleString()} VNĐ</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
```

### Admin Product Management

```javascript
const AdminProductManager = () => {
    const [products, setProducts] = useState([]);
    const [filters, setFilters] = useState({});
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [showForm, setShowForm] = useState(false);

    const loadProducts = async () => {
        try {
            const data = await getAllProductsAdmin(filters);
            setProducts(data);
        } catch (error) {
            console.error('Failed to load products:', error);
        }
    };

    const handleCreateProduct = async (productData) => {
        try {
            await createProduct(productData);
            setShowForm(false);
            loadProducts();
            alert('Tạo sản phẩm thành công!');
        } catch (error) {
            alert('Tạo sản phẩm thất bại: ' + error.message);
        }
    };

    const handleUpdateProduct = async (productId, updateData) => {
        try {
            await updateProduct(productId, updateData);
            setSelectedProduct(null);
            loadProducts();
            alert('Cập nhật sản phẩm thành công!');
        } catch (error) {
            alert('Cập nhật sản phẩm thất bại: ' + error.message);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;

        try {
            await deleteProduct(productId);
            loadProducts();
            alert('Xóa sản phẩm thành công!');
        } catch (error) {
            alert('Xóa sản phẩm thất bại: ' + error.message);
        }
    };

    useEffect(() => {
        loadProducts();
    }, [filters]);

    return (
        <div className="admin-product-manager">
            <div className="manager-header">
                <h2>Quản lý sản phẩm</h2>
                <button 
                    className="btn-create"
                    onClick={() => setShowForm(true)}
                >
                    Tạo sản phẩm mới
                </button>
            </div>

            <div className="filters">
                <select 
                    value={filters.published || ''}
                    onChange={(e) => setFilters({...filters, published: e.target.value})}
                >
                    <option value="">Tất cả trạng thái</option>
                    <option value="true">Đã publish</option>
                    <option value="false">Chưa publish</option>
                </select>

                <input
                    type="text"
                    placeholder="Tìm kiếm..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({...filters, search: e.target.value})}
                />

                <select
                    value={filters.inStock || ''}
                    onChange={(e) => setFilters({...filters, inStock: e.target.value})}
                >
                    <option value="">Tất cả</option>
                    <option value="true">Còn hàng</option>
                    <option value="false">Hết hàng</option>
                </select>
            </div>

            <div className="products-table">
                <table>
                    <thead>
                        <tr>
                            <th>Hình ảnh</th>
                            <th>Tên sản phẩm</th>
                            <th>SKU</th>
                            <th>Giá</th>
                            <th>Tồn kho</th>
                            <th>Trạng thái</th>
                            <th>Thao tác</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td>
                                    <img 
                                        src={product.images[0]} 
                                        alt={product.name}
                                        width="50"
                                    />
                                </td>
                                <td>{product.name}</td>
                                <td>{product.sku}</td>
                                <td>{product.price.toLocaleString()} VNĐ</td>
                                <td>{product.stockQuantity}</td>
                                <td>
                                    <span className={`status ${product.published ? 'published' : 'draft'}`}>
                                        {product.published ? 'Published' : 'Draft'}
                                    </span>
                                </td>
                                <td>
                                    <button onClick={() => setSelectedProduct(product)}>
                                        Sửa
                                    </button>
                                    <button onClick={() => handleDeleteProduct(product.id)}>
                                        Xóa
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {showForm && (
                <ProductForm
                    onSubmit={handleCreateProduct}
                    onCancel={() => setShowForm(false)}
                />
            )}

            {selectedProduct && (
                <ProductForm
                    product={selectedProduct}
                    onSubmit={(data) => handleUpdateProduct(selectedProduct.id, data)}
                    onCancel={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};
```

### Product Form Component

```javascript
const ProductForm = ({ product, onSubmit, onCancel }) => {
    const [formData, setFormData] = useState(
        product || {
            name: '',
            sku: '',
            slug: '',
            description: '',
            images: [''],
            price: 0,
            discountPercent: 0,
            stockQuantity: 0,
            categoryId: '',
            brand: '',
            attributes: [],
            published: true,
            relatedProducts: []
        }
    );

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    const addAttribute = () => {
        setFormData({
            ...formData,
            attributes: [...formData.attributes, { name: '', value: '' }]
        });
    };

    const updateAttribute = (index, field, value) => {
        const newAttributes = [...formData.attributes];
        newAttributes[index][field] = value;
        setFormData({ ...formData, attributes: newAttributes });
    };

    const removeAttribute = (index) => {
        const newAttributes = formData.attributes.filter((_, i) => i !== index);
        setFormData({ ...formData, attributes: newAttributes });
    };

    return (
        <div className="product-form-overlay">
            <form onSubmit={handleSubmit} className="product-form">
                <h3>{product ? 'Cập nhật sản phẩm' : 'Tạo sản phẩm mới'}</h3>

                <div className="form-group">
                    <label>Tên sản phẩm *</label>
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        maxLength={150}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>SKU *</label>
                        <input
                            type="text"
                            value={formData.sku}
                            onChange={(e) => setFormData({...formData, sku: e.target.value})}
                            required
                            maxLength={100}
                        />
                    </div>

                    <div className="form-group">
                        <label>Slug *</label>
                        <input
                            type="text"
                            value={formData.slug}
                            onChange={(e) => setFormData({...formData, slug: e.target.value})}
                            required
                            maxLength={150}
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Mô tả</label>
                    <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        maxLength={500}
                        rows={3}
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Giá *</label>
                        <input
                            type="number"
                            value={formData.price}
                            onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value)})}
                            required
                            min="0"
                            step="1000"
                        />
                    </div>

                    <div className="form-group">
                        <label>Giảm giá (%)</label>
                        <input
                            type="number"
                            value={formData.discountPercent}
                            onChange={(e) => setFormData({...formData, discountPercent: parseInt(e.target.value)})}
                            min="0"
                            max="100"
                        />
                    </div>

                    <div className="form-group">
                        <label>Số lượng tồn kho</label>
                        <input
                            type="number"
                            value={formData.stockQuantity}
                            onChange={(e) => setFormData({...formData, stockQuantity: parseInt(e.target.value)})}
                            min="0"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <label>Hình ảnh URLs *</label>
                    {formData.images.map((image, index) => (
                        <div key={index} className="image-input-row">
                            <input
                                type="url"
                                value={image}
                                onChange={(e) => {
                                    const newImages = [...formData.images];
                                    newImages[index] = e.target.value;
                                    setFormData({...formData, images: newImages});
                                }}
                                placeholder="https://example.com/image.jpg"
                                required={index === 0}
                            />
                            {index > 0 && (
                                <button 
                                    type="button"
                                    onClick={() => {
                                        const newImages = formData.images.filter((_, i) => i !== index);
                                        setFormData({...formData, images: newImages});
                                    }}
                                >
                                    Xóa
                                </button>
                            )}
                        </div>
                    ))}
                    <button 
                        type="button"
                        onClick={() => setFormData({...formData, images: [...formData.images, '']})}
                    >
                        Thêm ảnh
                    </button>
                </div>

                <div className="form-group">
                    <label>Thuộc tính</label>
                    {formData.attributes.map((attr, index) => (
                        <div key={index} className="attribute-row">
                            <input
                                type="text"
                                placeholder="Tên thuộc tính"
                                value={attr.name}
                                onChange={(e) => updateAttribute(index, 'name', e.target.value)}
                            />
                            <input
                                type="text"
                                placeholder="Giá trị"
                                value={attr.value}
                                onChange={(e) => updateAttribute(index, 'value', e.target.value)}
                            />
                            <button type="button" onClick={() => removeAttribute(index)}>
                                Xóa
                            </button>
                        </div>
                    ))}
                    <button type="button" onClick={addAttribute}>
                        Thêm thuộc tính
                    </button>
                </div>

                <div className="form-group">
                    <label>
                        <input
                            type="checkbox"
                            checked={formData.published}
                            onChange={(e) => setFormData({...formData, published: e.target.checked})}
                        />
                        Hiển thị công khai
                    </label>
                </div>

                <div className="form-actions">
                    <button type="submit" className="btn-submit">
                        {product ? 'Cập nhật' : 'Tạo mới'}
                    </button>
                    <button type="button" onClick={onCancel} className="btn-cancel">
                        Hủy
                    </button>
                </div>
            </form>
        </div>
    );
};
```

---

## Helper Functions

### Price Calculation

```javascript
const PriceHelper = {
    calculateDiscountedPrice(price, discountPercent) {
        return price * (1 - discountPercent / 100);
    },

    formatPrice(price) {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    },

    calculateSavings(price, discountPercent) {
        return price * (discountPercent / 100);
    }
};
```

### Product URL Helper

```javascript
const ProductUrlHelper = {
    generateSlug(name) {
        return name
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-');
    },

    getProductUrl(slug) {
        return `/products/${slug}`;
    },

    generateSKU(name, category) {
        const nameCode = name.substring(0, 3).toUpperCase();
        const categoryCode = category.substring(0, 3).toUpperCase();
        const random = Math.random().toString(36).substring(2, 8).toUpperCase();
        return `${nameCode}-${categoryCode}-${random}`;
    }
};
```

---

## Performance Optimization

### Product List Virtualization

```javascript
import { FixedSizeList as List } from 'react-window';

const VirtualizedProductList = ({ products }) => {
    const Row = ({ index, style }) => (
        <div style={style}>
            <ProductCard product={products[index]} />
        </div>
    );

    return (
        <List
            height={600}
            itemCount={products.length}
            itemSize={350}
            itemData={products}
        >
            {Row}
        </List>
    );
};
```

### Image Lazy Loading

```javascript
const LazyImage = ({ src, alt, ...props }) => {
    const [imageSrc, setImageSrc] = useState('');
    const [imageRef, setImageRef] = useState();

    useEffect(() => {
        let observer;
        
        if (imageRef && imageSrc !== src) {
            if (IntersectionObserver) {
                observer = new IntersectionObserver(
                    entries => {
                        entries.forEach(entry => {
                            if (entry.isIntersecting) {
                                setImageSrc(src);
                                observer.unobserve(imageRef);
                            }
                        });
                    },
                    { threshold: 0.1 }
                );
                observer.observe(imageRef);
            } else {
                setImageSrc(src);
            }
        }
        
        return () => {
            if (observer && observer.unobserve) {
                observer.unobserve(imageRef);
            }
        };
    }, [src, imageSrc, imageRef]);

    return (
        <img
            ref={setImageRef}
            src={imageSrc}
            alt={alt}
            {...props}
        />
    );
};
```

---

## Notes

1. **SEO Optimization**: Sử dụng slug để tạo URLs thân thiện với SEO
2. **Image Optimization**: Nên optimize images trước khi upload
3. **Inventory Management**: Cần sync stock quantity với hệ thống inventory
4. **Search Enhancement**: Có thể tích hợp Elasticsearch để tìm kiếm tốt hơn
5. **Caching**: Nên cache product data để cải thiện performance
6. **Related Products**: Algorithm cho related products có thể được cải thiện
7. **Bulk Operations**: Admin có thể cần bulk import/export products

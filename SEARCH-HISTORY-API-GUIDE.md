# Hướng Dẫn Sử Dụng Search History API cho Frontend

## Tổng Quan

API Search History hỗ trợ **lưu trữ và quản lý lịch sử tìm kiếm** của người dùng để cải thiện trải nghiệm mua sắm. Hệ thống cho phép lưu từ khóa tìm kiếm, bộ lọc đã áp dụng, và các sản phẩm được click để đưa ra gợi ý thông minh.

- **Lưu lịch sử tìm kiếm**: Tự động lưu mỗi lần user tìm kiếm
- **Xem lịch sử**: Hiển thị lịch sử tìm kiếm gần đây
- **Gợi ý thông minh**: Đưa ra từ khóa phổ biến dựa trên lịch sử
- **Quản lý privacy**: User có thể xóa lịch sử tìm kiếm

## Base URL

```
http://localhost:8080/api/v1
```

## Authentication

Tất cả API đều yêu cầu JWT token trong header:

```javascript
const headers = {
    'Authorization': 'Bearer <JWT_TOKEN>',
    'Content-Type': 'application/json'
};
```

---

## USER APIs - Quản lý lịch sử tìm kiếm

### 1. Lấy Lịch Sử Tìm Kiếm

**GET** `/search-history`

Lấy tất cả lịch sử tìm kiếm của user hiện tại, sắp xếp theo thời gian mới nhất.

#### Query Parameters:
- `recent` (optional): `true` để chỉ lấy 10 tìm kiếm gần đây nhất

```javascript
async function getSearchHistory(recent = false) {
    const response = await fetch(`/api/v1/search-history?recent=${recent}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of SearchHistoryResponse objects
}
```

**Response Format:**
```json
{
    "success": true,
    "message": "Lấy lịch sử tìm kiếm thành công",
    "data": [
        {
            "id": "search_id",
            "userId": "user_id",
            "searchQuery": "thuốc cảm",
            "searchFilters": {
                "category": "drugs",
                "minPrice": 10000,
                "maxPrice": 100000,
                "brand": "Traphaco"
            },
            "clickedProducts": ["product_id_1", "product_id_2"],
            "timestamp": "2025-01-31T10:00:00Z"
        }
    ]
}
```

### 2. Lấy Lịch Sử Theo Khoảng Thời Gian

**GET** `/search-history/date-range`

Lấy lịch sử tìm kiếm trong khoảng thời gian cụ thể.

#### Query Parameters:
- `startDate` (required): Ngày bắt đầu (yyyy-MM-dd)
- `endDate` (required): Ngày kết thúc (yyyy-MM-dd)

```javascript
async function getSearchHistoryByDateRange(startDate, endDate) {
    const response = await fetch(`/api/v1/search-history/date-range?startDate=${startDate}&endDate=${endDate}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
}

// Ví dụ: Lấy lịch sử tìm kiếm trong tháng 1/2025
// getSearchHistoryByDateRange('2025-01-01', '2025-01-31')
```

### 3. Lấy Từ Khóa Phổ Biến

**GET** `/search-history/popular`

Lấy danh sách từ khóa tìm kiếm phổ biến của user (để hiển thị gợi ý).

#### Query Parameters:
- `limit` (optional): Số lượng từ khóa tối đa (mặc định: 10)

```javascript
async function getPopularSearchQueries(limit = 10) {
    const response = await fetch(`/api/v1/search-history/popular?limit=${limit}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    return data.data; // Array of strings
}
```

**Response Format:**
```json
{
    "success": true,
    "message": "Lấy từ khóa phổ biến thành công",
    "data": [
        "thuốc cảm",
        "vitamin c",
        "thuốc đau đầu",
        "siro ho",
        "thuốc dạ dày"
    ]
}
```

### 4. Lưu Lịch Sử Tìm Kiếm

**POST** `/search-history`

Lưu một lần tìm kiếm mới vào lịch sử. Thường được gọi khi user thực hiện tìm kiếm.

#### Request Body:
```json
{
    "searchQuery": "thuốc cảm", // Bắt buộc
    "searchFilters": { // Tùy chọn - các bộ lọc đã áp dụng
        "category": "drugs",
        "minPrice": 10000,
        "maxPrice": 100000,
        "brand": "Traphaco",
        "inStock": true
    },
    "clickedProducts": ["product_id_1", "product_id_2"] // Tùy chọn
}
```

```javascript
async function saveSearchHistory(searchData) {
    const response = await fetch('/api/v1/search-history', {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(searchData)
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data; // SearchHistoryResponse object
    } else {
        throw new Error(data.message);
    }
}

// Ví dụ sử dụng khi user tìm kiếm
async function handleSearch(query, filters) {
    try {
        // 1. Thực hiện tìm kiếm sản phẩm
        const products = await searchProducts(query, filters);
        
        // 2. Lưu vào lịch sử tìm kiếm
        await saveSearchHistory({
            searchQuery: query,
            searchFilters: filters
        });
        
        return products;
    } catch (error) {
        console.error('Search error:', error);
    }
}
```

### 5. Cập Nhật Sản Phẩm Đã Click

**PUT** `/search-history/{id}/clicked-products`

Cập nhật danh sách sản phẩm mà user đã click sau khi tìm kiếm.

#### Request Body:
```json
["product_id_1", "product_id_2", "product_id_3"]
```

```javascript
async function updateClickedProducts(searchHistoryId, productIds) {
    const response = await fetch(`/api/v1/search-history/${searchHistoryId}/clicked-products`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(productIds)
    });
    
    const data = await response.json();
    if (data.success) {
        return data.data;
    } else {
        throw new Error(data.message);
    }
}

// Ví dụ sử dụng khi user click vào sản phẩm
async function handleProductClick(productId, searchHistoryId) {
    try {
        // Lấy lịch sử hiện tại
        const history = await getSearchHistory(true);
        const currentSearch = history.find(h => h.id === searchHistoryId);
        
        if (currentSearch) {
            const clickedProducts = currentSearch.clickedProducts || [];
            if (!clickedProducts.includes(productId)) {
                clickedProducts.push(productId);
                await updateClickedProducts(searchHistoryId, clickedProducts);
            }
        }
    } catch (error) {
        console.error('Error updating clicked products:', error);
    }
}
```

### 6. Xóa Một Lịch Sử Tìm Kiếm

**DELETE** `/search-history/{id}`

Xóa một mục lịch sử tìm kiếm cụ thể.

```javascript
async function deleteSearchHistory(searchHistoryId) {
    const response = await fetch(`/api/v1/search-history/${searchHistoryId}`, {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (data.success) {
        return true;
    } else {
        throw new Error(data.message);
    }
}
```

### 7. Xóa Toàn Bộ Lịch Sử

**DELETE** `/search-history`

Xóa toàn bộ lịch sử tìm kiếm của user hiện tại.

```javascript
async function clearAllSearchHistory() {
    const response = await fetch('/api/v1/search-history', {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
        }
    });
    
    const data = await response.json();
    if (data.success) {
        return true;
    } else {
        throw new Error(data.message);
    }
}
```

---

## Frontend Integration Examples

### Search Component với History

```javascript
function SearchComponent() {
    const [query, setQuery] = useState('');
    const [suggestions, setSuggestions] = useState([]);
    const [showHistory, setShowHistory] = useState(false);
    const [searchHistory, setSearchHistory] = useState([]);
    
    // Lấy gợi ý từ lịch sử khi focus vào search box
    useEffect(() => {
        async function loadSuggestions() {
            try {
                const popular = await getPopularSearchQueries(5);
                const recent = await getSearchHistory(true);
                
                setSuggestions(popular);
                setSearchHistory(recent.slice(0, 5));
            } catch (error) {
                console.error('Error loading suggestions:', error);
            }
        }
        
        if (showHistory) {
            loadSuggestions();
        }
    }, [showHistory]);
    
    const handleSearch = async (searchQuery, filters = {}) => {
        try {
            setShowHistory(false);
            
            // Thực hiện tìm kiếm
            const results = await searchProducts(searchQuery, filters);
            
            // Lưu vào lịch sử
            await saveSearchHistory({
                searchQuery,
                searchFilters: filters
            });
            
            // Cập nhật UI với kết quả
            onSearchResults(results);
            
        } catch (error) {
            console.error('Search failed:', error);
        }
    };
    
    return (
        <div className="search-component">
            <div className="search-input-container">
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setShowHistory(true)}
                    onBlur={() => setTimeout(() => setShowHistory(false), 200)}
                    placeholder="Tìm kiếm thuốc, thực phẩm chức năng..."
                />
                
                {showHistory && (
                    <div className="search-dropdown">
                        {suggestions.length > 0 && (
                            <div className="suggestions-section">
                                <h4>Từ khóa phổ biến</h4>
                                {suggestions.map((suggestion, index) => (
                                    <div
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSearch(suggestion)}
                                    >
                                        <i className="icon-search"></i>
                                        {suggestion}
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {searchHistory.length > 0 && (
                            <div className="history-section">
                                <h4>Tìm kiếm gần đây</h4>
                                {searchHistory.map((history) => (
                                    <div
                                        key={history.id}
                                        className="history-item"
                                        onClick={() => handleSearch(history.searchQuery, history.searchFilters)}
                                    >
                                        <i className="icon-history"></i>
                                        <span className="query">{history.searchQuery}</span>
                                        <button
                                            className="delete-btn"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteSearchHistory(history.id);
                                                setSearchHistory(prev => prev.filter(h => h.id !== history.id));
                                            }}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            <button onClick={() => handleSearch(query)}>
                Tìm kiếm
            </button>
        </div>
    );
}
```

### Search History Management Page

```javascript
function SearchHistoryPage() {
    const [searchHistory, setSearchHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: '',
        endDate: ''
    });
    
    useEffect(() => {
        loadSearchHistory();
    }, []);
    
    const loadSearchHistory = async () => {
        try {
            setLoading(true);
            const history = await getSearchHistory();
            setSearchHistory(history);
        } catch (error) {
            console.error('Error loading search history:', error);
        } finally {
            setLoading(false);
        }
    };
    
    const filterByDateRange = async () => {
        if (dateRange.startDate && dateRange.endDate) {
            try {
                const filtered = await getSearchHistoryByDateRange(
                    dateRange.startDate,
                    dateRange.endDate
                );
                setSearchHistory(filtered);
            } catch (error) {
                console.error('Error filtering by date:', error);
            }
        }
    };
    
    const clearAllHistory = async () => {
        if (confirm('Bạn có chắc muốn xóa toàn bộ lịch sử tìm kiếm?')) {
            try {
                await clearAllSearchHistory();
                setSearchHistory([]);
                alert('Đã xóa toàn bộ lịch sử tìm kiếm');
            } catch (error) {
                console.error('Error clearing history:', error);
            }
        }
    };
    
    const deleteHistoryItem = async (id) => {
        try {
            await deleteSearchHistory(id);
            setSearchHistory(prev => prev.filter(item => item.id !== id));
        } catch (error) {
            console.error('Error deleting history item:', error);
        }
    };
    
    return (
        <div className="search-history-page">
            <div className="page-header">
                <h2>Lịch sử tìm kiếm</h2>
                <button 
                    className="clear-all-btn"
                    onClick={clearAllHistory}
                    disabled={searchHistory.length === 0}
                >
                    Xóa tất cả
                </button>
            </div>
            
            <div className="date-filter">
                <input
                    type="date"
                    value={dateRange.startDate}
                    onChange={(e) => setDateRange(prev => ({...prev, startDate: e.target.value}))}
                />
                <input
                    type="date"
                    value={dateRange.endDate}
                    onChange={(e) => setDateRange(prev => ({...prev, endDate: e.target.value}))}
                />
                <button onClick={filterByDateRange}>Lọc</button>
                <button onClick={loadSearchHistory}>Reset</button>
            </div>
            
            {loading ? (
                <div className="loading">Đang tải...</div>
            ) : (
                <div className="history-list">
                    {searchHistory.length === 0 ? (
                        <div className="empty-state">Chưa có lịch sử tìm kiếm</div>
                    ) : (
                        searchHistory.map((item) => (
                            <SearchHistoryItem
                                key={item.id}
                                item={item}
                                onDelete={() => deleteHistoryItem(item.id)}
                                onReSearch={() => handleSearch(item.searchQuery, item.searchFilters)}
                            />
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
```

### Search History Item Component

```javascript
function SearchHistoryItem({ item, onDelete, onReSearch }) {
    const formatDate = (date) => {
        return new Date(date).toLocaleString('vi-VN');
    };
    
    const formatFilters = (filters) => {
        if (!filters || Object.keys(filters).length === 0) {
            return 'Không có bộ lọc';
        }
        
        const filterText = [];
        if (filters.category) filterText.push(`Danh mục: ${filters.category}`);
        if (filters.brand) filterText.push(`Thương hiệu: ${filters.brand}`);
        if (filters.minPrice || filters.maxPrice) {
            filterText.push(`Giá: ${filters.minPrice || 0} - ${filters.maxPrice || '∞'} VND`);
        }
        
        return filterText.join(', ');
    };
    
    return (
        <div className="search-history-item">
            <div className="item-content">
                <div className="search-query">
                    <i className="icon-search"></i>
                    <span className="query-text">{item.searchQuery}</span>
                </div>
                
                <div className="search-details">
                    <div className="timestamp">{formatDate(item.timestamp)}</div>
                    <div className="filters">{formatFilters(item.searchFilters)}</div>
                    
                    {item.clickedProducts && item.clickedProducts.length > 0 && (
                        <div className="clicked-products">
                            Đã xem {item.clickedProducts.length} sản phẩm
                        </div>
                    )}
                </div>
            </div>
            
            <div className="item-actions">
                <button 
                    className="research-btn"
                    onClick={onReSearch}
                    title="Tìm kiếm lại"
                >
                    <i className="icon-refresh"></i>
                </button>
                <button 
                    className="delete-btn"
                    onClick={onDelete}
                    title="Xóa"
                >
                    <i className="icon-delete"></i>
                </button>
            </div>
        </div>
    );
}
```

## Error Handling

```javascript
async function handleSearchHistoryAPI() {
    try {
        const history = await getSearchHistory();
        console.log('Search History:', history);
    } catch (error) {
        if (error.message.includes('401')) {
            // Redirect to login
            window.location.href = '/login';
        } else if (error.message.includes('403')) {
            // Access denied
            alert('Bạn không có quyền truy cập');
        } else {
            // Other errors
            alert('Có lỗi xảy ra: ' + error.message);
        }
    }
}
```

## Best Practices

### 1. Debounce Search Input
```javascript
import { debounce } from 'lodash';

const debouncedSaveSearch = debounce(async (query, filters) => {
    if (query.trim().length > 0) {
        await saveSearchHistory({ searchQuery: query, searchFilters: filters });
    }
}, 1000);
```

### 2. Smart Suggestions
```javascript
function useSearchSuggestions() {
    const [suggestions, setSuggestions] = useState([]);
    
    const loadSuggestions = useCallback(async (query) => {
        try {
            // Kết hợp từ khóa phổ biến và lịch sử gần đây
            const [popular, recent] = await Promise.all([
                getPopularSearchQueries(5),
                getSearchHistory(true)
            ]);
            
            // Lọc gợi ý phù hợp với input hiện tại
            const filtered = [...popular, ...recent.map(h => h.searchQuery)]
                .filter(item => item.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 8);
            
            setSuggestions([...new Set(filtered)]); // Remove duplicates
        } catch (error) {
            console.error('Error loading suggestions:', error);
        }
    }, []);
    
    return { suggestions, loadSuggestions };
}
```

### 3. Privacy Controls
```javascript
function PrivacySettings() {
    const [autoSave, setAutoSave] = useState(true);
    
    const handleAutoSaveToggle = (enabled) => {
        setAutoSave(enabled);
        localStorage.setItem('searchHistoryAutoSave', enabled.toString());
    };
    
    const handleClearHistory = async () => {
        if (confirm('Xóa toàn bộ lịch sử tìm kiếm? Hành động này không thể hoàn tác.')) {
            await clearAllSearchHistory();
            alert('Đã xóa toàn bộ lịch sử tìm kiếm');
        }
    };
    
    return (
        <div className="privacy-settings">
            <div className="setting-item">
                <label>
                    <input
                        type="checkbox"
                        checked={autoSave}
                        onChange={(e) => handleAutoSaveToggle(e.target.checked)}
                    />
                    Tự động lưu lịch sử tìm kiếm
                </label>
            </div>
            
            <button 
                className="danger-btn"
                onClick={handleClearHistory}
            >
                Xóa toàn bộ lịch sử
            </button>
        </div>
    );
}
```

Hướng dẫn này cung cấp đầy đủ các API và ví dụ implementation để xây dựng một hệ thống lịch sử tìm kiếm thông minh và thân thiện với người dùng.

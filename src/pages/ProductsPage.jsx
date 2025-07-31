import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  CircularProgress,
  Box,
  Pagination,
} from '@mui/material';
import { getProducts } from '../api/productApi';
import { getCategories } from '../api/categoryApi';
import ProductCard from '../components/ProductCard';
import ProductFilters from '../components/ProductFilters';

const ProductsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]); // Store all products for client-side filtering
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filter states
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(searchParams.get('category') || '');
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [sortBy, setSortBy] = useState(searchParams.get('sortBy') || 'name_asc');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      console.log('Fetching products...'); // Debug log
      const response = await getProducts();
      console.log('Products response:', response); // Debug log
      
      const productsData = response.data || response || [];
      setAllProducts(productsData);
      
      // Apply client-side filtering
      applyFilters(productsData);
      
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to fetch products.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Client-side filtering function
  const applyFilters = useCallback((productsToFilter = allProducts) => {
    let filtered = [...productsToFilter];

    // Category filter
    if (selectedCategory) {
      filtered = filtered.filter(product => 
        product.categoryId === selectedCategory || product.category === selectedCategory
      );
    }

    // Price range filter
    if (priceRange[0] > 0 || priceRange[1] < 5000000) {
      filtered = filtered.filter(product => {
        const price = parseFloat(product.price) || 0;
        return price >= priceRange[0] && price <= priceRange[1];
      });
    }

    // Discount status filter - removed as API doesn't support it
    // if (discountStatus) {
    //   if (discountStatus === 'on_sale') {
    //     filtered = filtered.filter(product => (product.discountPercent || 0) > 0);
    //   } else if (discountStatus === 'regular_price') {
    //     filtered = filtered.filter(product => (product.discountPercent || 0) === 0);
    //   }
    // }

    // Sort products
    if (sortBy) {
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'name_asc':
            return (a.name || '').localeCompare(b.name || '');
          case 'name_desc':
            return (b.name || '').localeCompare(a.name || '');
          case 'price_asc':
            return (parseFloat(a.price) || 0) - (parseFloat(b.price) || 0);
          case 'price_desc':
            return (parseFloat(b.price) || 0) - (parseFloat(a.price) || 0);
          case 'discount_desc':
            return (parseFloat(b.discountPercent) || 0) - (parseFloat(a.discountPercent) || 0);
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          case 'popular':
            // Assuming we have a popularity score, otherwise fallback to name
            return (a.name || '').localeCompare(b.name || '');
          default:
            return 0;
        }
      });
    }

    setProducts(filtered);
    
    // Update pagination
    const itemsPerPage = 12;
    const currentPage = parseInt(searchParams.get('page')) || 1;
    const totalPages = Math.ceil(filtered.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    
    setProducts(filtered.slice(startIndex, endIndex));
    setPagination({
      currentPage,
      totalPages,
      totalItems: filtered.length,
      itemsPerPage
    });
  }, [selectedCategory, priceRange, sortBy, searchParams, allProducts]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Apply filters when filter states change
  useEffect(() => {
    if (allProducts.length > 0) {
      applyFilters();
    }
  }, [applyFilters]);

  // Sync URL params with state when component mounts or URL changes
  useEffect(() => {
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sortBy') || 'name_asc';
    const minPrice = parseInt(searchParams.get('minPrice')) || 0;
    const maxPrice = parseInt(searchParams.get('maxPrice')) || 5000000;

    setSelectedCategory(category);
    setSortBy(sort);
    setPriceRange([minPrice, maxPrice]);
  }, [searchParams]);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const categoriesResponse = await getCategories();
        if (Array.isArray(categoriesResponse)) {
          setCategories(categoriesResponse);
        } else {
          setCategories([]);
        }
      } catch (err) {
        console.error('Error fetching categories in ProductsPage:', err);
        setCategories([]);
      }
    };
    fetchInitialData();
  }, []);

  const handlePageChange = (event, value) => {
    setSearchParams(prev => {
      const newSearchParams = new URLSearchParams(prev);
      newSearchParams.set('page', value);
      return newSearchParams;
    });
  };

  const handleFilterChange = (setter) => (event) => {
    const { name, value } = event.target;
    console.log('Filter change:', name, value); // Debug log
    setter(value);
    
    setSearchParams(prev => {
      const newSearchParams = new URLSearchParams(prev);
      if (value) {
        newSearchParams.set(name, value);
      } else {
        newSearchParams.delete(name);
      }
      newSearchParams.set('page', '1'); // Reset to first page on filter change
      console.log('New search params:', newSearchParams.toString()); // Debug log
      return newSearchParams;
    });
  };
  
  const handlePriceChange = (event, newValue) => {
    setPriceRange(newValue);
  };

  const handlePriceChangeCommitted = (event, newValue) => {
    console.log('Price change committed:', newValue); // Debug log
    setSearchParams(prev => {
      const newSearchParams = new URLSearchParams(prev);
      newSearchParams.set('minPrice', newValue[0]);
      newSearchParams.set('maxPrice', newValue[1]);
      newSearchParams.set('page', '1');
      return newSearchParams;
    });
  };

  const handleClearFilters = () => {
    setSelectedCategory('');
    setPriceRange([0, 5000000]);
    setSortBy('name_asc');
    
    setSearchParams(prev => {
      const newSearchParams = new URLSearchParams();
      newSearchParams.set('page', '1');
      return newSearchParams;
    });
  };


  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Sản phẩm của chúng tôi
      </Typography>
      <Grid container spacing={4}>
        {/* Filters */}
        <Grid size={{ xs: 12, md: 3 }}>
          <ProductFilters
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            priceRange={priceRange}
            setPriceRange={setPriceRange}
            sortBy={sortBy}
            setSortBy={setSortBy}
            onFilterChange={handleFilterChange}
            onPriceChange={handlePriceChange}
            onPriceChangeCommitted={handlePriceChangeCommitted}
            onClearFilters={handleClearFilters}
          />
        </Grid>

        {/* Products Grid */}
        <Grid size={{ xs: 12, md: 9 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error">{error}</Typography>
          ) : (
            <>
              <Grid container spacing={2}>
                {products.length > 0 ? (
                  products.map((product) => (
                    <Grid key={product.id || product._id} size={{ xs: 12, sm: 6, md: 4 }}>
                      <ProductCard product={product} />
                    </Grid>
                  ))
                ) : (
                  <Grid key="no-products" size={{ xs: 12 }}>
                    <Typography sx={{p: 3}}>Không tìm thấy sản phẩm nào phù hợp với tiêu chí của bạn.</Typography>
                  </Grid>
                )}
              </Grid>
              {pagination.totalPages > 1 && (
                <Box display="flex" justifyContent="center" mt={4}>
                  <Pagination
                    count={pagination.totalPages}
                    page={pagination.currentPage}
                    onChange={handlePageChange}
                    color="primary"
                  />
                </Box>
              )}
            </>
          )}
        </Grid>
      </Grid>
    </Container>
  );
};

export default ProductsPage;

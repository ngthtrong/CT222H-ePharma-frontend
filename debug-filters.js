// Debug script to test filter functionality
import { getProducts } from './src/api/productApi.js';
import { getCategories } from './src/api/categoryApi.js';

async function testFilters() {
  console.log('Testing filters...');
  
  try {
    // Test 1: Get all products without filters
    console.log('\n1. Testing without filters:');
    const allProducts = await getProducts();
    console.log('All products response:', allProducts);
    
    // Test 2: Get categories
    console.log('\n2. Testing categories:');
    const categories = await getCategories();
    console.log('Categories response:', categories);
    
    // Test 3: Test with category filter
    if (categories && categories.length > 0) {
      console.log('\n3. Testing with category filter:');
      const categoryId = categories[0].id || categories[0]._id;
      const filteredByCategory = await getProducts({ categoryId });
      console.log('Filtered by category response:', filteredByCategory);
    }
    
    // Test 4: Test with price filter
    console.log('\n4. Testing with price filter:');
    const filteredByPrice = await getProducts({ minPrice: 100000, maxPrice: 500000 });
    console.log('Filtered by price response:', filteredByPrice);
    
    // Test 5: Test with sort
    console.log('\n5. Testing with sort:');
    const sortedProducts = await getProducts({ sortBy: 'price_asc' });
    console.log('Sorted products response:', sortedProducts);
    
  } catch (error) {
    console.error('Error testing filters:', error);
  }
}

testFilters();

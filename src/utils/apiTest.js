import { productAPI, categoryAPI } from '../api';

// Test function to check API connectivity
export const testAPI = async () => {
  try {
    console.log('Testing API connectivity...');
    
    // Test products API
    console.log('Testing products API...');
    const productsResponse = await productAPI.getProducts({ limit: 5 });
    console.log('Products response:', productsResponse.data);
    
    // Test categories API
    console.log('Testing categories API...');
    const categoriesResponse = await categoryAPI.getCategories();
    console.log('Categories response:', categoriesResponse.data);
    
    return {
      success: true,
      products: productsResponse.data,
      categories: categoriesResponse.data
    };
  } catch (error) {
    console.error('API Test Error:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Call this function automatically when module is imported
testAPI().then(result => {
  if (result.success) {
    console.log('✅ API Test Success:', result);
  } else {
    console.error('❌ API Test Failed:', result.error);
  }
});

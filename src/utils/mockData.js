// Mock Product IDs for testing
export const MOCK_PRODUCT_IDS = [
  '60f1b2b2c745c5d5a8e8b001',
  '60f1b2b2c745c5d5a8e8b002', 
  '60f1b2b2c745c5d5a8e8b003',
  '60f1b2b2c745c5d5a8e8b004',
  '60f1b2b2c745c5d5a8e8b005',
];

export const generateMockProductId = () => {
  return MOCK_PRODUCT_IDS[Math.floor(Math.random() * MOCK_PRODUCT_IDS.length)];
};

export const getAllMockProductIds = () => {
  return MOCK_PRODUCT_IDS;
};

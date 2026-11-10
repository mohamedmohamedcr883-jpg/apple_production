const STICKER_SIZE_PRICES = { small: 20, medium: 25 };

export const getItemPrice = (product, size) =>
  (product.category === 'stickers' && STICKER_SIZE_PRICES[size?.toLowerCase()]) || product.price;

export const getProductDiscount = (product, size) => {
  const price = getItemPrice(product, size);
  const originalPrice = getItemPrice({ ...product, price: product.originalPrice }, size);
  return Number.isFinite(originalPrice) && originalPrice > 0 && price >= 0 && price < originalPrice
    ? { originalPrice, savings: originalPrice - price }
    : null;
};

export const normalizeSize = (size) =>
  size ? size.charAt(0).toUpperCase() + size.slice(1).toLowerCase() : '';

const STICKER_SIZE_PRICES = { small: 20, medium: 25 };

export const getItemPrice = (product, size) =>
  (product.category === 'stickers' && STICKER_SIZE_PRICES[size?.toLowerCase()]) || product.price;

export const normalizeSize = (size) =>
  size ? size.charAt(0).toUpperCase() + size.slice(1).toLowerCase() : '';

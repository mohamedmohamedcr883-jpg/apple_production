// Every product price, including Sticker Single, comes from the admin dashboard.
// Size remains an order option but does not override the product's configured price.
export const getItemPrice = (product) => Number(product.price);

export const getProductDiscount = (product, size) => {
  const price = getItemPrice(product, size);
  const originalPrice = getItemPrice({ ...product, price: product.originalPrice }, size);
  return Number.isFinite(originalPrice) && originalPrice > 0 && price >= 0 && price < originalPrice
    ? { originalPrice, savings: originalPrice - price }
    : null;
};

export const normalizeSize = (size) =>
  size ? size.charAt(0).toUpperCase() + size.slice(1).toLowerCase() : '';

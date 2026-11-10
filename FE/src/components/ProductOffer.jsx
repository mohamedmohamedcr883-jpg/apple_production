import { getItemPrice, getProductDiscount } from '../utils/pricing';

export const OfferBadge = ({ product, size }) => {
  const discount = getProductDiscount(product, size);
  if (!discount) return null;

  const percentage = Number(((discount.savings / discount.originalPrice) * 100).toFixed(1));
  return <span className="product-offer-badge">Offer · {percentage}% OFF</span>;
};

export const ProductPrice = ({ product, size, className = '', id }) => {
  const discount = getProductDiscount(product, size);

  return (
    <span className="product-price-group">
      {discount && <del className="product-original-price" aria-label="Original price">LE {discount.originalPrice.toFixed(2)}</del>}
      <span id={id} className={`${className}${discount ? ' product-offer-price' : ''}`}>LE {getItemPrice(product, size).toFixed(2)}</span>
    </span>
  );
};

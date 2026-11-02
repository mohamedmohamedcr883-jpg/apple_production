import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';

const ProductOptionsModal = () => {
  const { addToCart } = useAppContext();
  const [product, setProduct] = useState(null);
  const [size, setSize] = useState('');
  const [quantity, setQuantity] = useState(1);

  // Listen for the custom event dispatched when "Choose options" is clicked
  useEffect(() => {
    const handler = (e) => {
      setProduct(e.detail);
      setSize('');
      setQuantity(1);
    };
    window.addEventListener('open-options', handler);
    return () => window.removeEventListener('open-options', handler);
  }, []);

  if (!product) return (
    <div className="modal fade" id="productOptionsModal" tabIndex="-1" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content"></div>
      </div>
    </div>
  );

  // Price depends on selected size; falls back to base product price if no size chosen yet
  const getPrice = () => {
    if (size === 'medium') return 25;
    if (size === 'small') return 20;
    return product.price ?? 0;
  };

  const price = getPrice();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!size) return; // required field guard

    addToCart({ ...product, price }, quantity, size);

    // Close the modal programmatically (Bootstrap 5)
    const modalEl = document.getElementById('productOptionsModal');
    const modalInstance = window.bootstrap?.Modal.getInstance(modalEl);
    modalInstance?.hide();
  };

  return (
    <div className="modal fade" id="productOptionsModal" tabIndex="-1" aria-labelledby="productOptionsModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>

          <div className="modal-body p-4">
            <div className="row g-4">
              <div className="col-md-12">
                <h3 id="productOptionsModalLabel">{product.name}</h3>
                <p className="text-muted" id="productOptionsCategory">{product.category}</p>
                <p className="text-muted" id="plusOption">(For special size contact us)</p>
                <div className="mb-4">
                  <span id="productOptionsPrice" className="fs-4">LE {price.toFixed(2)}</span>
                </div>

                <form id="productOptionsForm" onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productSize">Size</label>
                    <select
                      className="form-select form-select-sm"
                      id="productSize"
                      value={size}
                      onChange={(e) => setSize(e.target.value)}
                      required
                    >
                      <option value="">Choose an option</option>
                      <option value="small">Small (5cm*5cm)</option>
                      <option value="medium">Medium (10cm*10cm)</option>
                    </select>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold" htmlFor="productQuantity">Quantity</label>
                    <div className="input-group input-group-lg">
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        id="decreaseQty"
                        onClick={() => setQuantity(q => Math.max(1, q - 1))}
                      >-</button>
                      <input
                        type="number"
                        id="productQuantity"
                        className="form-control text-center"
                        value={quantity}
                        min="1"
                        max="99"
                        onChange={(e) => setQuantity(Math.min(99, Math.max(1, parseInt(e.target.value) || 1)))}
                      />
                      <button
                        type="button"
                        className="btn btn-outline-secondary"
                        id="increaseQty"
                        onClick={() => setQuantity(q => Math.min(99, q + 1))}
                      >+</button>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary btn-lg w-100">
                    <i className="bi bi-cart-plus me-2"></i>Add to Cart
                  </button>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ProductOptionsModal;
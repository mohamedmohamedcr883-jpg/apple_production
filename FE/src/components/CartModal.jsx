import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const CartModal = () => {
  const { cart, removeFromCart, updateCartQuantity } = useAppContext();
  
  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const isEmpty = cart.length === 0;

  return (
    <div className="modal fade" id="cartModal" tabIndex="-1" aria-labelledby="cartModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered modal-xl">
        <div className="modal-content cart-modal-content">
          <div className="modal-header border-0 pb-0">
            <h3 className="modal-title" id="cartModalLabel">Shopping Cart</h3>
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <div id="cartItemsContainer">
              {isEmpty ? (
                <div className="empty-cart text-center py-5">
                  <i className="bi bi-cart-x" style={{ fontSize: '4rem', color: '#ccc' }}></i>
                  <p className="text-muted mt-3">Your cart is empty</p>
                  <a href="#shop" className="btn btn-primary mt-2" data-bs-dismiss="modal">Continue Shopping</a>
                </div>
              ) : (
                cart.map((item, idx) => (
                  <div key={`${item.productId}-${item.size}`} className="card mb-3 border-0 shadow-sm cart-item-card">
                    <div className="card-body">
                      <div className="row align-items-center">
                        <div className="col-auto">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="img-thumbnail" style={{ width: '80px', height: '80px', objectFit: 'cover' }} />
                          ) : (
                            <div className="product-emoji-placeholder rounded" style={{ width: '80px', height: '80px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fa', fontSize: '2rem' }}>
                              {item.emoji || '📦'}
                            </div>
                          )}
                        </div>
                        <div className="col">
                          <h5 className="card-title mb-1 text-truncate">{item.emoji || '📦'} {item.name}</h5>
                          {item.size && <p className="text-muted small mb-0">Size: {item.size}</p>}
                          <p className="text-primary fw-bold mb-0 mt-1">LE {item.price.toFixed(2)}</p>
                        </div>
                        <div className="col-auto">
                          <div className="input-group input-group-sm quantity-control">
                            <button className="btn btn-outline-secondary px-3 fw-bold bg-light" type="button" onClick={() => updateCartQuantity(idx, -1)}>-</button>
                            <input type="text" className="form-control text-center fw-bold border-secondary text-dark" value={item.quantity} readOnly style={{ maxWidth: '60px' }} />
                            <button className="btn btn-outline-secondary px-3 fw-bold bg-light" type="button" onClick={() => updateCartQuantity(idx, 1)}>+</button>
                          </div>
                        </div>
                        <div className="col-auto">
                          <p className="fw-bold mb-0">LE {(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                        <div className="col-auto">
                          <button className="btn btn-link text-danger p-0" onClick={() => removeFromCart(idx)}>
                            <i className="bi bi-trash3 fs-5"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            {!isEmpty && (
              <div id="cartSummary" className="cart-summary mt-4 pt-4 border-top">
                <div className="row">
                  <div className="col-md-8">
                    <div className="d-flex justify-content-between mb-2">
                      <span>Subtotal:</span>
                      <span id="cartSubtotal">LE {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-2">
                      <span>Shipping:</span>
                      <span>Calculated at checkout</span>
                    </div>
                    <div className="d-flex justify-content-between mb-3">
                      <strong>Total:</strong>
                      <strong className="text-primary fs-5" id="cartTotal">LE {subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                  <div className="col-md-4 text-end">
                    <Link to="/pages/checkout.html" className="btn btn-primary btn-lg w-100 mb-2" id="checkoutButton" onClick={() => {
                      const modalEl = document.getElementById('cartModal');
                      if (modalEl && window.bootstrap) {
                         const modalInstance = window.bootstrap.Modal.getInstance(modalEl);
                         if (modalInstance) modalInstance.hide();
                      }
                    }}>
                      Checkout
                    </Link>
                    <button className="btn btn-outline-secondary btn-sm w-100" data-bs-dismiss="modal">
                      Continue Shopping
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartModal;

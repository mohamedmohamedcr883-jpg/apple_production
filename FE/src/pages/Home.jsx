import React, { useState, useEffect } from 'react';
import { useAppContext } from '../context/AppContext';
import { getItemPrice, getProductDiscount } from '../utils/pricing';
import { OfferBadge, ProductPrice } from '../components/ProductOffer';
import { Link } from 'react-router-dom';
import { MAIN_CATEGORIES } from '../config/categories';
import copilotImg from '../assets/Copilot_20260122_175027.png';

// Components
import SearchModal from '../components/SearchModal';
import ProductOptionsModal from '../components/ProductOptionsModal';
import CartModal from '../components/CartModal';

const Home = () => {
  const { products, addToCart } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [detailSize, setDetailSize] = useState('Medium');
  
  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    setDetailSize('Medium');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ page: 'detail', id: product.id }, "", `#product-${product.id}`);
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ page: 'home' }, "", window.location.pathname);
  };

  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page === 'home') setSelectedProduct(null);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const getBestSellers = () => {
    if (!products.length) return [];
    const middleIndex = Math.floor(products.length / 2);
    const start = Math.max(0, middleIndex - 2);
    return products.slice(start, start + 4);
  };

  const bestSellers = getBestSellers();

  const renderDetailView = () => {
    if (!selectedProduct) return null;
    const relatedProducts = products
      .filter(p => p.category === selectedProduct.category && String(p.id) !== String(selectedProduct.id))
      .slice(0, 2);
    const showSizeOption = selectedProduct.category === 'stickers';

    return (
      <div id="bestsellerDetailView" style={{ display: 'block' }}>
        <div className="container my-4 my-md-5 animate__animated animate__fadeIn">
          <button className="btn btn-outline-secondary mb-3" onClick={closeDetail}>
            <i className="bi bi-arrow-left me-2"></i>Back to Home
          </button>
          <div className="row g-4 g-lg-5 justify-content-center">
              <div className="col-10 col-sm-8 col-md-5 col-lg-4">
                  <div className="product-image-wrapper bg-white border rounded-4 overflow-hidden shadow-sm">
                      <img src={selectedProduct.image} className="img-fluid w-100 p-3 p-md-4" alt={selectedProduct.name} style={{maxHeight: '400px', objectFit: 'contain'}} />
                  </div>
              </div>
              <div className="col-12 col-md-6 col-lg-5">
                  <div className="product-info-sticky text-center text-md-start">
                      <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                          <h1 className="fw-bold h3 h2-md mb-0">{selectedProduct.name}</h1>
                          <OfferBadge product={selectedProduct} size={showSizeOption ? detailSize : undefined} />
                      </div>
                      <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4">
                          <ProductPrice product={selectedProduct} size={showSizeOption ? detailSize : undefined} className="fs-4 fw-bold text-dark" id="detailPrice" />
                          <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small">In Stock</span>
                      </div>
                      
                      {showSizeOption && (
                        <div className="my-4">
                            <label className="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Size</label>
                            <select className="form-select rounded-pill mx-auto mx-md-0" style={{width: '200px'}} id="detailSize" value={detailSize} onChange={(e) => setDetailSize(e.target.value)}>
                                <option value="Small">Small (5cm*5cm)</option>
                                <option value="Medium">Medium (10cm*10cm)</option>
                            </select>
                        </div>
                      )}

                      <div className="my-4">
                          <label className="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Quantity</label>
                          <div className="input-group border rounded-pill overflow-hidden mx-auto mx-md-0" style={{width: '130px'}}>
                              <button className="btn btn-link text-dark text-decoration-none px-3" type="button" onClick={() => {
                                const el = document.getElementById('detailQty');
                                if(el && parseInt(el.value) > 1) el.value = parseInt(el.value) - 1;
                              }}>—</button>
                              <input type="text" className="form-control border-0 text-center fw-bold bg-transparent" id="detailQty" defaultValue="1" readOnly />
                              <button className="btn btn-link text-dark text-decoration-none px-3" type="button" onClick={() => {
                                const el = document.getElementById('detailQty');
                                if(el) el.value = parseInt(el.value) + 1;
                              }}>+</button>
                          </div>
                      </div>
                      <div className="d-grid gap-2 gap-md-3">
                          <button className="btn btn-dark btn-lg rounded-pill py-3 fw-bold shadow-sm" onClick={() => {
                            const qty = parseInt(document.getElementById('detailQty')?.value || 1);
                            const size = showSizeOption ? (document.getElementById('detailSize')?.value || 'Medium') : '';
                            addToCart({ ...selectedProduct, price: getItemPrice(selectedProduct, size) }, qty, size);
                          }}>Add to cart</button>
                          <button className="btn btn-outline-dark btn-lg rounded-pill py-3 fw-bold" onClick={() => {
                            const qty = parseInt(document.getElementById('detailQty')?.value || 1);
                            const size = showSizeOption ? (document.getElementById('detailSize')?.value || 'Medium') : '';
                            addToCart({ ...selectedProduct, price: getItemPrice(selectedProduct, size) }, qty, size);
                            window.location.href = '/pages/checkout.html';
                          }}>Buy it now</button>
                      </div>
                  </div>
              </div>
          </div>
          
          {/* Related products */}
          <div className="mt-5 text-center text-md-start">
            <h3 className="fw-bold mb-4">You may also like</h3>
            <div className="row g-4 justify-content-center justify-content-md-center">
              {relatedProducts.map(p => (
                <div key={p.id} className="col-10 col-sm-6 col-md-4 col-lg-3">
                  <div className={`card h-100 cursor-pointer related-product border-0 shadow-sm hover-scale position-relative${getProductDiscount(p) ? ' offer-card' : ''}`}
                       onClick={() => handleProductSelect(p)}
                       style={{transition: 'transform 0.2s'}}>
                    <OfferBadge product={p} />
                    <img src={p.image} className="card-img-top p-3" alt={p.name} style={{height:'180px', objectFit:'contain'}} />
                    <div className="card-body text-center p-2">
                      <h6 className="card-title mb-1">{p.name}</h6>
                      <p className="mb-0 fw-bold"><ProductPrice product={p} /></p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {selectedProduct ? renderDetailView() : (
        <>
          {/* Hero Section */}
          <section id="first-section" className="hero-wrapper">
            <div className="hero-shapes">
              <div className="shape-1"></div>
              <div className="shape-2"></div>
              <div className="shape-3"></div>
            </div>

            <div className="hero-content glass-card">
              <span className="hero-subtitle">•New Collection 2026</span>
              <h1 className="hero-title">Premium Stickers</h1>

              <div className="hero-features">
                <span>•High quality</span>
                <span>•Unique designs</span>
              </div>
            </div>
          </section>

          {/* Best Seller This Week Section */}
          <section id="bestSeller" className="py-5 bg-light">
            <div className="container">
              <div className="text-center mb-5">
                <h2 className="display-5 fw-bold">Best Seller This Week</h2>
                <p className="text-muted">Our most popular mugs loved by customers</p>
              </div>
              <div className="row g-4" id="bestSellerContainer">
                {bestSellers.map(p => (
                  <div key={p.id} className="col-6 col-md-3 mb-4">
                      <div className={`card h-100 border-0 shadow-sm product-card-hover${getProductDiscount(p) ? ' offer-card' : ''}`}>
                          <div className="position-relative overflow-hidden rounded-top" onClick={() => handleProductSelect(p)} style={{cursor:'pointer'}}>
                              <OfferBadge product={p} />
                              <div className="img-wrapper">
                                  <img src={p.image} className="card-img-top p-3" alt={p.name} loading="lazy" />
                              </div>
                          </div>
                          
                          <div className="card-body d-flex flex-column pt-0 text-center">
                              <h6 className="card-title fw-bold text-dark mb-1 mt-2" onClick={() => handleProductSelect(p)} style={{cursor:'pointer'}}>
                                  🟢 {p.name}
                              </h6>
                              
                              <div className="mt-auto">
                                  <div className="mb-2">
                                      <span className="text-muted small d-block mb-0" style={{fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase'}}>
                                          Starts from
                                      </span>
                                      <ProductPrice product={p} className="fs-5 fw-bold text-success price-green" />
                                  </div>
                                  
                                  {(p.stock != null && p.stock <= 0) ? (
                                    <button className="btn btn-secondary btn-sm w-100 rounded-pill" disabled>Sold Out</button>
                                  ) : p.category === 'stickers' ? (
                                    <button className="btn btn-outline-success btn-sm w-100 rounded-pill open-product-options"
                                            data-bs-toggle="modal"
                                            data-bs-target="#productOptionsModal"
                                            onClick={() => window.dispatchEvent(new CustomEvent('open-options', {detail: p}))}>
                                        Choose options
                                    </button>
                                  ) : (
                                    <button className="btn btn-success btn-sm w-100 rounded-pill btn-add-to-cart"
                                            onClick={() => addToCart(p, 1)}>
                                        Add to Cart
                                    </button>
                                  )}
                              </div>
                          </div>
                      </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

      {/* Shop By Category Section */}
      <section id="shopByCategory" className="py-5">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold hero-title">Shop by Category</h2>
            <p className="text-muted">Explore our stickers, sheets, mugs, and more</p>
          </div>
          <div className="row g-4" id="categorySquaresContainer">
            {MAIN_CATEGORIES.map(c => (
              <div key={c.label} className="col-6 col-md-3">
                <Link to={c.to} className="text-decoration-none category-link">
                  <div className="category-card text-center p-3 border rounded hover-shadow">
                    <img src={copilotImg} alt={c.label} className="img-fluid mb-2 rounded" />
                    <h5 className="mb-0 text-dark">{c.label}</h5>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>
        </>
      )}

      {/* Modals and Toasts */}
      <SearchModal />
      <ProductOptionsModal />
      <CartModal />

      {/* Toast Containers */}
      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="cartToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            <strong className="me-auto">Added to Cart</strong>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            Item has been added to your cart!
          </div>
        </div>
      </div>
    </>
  );
};

export default Home;

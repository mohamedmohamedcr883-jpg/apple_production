import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

// Components
import SearchModal from '../components/SearchModal';
import LoginModal from '../components/LoginModal';
import SignupModal from '../components/SignupModal';
import ForgotPasswordModal from '../components/ForgotPasswordModal';
import ProductOptionsModal from '../components/ProductOptionsModal';
import CartModal from '../components/CartModal';

const Category = () => {
  const { products, addToCart } = useAppContext();
  const [searchParams] = useSearchParams();
  const catParam = searchParams.get('cat');

  const [typeFilter, setTypeFilter] = useState('all');
  const [sortFilter, setSortFilter] = useState('default');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;
  const [selectedProduct, setSelectedProduct] = useState(null);
const productId = searchParams.get('productId');
  useEffect(() => {
    // Reset page and type filter when category changes
    setCurrentPage(1);
    setTypeFilter('all');
    setSelectedProduct(null);
  }, [catParam]);
useEffect(() => {
  if (!productId) return;

  const found = products.find(
    p => String(p.id || p._id) === String(productId)
  );

  if (found) {
    setSelectedProduct(found);
  }
}, [productId, products]);
  useEffect(() => {
    const handlePopState = (e) => {
      if (e.state && e.state.page === 'list') {
        setSelectedProduct(null);
        if (e.state.pageNum) setCurrentPage(e.state.pageNum);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);


  const handleProductSelect = (product) => {
    setSelectedProduct(product);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ page: 'list', pageNum: currentPage }, "", window.location.href);
    window.history.pushState({ page: 'detail', id: product.id }, "", `#product-${product.id}`);
  };

  const closeDetail = () => {
    setSelectedProduct(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.history.pushState({ page: 'list', pageNum: currentPage }, "", window.location.pathname + window.location.search);
  };

  let filteredProducts = products.slice();

  if (catParam) {
    filteredProducts = filteredProducts.filter(p => p.category?.toLowerCase() === catParam.toLowerCase());
  }

  if (typeFilter !== 'all') {
    filteredProducts = filteredProducts.filter(p => p.type?.toLowerCase() === typeFilter.toLowerCase());
  }

  if (sortFilter === 'price-low') {
    filteredProducts.sort((a, b) => a.price - b.price);
  } else if (sortFilter === 'price-high') {
    filteredProducts.sort((a, b) => b.price - a.price);
  } else if (sortFilter === 'name') {
    filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
  }

  const totalPages = Math.max(1, Math.ceil(filteredProducts.length / itemsPerPage));
  const safePage = Math.min(currentPage, totalPages);
  const currentProducts = filteredProducts.slice((safePage - 1) * itemsPerPage, safePage * itemsPerPage);

  // Show a window of page numbers starting from the current page
  const maxVisiblePages = 5;
  const pageWindowStart = safePage;
  const pageWindowEnd = Math.min(totalPages, pageWindowStart + maxVisiblePages - 1);
  const visiblePages = [];
  for (let page = pageWindowStart; page <= pageWindowEnd; page++) {
    visiblePages.push(page);
  }

  const goToPage = (page) => {
    const next = Math.min(Math.max(1, page), totalPages);
    if (next === currentPage) return;
    setCurrentPage(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getCategoryTitle = () => {
    if (catParam === "sticker sheets") return "Sticker Sheets";
    if (catParam === "stickers") return "Stickers";
    if (catParam === "mugs") return "Mugs";
    if (catParam === "medals") return "Medals";
    if (catParam === "coaster") return "Coasters";
    if (catParam === "visa stickers") return "Visa Stickers";
    if (catParam === "laptop stickers") return "Laptop Stickers";
    return "Our products";
  };

  const renderDetailView = () => {
    const getRandomRelatedProducts = () => {
      return products
        .filter(
          p =>
            p.category === selectedProduct.category &&
            String(p.id) !== String(selectedProduct.id)
        )
        .sort(() => Math.random() - 0.5)
        .slice(0, 2);
    };

    const relatedProducts = getRandomRelatedProducts();
    const showSizeOption = selectedProduct.category === 'stickers';

    return (
      <div className="container my-4 my-md-5 animate__animated animate__fadeIn">
        <button className="btn btn-outline-secondary mb-3" onClick={closeDetail}>
          <i className="bi bi-arrow-left me-2"></i>Back to Products
        </button>
        <div className="row g-4 g-lg-5 justify-content-center">
          <div className="col-10 col-sm-8 col-md-5 col-lg-4">
            <div className="product-image-wrapper bg-white border rounded-4 overflow-hidden shadow-sm">
              <img src={selectedProduct.image} className="img-fluid w-100 p-3 p-md-4" alt={selectedProduct.name} style={{ maxHeight: '400px', objectFit: 'contain' }} />
            </div>
          </div>
          <div className="col-12 col-md-6 col-lg-5">
            <div className="product-info-sticky text-center text-md-start">
              <h1 className="fw-bold h3 h2-md mb-2">{selectedProduct.name}</h1>
              <div className="d-flex align-items-center justify-content-center justify-content-md-start gap-3 mb-4 flex-wrap">
                <span className="fs-4 fw-bold text-dark" id="detailPrice">LE {selectedProduct.price.toFixed(2)}</span>
                <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-3 py-2 small">In Stock</span>
              </div>

              {showSizeOption && (
                <div className="my-4">
                  <label className="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Size</label>
                  <select className="form-select rounded-pill mx-auto mx-md-0" style={{ width: '200px' }} id="detailSize" defaultValue="Medium" onChange={(e) => {
                    const val = e.target.value;
                    const p = document.getElementById('detailPrice');
                    if (p) p.innerText = `LE ${val === 'Medium' ? '25.00' : '20.00'}`;
                  }}>
                    <option value="Small">Small (5cm*5cm)</option>
                    <option value="Medium">Medium (10cm*10cm)</option>
                  </select>
                </div>
              )}

              <div className="my-4">
                <label className="form-label small fw-bold text-uppercase text-muted mb-2 d-block text-center text-md-start">Quantity</label>
                <div className="input-group border rounded-pill overflow-hidden mx-auto mx-md-0" style={{ width: '130px' }}>
                  <button className="btn btn-link text-dark text-decoration-none px-3" type="button" onClick={() => {
                    const el = document.getElementById('detailQty');
                    if (el && parseInt(el.value) > 1) el.value = parseInt(el.value) - 1;
                  }}>—</button>
                  <input type="text" className="form-control border-0 text-center fw-bold bg-transparent" id="detailQty" defaultValue="1" readOnly />
                  <button className="btn btn-link text-dark text-decoration-none px-3" type="button" onClick={() => {
                    const el = document.getElementById('detailQty');
                    if (el) el.value = parseInt(el.value) + 1;
                  }}>+</button>
                </div>
              </div>
              <div className="d-grid gap-2 gap-md-3">
                <button className="btn btn-dark btn-lg rounded-pill py-3 fw-bold shadow-sm" onClick={() => {
                  const qty = parseInt(document.getElementById('detailQty')?.value || 1);
                  let size = '';
                  let finalPrice = selectedProduct.price;
                  if (showSizeOption) {
                    size = document.getElementById('detailSize')?.value || 'Medium';
                    finalPrice = size === 'Medium' ? 25 : 20;
                  }
                  addToCart({ ...selectedProduct, price: finalPrice }, qty, size);
                }}>Add to cart</button>
                <button className="btn btn-outline-dark btn-lg rounded-pill py-3 fw-bold" onClick={() => {
                  const qty = parseInt(document.getElementById('detailQty')?.value || 1);
                  let size = '';
                  let finalPrice = selectedProduct.price;
                  if (showSizeOption) {
                    size = document.getElementById('detailSize')?.value || 'Medium';
                    finalPrice = size === 'Medium' ? 25 : 20;
                  }
                  addToCart({ ...selectedProduct, price: finalPrice }, qty, size);
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
                <div className="card h-100 cursor-pointer related-product border-0 shadow-sm hover-scale"
                  onClick={() => handleProductSelect(p)}
                  style={{ transition: 'transform 0.2s' }}>
                  <img src={p.image} className="card-img-top p-3" alt={p.name} style={{ height: '180px', objectFit: 'contain' }} />
                  <div className="card-body text-center p-2">
                    <h6 className="card-title mb-1">{p.name}</h6>
                    <p className="mb-0 fw-bold">LE {p.price.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {selectedProduct ? renderDetailView() : (
        <>
          {/* Filter Section */}
          <section className="filter-section py-4">
            <div className="container">
              <div className="row align-items-center">
                <div className="col-md-6">
                  <h2 className="section-title mb-0">
                    <span id="categoryTitle">{getCategoryTitle()}</span>
                  </h2>
                </div>
                <div className="col-md-6">
                  <div className="d-flex gap-3 justify-content-md-end mt-3 mt-md-0 flex-wrap">
                    <select className="form-select filter-select" id="typeFilter" value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
                      <option value="all">All Types</option>
                      <option value="sport">Sport</option>
                      <option value="nationalitie">Nationality</option>
                      <option value="cartoon">Cartoon</option>
                      <option value="marvel">Marvel</option>
                      <option value="series">Series</option>
                      <option value="music">Music</option>
                      <option value="colledge">College</option>
                      <option value="anime">Anime</option>
                      <option value="cute">Cute</option>
                      <option value="memes">Memes</option>
                      <option value="coat">Coat</option>
                    </select>
                    <select className="form-select filter-select" id="sortFilter" value={sortFilter} onChange={e => setSortFilter(e.target.value)}>
                      <option value="default">Sort By</option>
                      <option value="price-low">Price: Low to High</option>
                      <option value="price-high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Products Grid */}
          <section className="products-section py-5" id="products-grid">
            <div className="container">
              <div className="row" id="productsContainer">
                {currentProducts.length === 0 ? (
                  <div className="text-center py-5">
                    <h4 className="text-muted">No products found matching your criteria.</h4>
                  </div>
                ) : (
                  currentProducts.map(p => (
                    <div key={p.id} className="col-6 col-md-4 col-lg-3 mb-4 animate__animated animate__fadeIn">
                      <div className="card h-100 border-0 shadow-sm product-card-hover">
                        <div className="position-relative overflow-hidden rounded-top" onClick={() => handleProductSelect(p)} style={{ cursor: 'pointer' }}>
                          <div className="img-wrapper">
                            <img src={p.image} className="card-img-top p-3" alt={p.name} loading="lazy" />
                          </div>
                        </div>

                        <div className="card-body d-flex flex-column pt-0 text-center">
                          <h6 className="card-title fw-bold text-dark mb-1 mt-2" onClick={() => handleProductSelect(p)} style={{ cursor: 'pointer' }}>
                            🟢 {p.name}
                          </h6>
                          <div className="mt-auto">
                            <div className="mb-2">
                              <span className="text-muted small d-block mb-0" style={{ fontSize: '0.75rem', letterSpacing: '0.5px', textTransform: 'uppercase' }}>Starts from</span>
                              <span className="fs-5 fw-bold text-success price-green">LE {p.price.toFixed(2)}</span>
                            </div>

                            {(p.stock != null && p.stock <= 0) ? (
                              <button className="btn btn-secondary btn-sm w-100 rounded-pill" disabled>Out of Stock</button>
                            ) : p.category === 'stickers' ? (
                              <button className="btn btn-outline-success btn-sm w-100 rounded-pill open-product-options"
                                data-bs-toggle="modal"
                                data-bs-target="#productOptionsModal"
                                onClick={() => window.dispatchEvent(new CustomEvent('open-options', { detail: p }))}>
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
                  ))
                )}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <nav className="mt-5">
                  <ul className="pagination justify-content-center" id="pagination">
                    <li className={`page-item ${safePage === 1 ? 'disabled' : ''}`}>
                      <button className="page-link" aria-label="Previous page" onClick={() => goToPage(safePage - 1)}><i className="bi bi-chevron-left"></i></button>
                    </li>
                    {visiblePages.map((page) => (
                      <li key={page} className={`page-item ${safePage === page ? 'active' : ''}`}>
                        <button className="page-link" onClick={() => goToPage(page)}>{page}</button>
                      </li>
                    ))}
                    <li className={`page-item ${safePage === totalPages ? 'disabled' : ''}`}>
                      <button className="page-link" aria-label="Next page" onClick={() => goToPage(safePage + 1)}><i className="bi bi-chevron-right"></i></button>
                    </li>
                  </ul>
                </nav>
              )}
            </div>
          </section>
        </>
      )}

      {/* Modals */}
      <ProductOptionsModal />
      <SearchModal />
      <LoginModal />
      <SignupModal />
      <ForgotPasswordModal />
      <CartModal />

      {/* Toast Notification */}
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

      <div className="toast-container position-fixed bottom-0 end-0 p-3">
        <div id="loginToast" className="toast" role="alert" aria-live="assertive" aria-atomic="true">
          <div className="toast-header">
            <i className="bi bi-check-circle-fill text-success me-2"></i>
            <strong className="me-auto">Login Successful</strong>
            <button type="button" className="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
          </div>
          <div className="toast-body">
            You have successfully logged in!
          </div>
        </div>
      </div>
    </>
  );
};

export default Category;

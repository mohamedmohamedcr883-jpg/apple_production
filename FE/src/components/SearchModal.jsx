import React, { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import { getCategoryLabel } from '../config/categories';

const SearchModal = () => {
  const { products } = useAppContext();
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];

    return products
      .filter(product => [
        product.name,
        getCategoryLabel(product.category),
        product.type,
        product.description
      ].some(field => String(field || '').toLowerCase().includes(value)))
      .slice(0, 8);
  }, [products, query]);

  const openSearchTarget = (target) => {
    const modal = document.getElementById('searchModal');
    const instance = window.bootstrap?.Modal.getInstance(modal);
    const open = () => {
      setQuery('');
      navigate(target);
    };
    if (instance) {
      const hide = () => instance.hide();
      modal.addEventListener('shown.bs.modal', hide, { once: true });
      modal.addEventListener('hidden.bs.modal', () => {
        modal.removeEventListener('shown.bs.modal', hide);
        open();
      }, { once: true });
      hide();
    } else {
      open();
    }
  };

  const openProduct = (event) => {
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openSearchTarget(event.currentTarget.getAttribute('href'));
  };

  const submitSearch = (event) => {
    event.preventDefault();
    const value = query.trim();
    if (!value) return;
    openSearchTarget(`/pages/category.html?search=${encodeURIComponent(value)}`);
  };

  return (
    <div className="modal fade" id="searchModal" tabIndex="-1" aria-labelledby="searchModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content search-modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body">
            <h3 className="modal-title text-center mb-4" id="searchModalLabel">Search Products</h3>
            <div className="search-container">
              <form className="input-group input-group-lg" onSubmit={submitSearch}>
                <input
                  type="text"
                  className="form-control search-input"
                  id="searchInput"
                  placeholder="Search for stickers, products..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.nativeEvent.isComposing) submitSearch(e);
                  }}
                  autoFocus
                />
                <button className="btn btn-primary" type="submit" id="searchButton" aria-label="Search">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </form>
              <div id="searchResults" className="search-results mt-4">
                {query.trim() && results.length === 0 && (
                  <div className="text-center text-muted py-3">No products found.</div>
                )}
                {results.map(product => (
                  <Link
                    key={product.id || product._id}
                    to={`/pages/category.html?cat=${encodeURIComponent(product.category || '')}&productId=${encodeURIComponent(product.id || product._id)}`}
                    onClick={openProduct}
                    className="d-flex align-items-center gap-3 text-decoration-none"
                  >
                    <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />
                    <span>
                      <strong>{product.name}</strong>
                      <small className="d-block text-muted">{getCategoryLabel(product.category)} • {product.price} LE</small>
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;

import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const SearchModal = () => {
  const { products } = useAppContext();
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return [];

    return products
      .filter(product => [
        product.name,
        product.category,
        product.type,
        product.description
      ].some(field => String(field || '').toLowerCase().includes(value)))
      .slice(0, 8);
  }, [products, query]);

  const closeModal = () => {
    const modal = document.getElementById('searchModal');
    if (modal && window.bootstrap) {
      window.bootstrap.Modal.getInstance(modal)?.hide();
    }
    setQuery('');
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
              <div className="input-group input-group-lg">
                <input
                  type="text"
                  className="form-control search-input"
                  id="searchInput"
                  placeholder="Search for stickers, products..."
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  autoFocus
                />
                <button className="btn btn-primary" type="button" id="searchButton">
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
              </div>
              <div id="searchResults" className="search-results mt-4">
                {query.trim() && results.length === 0 && (
                  <div className="text-center text-muted py-3">No products found.</div>
                )}
                {results.map(product => (
                  <Link
                    key={product.id || product._id}
                    to={`/pages/category.html?cat=${encodeURIComponent(product.category || '')}`}
                    onClick={closeModal}
                    className="d-flex align-items-center gap-3 text-decoration-none"
                  >
                    <img src={product.image} alt={product.name} style={{ width: '48px', height: '48px', objectFit: 'contain', borderRadius: '8px' }} />
                    <span>
                      <strong>{product.name}</strong>
                      <small className="d-block text-muted">{product.category} • {product.price} LE</small>
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

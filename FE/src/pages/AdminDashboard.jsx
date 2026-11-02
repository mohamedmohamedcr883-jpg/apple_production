import React, { useState, useEffect } from 'react';
import { getAdminProducts, getOrders, getOffers, createProduct, deleteProduct, updateProduct, createOffer, deleteOffer } from '../services/api';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('products');
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [offers, setOffers] = useState([]);
  const [adminName, setAdminName] = useState('Admin');
  const [productSearch, setProductSearch] = useState('');
  
  // Modals
  const [toastMsg, setToastMsg] = useState('');
  const [toastType, setToastType] = useState('success');
  const [showToast, setShowToast] = useState(false);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [showEditModal, setShowEditModal] = useState(false);
  const [editTarget, setEditTarget] = useState({ id: null, name: '', price: 0, stock: 0, category: '', image: '' });

  const [showAddProduct, setShowAddProduct] = useState(false);
  const [dashboardError, setDashboardError] = useState('');

  // Offer Form
  const [offerForm, setOfferForm] = useState({ title: '', category: '', discountType: 'percentage', discountValue: '', startDate: '', expiryDate: '' });

  useEffect(() => {
    const name = localStorage.getItem('adminName');
    if (name) setAdminName(name);

    if (!localStorage.getItem('adminToken')) {
      window.location.href = '/pages/admin-login.html';
      return;
    }

    loadProducts();
    loadOrders();
    loadOffers();
  }, []);

  const triggerToast = (msg, type = 'success') => {
    setToastMsg(msg);
    setToastType(type);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const lgout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminName');
    window.location.href = '/pages/admin-login.html';
  };

  const handleTabSwitch = (tab) => {
    setActiveTab(tab);
    if (tab === 'products') loadProducts();
    if (tab === 'orders') loadOrders();
    if (tab === 'offers') loadOffers();
  };

  const loadProducts = async () => {
    try {
      const res = await getAdminProducts();
      if (res?.success && Array.isArray(res.data)) {
        setProducts(res.data);
        setDashboardError('');
      } else {
        setProducts([]);
        setDashboardError(res?.message || 'Could not load products');
      }
    } catch {
      setProducts([]);
      setDashboardError('Could not load products');
    }
  };

  const loadOrders = async () => {
    try {
      const res = await getOrders();
      if (res?.success && Array.isArray(res.data)) setOrders(res.data);
    } catch {
      triggerToast('Could not load orders', 'error');
    }
  };

  const loadOffers = async () => {
    try {
      const res = await getOffers();
      if (res?.success && Array.isArray(res.data)) setOffers(res.data);
    } catch {
      triggerToast('Could not load offers', 'error');
    }
  };

  const normalizedProductSearch = productSearch.trim().toLowerCase();
  const filteredProducts = normalizedProductSearch
    ? products.filter(product => [product.name, product.category, product.type, product.id, product._id]
      .some(value => String(value || '').toLowerCase().includes(normalizedProductSearch)))
    : products;

  const submitProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set('name', formData.get('name')?.trim() || '');
    formData.set('description', formData.get('description')?.trim() || '');

    const res = await createProduct(formData);
    if (res?.success) {
      triggerToast('Product added successfully');
      e.currentTarget.reset();
      setShowAddProduct(false);
      loadProducts();
    } else {
      triggerToast(res?.message || 'Failed to add product', 'error');
    }
  };

  // --- Deletion ---
  const attemptDelete = (id, name) => {
    setDeleteTarget({ id, name });
    setShowDeleteModal(true);
  };
  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const res = await deleteProduct(deleteTarget.id);
    if (res?.success) {
      triggerToast('Product deleted successfully');
      loadProducts();
    } else triggerToast(res?.message || 'Failed', 'error');
    setShowDeleteModal(false);
  };

  // --- Editing ---
  const attemptEdit = (p) => {
    setEditTarget({ id: p.id || p._id, name: p.name, price: p.originalPrice ?? p.price, stock: p.stock ?? 0, category: p.category, image: p.image || '' });
    setShowEditModal(true);
  };
  const confirmEdit = async () => {
    const formData = new FormData();
    const price = editTarget.category === 'stickers' ? 20 : Number(editTarget.price);
    formData.set('name', editTarget.name);
    formData.set('price', String(price));
    formData.set('stock', String(Number(editTarget.stock)));
    const photo = document.getElementById('editPhoto')?.files?.[0];
    if (photo) formData.set('photo', photo);

    const res = await updateProduct(editTarget.id, formData);
    if (res?.success) {
      triggerToast('Updated successfully');
      loadProducts();
    } else triggerToast(res?.message || 'Failed', 'error');
    setShowEditModal(false);
  };

  // --- Offers ---
  const submitOffer = async (e) => {
    e.preventDefault();
    const res = await createOffer({ ...offerForm, discountValue: Number(offerForm.discountValue) });
    if (res?.success) {
      triggerToast('Offer created successfully');
      setOfferForm({ title: '', category: '', discountType: 'percentage', discountValue: '', startDate: '', expiryDate: '' });
      loadOffers();
    } else triggerToast(res?.message || 'Failed', 'error');
  };

  return (
    <>
      <div className={`toast toast-${toastType} ${showToast ? 'show' : ''}`} id="toast">{toastMsg}</div>

      {showDeleteModal && (
        <div className="modal-overlay show" id="deleteModal" style={{ display: 'flex' }}>
          <div className="admin-modal">
            <h3>⚠️ Delete Product</h3>
            <p>Are you sure you want to delete <strong>{deleteTarget?.name}</strong>? This action cannot be undone.</p>
            <div className="modal-btns">
              <button className="btn" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setShowDeleteModal(false)}>Cancel</button>
              <button className="btn btn-danger" onClick={confirmDelete}>Delete</button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="modal-overlay show" id="editModal" style={{ display: 'flex' }}>
          <div className="admin-modal">
            <h3>✏️ Edit Product</h3>
            {editTarget.image && (
              <div className="admin-modal-image">
                <img
                  src={editTarget.image}
                  alt={editTarget.name}
                  onError={e => { e.currentTarget.style.display = 'none'; }}
                />
              </div>
            )}
            <div className="form-group">
              <label htmlFor="editName">Name</label>
              <input type="text" id="editName" value={editTarget.name} onChange={e => setEditTarget({ ...editTarget, name: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="editPrice">Original Price (LE)</label>
              <input type="number" id="editPrice" step="0.01" value={editTarget.price} onChange={e => setEditTarget({ ...editTarget, price: e.target.value })} readOnly={editTarget.category === 'stickers'} style={editTarget.category === 'stickers' ? { backgroundColor: '#e9ecef', cursor: 'not-allowed' } : {}} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="editStock">Stock</label>
              <input type="number" id="editStock" value={editTarget.stock} onChange={e => setEditTarget({ ...editTarget, stock: e.target.value })} />
            </div>
            <div className="form-group" style={{ marginTop: '12px' }}>
              <label htmlFor="editPhoto">Replace Image</label>
              <input type="file" id="editPhoto" accept="image/*" />
            </div>
            <div className="modal-btns">
              <button className="btn" style={{ background: 'var(--gray-100)', color: 'var(--gray-700)' }} onClick={() => setShowEditModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={confirmEdit}>Save Changes</button>
            </div>
          </div>
        </div>
      )}

      <div className="admin-layout">
        <aside className="sidebar">
          <div className="sidebar-logo">
            <div className="icon">🍎</div>
            <span>Apple Store</span>
          </div>
          <nav className="sidebar-nav">
            <button className={`nav-item ${activeTab === 'products' ? 'active' : ''}`} onClick={() => handleTabSwitch('products')}>
              <span className="nav-icon">📦</span>
              <span>Products</span>
            </button>
            <button className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => handleTabSwitch('orders')}>
              <span className="nav-icon">📋</span>
              <span>Orders</span>
            </button>
            <button className={`nav-item ${activeTab === 'offers' ? 'active' : ''}`} onClick={() => handleTabSwitch('offers')}>
              <span className="nav-icon">🏷️</span>
              <span>Offers</span>
            </button>
          </nav>
          <div className="sidebar-footer">
            <button className="logout-btn" onClick={lgout}>
              <span className="nav-icon">🚪</span>
              <span>Logout</span>
            </button>
          </div>
        </aside>

        <main className="main-content">
          <div className="page-header">
            <h1 id="pageTitle">{activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</h1>
            <span className="admin-name">👋 Hello, <span id="adminNameDisplay">{adminName}</span></span>
          </div>

          <div className={`tab-content ${activeTab === 'products' ? 'active' : ''}`} id="tab-products">
            <div className="card">
              <div className="card-header">
                <h2>All Products</h2>
                <button className="btn btn-primary" onClick={() => setShowAddProduct(!showAddProduct)}>
                  ➕ Add Product
                </button>
              </div>

              <div className="product-search-bar">
                <label htmlFor="productSearch">Search products</label>
                <div className="product-search-controls">
                  <input
                    id="productSearch"
                    type="search"
                    value={productSearch}
                    onChange={e => setProductSearch(e.target.value)}
                    placeholder="Search by name, category, type, or ID"
                  />
                  {productSearch && (
                    <button type="button" className="btn btn-sm" onClick={() => setProductSearch('')}>
                      Clear
                    </button>
                  )}
                </div>
                <span className="product-search-count">
                  Showing {filteredProducts.length} of {products.length} products
                </span>
              </div>

              {showAddProduct && (
                <div id="addProductCard" style={{ marginBottom: '20px', padding: '20px', background: 'var(--green-50)', borderRadius: '12px', border: '1px solid var(--green-200)' }}>
                  <h3 style={{ marginBottom: '16px', fontSize: '15px', color: 'var(--green-800)' }}>Add New Product</h3>
                  <form id="addProductForm" onSubmit={submitProduct}>
                    <div className="form-row">
                      <div className="form-group"><label>Name</label><input type="text" name="name" required placeholder="Product name" className="form-control" /></div>
                      <div className="form-group" id="apPriceGroup"><label id="apPriceLabel">Price (LE)</label><input type="number" name="price" required placeholder="0.00" step="0.01" className="form-control" /></div>
                    </div>
                    <div className="form-row">
                      <div className="form-group"><label>Stock</label><input type="number" name="stock" placeholder="0" className="form-control" /></div>
                      <div className="form-group">
                        <label>Category</label>
                        <select name="category" required className="form-control" onChange={(e) => {
                          const apPrice = e.currentTarget.form.elements.price;
                          if (e.target.value === 'stickers') {
                            apPrice.value = '20';
                            apPrice.readOnly = true;
                            apPrice.style.backgroundColor = '#e9ecef';
                          } else {
                            apPrice.readOnly = false;
                            apPrice.style.backgroundColor = '';
                          }
                        }}>
                          <option value="">Select category...</option>
                          <option value="stickers">Stickers</option>
                          <option value="sticker sheets">Sticker Sheets</option>
                          <option value="mugs">Mugs</option>
                          <option value="medals">Medals</option>
                          <option value="coaster">Coasters</option>
                          <option value="visa stickers">Visa Stickers</option>
                          <option value="laptop stickers">Laptop Stickers</option>
                        </select>
                      </div>
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Type</label>
                        <select name="type" required className="form-control">
                          <option value="">Select type...</option>
                          <option value="sport">Sport</option>
                          <option value="nationalitie">Nationalitie</option>
                          <option value="cartoon">Cartoon</option>
                          <option value="marvel">Marvel</option>
                          <option value="series">Series</option>
                          <option value="music">Music</option>
                          <option value="colledge">Colledge</option>
                          <option value="anime">Anime</option>
                          <option value="cute">Cute</option>
                          <option value="memes">Memes</option>
                          <option value="coat">Coat</option>
                        </select>
                      </div>
                      <div className="form-group"><label>Product Image</label><input type="file" name="photo" required accept="image/*" className="form-control" /></div>
                    </div>
                    <div className="form-group" style={{ marginTop: '15px' }}><label>Description</label><input type="text" name="description" placeholder="Optional product description" className="form-control" /></div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '15px' }}>Save Product</button>
                  </form>
                </div>
              )}

              {dashboardError && activeTab === 'products' && <div className="empty-state">{dashboardError}</div>}
              <div className="table-wrap">
                <table>
                  <thead><tr><th>Image</th><th>Name</th><th>Category</th><th>Type</th><th>Price</th><th>Stock</th><th>Actions</th></tr></thead>
                  <tbody id="productsTableBody">
                    {filteredProducts.map(p => (
                      <tr key={p.id || p._id}>
                        <td><img src={p.image} className="product-thumb" alt={p.name} /></td>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.category}</td>
                        <td>{p.type}</td>
                        <td>{p.price} LE</td>
                        <td>{p.stock ?? '—'}</td>
                        <td>
                          <div className="action-btns">
                            <button className="btn btn-warning btn-sm" onClick={() => attemptEdit(p)}>✏️ Edit</button>
                            <button className="btn btn-danger btn-sm" onClick={() => attemptDelete(p.id || p._id, p.name)}>🗑️ Delete</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredProducts.length === 0 && !dashboardError && (
                      <tr><td colSpan="7" className="empty-state">No products found.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className={`tab-content ${activeTab === 'orders' ? 'active' : ''}`} id="tab-orders">
             <div className="card">
                <div className="card-header"><h2>All Orders</h2></div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>Customer</th><th>Phone</th><th>Products</th><th>Total</th><th>Status</th><th>Payment</th><th>Date</th></tr></thead>
                        <tbody id="ordersTableBody">
                           {orders.map(o => (
                               <tr key={o._id || o.id}>
                                   <td><strong>{o.name}</strong><br/><small style={{color:'var(--gray-500)'}}>{o.email}</small></td>
                                   <td>{o.phone}</td>
                                   <td style={{maxWidth:'200px'}}>{o.products?.map(p => `${p.name} ×${p.quantity}`).join(', ')}</td>
                                   <td><strong>{o.totalPrice} LE</strong></td>
                                   <td><span className={`badge ${o.status ? 'badge-success' : 'badge-pending'}`}>{o.status ? 'Completed' : 'Pending'}</span></td>
                                   <td>{o.paymentMethod?.toUpperCase()}</td>
                                   <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                               </tr>
                           ))}
                           {orders.length === 0 && (
                             <tr><td colSpan="7" className="empty-state">No orders found.</td></tr>
                           )}
                        </tbody>
                    </table>
                </div>
             </div>
          </div>

          <div className={`tab-content ${activeTab === 'offers' ? 'active' : ''}`} id="tab-offers">
            <div className="card">
              <div className="card-header"><h2>Create New Offer</h2></div>
              <form id="offerForm" onSubmit={submitOffer}>
                <div className="form-row">
                   <div className="form-group"><label>Offer Title</label><input type="text" value={offerForm.title} onChange={e=>setOfferForm({...offerForm, title: e.target.value})} required /></div>
                   <div className="form-group">
                       <label>Category</label>
                       <select value={offerForm.category} onChange={e=>setOfferForm({...offerForm, category: e.target.value})} required>
                           <option value="">Select category</option>
                           <option value="stickers">Stickers</option>
                           <option value="sticker sheets">Sticker Sheets</option>
                           <option value="mugs">Mugs</option>
                           <option value="medals">Medals</option>
                           <option value="coaster">Coasters</option>
                           <option value="visa stickers">Visa Stickers</option>
                           <option value="laptop stickers">Laptop Stickers</option>
                       </select>
                   </div>
                </div>
                <div className="form-row">
                   <div className="form-group">
                       <label>Discount Type</label>
                       <select value={offerForm.discountType} onChange={e=>setOfferForm({...offerForm, discountType: e.target.value})} required>
                           <option value="percentage">Percentage</option>
                           <option value="fixed">Fixed Amount</option>
                       </select>
                   </div>
                   <div className="form-group"><label>Discount Value</label><input type="number" min="0" step="0.01" value={offerForm.discountValue} onChange={e=>setOfferForm({...offerForm, discountValue: e.target.value})} required /></div>
                </div>
                <div className="form-row">
                   <div className="form-group"><label>Start Date</label><input type="date" value={offerForm.startDate} onChange={e=>setOfferForm({...offerForm, startDate: e.target.value})} required /></div>
                   <div className="form-group"><label>Expiry Date</label><input type="date" value={offerForm.expiryDate} onChange={e=>setOfferForm({...offerForm, expiryDate: e.target.value})} required /></div>
                </div>
                <button type="submit" className="btn btn-primary">🏷️ Create Offer</button>
              </form>
            </div>
            <div className="card mt-4">
              <div className="card-header"><h2>Active Offers</h2></div>
              <div className="table-wrap">
                  <table>
                      <thead><tr><th>Title</th><th>Category</th><th>Discount</th><th>Expires</th><th>Actions</th></tr></thead>
                      <tbody id="offersTableBody">
                          {offers.map(o => (
                              <tr key={o._id}>
                                  <td><strong>{o.title}</strong></td>
                                  <td><span className="badge badge-offer">{o.category}</span></td>
                                  <td><strong>{o.discountValue}{o.discountType === 'percentage' ? '%' : ' LE'}</strong></td>
                                  <td>{new Date(o.expiryDate).toLocaleDateString()}</td>
                                  <td>
                                      <button className="btn btn-danger btn-sm" onClick={async () => {
                                          await deleteOffer(o._id); loadOffers();
                                      }}>🗑️ Delete</button>
                                  </td>
                              </tr>
                          ))}
                          {offers.length === 0 && (
                            <tr><td colSpan="5" className="empty-state">No offers found.</td></tr>
                          )}
                      </tbody>
                  </table>
              </div>
            </div>
          </div>

        </main>
      </div>
    </>
  );
};

export default AdminDashboard;

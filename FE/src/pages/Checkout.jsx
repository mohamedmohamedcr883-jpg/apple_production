  import React, { useState } from 'react';
  import { useAppContext } from '../context/AppContext';
  import CartModal from '../components/CartModal';
  import { API_BASE } from '../config/api';

  const shippingByGovernorate = {
    Cairo: 5, Giza: 6, Alexandria: 7, Qalyubia: 6, Sharqia: 7, Dakahlia: 7,
    Beheira: 7, Monufia: 6, Gharbia: 6, "Kafr El Sheikh": 7, Damietta: 7, "Port Said": 8,
    Ismailia: 8, Suez: 8, "North Sinai": 10, "South Sinai": 10, "Red Sea": 10,
    Faiyum: 7, "Beni Suef": 8, Minya: 8, Assiut: 9, Sohag: 9, Qena: 9, Luxor: 9,
    Aswan: 10, "New Valley": 10, Matrouh: 10
  };

  const Checkout = () => {
    const { cart, clearCart } = useAppContext();

    const [form, setForm] = useState({
      name: '', email: '', city: '', address: '', phone: ''
    });

    const [orderStatus, setOrderStatus] = useState({ msg: '', color: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = (form.city ? (shippingByGovernorate[form.city] || 0) : 0) + 2;
    const total = subtotal + shippingCost;

    const handlePlaceOrder = async () => {
      if (cart.length === 0 || isProcessing) return;

      if (!form.name || !form.email || !form.phone || !form.address || !form.city) {
        setOrderStatus({ msg: '❌ Please fill in all required fields.', color: 'red' });
        return;
      }

      if (subtotal < 50) {
        setOrderStatus({ msg: '❌ Please add items worth at least 50 LE to proceed.', color: 'red' });
        return;
      }

      setIsProcessing(true);
      setOrderStatus({ msg: '', color: '' });

      try {
        const productsPayload = {};

        cart.forEach(item => {
          const key = item.size ? `${item.productId}_${item.size}` : String(item.productId);
          const existing = productsPayload[key];
          productsPayload[key] = {
            quantity: (existing?.quantity || 0) + Number(item.quantity),
            ...(item.size ? { size: item.size } : {}),
          };
        });

        const transactionPayload = {
          name: form.name,
          email: form.email,
          phoneNumber: form.phone,
          address: form.address,
          city: form.city,
          products: productsPayload,
          totalPrice: total,
          paymentMethod: 'cash',
          status: false
        };

        const res = await fetch(`${API_BASE}/transaction/add`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(transactionPayload)
        });

        const result = await res.json();

        if (!res.ok) {
          throw new Error(result.errorDetails?.map(e => `${e.field}: ${e.message}`).join(", ") || result.message || "Order Failed");
        }

        clearCart();
        setOrderStatus({ msg: '✅ Order placed successfully!', color: 'green' });

      } catch (err) {
        setOrderStatus({ msg: `❌ ${err.message || 'Error connecting to server'}`, color: 'red' });
      } finally {
        setIsProcessing(false);
      }
    };

    return (
      <main className="py-5">
        {/* Mobile-only fix: kills any inherited gap/height on the checkout columns.
            Order stays the same as desktop (form first, summary below). */}
        <style>{`
          @media (max-width: 991.98px) {
            .checkout-summary-col {
              min-height: auto !important;
              height: auto !important;
              margin-top: 0 !important;
              margin-bottom: 0 !important;
              top: auto !important;
              position: static !important;
            }
            .checkout-summary-col .card {
              min-height: auto !important;
              height: auto !important;
            }
            .checkout-form-col {
              margin-bottom: 0 !important;
            }
            .checkout-row {
              row-gap: 16px !important;
            }
          }
        `}</style>

        <div className="container">
          <div className="row g-4 checkout-row">

            {/* LEFT SIDE */}
            <div className="col-12 col-lg-7 checkout-form-col">
              <div className="mb-4">
                <h1 className="display-6 fw-semibold mb-2">Checkout</h1>
                <p className="text-secondary-emphasis mb-0">
                  Please add items worth at least 50 LE (Net) to proceed.
                </p>
              </div>

              <div className="card shadow-sm border-0">
                <div className="card-body p-4">
                  <h2 className="h5 fw-semibold mb-3">Customer Details</h2>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label">Name</label>
                      <input className="form-control" id="Name" placeholder="Ziad" value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Email</label>
                      <input className="form-control" id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
                    </div>

                    <div className="col-12">
                      <label className="form-label">City</label>
                      <select className="form-control" id="city" value={form.city} onChange={e=>setForm({...form, city: e.target.value})}>
                        <option value="" disabled>Choose Governorate</option>
                        {Object.keys(shippingByGovernorate).map(gov => (
                          <option key={gov} value={gov}>{gov}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label">Address</label>
                      <input className="form-control" id="address" placeholder="Street, building, apartment" value={form.address} onChange={e=>setForm({...form, address: e.target.value})} />
                    </div>

                    <div className="col-12">
                      <label className="form-label">Phone</label>
                      <input className="form-control" id="phone" placeholder="+20 123456789" value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
                    </div>
                  </div>

                  <hr className="my-4" />

                  {/* PAYMENT METHOD */}
                  <h2 className="h5 fw-semibold mb-3">Payment Method</h2>

                  <div className="payment-option form-check mb-2">
                    <input className="form-check-input" type="radio" name="payment" id="pmCod" value="cod" checked readOnly />
                    <label className="form-check-label w-100" htmlFor="pmCod">
                      <div className="d-flex justify-content-between align-items-center">
                        <div className="d-flex align-items-center gap-2">
                          <i className="bi bi-truck"></i>
                          <span className="fw-semibold">Cash on Delivery</span>
                        </div>
                      </div>
                      <div className="text-secondary-emphasis small mt-1">
                        Pay in cash when the order arrives.
                        <span className="text-danger ms-1">(+2 LE Extra)</span>
                      </div>
                    </label>
                  </div>

                  <div className="mt-4">
                    <div className="alert alert-warning mb-0" id="codNote">
                      Please prepare the full amount on delivery.
                      You can inspect the package before paying.
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* RIGHT SIDE */}
            <div className="col-12 col-lg-5 checkout-summary-col">
              <div className="card shadow-sm border-0 sticky-lg-top" style={{ top: '92px', backgroundColor: '#effce8' }}>
                <div className="card-body p-4">
                  <h2 className="h5 fw-semibold mb-3">Order Summary</h2>

                  <div id="checkoutItems" className="vstack gap-3">
                    {cart.map((item, idx) => (
                      <div key={idx} className="d-flex align-items-center gap-3 bg-white p-2 rounded shadow-sm border">
                        <div className="border rounded bg-light d-flex align-items-center justify-content-center flex-shrink-0" style={{width:'50px', height:'50px'}}>
                          <img src={item.image} alt={item.name} style={{width:'100%', height:'100%', objectFit:'contain'}} />
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <h6 className="mb-0 text-truncate">{item.name}</h6>
                          <small className="text-secondary-emphasis d-block">{item.price} LE x {item.quantity}{item.size ? ` (${item.size})` : ''}</small>
                        </div>
                        <div className="fw-bold">
                          {(item.price * item.quantity).toFixed(2)} LE
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <strong id="subtotal">{subtotal.toFixed(2)} LE</strong>
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span>Shipping</span>
                    <strong id="shipping">{shippingCost > 0 ? `${shippingCost} LE` : 'Calculated at checkout'}</strong>
                  </div>

                  <hr className="my-4" />

                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fs-5 fw-semibold">Total</span>
                    <span className="fs-5 fw-semibold" id="total">{total.toFixed(2)} LE</span>
                  </div>

                  <button id="placeOrder" className="btn btn-success btn-lg w-100 mt-4" onClick={handlePlaceOrder} disabled={isProcessing || cart.length === 0}>
                    {isProcessing ? 'Processing...' : (orderStatus.msg.includes('✅') ? 'Order Placed ✓' : 'Place Order')}
                  </button>

                  {orderStatus.msg && (
                    <div id="orderMsg" className="small mt-3" style={{color: orderStatus.color}}>{orderStatus.msg}</div>
                  )}

                </div>
              </div>
            </div>

          </div>
        </div>

        <CartModal />
      </main>
    );
  };

  export default Checkout;
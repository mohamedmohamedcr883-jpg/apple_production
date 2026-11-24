  import React, { useState } from 'react';
  import { useAppContext } from '../context/AppContext';
  import CartModal from '../components/CartModal';
  import { API_BASE } from '../config/api';

  const shippingByGovernorate = {
    Cairo: 80,
    "Cairo suburbs": 100,
    Giza: 80,
    "Giza suburbs": 100,
    Qalyubia: 80,
    Alexandria: 100,
    Beheira: 100,
    "Marsa Matrouh": 140,
    Dakahlia: 100,
    "Kafr El Sheikh": 100,
    Gharbia: 100,
    Menoufia: 100,
    Damietta: 100,
    "Port Said": 100,
    Ismailia: 100,
    Suez: 100,
    Sharqia: 100,
    "Red Sea": 160,
    Fayoum: 100,
    "Beni Suef": 100,
    Minya: 130,
    Assiut: 140,
    "New Valley": 160,
    Qena: 140,
    Sohag: 140,
    Aswan: 140,
    Luxor: 140
  };
  const CASH_ON_DELIVERY_FEE = 2;

  const Checkout = () => {
    const { cart, clearCart } = useAppContext();

    const [form, setForm] = useState({
      name: '', email: '', city: '', address: '', phone: ''
    });

    const [orderStatus, setOrderStatus] = useState({ msg: '', color: '' });
    const [isProcessing, setIsProcessing] = useState(false);

    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const shippingCost = form.city ? (shippingByGovernorate[form.city] || 0) : 0;
    const total = subtotal + shippingCost + CASH_ON_DELIVERY_FEE;

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
                      <label className="form-label" htmlFor="city">City</label>
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

                  <div className="mt-4">
                    <div className="alert alert-warning mb-0" id="codNote">
                      <strong>Cash on Delivery</strong><br />
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
                        <div className="flex-grow-1" style={{ minWidth: 0 }}>
                          <h6 className="mb-0 text-truncate" title={item.name}>{item.name}</h6>
                          <small className="text-secondary-emphasis d-block">
                            {item.quantity} × {item.price.toFixed(2)} LE{item.size ? ` · Size: ${item.size}` : ''}
                          </small>
                        </div>
                        <div className="fw-bold flex-shrink-0 text-nowrap">
                          {(item.price * item.quantity).toFixed(2)} LE
                        </div>
                      </div>
                    ))}
                  </div>

                  <hr className="my-4" />

                  <section className="bg-white border rounded p-3 mb-4" aria-label="Delivery details">
                    <h3 className="h6 fw-semibold mb-3">Delivery Details</h3>
                    <div className="d-flex justify-content-between gap-3">
                      <span className="text-secondary-emphasis">Governorate</span>
                      <strong className="text-end">{form.city || 'Choose a governorate'}</strong>
                    </div>
                    <div className="d-flex justify-content-between gap-3 mt-2">
                      <span className="text-secondary-emphasis">Shipping cost</span>
                      <strong className="text-end">{form.city ? `${shippingCost.toFixed(2)} LE` : 'Choose a governorate'}</strong>
                    </div>
                  </section>

                  <div className="d-flex justify-content-between">
                    <span>Subtotal</span>
                    <strong id="subtotal">{subtotal.toFixed(2)} LE</strong>
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span>Shipping</span>
                    <strong id="shipping">{form.city ? `${shippingCost.toFixed(2)} LE` : 'Choose a governorate'}</strong>
                  </div>

                  <div className="d-flex justify-content-between mt-2">
                    <span>Cash on Delivery fee</span>
                    <strong id="cashOnDeliveryFee">{CASH_ON_DELIVERY_FEE.toFixed(2)} LE</strong>
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

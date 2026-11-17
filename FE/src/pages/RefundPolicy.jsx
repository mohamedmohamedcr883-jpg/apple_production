import { Link } from 'react-router-dom';
import CartModal from '../components/CartModal';
import SearchModal from '../components/SearchModal';

const RefundPolicy = () => (
  <>
    <main className="container py-5" style={{ maxWidth: '800px' }}>
      <header className="text-center mb-4">
        <h1 className="display-6 fw-bold">Return &amp; Exchange</h1>
        <p className="text-muted">Our refund and exchange policy</p>
      </header>
      <div className="bg-white border rounded-4 p-4 p-md-5 shadow-sm">
        <section className="mb-4" aria-labelledby="refund-policy">
          <h2 className="h4 fw-bold" id="refund-policy">Refund Policy</h2>
          <p className="mb-0">You can check your order carefully upon delivery. If you are not satisfied with your order, you can return it to the courier at the same time. You will only be charged the shipping fees.</p>
        </section>
        <section className="mb-4" aria-labelledby="exchange-policy">
          <h2 className="h4 fw-bold" id="exchange-policy">Exchange Policy</h2>
          <p>You can exchange your order within <strong>3 days of receiving it</strong>, provided it is unused and in its original condition and packaging.</p>
          <ul className="mb-0 ps-3">
            <li className="mb-2">Shipping costs for exchanges are covered by the customer.</li>
            <li>You will not be charged shipping costs in the case of manufacturing defects.</li>
          </ul>
        </section>
        <section aria-labelledby="start-return">
          <h2 className="h4 fw-bold" id="start-return">How to Initiate a Return</h2>
          <p>To start a return, please contact us at <a className="text-success text-break" href="mailto:specialstickers11@gmail.com">specialstickers11@gmail.com</a> with your order number and reason for return. We will provide instructions on how to proceed.</p>
        </section>
        <Link to="/" className="btn btn-outline-success rounded-pill mt-2">Continue shopping</Link>
      </div>
    </main>
    <SearchModal />
    <CartModal />
  </>
);

export default RefundPolicy;

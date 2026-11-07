import React from 'react';
import { Link } from 'react-router-dom';
import CartModal from '../components/CartModal';
import SearchModal from '../components/SearchModal';

const ComingSoon = ({ title, text }) => (
  <main className="py-5">
    <div className="container text-center py-5" style={{ maxWidth: '640px' }}>
      <h1 className="display-5 fw-bold hero-title mb-3">{title}</h1>
      <p className="text-muted fs-5 mb-4">{text}</p>
      <span className="badge bg-success bg-opacity-10 text-success rounded-pill px-4 py-2 mb-4 d-inline-block">Coming soon</span>
      <div className="d-flex gap-3 justify-content-center flex-wrap">
        <Link to="/" className="btn btn-success rounded-pill px-4">Continue shopping</Link>
        <a href="#contact" className="btn btn-outline-success rounded-pill px-4">Contact us</a>
      </div>
    </div>
    <SearchModal />
    <CartModal />
  </main>
);

export default ComingSoon;

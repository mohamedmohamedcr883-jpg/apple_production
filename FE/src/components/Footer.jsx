import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer py-3" id="contact">
      <div className="container d-flex flex-column flex-md-row justify-content-between align-items-center">
        {/* Contact Info */}
        <div className="footer-contact d-flex flex-wrap align-items-center gap-3 mb-2 mb-md-0">
          <div className="footer-item d-flex align-items-center gap-1">
            <a href="https://maps.app.goo.gl/Q8iFqu5bacgHWEP28" target="_parent" style={{ color: '#76b852', textDecoration: 'none' }}>
              <i className="fa-solid fa-location-crosshairs"></i>
              <span> السكاكيني، حي الظاهر، محافظة القاهرة</span>
            </a>
          </div>
          <div className="footer-item d-flex align-items-center gap-1">
            <i className="fa-brands fa-whatsapp"></i>
            <span>010 68458049</span>
          </div>
          <div className="footer-item d-flex align-items-center gap-1">
            <i className="fa-solid fa-at"></i>
            <span>info@apple-store.com</span>
          </div>
        </div>

        {/* Social Links */}
        <div className="footer-social d-flex gap-3">
          <a href="https://www.facebook.com/share/1DZSAA1qbx/?mibextid=wwXIfr" target="_blank" rel="noreferrer" aria-label="Facebook">
            <i className="fa-brands fa-square-facebook"></i>
          </a>
          <a href="https://www.instagram.com/apple_store_el_daher?utm_source=ig_web_button_share_sheet&igsh=ZDNlZDc0MzIxNw==" target="_blank" rel="noreferrer" aria-label="Instagram">
            <i className="fa-brands fa-instagram"></i>
          </a>
        </div>
      </div>

      {/* Footer bottom */}
      <div className="text-center text-muted mt-2" style={{ fontSize: '0.8rem' }}>
        &copy; 2026 Apple Store. All rights reserved. | <Link to="/pages/admin-login.html" style={{ color: '#76b852', textDecoration: 'none' }}>Admin Login</Link>
      </div>
    </footer>
  );
};

export default Footer;

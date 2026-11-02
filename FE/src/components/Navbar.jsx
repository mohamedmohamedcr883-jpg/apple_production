import React, { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import logoImg from '../assets/logo.jpg';

const Navbar = () => {
  const { cart, user, logout } = useAppContext();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navRef = useRef(null);
  const location = useLocation();

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const closeMenu = () => setIsMenuOpen(false);

  const handleNavClick = () => {
    closeMenu();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Close menu on route change and scroll page to top
  useEffect(() => {
    closeMenu();
    window.scrollTo(0, 0);
  }, [location.pathname, location.search]);

  // Lock page scroll while menu is open (keeps viewport fixed on navbar)
  useEffect(() => {
    if (!isMenuOpen) return;

    const scrollY = window.scrollY;
    const { style } = document.body;

    style.position = 'fixed';
    style.top = `-${scrollY}px`;
    style.left = '0';
    style.right = '0';
    style.width = '100%';
    style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    document.body.classList.add('mobile-nav-open');

    return () => {
      style.position = '';
      style.top = '';
      style.left = '';
      style.right = '';
      style.width = '';
      style.overflow = '';
      document.documentElement.style.overflow = '';
      document.body.classList.remove('mobile-nav-open');
      window.scrollTo(0, scrollY);
    };
  }, [isMenuOpen]);

  // Close on outside click / Escape
  useEffect(() => {
    if (!isMenuOpen) return;

    const handlePointerDown = (e) => {
      if (navRef.current && !navRef.current.contains(e.target)) {
        closeMenu();
      }
    };

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') closeMenu();
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen]);

  return (
    <nav
      ref={navRef}
      className={`navbar navbar-expand-lg navbar-light bg-white sticky-top shadow-sm ${isMenuOpen ? 'menu-open' : ''}`}
    >
      <div className="container">
        {/* TOGGLER */}
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="navbarNav"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen(open => !open)}
        >
          <span className="navbar-toggler-icon"></span>
        </button>

        {/* LOGO */}
        <Link className="navbar-brand fw-bold d-flex align-items-center" to="/" onClick={handleNavClick}>
          <img src={logoImg} alt="Apple Store" className="logo-img" />
        </Link>

        {/* Avoid Bootstrap .collapse — React owns open/close via .show */}
        <div className={`navbar-collapse mobile-nav-panel ${isMenuOpen ? 'show' : ''}`} id="navbarNav">
          <ul className="navbar-nav ms-0 align-items-center elegant-nav">
            <li className={`nav-item dropdown ${user ? '' : 'd-none'}`} id="userMenu">
              <a className="nav-link dropdown-toggle fw-semibold user-box" href="#" role="button" data-bs-toggle="dropdown">
                <span id="userName">{user?.name || 'User'}</span>
              </a>
              <ul className="dropdown-menu">
                <li>
                  <button className="dropdown-item text-danger" id="logoutBtn" onClick={() => { logout(); closeMenu(); window.location.href = '/'; }}>Logout</button>
                </li>
              </ul>
            </li>

            <li className="nav-item"><Link className="nav-link active" to="/" onClick={handleNavClick}>Home</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=stickers" onClick={handleNavClick}>Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=sticker sheets" onClick={handleNavClick}>Sticker Sheets</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=laptop stickers" onClick={handleNavClick}>Laptop Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=visa stickers" onClick={handleNavClick}>Visa Stickers</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=mugs" onClick={handleNavClick}>Mugs</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=medals" onClick={handleNavClick}>Medlas</Link></li>
            <li className="nav-item"><Link className="nav-link" to="/pages/category.html?cat=coaster" onClick={handleNavClick}>Coaster</Link></li>
            <li className="nav-item">
              <a className="nav-link smart-contact-link" href="#contact" onClick={closeMenu}>Contact</a>
            </li>
          </ul>
        </div>

        {/* ICONS */}
        <div className="icon-group d-flex align-items-center">
          {!user && (
            <a href="#" className="nav-icon me-2" id="userIcon" data-bs-toggle="modal" data-bs-target="#loginModal" onClick={closeMenu}>
              <i className="fa-solid fa-user"></i>
            </a>
          )}

          <a href="#" className="nav-icon me-2" data-bs-toggle="modal" data-bs-target="#searchModal" onClick={closeMenu}>
            <i className="fa-solid fa-magnifying-glass"></i>
          </a>

          <a href="#" className="nav-icon btn btn-outline-success position-relative" data-bs-toggle="modal" data-bs-target="#cartModal" onClick={closeMenu}>
            <i className="bi bi-cart3"></i>
            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger cart-count">
              {cartCount}
            </span>
          </a>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

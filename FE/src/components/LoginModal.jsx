import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const LoginModal = () => {
  const { login } = useAppContext();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState('');
  const [statusColor, setStatusColor] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      // Close modal on success
      const modalEl = document.getElementById('loginModal');
      if (modalEl && window.bootstrap) {
         window.bootstrap.Modal.getInstance(modalEl)?.hide();
      }
      setEmail('');
      setPassword('');
      setStatusMsg('');
    } catch (err) {
      setStatusMsg(err.message || "Login failed, please check your credentials.");
      setStatusColor('red');
    }
  };

  return (
    <div className="modal fade" id="loginModal" tabIndex="-1" aria-labelledby="loginModalLabel" aria-hidden="true">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content login-modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="login-icon-wrapper mb-3">
                <i className="fa-solid fa-user"></i>
              </div>
              <h3 className="modal-title" id="loginModalLabel">Welcome Back</h3>
              <p className="text-muted">Sign in to your account to continue</p>
            </div>
            <form id="loginForm" onSubmit={handleLogin}>
              <div className="mb-3">
                <label htmlFor="loginEmail" className="form-label fw-semibold">Email Address</label>
                <input type="email" className="form-control form-control-lg" id="loginEmail" placeholder="Enter your email" required value={email} onChange={e=>setEmail(e.target.value)} />
              </div>
              <div className="mb-3">
                <label htmlFor="loginPassword" className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control form-control-lg" id="loginPassword" placeholder="Enter your password" required value={password} onChange={e=>setPassword(e.target.value)} />
              </div>
              <div className="mb-3 d-flex justify-content-between align-items-center">
                <div className="form-check">
                  <input className="form-check-input" type="checkbox" id="rememberMe" />
                  <label className="form-check-label" htmlFor="rememberMe">Remember me</label>
                </div>
                <a href="#" className="text-decoration-none" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#forgotPasswordModal">
                  Forgot password?
                </a>
              </div>
              {statusMsg && <p id="Login-state" style={{ color: statusColor }}>{statusMsg}</p>}
              <button type="submit" className="btn btn-primary btn-lg w-100 mb-3">
                <i className="bi bi-box-arrow-in-right me-2"></i>Sign In
              </button>
              <div className="text-center">
                <p className="text-muted mb-0">
                  Don't have an account?{' '}
                  <a href="#" className="text-decoration-none fw-semibold" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#signupModal">
                    Sign up
                  </a>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;

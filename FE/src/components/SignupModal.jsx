import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';

const SignupModal = () => {
  const { signup } = useAppContext();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [statusMsg, setStatusMsg] = useState('');

  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      const data = await signup(form.name, form.email, form.password, form.phone);
      alert(data.message);
      
      const signupEl = document.getElementById('signupModal');
      const loginEl = document.getElementById('loginModal');
      if (window.bootstrap) {
         window.bootstrap.Modal.getInstance(signupEl)?.hide();
         new window.bootstrap.Modal(loginEl).show();
      }
      setForm({ name: '', email: '', password: '', phone: '' });
      setStatusMsg('');
    } catch (err) {
      setStatusMsg(err.message || 'Signup failed');
    }
  };

  return (
    <div className="modal fade" id="signupModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content login-modal-content">
          <div className="modal-header border-0 pb-0">
            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body p-4">
            <div className="text-center mb-4">
              <div className="login-icon-wrapper mb-3">
                <i className="fa-solid fa-user-plus"></i>
              </div>
              <h3>Create Account</h3>
              <p className="text-muted">Sign up to get started</p>
            </div>

            <form id="signupForm" onSubmit={handleSignup}>
              <div className="mb-3">
                <label className="form-label fw-semibold">Name</label>
                <input type="text" className="form-control form-control-lg" id="signupName" required value={form.name} onChange={e=>setForm({...form, name: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Email</label>
                <input type="email" className="form-control form-control-lg" id="signupEmail" required value={form.email} onChange={e=>setForm({...form, email: e.target.value})} />
              </div>

              <div className="mb-3">
                <label className="form-label fw-semibold">Password</label>
                <input type="password" className="form-control form-control-lg" id="signupPassword" required value={form.password} onChange={e=>setForm({...form, password: e.target.value})} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Phone Number</label>
                <input type="tel" className="form-control form-control-lg" id="signupPhone" required value={form.phone} onChange={e=>setForm({...form, phone: e.target.value})} />
              </div>

              <button type="submit" className="btn btn-success btn-lg w-100">
                Create Account
              </button>
              {statusMsg && <p id="Register-state" style={{ color: 'red', marginTop: '10px' }}>{statusMsg}</p>}
              <div className="text-center mt-3">
                <p className="text-muted">
                  Already have an account?{' '}
                  <a href="#" data-bs-dismiss="modal" data-bs-toggle="modal" data-bs-target="#loginModal">
                    Sign in
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

export default SignupModal;

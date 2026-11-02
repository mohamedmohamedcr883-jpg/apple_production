import React, { useState } from 'react';
import { API_BASE } from '../config/api';

const ForgotPasswordModal = () => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [cachedToken, setCachedToken] = useState(null);
  const [msg, setMsg] = useState({ text: '', color: '' });

  const sendOtp = async () => {
    if (!email) return setMsg({ text: 'Please enter your email.', color: 'red' });
    try {
      const res = await fetch(`${API_BASE}/user/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to send OTP');
      
      setStep(2);
      setMsg({ text: data.message, color: 'green' });
    } catch (err) {
      setMsg({ text: err.message, color: 'red' });
    }
  };

  const verifyOtp = async () => {
    if (!otp) return setMsg({ text: 'Please enter the OTP.', color: 'red' });
    try {
      const res = await fetch(`${API_BASE}/user/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Invalid OTP');
      
      setCachedToken(data.resetToken);
      setStep(3);
      setMsg({ text: 'OTP verified! Please enter your new password.', color: 'green' });
    } catch (err) {
      setMsg({ text: err.message, color: 'red' });
    }
  };

  const changePassword = async () => {
    if (!newPassword || !confirmPassword) return setMsg({ text: 'Please fill in all password fields.', color: 'red' });
    if (newPassword !== confirmPassword) return setMsg({ text: 'Passwords do not match.', color: 'red' });
    try {
      const res = await fetch(`${API_BASE}/user/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, newPassword, resetToken: cachedToken })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to change password');
      if (!cachedToken) throw new Error(data.message || 'Session expired. Please restart password reset.');
      
      setMsg({ text: 'Password changed successfully!', color: 'green' });
      setTimeout(() => {
        // Reset flow
        setStep(1);
        setEmail('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setCachedToken(null);
        setMsg({ text: '', color: '' });
        // Close modal and show login
        const fpEl = document.getElementById('forgotPasswordModal');
        const loginEl = document.getElementById('loginModal');
        if (window.bootstrap) {
          window.bootstrap.Modal.getInstance(fpEl)?.hide();
          new window.bootstrap.Modal(loginEl).show();
        }
      }, 1500);
    } catch (err) {
      setMsg({ text: err.message, color: 'red' });
    }
  };

  // Reset state on modal hide
  React.useEffect(() => {
    const modal = document.getElementById('forgotPasswordModal');
    const handleHide = () => {
      setStep(1); setEmail(''); setOtp(''); setNewPassword(''); setConfirmPassword(''); setCachedToken(null); setMsg({ text: '', color: '' });
    };
    modal?.addEventListener('hidden.bs.modal', handleHide);
    return () => modal?.removeEventListener('hidden.bs.modal', handleHide);
  }, []);

  return (
    <div className="modal fade" id="forgotPasswordModal" tabIndex="-1">
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content login-modal-content">
          <div className="modal-header border-0">
            <h5 className="modal-title">Reset Password</h5>
            <button className="btn-close" data-bs-dismiss="modal"></button>
          </div>

          <div className="modal-body p-4">
            <form id="otpForm">
              {step === 1 && (
                <div id="emailStep">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control mb-3" id="otpEmail" required value={email} onChange={e=>setEmail(e.target.value)} />
                  <button type="button" className="btn btn-primary w-100" onClick={sendOtp}>Send OTP</button>
                </div>
              )}

              {step === 2 && (
                <div id="otpStep">
                  <label className="form-label fw-semibold">Enter OTP</label>
                  <input type="text" className="form-control mb-3" id="otpCode" required value={otp} onChange={e=>setOtp(e.target.value)} />
                  <button type="button" className="btn btn-success w-100" onClick={verifyOtp}>Verify OTP</button>
                </div>
              )}

              {step === 3 && (
                <div id="changePasswordStep">
                  <label className="form-label fw-semibold">New Password</label>
                  <input type="password" className="form-control mb-3" id="newPassword" required value={newPassword} onChange={e=>setNewPassword(e.target.value)} />

                  <label className="form-label fw-semibold">Confirm Password</label>
                  <input type="password" className="form-control mb-3" id="confirmPassword" required value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} />

                  <button type="button" className="btn btn-success w-100" id="changePasswordBtn" onClick={changePassword}>
                    Change Password
                  </button>
                </div>
              )}
            </form>

            {msg.text && <p id="otpState" className="text mt-2" style={{ color: msg.color }}>{msg.text}</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordModal;

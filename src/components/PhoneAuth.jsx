// src/components/PhoneAuth.jsx
import React, { useState, useEffect } from 'react';
import { auth } from '../firebase';
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function PhoneAuth({ onAuthSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('phone'); // 'phone' or 'otp'

  useEffect(() => {
    // Setup reCAPTCHA Verifier when the component mounts
    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
        'size': 'invisible',
        'callback': (response) => {
          // reCAPTCHA solved
        },
        'expired-callback': () => {
          setError("reCAPTCHA expired. Please try again.");
        }
      });
    }

    // Clean up reCAPTCHA on unmount
    return () => {
      if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        window.recaptchaVerifier.clear();
        window.recaptchaVerifier = null;
      }
    };
  }, []);

  const formatPhoneNumber = (value) => {
    // Remove all non-numeric characters
    const phoneNumber = value.replace(/\D/g, '');
    
    // Add + prefix if not present and format
    if (phoneNumber.length === 10) {
      // Assume US number if 10 digits
      return `+1${phoneNumber}`;
    } else if (phoneNumber.length === 11 && phoneNumber.startsWith('1')) {
      return `+${phoneNumber}`;
    } else if (phoneNumber.length === 12 && phoneNumber.startsWith('91')) {
      // Indian number
      return `+${phoneNumber}`;
    }
    
    // Return with + if not already present
    return phoneNumber.startsWith('+') ? phoneNumber : `+${phoneNumber}`;
  };

  const handleSendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!phoneNumber) {
      setError('Please enter a phone number.');
      setLoading(false);
      return;
    }

    try {
      const formattedNumber = formatPhoneNumber(phoneNumber);
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedNumber, appVerifier);
      setConfirmationResult(result);
      setStep('otp');
      setError('');
    } catch (err) {
      console.error("Error sending OTP:", err);
      let errorMessage = 'Failed to send OTP. ';
      
      if (err.code === 'auth/invalid-phone-number') {
        errorMessage = 'Invalid phone number format. Please include country code (e.g., +1234567890)';
      } else if (err.code === 'auth/too-many-requests') {
        errorMessage = 'Too many attempts. Please try again later.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!otp) {
      setError('Please enter the OTP.');
      setLoading(false);
      return;
    }

    try {
      if (confirmationResult) {
        await confirmationResult.confirm(otp);
        console.log("User signed in successfully with phone number!");
        if (onAuthSuccess) {
          onAuthSuccess();
        }
      } else {
        setError("No confirmation result available. Please send OTP first.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      let errorMessage = 'Failed to verify OTP. ';
      
      if (err.code === 'auth/invalid-verification-code') {
        errorMessage = 'Invalid OTP. Please check and try again.';
      } else if (err.code === 'auth/code-expired') {
        errorMessage = 'OTP expired. Please request a new one.';
      } else {
        errorMessage += err.message;
      }
      
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleBackToPhone = () => {
    setStep('phone');
    setConfirmationResult(null);
    setOtp('');
    setError('');
  };

  return (
    <div className="phone-auth-container">
      <div id="recaptcha-container"></div>
      
      {error && (
        <div className="error-message">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM13 17h-2v-6h2v6zm0-8h-2V7h2v2z"/>
          </svg>
          {error}
        </div>
      )}

      {step === 'phone' ? (
        <form onSubmit={handleSendOtp} className="phone-form">
          <div className="input-group">
            <label htmlFor="phone">Phone Number</label>
            <div className="phone-input-wrapper">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="phone-icon">
                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
              </svg>
              <input
                id="phone"
                type="tel"
                placeholder="Enter phone number (+1234567890)"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                disabled={loading}
                className="phone-input"
              />
            </div>
            <small className="input-hint">Include country code (e.g., +91 for India, +1 for US)</small>
          </div>
          
          <button
            type="submit"
            disabled={loading || !phoneNumber}
            className="send-otp-btn"
          >
            {loading ? (
              <>
                <div className="spinner"></div>
                Sending OTP...
              </>
            ) : (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/>
                </svg>
                Send OTP
              </>
            )}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="otp-form">
          <div className="otp-info">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="currentColor" className="otp-icon">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            <h3>Verify Phone Number</h3>
            <p>We've sent a verification code to:</p>
            <strong>{phoneNumber}</strong>
          </div>

          <div className="input-group">
            <label htmlFor="otp">Verification Code</label>
            <input
              id="otp"
              type="text"
              placeholder="Enter 6-digit code"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              disabled={loading}
              className="otp-input"
              maxLength="6"
            />
          </div>

          <div className="form-actions">
            <button
              type="submit"
              disabled={loading || !otp}
              className="verify-otp-btn"
            >
              {loading ? (
                <>
                  <div className="spinner"></div>
                  Verifying...
                </>
              ) : (
                <>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                  </svg>
                  Verify Code
                </>
              )}
            </button>
            
            <button
              type="button"
              onClick={handleBackToPhone}
              className="back-btn"
              disabled={loading}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z"/>
              </svg>
              Change Number
            </button>
          </div>
        </form>
      )}

      <div className="phone-auth-footer">
        <p>By continuing, you agree to receive SMS messages. Standard rates may apply.</p>
      </div>
    </div>
  );
}

export default PhoneAuth;
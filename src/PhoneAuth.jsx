import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // Your firebase.js setup
import { RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';

function PhoneAuth({ onAuthSuccess }) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(''); // One-Time Password
  const [confirmationResult, setConfirmationResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Setup reCAPTCHA Verifier when the component mounts
  useEffect(() => {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      'size': 'invisible', // Can be 'normal' for a visible widget
      'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
        // You can log the response if needed, but 'invisible' handles it automatically.
      },
      'expired-callback': () => {
        setError("reCAPTCHA expired. Please try again.");
      }
    });
    // Render the reCAPTCHA widget (important for invisible mode to work)
    window.recaptchaVerifier.render();

    // Clean up reCAPTCHA on unmount
    return () => {
      if (window.recaptchaVerifier && typeof window.recaptchaVerifier.clear === 'function') {
        window.recaptchaVerifier.clear();
      }
    };
  }, []);

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
      const appVerifier = window.recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, phoneNumber, appVerifier);
      setConfirmationResult(result);
      alert('OTP sent to your phone!');
    } catch (err) {
      console.error("Error sending OTP:", err);
      setError(`Failed to send OTP: ${err.message}`);
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
          onAuthSuccess(); // Callback to parent component
        }
      } else {
        setError("No confirmation result available. Please send OTP first.");
      }
    } catch (err) {
      console.error("Error verifying OTP:", err);
      setError(`Failed to verify OTP: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '400px', margin: '50px auto', border: '1px solid #ccc', borderRadius: '8px' }}>
      <h2>Sign In with Phone Number</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div id="recaptcha-container"></div> {/* This is where reCAPTCHA will attach */}

      {!confirmationResult ? (
        <form onSubmit={handleSendOtp}>
          <input
            type="tel" // Use type="tel" for phone numbers
            placeholder="Enter phone number (e.g., +11234567890)"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !phoneNumber}
            style={{ width: '100%', padding: '10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Sending...' : 'Send OTP'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp}>
          <p>OTP sent to {phoneNumber}. Please enter it below:</p>
          <input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            style={{ width: '100%', padding: '10px', marginBottom: '10px', borderRadius: '4px', border: '1px solid #ddd' }}
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !otp}
            style={{ width: '100%', padding: '10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            {loading ? 'Verifying...' : 'Verify OTP'}
          </button>
          <button
            type="button"
            onClick={() => setConfirmationResult(null)} // Allow sending new OTP
            style={{ width: '100%', padding: '10px', marginTop: '10px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
          >
            Change Phone Number
          </button>
        </form>
      )}
    </div>
  );
}

export default PhoneAuth;
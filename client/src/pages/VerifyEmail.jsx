import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';
import { Check, AlertCircle, Loader } from 'lucide-react';

const S = {
  page: { minHeight: '100vh', background: '#020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  container: { maxWidth: '500px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '40px', textAlign: 'center' },
  spinner: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  icon: { marginBottom: '20px', display: 'flex', justifyContent: 'center' },
  heading: { fontSize: '24px', fontWeight: 600, color: '#e0f5f2', marginBottom: '12px' },
  message: { fontSize: '14px', color: '#7fa8b3', marginBottom: '20px', lineHeight: 1.6 },
  button: { background: '#00c8b4', border: 'none', color: '#020f18', padding: '10px 24px', borderRadius: '20px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '20px' },
  error: { color: '#ff6b6b' },
  success: { color: '#00c8b4' },
};

export default function VerifyEmail() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('verifying'); 
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verify = async () => {
      try {
        const response = await fetchClient(`/auth/verify-email/${token}`, { method: 'POST' });
        setMessage(response.message);
        setStatus('success');
        setTimeout(() => navigate('/login'), 3000);
      } catch (error) {
        setMessage(error.message || 'Verification failed. Link may be expired.');
        setStatus('error');
      }
    };

    if (token) verify();
  }, [token, navigate]);

  return (
    <div style={S.page}>
      <div style={S.container}>
        {status === 'verifying' && (
          <>
            <div style={S.spinner}>
              <Loader size={40} color="#00c8b4" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h1 style={S.heading}>Verifying Email...</h1>
            <p style={S.message}>Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={S.icon}>
              <Check size={50} color="#00c8b4" />
            </div>
            <h1 style={{ ...S.heading, ...S.success }}>Email Verified!</h1>
            <p style={S.message}>{message}</p>
            <p style={S.message}>Redirecting to login...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={S.icon}>
              <AlertCircle size={50} color="#ff6b6b" />
            </div>
            <h1 style={{ ...S.heading, ...S.error }}>Verification Failed</h1>
            <p style={S.message}>{message}</p>
            <button style={S.button} onClick={() => navigate('/login')}>
              Go to Login
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
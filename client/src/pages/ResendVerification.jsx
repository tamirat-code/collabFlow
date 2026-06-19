import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchClient } from '../api/fetchClient';
import { Mail, ArrowLeft } from 'lucide-react';

const S = {
  page: { minHeight: '100vh', background: '#020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' },
  container: { maxWidth: '500px', background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', padding: '40px' },
  heading: { fontSize: '24px', fontWeight: 600, color: '#e0f5f2', marginBottom: '12px' },
  message: { fontSize: '14px', color: '#7fa8b3', marginBottom: '20px', lineHeight: 1.6 },
  input: { width: '100%', padding: '10px', background: '#0a1f2e', border: '1px solid #0e3347', borderRadius: '8px', color: '#e0f5f2', fontSize: '14px', marginBottom: '15px', fontFamily: 'inherit', boxSizing: 'border-box' },
  button: { width: '100%', background: '#00c8b4', border: 'none', color: '#020f18', padding: '10px', borderRadius: '8px', fontSize: '14px', fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', marginTop: '10px' },
  backButton: { display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', color: '#3a7080', fontSize: '13px', cursor: 'pointer', marginBottom: '20px', fontFamily: 'inherit' },
  success: { color: '#00c8b4', background: '#061f18', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
  error: { color: '#ff6b6b', background: '#2a1f1f', padding: '12px', borderRadius: '8px', marginBottom: '20px' },
};

export default function ResendVerification() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const handleResend = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetchClient('/auth/resend-verification', {
        method: 'POST',
        body: JSON.stringify({ email }),
      });
      setMessage(response.message);
      setIsError(false);
    } catch (error) {
      setMessage(error.message || 'Failed to resend verification email');
      setIsError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={S.page}>
      <div style={S.container}>
        <button style={S.backButton} onClick={() => navigate('/login')}>
          <ArrowLeft size={14} /> Back to Login
        </button>

        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Mail size={40} color="#00c8b4" />
        </div>

        <h1 style={S.heading}>Resend Verification Email</h1>
        <p style={S.message}>
          Enter your email address and we'll send you a new verification link.
        </p>

        {message && (
          <div style={isError ? S.error : S.success}>
            {message}
          </div>
        )}

        <form onSubmit={handleResend}>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={S.input}
          />
          <button type="submit" style={S.button} disabled={loading}>
            {loading ? 'Sending...' : 'Resend Verification Email'}
          </button>
        </form>
      </div>
    </div>
  );
}
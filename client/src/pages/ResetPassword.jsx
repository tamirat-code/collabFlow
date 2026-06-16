import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useResetPassword } from '../hooks/useAuth';
import { resetPasswordSchema } from '../lib/validationSchemas';

const M = {
  page:     { minHeight: '100vh', background: '#020f18', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' },
  card:     { background: '#051e2e', border: '1px solid #0e3347', borderRadius: '16px', width: '100%', maxWidth: '420px', padding: '2rem' },
  logo:     { fontSize: '20px', fontWeight: 700, color: '#00c8b4', marginBottom: '1.5rem', letterSpacing: '-0.5px' },
  heading:  { fontSize: '20px', fontWeight: 600, color: '#e0f5f2', marginBottom: '6px' },
  subtext:  { fontSize: '13px', color: '#3a7080', marginBottom: '1.5rem' },
  label:    { display: 'block', fontSize: '12px', color: '#3a7080', marginBottom: '6px' },
  input:    { width: '100%', background: '#071520', border: '1px solid #0e3347', borderRadius: '8px', padding: '8px 12px', fontSize: '13px', color: '#c0e8e4', outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box' },
  error:    { fontSize: '11px', color: '#f87171', marginTop: '4px' },
  btn:      { width: '100%', padding: '9px', background: 'transparent', border: '1.5px solid #00c8b4', borderRadius: '20px', color: '#00c8b4', fontSize: '13px', fontWeight: 500, cursor: 'pointer', marginTop: '0.75rem', fontFamily: 'inherit' },
  errBox:   { background: '#2d0a0a', color: '#f87171', fontSize: '13px', padding: '8px 12px', borderRadius: '8px', marginBottom: '12px' },
  successBox: { background: '#061f18', color: '#34d399', fontSize: '13px', padding: '10px 14px', borderRadius: '8px', lineHeight: 1.5 },
  backLink: { display: 'block', textAlign: 'center', marginTop: '1.25rem', fontSize: '12px', color: '#3a7080', textDecoration: 'none' },
};

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { mutate, isPending, isSuccess, error } = useResetPassword();

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = (data) => {
    mutate(
      { token, password: data.password },
      { onSuccess: () => setTimeout(() => navigate('/login'), 2000) }
    );
  };

  return (
    <div style={M.page}>
      <div style={M.card}>
        <div style={M.logo}>CollabFlow</div>
        <h1 style={M.heading}>Reset password</h1>
        <p style={M.subtext}>Enter your new password below.</p>

        {error && <div style={M.errBox}>{error.message}</div>}

        {isSuccess ? (
          <div style={M.successBox}>
            Password reset! Redirecting to login...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div style={{ marginBottom: '1rem' }}>
              <label style={M.label}>New Password</label>
              <input
                type="password"
                {...register('password')}
                autoFocus
                placeholder="••••••••"
                style={{ ...M.input, ...(errors.password ? { borderColor: '#f87171' } : {}) }}
              />
              {errors.password && <p style={M.error}>{errors.password.message}</p>}
            </div>

            <div style={{ marginBottom: '0.5rem' }}>
              <label style={M.label}>Confirm Password</label>
              <input
                type="password"
                {...register('confirmPassword')}
                placeholder="••••••••"
                style={{ ...M.input, ...(errors.confirmPassword ? { borderColor: '#f87171' } : {}) }}
              />
              {errors.confirmPassword && <p style={M.error}>{errors.confirmPassword.message}</p>}
            </div>

            <button type="submit" disabled={isPending} style={{ ...M.btn, opacity: isPending ? 0.6 : 1 }}>
              {isPending ? 'Resetting...' : 'Reset Password'}
            </button>
          </form>
        )}

        <Link to="/login" style={M.backLink}>← Back to login</Link>
      </div>
    </div>
  );
}
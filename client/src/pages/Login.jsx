import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { useLogin, useRegister } from '../hooks/useAuth';
import { loginSchema, registerSchema } from '../lib/validationSchemas';

export default function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [animating, setAnimating] = useState(false);
  const [overlayFull, setOverlayFull] = useState(false);
  const [nextMode, setNextMode] = useState(null);

  const { mutate: login, isPending: loginPending, error: loginError } = useLogin();
  const { mutate: registerUser, isPending: registerPending, error: registerError } = useRegister();

  const loginForm = useForm({ resolver: zodResolver(loginSchema) });
  const registerForm = useForm({ resolver: zodResolver(registerSchema) });

  const onLoginSubmit = (data) => {
    login(data, { onSuccess: () => navigate('/dashboard') });
  };

  const onRegisterSubmit = (data) => {
    registerUser(data, { onSuccess: () => navigate('/dashboard') });
  };

  const switchMode = (target) => {
    if (animating || target === mode) return;
    setAnimating(true);
    setNextMode(target);

    // step 1: expand overlay top → bottom
    setOverlayFull(true);

    // step 2: swap mode while covered
    setTimeout(() => {
      setMode(target);
    }, 450);

    // step 3: collapse overlay
    setTimeout(() => {
      setOverlayFull(false);
    }, 500);

    // step 4: done
    setTimeout(() => {
      setAnimating(false);
      setNextMode(null);
    }, 950);
  };

  const isLogin = mode === 'login';

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: '#031524' }}
    >
      <div
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          maxWidth: '800px',
          height: '460px',
          border: '1.5px solid #00e5d1',
          boxShadow: '0 0 40px #00e5d130, 0 0 80px #00e5d110',
        }}
      >
        {/* teal background — always visible behind */}
        <div
          className="absolute inset-0"
          style={{
            background: 'linear-gradient(135deg, #00c8b4 0%, #009e8e 50%, #006e62 100%)',
            zIndex: 0,
          }}
        />

        {/* welcome text — positioned based on mode */}
        <div
          className="absolute top-0 bottom-0 flex flex-col justify-center"
          style={{
            zIndex: 1,
            width: '48%',
            left: isLogin ? 'auto' : 0,
            right: isLogin ? 0 : 'auto',
            padding: '2rem',
            textAlign: isLogin ? 'center' : 'left',
            alignItems: isLogin ? 'center' : 'flex-start',
            display: 'flex',
          }}
        >
          <h2
            style={{
              fontSize: '2rem',
              fontWeight: 700,
              color: '#fff',
              lineHeight: 1.2,
              marginBottom: '0.75rem',
              textShadow: '0 2px 16px #00000040',
            }}
          >
            WELCOME<br />BACK{isLogin ? '!' : ''}
          </h2>
          <p style={{ fontSize: '13px', color: '#d0f5f0', lineHeight: 1.7, maxWidth: '180px' }}>
            {isLogin
              ? 'Manage your team projects, track tasks, and collaborate in real time.'
              : 'Join your team workspace and start collaborating on projects today.'}
          </p>
        </div>

        {/* dark form panel */}
        <div
          className="absolute top-0 bottom-0 flex flex-col justify-center"
          style={{
            zIndex: 2,
            width: '56%',
            left: isLogin ? 0 : 'auto',
            right: isLogin ? 'auto' : 0,
            background: '#0a1520',
            clipPath: isLogin
              ? 'polygon(0 0, 88% 0, 100% 100%, 0 100%)'
              : 'polygon(0 0, 100% 0, 100% 100%, 12% 100%)',
            padding: isLogin ? '2.5rem 3rem 2.5rem 2.5rem' : '2.5rem 2.5rem 2.5rem 3rem',
          }}
        >
          <AnimatePresence mode="wait">
            {isLogin ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#e0f5f2', marginBottom: '1.8rem' }}>
                  login
                </h1>

                {loginError && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '1rem' }}>
                    {loginError.message}
                  </p>
                )}

                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
                 <Field
  registration={loginForm.register('email')}
  placeholder="email"   // ← fixed
  type="email"
  icon="&#128100;"
  error={loginForm.formState.errors.email?.message}
/>
                  <Field
                    registration={loginForm.register('password')}
                    placeholder="password"
                    type="password"
                    icon="&#128274;"
                    error={loginForm.formState.errors.password?.message}
                  />

                  <div style={{ textAlign: 'right', marginBottom: '1rem', marginTop: '-0.5rem' }}>
                    
                      <a href="/forgot-password"
                      style={{ fontSize: '11px', color: '#3a7080', textDecoration: 'none' }}
                    >
                      Forgot password?
                    </a>
                  </div>

                  <NeonButton type="submit" disabled={loginPending}>
                    {loginPending ? 'Signing in...' : 'Login'}
                  </NeonButton>
                </form>

                <GoogleBtn />

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#3a7080', marginTop: '1rem' }}>
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    style={{ color: '#00c8b4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                  >
                    sign up
                  </button>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0, transition: { delay: 0.1, duration: 0.4, ease: 'easeOut' } }}
                exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
              >
                <h1 style={{ fontSize: '22px', fontWeight: 500, color: '#e0f5f2', marginBottom: '1.5rem' }}>
                  sign Up
                </h1>

                {registerError && (
                  <p style={{ color: '#f87171', fontSize: '13px', marginBottom: '1rem' }}>
                    {registerError.message}
                  </p>
                )}

                <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
                  <Field
  registration={registerForm.register('email')}
  placeholder="email"   // ← fixed
  type="email"
  icon="&#128100;"
  error={loginForm.formState.errors.email?.message}
/>
                  <Field
                    registration={registerForm.register('email')}
                    placeholder="Email"
                    type="email"
                    icon="&#9993;"
                    error={registerForm.formState.errors.email?.message}
                  />
                  <Field
                    registration={registerForm.register('password')}
                    placeholder="password"
                    type="password"
                    icon="&#128274;"
                    error={registerForm.formState.errors.password?.message}
                  />

                  <NeonButton type="submit" disabled={registerPending}>
                    {registerPending ? 'Creating account...' : 'Sign up'}
                  </NeonButton>
                </form>

                <GoogleBtn />

                <p style={{ textAlign: 'center', fontSize: '12px', color: '#3a7080', marginTop: '1rem' }}>
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    style={{ color: '#00c8b4', background: 'none', border: 'none', cursor: 'pointer', fontSize: '12px', textDecoration: 'underline' }}
                  >
                    Login
                  </button>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* teal overlay — expands top → bottom during transition */}
        <motion.div
          className="absolute left-0 right-0 top-0"
          style={{
            zIndex: 10,
            background: 'linear-gradient(135deg, #00c8b4 0%, #009e8e 50%, #006e62 100%)',
            pointerEvents: 'none',
          }}
          animate={{ height: overlayFull ? '100%' : '0%' }}
          transition={{ duration: 0.45, ease: [0.77, 0, 0.18, 1] }}
        />
      </div>
    </div>
  );
}

function Field({ registration, placeholder, type, icon, error }) {
  return (
    <div style={{ position: 'relative', marginBottom: '1.1rem' }}>
      <input
        {...registration}
        type={type}
        placeholder={placeholder}
        style={{
          width: '100%',
          background: 'transparent',
          border: 'none',
          borderBottom: '1px solid #1e5060',
          padding: '7px 28px 7px 0',
          color: '#c0e8e4',
          fontSize: '13px',
          outline: 'none',
          fontFamily: 'inherit',
        }}
        onFocus={e => e.target.style.borderBottomColor = '#00c8b4'}
        onBlur={e => e.target.style.borderBottomColor = '#1e5060'}
      />
      <span style={{ position: 'absolute', right: '4px', top: '6px', color: '#2a6070', fontSize: '15px' }}>
        {icon}
      </span>
      {error && <p style={{ color: '#f87171', fontSize: '11px', marginTop: '3px' }}>{error}</p>}
    </div>
  );
}

function NeonButton({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        width: '100%',
        padding: '9px',
        background: 'transparent',
        border: '1.5px solid #00c8b4',
        borderRadius: '20px',
        color: '#00c8b4',
        fontSize: '13px',
        fontWeight: 500,
        cursor: 'pointer',
        marginTop: '0.4rem',
        marginBottom: '0.75rem',
        letterSpacing: '0.5px',
        transition: 'background 0.2s, color 0.2s',
        fontFamily: 'inherit',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = '#00c8b4';
        e.currentTarget.style.color = '#051510';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = 'transparent';
        e.currentTarget.style.color = '#00c8b4';
      }}
    >
      {children}
    </button>
  );
}

function GoogleBtn() {
  return (
    
      <a href="http://localhost:5000/api/auth/google"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        width: '100%',
        padding: '8px',
        borderRadius: '20px',
        border: '1px solid #1e4a5a',
        color: '#5a8a99',
        fontSize: '13px',
        textDecoration: 'none',
        transition: 'border-color 0.2s, color 0.2s',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = '#00c8b4';
        e.currentTarget.style.color = '#00c8b4';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = '#1e4a5a';
        e.currentTarget.style.color = '#5a8a99';
      }}
    >
      <img src="https://www.svgrepo.com/show/475656/google-color.svg" style={{ width: '16px', height: '16px' }} />
      Continue with Google
    </a>
  );
}
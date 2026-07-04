import rateLimit from 'express-rate-limit';


const message = (action) => ({
  message: `Too many ${action} attempts. Please try again later.`,
});


export const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('requests'),
});


export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('authentication'),
  skipSuccessfulRequests: true, 
});


export const sensitiveAuthLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('password reset'),
});


export const uploadLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 50,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('file uploads'),
});


export const billingLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, 
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: message('billing requests'),
});

export const aiLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many AI requests. Please try again later.' },
});
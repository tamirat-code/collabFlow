import dotenv from "dotenv";
dotenv.config();



import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User.js';

passport.use(new GoogleStrategy({
    clientID:     process.env.GOOGLE_CLIENT_ID,
    
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL:  '/api/auth/google/callback',
  },
  
  async (accessToken, refreshToken, profile, done) => {
    try {
     console.log('Google profile:', profile.id, profile.emails[0].value);
      let user = await User.findOne({ googleId: profile.id });

      if (user) return done(null, user);

      
      user = await User.findOne({ email: profile.emails[0].value });
  console.log('Found by email:', user);
      if (user) {
        user.googleId = profile.id;
        user.avatar = profile.photos[0].value;
        await user.save();
        return done(null, user);
      }

     
      user = await User.create({
        googleId: profile.id,
        name:     profile.displayName,
        email:    profile.emails[0].value,
        avatar:   profile.photos[0].value,
        isEmailVerified: true, // Google has already verified this email
      });
      console.log('Created new user:', user); 

      done(null, user);
    } catch (err) {
      console.error('Google strategy error:', err); 
      done(err, null);
    }
  }
 
));

export default passport;
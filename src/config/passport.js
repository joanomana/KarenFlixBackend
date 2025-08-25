import passport from 'passport';
import { Strategy as JwtStrategy, ExtractJwt } from 'passport-jwt';
import User from '../models/User.js';

// Configurar estrategia JWT
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: process.env.JWT_SECRET,
    issuer: 'KarenFlix-API',
    audience: 'KarenFlix-Users'
};

passport.use(new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.userId);
        if (user) {
            return done(null, {
                userId: user._id,
                username: user.username,
                email: user.email,
                roles: user.roles
            });
        }
        return done(null, false);
    } catch (error) {
        return done(error, false);
    }
}));

export default passport;

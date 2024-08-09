require('dotenv').config();

const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();
const port = 8000;
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const User = require("./models/user_schema");
const axios = require('axios');
const repo_route = require('./routes/repo_routes')
const webhooks_controller = require('./controllers/webhooks_controller');

const corsOptions = {
    origin: `${process.env.FRONT_END_API}`, 
    credentials: true,
};
app.use(bodyParser.json());
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(session({
  secret: process.env.SESSION_SECRET, 
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week
    httpOnly: true,
    sameSite: process.env.NODE_ENV === 'production' ? 'None' : 'Lax', // 'None' for production, 'Lax' for development
    secure: process.env.NODE_ENV === 'production', // true in production, false in development
    path: '/',
  }
}));


app.use(passport.initialize());
app.use(passport.session());

passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID,
    clientSecret: process.env.GITHUB_CLIENT_SECRET,
    callbackURL: `${process.env.BACK_END_API}/auth/github/callback`
  },
  async function(accessToken, refreshToken, profile, done) {
    try {
        const email = (profile.emails && profile.emails[0]) ? profile.emails[0].value : null;
        const user = await User.findOneAndUpdate(
          { githubId: profile.id },
          {
            username: profile.username,
            displayName: profile.displayName,
            email: email,
            accessToken: accessToken,
            avatarUrl: profile._json.avatar_url
          },
          { upsert: true, new: true }
        );
        return done(null, user);
      } catch (err) {
        return done(err);
      }
}));

passport.serializeUser(function(user, done) {
    done(null, user._id); // Serialize the user ID
});
  
passport.deserializeUser(async function(id, done) {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (err) {
      done(err);
    }
});









app.get('/auth/github',
    passport.authenticate('github', { scope: ['user:email', 'repo'] })
);
  
app.get('/auth/github/callback',
  passport.authenticate('github', { failureRedirect: '/' }),
  async (req, res) => {
      res.redirect(`${process.env.FRONT_END_API}`);
  }
);

app.get('/logout', (req, res) => {
    req.logout((err) => {
        if (err) {
            return next(err);
        }
        res.redirect(`${process.env.FRONT_END_API}`);
    });
});
  
app.get('/user', (req, res) => {
    if (req.isAuthenticated()) {
      res.json(req.user);
    } else {
      res.status(401).json({ message: 'Not authenticated' });
    }
});

const verifySignature = (req, res, next) => {
    const secret = process.env.WEBHOOK_SECRET; // Your webhook secret
    const signature = req.headers['x-hub-signature-256'];
    const hmac = crypto.createHmac('sha256', secret);
    const payload = JSON.stringify(req.body);
    hmac.update(payload, 'utf8');
    const digest = `sha256=${hmac.digest('hex')}`;
  
    if (digest === signature) {
      next();
    } else {
      res.status(403).send('Forbidden');
    }
  };
  
  // Apply signature verification for /deploy route
  app.use('/webhooks', verifySignature, webhooks_controller.handleWebhook);
  app.use('/repo',repo_route)










mongoose
  .connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("DataBase connected successfully");
    app.listen(port, () => {
        console.log(`Server connected to http://localhost:${port}`);
    });
  })
  .catch(error => {
    console.log('Invalid database connection', error);
});

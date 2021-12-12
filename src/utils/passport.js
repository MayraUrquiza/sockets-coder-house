import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { createHash, isValidPassword } from "./bcrypt.js";
import { User } from "../schemas/user.js";

export const getPassport = () => {
  return passport;
};

export const initializePassport = (app) => {
  passport.use(
    "register",
    new LocalStrategy(
      {
        passReqToCallback: true,
        usernameField: "email",
      },
      (req, email, password, done) => {
        User.findOne({ email }, (err, user) => {
          if (err) {
            return done(err);
          }

          if (user) {
            return done(null, false);
          }

          const newUser = {
            password: createHash(password),
            email: req.body.email,
          };

          User.create(newUser, (err, userWithId) => {
            if (err) {
              return done(err);
            }
            return done(null, userWithId);
          });
        });
      }
    )
  );

  passport.use(
    "login",
    new LocalStrategy(
      {
        passReqToCallback: false,
        usernameField: "email",
      },
      (email, password, done) => {
        User.findOne({ email }, (err, user) => {
          if (err) return done(err);

          if (!user) {
            return done(null, false);
          }

          if (!isValidPassword(user, password)) {
            return done(null, false);
          }

          return done(null, user);
        });
      }
    )
  );

  passport.serializeUser((user, done) => {
    done(null, user._id);
  });
  
  passport.deserializeUser((id, done) => {
    User.findById(id, done);
  });
  
  app.use(passport.initialize());
  app.use(passport.session());
};

import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { googleAuthUser } from "@/src/services/auth/authService";
import "dotenv/config";

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      callbackURL: `${process.env.SERVER_URL || "http://localhost:8080"}/api/auth/google/callback`,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        const email = profile.emails?.[0]?.value ?? "";
        const username = profile.displayName || email.split("@")[0];
        const profilePic = profile.photos?.[0]?.value ?? "";

        const user = await googleAuthUser(
          profile.id,
          email,
          username,
          profilePic,
        );
        done(null, user);
      } catch (err) {
        done(err as Error);
      }
    },
  ),
);

export default passport;

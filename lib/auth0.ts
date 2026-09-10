import { Auth0Client } from "@auth0/nextjs-auth0/server";
import { getEnv } from "@/lib/env";

// The Auth0 SDK reads its config straight from process.env, so this call's
// only purpose is to fail fast with a clear message if a var is missing,
// instead of a confusing downstream SDK error.
getEnv();

// Without this hook, the SDK strips the ID token down to a fixed set of
// default claims before storing it as the session user, dropping any custom
// claim (like our role claim from the Post-Login Action). Returning the
// session unchanged here keeps the full ID token claims instead.
export const auth0 = new Auth0Client({
  async beforeSessionSaved(session) {
    return session;
  },
});

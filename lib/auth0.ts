import { Auth0Client } from "@auth0/nextjs-auth0/server";

// Without this hook, the SDK strips the ID token down to a fixed set of
// default claims before storing it as the session user, dropping any custom
// claim (like our role claim from the Post-Login Action). Returning the
// session unchanged here keeps the full ID token claims instead.
export const auth0 = new Auth0Client({
  async beforeSessionSaved(session) {
    return session;
  },
});

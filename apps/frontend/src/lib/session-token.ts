const SESSION_TOKEN_KEY = "circles.sessionToken";

export const getSessionToken = () => {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(SESSION_TOKEN_KEY);
};

export const setSessionToken = (token: string) => {
  window.localStorage.setItem(SESSION_TOKEN_KEY, token);
};

export const clearSessionToken = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(SESSION_TOKEN_KEY);
};

export const consumeSessionTokenFromUrl = () => {
  if (typeof window === "undefined") return null;

  const url = new URL(window.location.href);
  const token = url.searchParams.get("session_token");
  if (!token) return null;

  setSessionToken(token);
  url.searchParams.delete("session_token");
  window.history.replaceState(window.history.state, "", url);
  return token;
};

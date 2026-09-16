/** Expiry values from the API are Unix timestamps in seconds. */
export function isSessionExpired(expiresAtSeconds: number, nowMs = Date.now()): boolean {
  return expiresAtSeconds <= nowMs;
}

/** Hide the renewal prompt while the session is still valid. */
export function shouldShowRenewal(expiresAtSeconds: number, nowMs = Date.now()): boolean {
  return isSessionExpired(expiresAtSeconds, nowMs);
}

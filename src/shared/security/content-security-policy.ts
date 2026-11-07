export function buildContentSecurityPolicy(options: {
  nonce: string;
  isDevelopment: boolean;
  upgradeInsecureRequests: boolean;
}): string {
  const { nonce, isDevelopment, upgradeInsecureRequests } = options;
  const directives = [
    "default-src 'self'",
    // React's development build needs eval to rebuild server stacks; production never does.
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDevelopment ? " 'unsafe-eval'" : ""}`,
    // The dev overlay injects unnonced styles, and a nonce in the list would disable 'unsafe-inline'.
    isDevelopment ? "style-src 'self' 'unsafe-inline'" : `style-src 'self' 'nonce-${nonce}'`,
    "img-src 'self' data:",
    "font-src 'self'",
    isDevelopment ? "connect-src 'self' ws://localhost:* ws://127.0.0.1:*" : "connect-src 'self'",
    // Without it workers fall back to script-src, where 'strict-dynamic' lets a trusted script start one from anywhere.
    "worker-src 'self'",
    "object-src 'none'",
    "base-uri 'none'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    ...(upgradeInsecureRequests ? ["upgrade-insecure-requests"] : []),
  ];
  return directives.join("; ");
}

// The offline fallback is a static file, stored by the service worker and served with no server around, so it
// cannot carry a nonce. It has no inline script or style, and reads what it shows from Cache Storage.
export const OFFLINE_PAGE_CONTENT_SECURITY_POLICY = [
  "default-src 'none'",
  "script-src 'self'",
  "style-src 'self'",
  "img-src 'self'",
  "manifest-src 'self'",
  "base-uri 'none'",
  "form-action 'none'",
  "frame-ancestors 'none'",
].join("; ");

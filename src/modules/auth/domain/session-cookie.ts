// The API uses the dev- name only under INSECURE_DEV_COOKIES. Presence never proves a session:
// the routing proxy checks it only to skip a pointless render; pages verify with GET /me.
export const SESSION_COOKIE_NAMES = ["__Host-session", "dev-session"] as const;

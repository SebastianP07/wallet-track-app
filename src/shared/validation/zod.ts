import { z } from "zod";

// Every schema imports zod from here, so this runs before any is built. Otherwise zod probes
// `new Function`, and the strict CSP reports that as a violation even though zod catches the throw.
z.config({ jitless: true });

export { z };

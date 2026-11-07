import {
  boolean,
  config,
  email,
  enum as enumOf,
  NEVER,
  object,
  string,
  type input as zodInput,
  type output as zodOutput,
  type RefinementCtx as ZodRefinementCtx,
  type ZodType,
} from "zod";

// Every schema imports zod from here, so this runs before any is built. Otherwise zod probes
// `new Function`, and the strict CSP reports that as a violation even though zod catches the throw.
config({ jitless: true });

// Named rather than the whole `z`, which carries every locale zod ships and is most of the Login page's script.
export const z = { boolean, email, enum: enumOf, NEVER, object, string };

// eslint-disable-next-line @typescript-eslint/no-namespace
export declare namespace z {
  export type input<Schema extends ZodType> = zodInput<Schema>;
  export type output<Schema extends ZodType> = zodOutput<Schema>;
  export type RefinementCtx = ZodRefinementCtx;
}

import { createEnv } from "@t3-oss/env-nextjs";
import { isAddress } from "viem";
import { z } from "zod";

export const env = createEnv({
  /**
   * Specify your server-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars.
   */
  server: {
    ALCHEMY_API_KEY: z.string({
      message: "ALCHEMY API KEY is required",
    }),
  },

  /**
   * Specify your client-side environment variables schema here. This way you can ensure the app
   * isn't built with invalid env vars. To expose them to the client, prefix them with
   * `NEXT_PUBLIC_`.
   */
  client: {
    NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID: z.string({
      message: "GAS MANAGER POLICY ID is required",
    }),
    NEXT_PUBLIC_CONTRACT_ADDRESS: z.string().refine(isAddress),
  },

  /**
   * You can't destruct `process.env` as a regular object in the Next.js edge runtimes (e.g.
   * middlewares) or client-side so we need to destruct manually.
   */
  runtimeEnv: {
    ALCHEMY_API_KEY: process.env.ALCHEMY_API_KEY,
    NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID: process.env.NEXT_PUBLIC_ALCHEMY_GAS_MANAGER_POLICY_ID,
    NEXT_PUBLIC_CONTRACT_ADDRESS: process.env.NEXT_PUBLIC_CONTRACT_ADDRESS,
  },
  /**
   * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially
   * useful for Docker builds.
   */
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  /**
   * Makes it so that empty strings are treated as undefined. `SOME_VAR: z.string()` and
   * `SOME_VAR=''` will throw an error.
   */
  emptyStringAsUndefined: true,
});

import { z } from "zod";

export const ratioResponse = z.object({
  data: z.object({
    decimal: z.number().nonnegative(),
    value: z.string(),
  }),
});

export const signatureRequest = z.object({
  btc_address: z.string(),
  icy_amount: z.string(),
  btc_amount: z.string(),
});

export const signatureResponse = z.object({
  data: z.object({
    btc_amount: z.string(),
    icy_amount: z.string(),
    deadline: z.string(),
    nonce: z.string(),
    signature: z.string(),
  }),
  message: z.string(),
});

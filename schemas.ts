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

export const Tx = z.object({
  id: z.number(),
  icy_transaction_hash: z.string().nullable(),
  btc_transaction_hash: z.string().nullable(),
  swap_transaction_hash: z.string().nullable(),
  btc_address: z.string(),
  processed_at: z.string(), // ISO
  amount: z.string(),
  status: z.enum(["completed", "failed", "in_progress"]),
  created_at: z.string(), // ISO
  updated_at: z.string(), // ISO
});
export const Txns = z.object({
  total: z.number(),
  transactions: z.array(Tx),
});
export type TX = z.infer<typeof Tx>;

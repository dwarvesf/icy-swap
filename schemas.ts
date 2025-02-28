import { z } from "zod";

export const infoResponse = z.object({
  data: z.object({
    circulated_icy_balance: z.string(),
    icy_satoshi_rate: z.string(),
    icy_usd_rate: z.string(),

    satoshi_balance: z.string(),
    satoshi_per_usd: z.number(),
    satoshi_usd_rate: z.string(),
    min_satoshi_fee: z.string(),

    min_icy_to_swap: z.string(),
    service_fee_rate: z.number(),
  }),
  message: z.string(),
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
  processed_at: z.string().nullable(), // ISO
  subtotal: z.string(),
  status: z.enum(["completed", "failed", "pending"]),
  icy_swap_tx: z.object({
    transaction_hash: z.string(),
    block_number: z.number(),
    icy_amount: z.string(),
    from_address: z.string(),
    btc_address: z.string(),
    btc_amount: z.string(),
    created_at: z.string(),
    updated_at: z.string(),
  }),
  created_at: z.string(), // ISO
  updated_at: z.string(), // ISO
  network_fee: z.string(),
  service_fee: z.string(),
  total: z.string(),
});
export const Txns = z.object({
  total: z.number(),
  transactions: z.array(Tx),
});
export type TX = z.infer<typeof Tx>;

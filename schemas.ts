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
  // EIP-712 proof that the caller controls the wallet that will call swap().
  // The backend recovers the address from it; the ApiKey cannot identify
  // anyone because it ships inside the browser bundle.
  wallet_signature: z.string(),
  wallet_deadline: z.number(),
  // bytes32 hex; makes the signature single-use (backend keeps a seen-set).
  wallet_nonce: z.string().regex(/^0x[0-9a-f]{64}$/),
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
  // The backend owns this vocabulary and has SIX values today (pending,
  // processing, broadcasted, completed, failed, needs_reconcile). A strict
  // enum here meant one in-flight swap made zod reject the whole array and
  // the entire list rendered as an error, which is exactly what production
  // did. Accept any string; the UI maps the known ones and falls back for
  // the rest, so a new backend status can never blank the list again.
  status: z.string(),
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
  // One malformed row must not blank the whole list. `catch` turns a failed
  // element into null instead of rejecting the array; the caller filters them
  // out. Losing one row is a far better failure than losing all of them.
  transactions: z.array(Tx.nullable().catch(null)),
});
export type TX = z.infer<typeof Tx>;

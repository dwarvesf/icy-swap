import { ICY_SWAPPER_CONTRACT_ADDRESS } from "@/envs";

/**
 * EIP-712 payload proving who is asking for a swap signature.
 *
 * The backend's ApiKey is inlined into this bundle, so it identifies nobody.
 * Instead the user signs this with the wallet that will call swap(), and the
 * backend recovers the address from it.
 *
 * This MUST match `swapRequestTypedData` in the backend
 * (internal/handler/swap/walletauth.go) exactly: field order, types, and every
 * domain value. Any divergence changes the digest, so the backend recovers a
 * different address and rejects every request.
 */
export const SWAP_REQUEST_DOMAIN = {
  name: "IcySwap",
  version: "1",
  chainId: 8453, // Base mainnet
  verifyingContract: ICY_SWAPPER_CONTRACT_ADDRESS,
} as const;

export const SWAP_REQUEST_TYPES = {
  SwapRequest: [
    { name: "icyAmount", type: "uint256" },
    { name: "btcAddress", type: "string" },
    { name: "deadline", type: "uint256" },
  ],
} as const;

/**
 * The backend rejects a deadline further out than 5 minutes, so a captured
 * signature has a short life. Two minutes leaves room for a slow wallet
 * confirmation without crowding that ceiling.
 */
export const WALLET_AUTH_TTL_SECONDS = 120;

export function swapRequestDeadline(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + WALLET_AUTH_TTL_SECONDS);
}

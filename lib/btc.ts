import { validate, Network } from "bitcoin-address-validation";

/**
 * ICY has 18 decimals. Approve and swap must agree on the exact wei string or
 * the allowance check passes while the transfer reverts, so both go through
 * here rather than each doing its own float maths.
 */
export function icyToWei(icy: string): string {
  const n = Number(icy);
  if (!Number.isFinite(n) || n <= 0) return "0";
  return (n * 10 ** 18).toLocaleString("fullwide", {
    useGrouping: false,
    maximumFractionDigits: 18,
    notation: "standard",
  });
}

/**
 * Bitcoin payouts settle on mainnet, so a testnet, signet or regtest address is
 * a guaranteed loss: the ICY leg burns on Base and the BTC leg targets an
 * encoding that does not exist on the network we pay from.
 *
 * `validate(addr)` with no network argument accepts all of them, so every
 * caller must go through here. Verified against bitcoin-address-validation@3:
 * tb1…, m…, and bcrt1… all return true without the second argument.
 */
export function isMainnetBtcAddress(address: string): boolean {
  return validate(address.trim(), Network.mainnet);
}

import { parseUnits } from "viem";
import { validate, Network } from "bitcoin-address-validation";

/**
 * ICY has 18 decimals. Approve and swap must agree on the exact wei string or
 * the allowance check passes while the transfer reverts, so both go through
 * here rather than each doing its own float maths.
 */
export function icyToWei(icy: string): string {
  // parseUnits, not Number(icy) * 10**18. A float cannot hold 18 significant
  // decimal places, and the error went the dangerous way: 1793131.12 came out
  // 200,000,000 wei ABOVE its exact value, so Max asked for more ICY than the
  // wallet held and transferFrom reverted on chain after the user had paid gas
  // and burned a backend nonce. parseUnits does exact decimal-string maths.
  //
  // It also fixes a render crash: more than 18 decimal places made the old
  // function return "1.5", and BigInt("1.5") throws where it is called.
  // parseUnits rounds the excess instead.
  try {
    const wei = parseUnits(icy as `${number}`, 18);
    return wei > BigInt(0) ? wei.toString() : "0";
  } catch {
    return "0";
  }
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

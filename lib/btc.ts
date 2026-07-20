import { validate, Network } from "bitcoin-address-validation";

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

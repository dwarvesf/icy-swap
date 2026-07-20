// These casts assert a shape nothing checks at runtime, and one of them is the
// address every user grants a token allowance to. A typo or a staging value in
// the deploy env would otherwise reach production silently, so assert instead.
const ZERO = "0x0000000000000000000000000000000000000000";

function contractAddress(name: string, value: string | undefined) {
  if (!value || !/^0x[0-9a-fA-F]{40}$/.test(value) || value === ZERO) {
    throw new Error(
      `${name} is missing or not a contract address. Check the deploy environment.`
    );
  }
  return value as `0x${string}`;
}

export const ICY_CONTRACT_ADDRESS = contractAddress(
  "NEXT_PUBLIC_ICY_CONTRACT_ADDRESS",
  process.env.NEXT_PUBLIC_ICY_CONTRACT_ADDRESS
);

export const ICY_SWAPPER_CONTRACT_ADDRESS = contractAddress(
  "NEXT_PUBLIC_ICY_SWAPPER_CONTRACT_ADDRESS",
  process.env.NEXT_PUBLIC_ICY_SWAPPER_CONTRACT_ADDRESS
);

export const BTC_EXPLORER = process.env.NEXT_PUBLIC_BTC_EXPLORER;

export const BASE_URL = process.env.NEXT_PUBLIC_BE_API as string;
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY as string;

export const ICY_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_ICY_CONTRACT_ADDRESS as `0x${string}`;
export const ICY_SWAPPER_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_ICY_SWAPPER_CONTRACT_ADDRESS as `0x${string}`;
export const USDC_CONTRACT_ADDRESS = process.env
  .NEXT_PUBLIC_USDC_CONTRACT_ADDRESS as `0x${string}`;
export const RATE = Number((process.env.NEXT_PUBLIC_RATE as string) ?? "1.5");

export const WEBHOOK_ID = process.env.WEBHOOK_ID as string;
export const WEBHOOK_TOKEN = process.env.WEBHOOK_TOKEN as string;

import { formatUnits } from "viem";
import React from "react";
import { useAccount, useBalance, useWatchAsset } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { validate as validateBtcAddr } from "bitcoin-address-validation";
import { cn, commify } from "@/lib/utils";

const Field = ({
  label,
  aside,
  invalid,
  children,
}: {
  label: string;
  aside?: React.ReactNode;
  invalid?: boolean;
  children: React.ReactNode;
}) => (
  <div
    className={cn(
      "rounded-[10px] border border-white/10 bg-white/[0.03] py-3 px-3.5",
      { "border-brand/60": invalid }
    )}
  >
    <div className="flex justify-between items-center mb-1.5 text-[11.5px] text-gray-500">
      <span>{label}</span>
      {aside}
    </div>
    {children}
  </div>
);

const Token = ({ icon, symbol }: { icon: string; symbol: string }) => (
  <span className="flex flex-shrink-0 gap-2 items-center py-1 pr-3 pl-1.5 text-[13.5px] font-medium rounded-full bg-white/[0.06]">
    <Image className="flex-shrink-0 rounded-full" src={icon} width={20} height={20} alt="" />
    {symbol}
  </span>
);

const amountInput =
  "w-full min-w-0 p-0 font-mono text-[26px] tabular-nums tracking-tight bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none text-white placeholder:text-gray-600";

export const Converter = ({
  tokenA,
  tokenB,
  setAmountTokenA,
  setAmountTokenB,
  rate,
  addressTokenB,
  setAddressTokenB,
  feeRate,
  minSats,
  satoshiPerUsd,
}: {
  tokenA: string;
  setAmountTokenA: (v: string) => void;
  tokenB: string;
  setAmountTokenB: (v: string) => void;
  rate: number;
  addressTokenB: string;
  setAddressTokenB: (v: string) => void;
  feeRate: number;
  minSats: string;
  satoshiPerUsd: number;
}) => {
  const { address } = useAccount();
  const { watchAsset } = useWatchAsset();
  const { data: balance } = useBalance({ token: contractAddress, address });

  const formattedBalance = (+formatUnits(
    balance?.value ?? BigInt(0),
    balance?.decimals ?? 0
  )).toFixed(2);

  const subtotal = Math.floor(Number(tokenB) || 0);
  // Service fee is a percentage with a floor, mirroring what the backend charges.
  const serviceFee = subtotal
    ? Math.max(Math.floor(subtotal * (feeRate ?? 0)), +minSats || 0)
    : 0;
  const receives = Math.max(0, subtotal - serviceFee);
  const usd = satoshiPerUsd ? receives / satoshiPerUsd : 0;

  const addressTouched = addressTokenB.trim().length > 0;
  const addressInvalid = addressTouched && !validateBtcAddr(addressTokenB);

  return (
    <div className="flex flex-col">
      <Field
        label="You pay"
        aside={
          balance ? (
            <span>
              Balance {commify(formattedBalance)}
              <button
                type="button"
                onClick={() => {
                  if (!rate) return;
                  setAmountTokenA(formattedBalance);
                  setAmountTokenB(`${Math.floor(+formattedBalance * rate)}`);
                }}
                className="py-0.5 px-1.5 ml-2 text-[10.5px] font-medium tracking-wider text-gray-400 uppercase rounded border border-white/10 hover:border-icy-100 hover:text-icy-100"
              >
                Max
              </button>
            </span>
          ) : null
        }
      >
        <div className="flex gap-2.5 items-center">
          <input
            value={tokenA}
            onChange={(e) => {
              if (!rate) return;
              if (Number.isNaN(Number(e.target.value))) return;
              setAmountTokenA(e.target.value);
              setAmountTokenB(`${Math.floor(Number(e.target.value) * rate)}`);
            }}
            type="text"
            inputMode="decimal"
            placeholder="0.00"
            aria-label="ICY amount to swap"
            className={amountInput}
          />
          <button
            type="button"
            title="Add ICY to your wallet"
            onClick={() =>
              watchAsset({
                type: "ERC20",
                options: {
                  address: ICY_CONTRACT_ADDRESS,
                  symbol: "ICY",
                  decimals: 18,
                },
              })
            }
          >
            <Token icon="/ICY.png" symbol="ICY" />
          </button>
        </div>
      </Field>

      <div className="flex relative z-10 -my-3.5 justify-center">
        <span className="grid place-items-center w-7 h-7 text-gray-400 rounded-full border bg-foreground-100 border-white/10">
          <ArrowDownIcon width={14} height={14} />
        </span>
      </div>

      <Field label="You receive" aside={usd ? <span>≈ ${usd.toFixed(2)}</span> : null}>
        <div className="flex gap-2.5 items-center">
          <input
            value={tokenB}
            onChange={(e) => {
              if (!rate) return;
              if (Number.isNaN(Number(e.target.value))) return;
              setAmountTokenB(Math.floor(+e.target.value).toString());
              setAmountTokenA(`${Number(e.target.value) / rate}`);
            }}
            type="text"
            inputMode="decimal"
            placeholder="0"
            aria-label="Satoshi to receive"
            className={amountInput}
          />
          <Token icon="/satoshi.png" symbol="sats" />
        </div>
      </Field>

      <div className="mt-2">
        <Field
          label="Bitcoin address"
          invalid={addressInvalid}
          aside={
            <span className="hidden sm:inline">
              Base and Bitcoin use different address formats
            </span>
          }
        >
          <input
            value={addressTokenB}
            onChange={(e) => setAddressTokenB(e.target.value)}
            spellCheck={false}
            placeholder="bc1..."
            aria-label="Destination Bitcoin address"
            aria-invalid={addressInvalid}
            className="p-0 w-full font-mono text-[13px] bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none text-white placeholder:text-gray-600"
          />
        </Field>
        {addressInvalid ? (
          <p className="mt-1.5 text-xs text-brand">
            Not a valid Bitcoin address. Check for a missing or extra character.
          </p>
        ) : null}
      </div>

      {/* Fees used to sit behind a modal. People moving Bitcoin want the
          arithmetic before they commit, not one interaction away. */}
      <dl className="grid gap-1.5 pt-3 mt-3.5 border-t border-white/5">
        <div className="flex justify-between text-[12.5px] text-gray-400">
          <dt>Rate</dt>
          <dd className="font-mono tabular-nums text-white">
            1 ICY = {commify(Math.floor(rate))} sats
          </dd>
        </div>
        <div className="flex justify-between text-[12.5px] text-gray-400">
          <dt>Service fee ({(feeRate ?? 0) * 100}%, min {commify(minSats || 0)} sats)</dt>
          <dd className="font-mono tabular-nums text-white">
            {serviceFee ? `−${commify(serviceFee)}` : "0"} sats
          </dd>
        </div>
        <div className="flex justify-between pt-2 text-[13.5px] border-t border-white/5">
          <dt>You receive</dt>
          <dd className="font-mono tabular-nums text-icy-200">
            {commify(receives)} sats
          </dd>
        </div>
      </dl>
      <p className="mt-2 text-[11.5px] text-gray-500">
        The Bitcoin network fee is deducted when the transaction is broadcast,
        so the amount that lands can be slightly lower.
      </p>
    </div>
  );
};

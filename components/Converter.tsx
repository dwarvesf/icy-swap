import { formatUnits } from "viem";
import React from "react";
import { useAccount, useBalance, useWatchAsset } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { isMainnetBtcAddress } from "@/lib/btc";
import { cn, commify, formatRate } from "@/lib/utils";

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
      "rounded-[10px] border border-white/10 bg-white/[0.03] py-3 px-3.5 focus-within:border-icy-100/50",
      { "border-brand/60 focus-within:border-brand/60": invalid }
    )}
  >
    <div className="flex gap-2 justify-between items-center mb-1.5 text-[11.5px] text-gray-400">
      <span>{label}</span>
      {aside}
    </div>
    {children}
  </div>
);

const Token = ({ icon, symbol }: { icon: string; symbol: string }) => (
  <span className="flex flex-shrink-0 gap-2 items-center py-1 pr-3 pl-1.5 text-[13.5px] font-medium rounded-full bg-white/[0.06]">
    <Image
      className="flex-shrink-0 rounded-full"
      src={icon}
      width={20}
      height={20}
      alt=""
    />
    {symbol}
  </span>
);

const amountInput =
  "w-full min-w-0 p-0 font-mono text-[26px] tabular-nums tracking-tight bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none focus-visible:outline-none text-white placeholder:text-gray-500";

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
  minIcy,
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
  minIcy: number;
  satoshiPerUsd: number;
}) => {
  const { address } = useAccount();
  const { watchAsset } = useWatchAsset();
  const { data: balance } = useBalance({ token: contractAddress, address });

  // FLOOR, never round. toFixed(2) rounds up, so a balance of 4200.999 shows
  // as 4201.00 and Max then asks to swap more ICY than the wallet holds. That
  // reverts on chain after the user has already paid gas, and now also trips
  // the backend's balance check. Truncating can only ever under-ask.
  const formattedBalance = (
    Math.floor(
      +formatUnits(balance?.value ?? BigInt(0), balance?.decimals ?? 0) * 100
    ) / 100
  ).toFixed(2);

  const subtotal = Math.floor(Number(tokenB) || 0);
  // Verified against live transactions 70-74: total = subtotal - service_fee,
  // where service_fee = max(1% of subtotal, min_satoshi_fee).
  const serviceFee = subtotal
    ? Math.max(Math.floor(subtotal * (feeRate ?? 0)), +minSats || 0)
    : 0;
  const receives = Math.max(0, subtotal - serviceFee);
  const usd = satoshiPerUsd ? receives / satoshiPerUsd : 0;

  // The minimum fee is a floor, not a percentage, so small swaps lose a much
  // larger share than the headline rate suggests. Show what they actually get.
  const effectiveRate = +tokenA > 0 ? receives / +tokenA : 0;
  const showEffective =
    effectiveRate > 0 && rate > 0 && effectiveRate < rate * 0.995;

  const addressTouched = addressTokenB.trim().length > 0;
  const addressInvalid = addressTouched && !isMainnetBtcAddress(addressTokenB);

  // Money form: accept digits and a single decimal point only. The bare
  // Number() check admitted 0x10, 1e5 and Infinity.
  const numeric = (v: string) => /^\d*\.?\d*$/.test(v);

  return (
    <div className="flex flex-col">
      <Field
        label="You pay"
        aside={
          balance ? (
            <span className="text-gray-400">
              Balance {commify(formattedBalance)}
              <button
                type="button"
                onClick={() => {
                  if (!rate) return;
                  setAmountTokenA(formattedBalance);
                  setAmountTokenB(`${Math.floor(+formattedBalance * rate)}`);
                }}
                className="py-0.5 px-1.5 ml-2 text-[10.5px] font-medium tracking-wider text-gray-300 uppercase rounded border border-white/10 hover:border-icy-100 hover:text-icy-100 focus-visible:border-icy-100"
              >
                Max
              </button>
            </span>
          ) : minIcy ? (
            <span className="text-gray-400">
              Minimum {commify(minIcy)} ICY
            </span>
          ) : null
        }
      >
        <div className="flex gap-2.5 items-center">
          <input
            value={tokenA}
            onChange={(e) => {
              if (!rate || !numeric(e.target.value)) return;
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
            aria-label="Add ICY to your wallet"
            className="rounded-full hover:brightness-125 focus-visible:ring-2 focus-visible:ring-icy-100"
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
        <span className="grid place-items-center w-7 h-7 text-gray-300 rounded-full border bg-foreground-100 border-white/10">
          <ArrowDownIcon width={14} height={14} />
        </span>
      </div>

      {/* Labelled "Converts to", not "You receive": this is the pre-fee
          subtotal, and the post-fee figure below already owns that phrase. */}
      <Field label="Converts to">
        <div className="flex gap-2.5 items-center">
          <input
            value={tokenB}
            onChange={(e) => {
              if (!rate || !numeric(e.target.value)) return;
              setAmountTokenB(Math.floor(+e.target.value).toString());
              setAmountTokenA(`${+(Number(e.target.value) / rate).toFixed(6)}`);
            }}
            type="text"
            inputMode="decimal"
            placeholder="0"
            aria-label="Satoshi before fee"
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
            <span className="text-right text-gray-400">
              Not your Base address
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
            aria-describedby={addressInvalid ? "btc-address-error" : undefined}
            className="p-0 w-full min-h-[28px] font-mono text-[13px] bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none text-white placeholder:text-gray-400"
          />
        </Field>
        {addressInvalid ? (
          <p
            id="btc-address-error"
            role="alert"
            className="mt-1.5 text-xs text-red-400"
          >
            This is not a Bitcoin mainnet address. Test network addresses
            (starting tb1, bcrt1, m or n) cannot receive a payout.
          </p>
        ) : null}
      </div>

      {/* Fees used to sit behind a modal. People moving Bitcoin want the
          arithmetic before they commit, not one interaction away. Labels
          shrink and figures never wrap, so a long label cannot run into its
          own value at 320px. */}
      <dl className="grid gap-1.5 pt-3 mt-3.5 border-t border-white/5">
        <div className="flex gap-3 justify-between items-baseline text-[12.5px] text-gray-400">
          <dt className="min-w-0">Rate</dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-white">
            1 ICY = {formatRate(rate)} sats
          </dd>
        </div>
        <div className="flex gap-3 justify-between items-baseline text-[12.5px] text-gray-400">
          <dt className="min-w-0">
            Service fee
            <span className="block text-[11px] text-gray-400">
              {(feeRate ?? 0) * 100}%, minimum {commify(minSats || 0)} sats
            </span>
          </dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-white">
            {serviceFee ? `−${commify(serviceFee)}` : "0"} sats
          </dd>
        </div>
        <div className="flex gap-3 justify-between items-baseline pt-2 text-[13.5px] border-t border-white/5">
          <dt className="min-w-0">
            You receive
            {usd ? (
              <span className="block text-[11px] text-gray-400">
                about ${usd.toFixed(2)}
              </span>
            ) : null}
          </dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-icy-200">
            {commify(receives)} sats
          </dd>
        </div>
      </dl>

      {showEffective ? (
        <p className="mt-2 text-[11.5px] text-gray-400">
          At this size the minimum fee dominates, so you get{" "}
          <span className="font-mono text-gray-300">
            {formatRate(effectiveRate)} sats
          </span>{" "}
          per ICY rather than {formatRate(rate)}. Swapping more improves it.
        </p>
      ) : null}
      <p className="mt-2 text-[11.5px] text-gray-400">
        This is the amount that lands at your address. The Bitcoin network fee
        is paid by the treasury and does not come out of it.
      </p>
    </div>
  );
};

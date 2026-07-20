import { formatUnits } from "viem";
import React from "react";
import { useAccount, useBalance, useWatchAsset } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { isMainnetBtcAddress } from "@/lib/btc";
import {
  floorIcyBalance,
  caretAfterDigits,
  cn,
  commify,
  formatRate,
  groupDigits,
  stripGroups,
} from "@/lib/utils";

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
    <div className="flex gap-2 justify-between items-center mb-1.5 text-[11.5px] text-ink-3">
      <span>{label}</span>
      {aside}
    </div>
    {children}
  </div>
);

const Token = ({
  badge,
  symbol,
}: {
  badge: React.ReactNode;
  symbol: string;
}) => (
  <span className="flex flex-shrink-0 gap-2 items-center py-1 pr-3 pl-1.5 text-[13.5px] font-medium rounded-full bg-white/[0.06]">
    {badge}
    {symbol}
  </span>
);

const IcyBadge = (
  <Image
    className="flex-shrink-0 rounded-full"
    src="/ICY.png"
    width={20}
    height={20}
    alt=""
  />
);

// satoshi.png is a black glyph on transparency and disappeared into the dark
// pill. The real Bitcoin mark was already sitting unused in public/, and a sat
// is a Bitcoin denomination, so it is both the honest badge and the one people
// recognise without reading the label.
const SatsBadge = (
  <Image
    className="flex-shrink-0 rounded-full"
    src="/bitcoin.png"
    width={20}
    height={20}
    alt=""
  />
);

const amountInput =
  "w-full min-w-0 p-0 font-mono text-[26px] tabular-nums tracking-tight bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none focus-visible:outline-none text-ink placeholder:text-ink-3";

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

  const formattedBalance = floorIcyBalance(
    formatUnits(balance?.value ?? BigInt(0), balance?.decimals ?? 0)
  );

  // Nothing stopped an amount larger than the wallet holds, so the swap could
  // be signed and sent only to revert on chain, after gas. Caught next to the
  // field instead, the same way the minimum already is.
  const overBalance = Boolean(balance) && +tokenA > +formattedBalance;

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

  // The amount fields were the only figures on the page without separators,
  // and they are the largest: 1793131 is unreadable where 1,793,131 is not.
  // State stays raw; only the display is grouped. Rewriting a controlled
  // input's value sends the caret to the end, which makes fixing a typo
  // mid-number impossible, so it is put back beside the same digit.
  const onAmount = (
    e: React.ChangeEvent<HTMLInputElement>,
    apply: (raw: string) => void
  ) => {
    const el = e.target;
    const raw = stripGroups(el.value);
    if (!numeric(raw)) return;

    const digitsLeftOfCaret = stripGroups(
      el.value.slice(0, el.selectionStart ?? 0)
    ).length;
    apply(raw);

    requestAnimationFrame(() => {
      const pos = caretAfterDigits(el.value, digitsLeftOfCaret);
      el.setSelectionRange(pos, pos);
    });
  };

  return (
    <div className="flex flex-col">
      <Field
        label="You pay"
        invalid={overBalance}
        aside={
          balance ? (
            <span className="text-ink-3">
              Balance {commify(formattedBalance)}
              <button
                type="button"
                onClick={() => {
                  if (!rate) return;
                  setAmountTokenA(formattedBalance);
                  setAmountTokenB(`${Math.floor(+formattedBalance * rate)}`);
                }}
                className="py-0.5 px-1.5 ml-2 text-[10.5px] font-medium tracking-wider text-ink-2 uppercase rounded border border-white/10 hover:border-icy-100 hover:text-icy-100 focus-visible:border-icy-100"
              >
                Max
              </button>
            </span>
          ) : minIcy ? (
            <span className="text-ink-3">
              Minimum {commify(minIcy)} ICY
            </span>
          ) : null
        }
      >
        <div className="flex gap-2.5 items-center">
          <input
            value={groupDigits(tokenA)}
            onChange={(e) =>
              onAmount(e, (raw) => {
                if (!rate) return;
                setAmountTokenA(raw);
                setAmountTokenB(`${Math.floor(Number(raw) * rate)}`);
              })
            }
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
            <Token badge={IcyBadge} symbol="ICY" />
          </button>
        </div>
      </Field>
      {overBalance ? (
        <p role="alert" className="mt-1.5 text-xs text-brand">
          You hold {commify(formattedBalance)} ICY. Use Max to swap all of it.
        </p>
      ) : null}

      <div className="flex relative z-10 -my-3.5 justify-center">
        <span className="grid place-items-center w-7 h-7 text-ink-2 rounded-full border bg-foreground-100 border-white/10">
          <ArrowDownIcon width={14} height={14} />
        </span>
      </div>

      {/* Labelled "Converts to", not "You receive": this is the pre-fee
          subtotal, and the post-fee figure below already owns that phrase. */}
      <Field label="Converts to">
        <div className="flex gap-2.5 items-center">
          <input
            value={groupDigits(tokenB)}
            onChange={(e) =>
              onAmount(e, (raw) => {
                if (!rate) return;
                setAmountTokenB(Math.floor(+raw).toString());
                setAmountTokenA(`${+(Number(raw) / rate).toFixed(6)}`);
              })
            }
            type="text"
            // A satoshi is indivisible, so this field takes whole numbers and
            // asks phones for the keypad without a decimal key.
            inputMode="numeric"
            placeholder="0"
            aria-label="Satoshi before fee"
            className={amountInput}
          />
          <Token badge={SatsBadge} symbol="sats" />
        </div>
      </Field>

      <div className="mt-2">
        <Field
          label="Bitcoin address"
          invalid={addressInvalid}
          aside={
            <span className="text-right text-ink-3">
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
            className="p-0 w-full min-h-[28px] font-mono text-[13px] bg-transparent border-none !ring-transparent !shadow-none outline-none focus:outline-none text-ink placeholder:text-ink-3"
          />
        </Field>
        {addressInvalid ? (
          <p
            id="btc-address-error"
            role="alert"
            className="mt-1.5 text-xs text-brand"
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
        <div className="flex gap-3 justify-between items-baseline text-[12.5px] text-ink-2">
          <dt className="min-w-0">Rate</dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-ink">
            1 ICY = {formatRate(rate)} sats
          </dd>
        </div>
        <div className="flex gap-3 justify-between items-baseline text-[12.5px] text-ink-2">
          <dt className="min-w-0">
            Service fee
            <span className="block text-[11px] text-ink-3">
              {(feeRate ?? 0) * 100}%, minimum {commify(minSats || 0)} sats
            </span>
          </dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-ink">
            {serviceFee ? `−${commify(serviceFee)}` : "0"} sats
          </dd>
        </div>
        <div className="flex gap-3 justify-between items-baseline pt-2 text-[13.5px] border-t border-white/5">
          <dt className="min-w-0">
            You receive
            {/* groupDigits, not commify: a swap this size runs to five figures,
                and commify would trim "$12,276.00" to "$12,276". Token
                quantities lose their trailing zeros, money keeps its cents. */}
            {usd ? (
              <span className="block text-[11px] text-ink-3">
                about ${groupDigits(usd.toFixed(2))}
              </span>
            ) : null}
          </dt>
          <dd className="flex-shrink-0 font-mono whitespace-nowrap tabular-nums text-icy-200">
            {commify(receives)} sats
          </dd>
        </div>
      </dl>

      {showEffective ? (
        <p className="mt-2 text-[11.5px] text-ink-3">
          At this size the minimum fee dominates, so you get{" "}
          <span className="font-mono text-ink-2">
            {formatRate(effectiveRate)} sats
          </span>{" "}
          per ICY rather than {formatRate(rate)}. Swapping more improves it.
        </p>
      ) : null}
      <p className="mt-2 text-[11.5px] text-ink-3">
        This is the amount that lands at your address. The Bitcoin network fee
        is paid by the treasury and does not come out of it.
      </p>
    </div>
  );
};

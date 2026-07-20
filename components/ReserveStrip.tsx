import { commify, formatRate } from "@/lib/utils";

// ICY's rate is not a market quote nobody can check, it is a division anybody
// can: reserve over circulating supply. The page used to state that in a
// paragraph underneath three unrelated tiles. Showing the arithmetic instead
// makes the trust argument self-evident and costs less room than explaining it.
const Term = ({
  label,
  value,
  sub,
  loading,
  accent,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  loading?: boolean;
  accent?: boolean;
}) => (
  <div className="min-w-0">
    <dt className="text-[10.5px] font-medium tracking-[0.1em] text-ink-3 uppercase">
      {label}
    </dt>
    {loading ? (
      <dd className="mt-1.5 w-28 h-6 rounded animate-pulse bg-white/10" />
    ) : (
      <dd
        className={
          accent
            ? "mt-1 font-mono text-[21px] tabular-nums tracking-tight text-icy-100"
            : "mt-1 font-mono text-[17px] tabular-nums tracking-tight text-ink"
        }
      >
        {value}
        {sub ? (
          <span className="block mt-0.5 font-mono text-[11.5px] text-ink-3">
            {sub}
          </span>
        ) : null}
      </dd>
    )}
  </div>
);

// The operators carry the meaning, so they are sized to be read, not to
// decorate. They are padded down onto the figures' line rather than centred on
// the whole term, which would float them above the numbers they join.
const Operator = ({ glyph }: { glyph: string }) => (
  <span
    aria-hidden
    className="hidden md:block flex-shrink-0 pt-[26px] font-mono text-[17px] text-ink-3"
  >
    {glyph}
  </span>
);

export const ReserveStrip = ({
  rate,
  satoshiBalance,
  circulatingIcy,
  satoshiPerUsd,
  minIcy,
  loading,
  error,
}: {
  rate: number;
  satoshiBalance: string;
  circulatingIcy: number;
  satoshiPerUsd: number;
  minIcy: number;
  loading: boolean;
  error: boolean;
}) => {
  const sats = +satoshiBalance;
  const usdPerIcy = satoshiPerUsd ? rate / satoshiPerUsd : 0;

  if (error) {
    return (
      <div
        role="alert"
        className="py-4 px-5 text-sm border-b border-white/10 text-brand"
      >
        Reserve figures are unavailable right now. Swapping is paused until the
        rate can be confirmed.
      </div>
    );
  }

  return (
    <div className="border-b border-white/10">
      {/* Screen readers get the claim as a sentence: the operator glyphs are
          decorative to them, and visual order alone would not carry it. */}
      <p className="sr-only">
        The rate is the Bitcoin reserve divided by the ICY in circulation.
      </p>
      <dl className="flex flex-col gap-y-4 gap-x-5 py-4 px-5 md:flex-row md:items-start">
        <Term
          label="Bitcoin reserve"
          loading={loading}
          value={commify(sats)}
          sub={`sats · ${(sats / 1e8).toFixed(5)} BTC`}
        />
        <Operator glyph="÷" />
        <Term
          label="ICY in circulation"
          loading={loading}
          value={commify(circulatingIcy.toFixed(2))}
          sub="held across all wallets"
        />
        <Operator glyph="=" />
        <Term
          accent
          label="Rate"
          loading={loading}
          value={`${formatRate(rate)} sats`}
          sub={`per ICY${usdPerIcy ? ` · $${usdPerIcy.toFixed(4)}` : ""}`}
        />
      </dl>
      {/* Only the two qualifiers are left: the division above now says what
          this paragraph used to spend three lines explaining. */}
      <p className="py-2.5 px-5 text-xs text-ink-3 border-t border-white/5">
        Redeeming does not move the rate
        {minIcy ? `, though swaps start at ${commify(minIcy)} ICY` : ""}. Issuing
        new ICY before the reserve grows will lower it.
      </p>
    </div>
  );
};

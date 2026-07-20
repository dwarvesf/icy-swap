import { cn, commify, formatRate } from "@/lib/utils";

const Tile = ({
  label,
  value,
  sub,
  loading,
  className,
}: {
  label: string;
  value: React.ReactNode;
  sub?: React.ReactNode;
  loading?: boolean;
  className?: string;
}) => (
  <div className={cn("py-4 px-5 border-white/5", className)}>
    <dt className="text-[10.5px] font-medium tracking-[0.1em] text-ink-3 uppercase">
      {label}
    </dt>
    {loading ? (
      <dd className="mt-1.5 w-24 h-5 rounded animate-pulse bg-white/10" />
    ) : (
      <dd className="mt-1 font-mono text-[17px] tabular-nums tracking-tight">
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
      {/* The rate is the headline, so it takes the full width on a phone and
          the other two share the row below it. */}
      <dl className="grid grid-cols-1 min-[360px]:grid-cols-2 md:grid-cols-3">
        <Tile
          className="border-b min-[360px]:col-span-2 md:col-span-1 md:border-b-0 md:border-r"
          label="Rate"
          loading={loading}
          value={
            <span className="text-icy-100">{formatRate(rate)} sats</span>
          }
          sub={`per ICY${usdPerIcy ? ` · $${usdPerIcy.toFixed(4)}` : ""}`}
        />
        <Tile
          className="border-b min-[360px]:border-r min-[360px]:border-b-0"
          label="Bitcoin reserve"
          loading={loading}
          value={
            <>
              {(sats / 1e8).toFixed(5)}{" "}
              <span className="text-[13px] text-ink-3">BTC</span>
            </>
          }
          sub={`${commify(sats)} sats`}
        />
        <Tile
          label="ICY in circulation"
          loading={loading}
          value={commify(circulatingIcy.toFixed(2))}
          sub="held across all wallets"
        />
      </dl>
      {/* The rate is not a market quote, it IS reserve/circulating. Saying so
          is the trust argument. The two qualifiers are load-bearing: swaps
          have a floor, and minting ahead of a top-up lowers the rate. */}
      <p className="py-2.5 px-5 text-xs text-ink-3 border-t border-white/5">
        The rate is the Bitcoin reserve divided by the circulating supply, so
        redeeming does not change it{minIcy ? "" : "."}
        {minIcy ? `, though swaps start at ${commify(minIcy)} ICY. ` : " "}
        Issuing new ICY before the reserve grows will lower it.
      </p>
    </div>
  );
};

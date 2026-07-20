import { cn, commify } from "@/lib/utils";

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
    <p className="text-[10.5px] font-medium tracking-[0.1em] text-gray-500 uppercase">
      {label}
    </p>
    {loading ? (
      <div className="mt-1.5 w-24 h-5 rounded animate-pulse bg-white/10" />
    ) : (
      <p className="mt-1 font-mono text-[17px] tabular-nums tracking-tight">
        {value}
      </p>
    )}
    {sub && !loading ? (
      <p className="mt-0.5 font-mono text-[11.5px] text-gray-500">{sub}</p>
    ) : null}
  </div>
);

export const ReserveStrip = ({
  rate,
  satoshiBalance,
  circulatingIcy,
  satoshiPerUsd,
  loading,
  error,
}: {
  rate: number;
  satoshiBalance: string;
  circulatingIcy: number;
  satoshiPerUsd: number;
  loading: boolean;
  error: boolean;
}) => {
  const sats = +satoshiBalance;
  const usdPerIcy = satoshiPerUsd ? rate / satoshiPerUsd : 0;

  if (error) {
    return (
      <div className="py-4 px-5 text-sm border-b border-white/10 text-brand">
        Reserve figures are unavailable right now. Swapping is paused until the
        rate can be confirmed.
      </div>
    );
  }

  return (
    <div className="border-b border-white/10">
      {/* The rate is the headline, so it takes the full width on a phone and
          the other two share the row below it. */}
      <div className="grid grid-cols-2 md:grid-cols-3">
        <Tile
          className="col-span-2 border-b md:col-span-1 md:border-b-0 md:border-r"
          label="Rate"
          loading={loading}
          value={
            <span className="text-icy-100">{commify(Math.floor(rate))} sats</span>
          }
          sub={`per ICY${usdPerIcy ? ` · $${usdPerIcy.toFixed(4)}` : ""}`}
        />
        <Tile
          className="border-r"
          label="Bitcoin reserve"
          loading={loading}
          value={
            <>
              {(sats / 1e8).toFixed(5)}{" "}
              <span className="text-[13px] text-gray-500">BTC</span>
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
      </div>
      {/* The rate is not a quote from a market, it IS reserve/circulating.
          Saying so is the whole trust argument for a backed token. */}
      <p className="py-2.5 px-5 text-xs text-gray-500 border-t border-white/5">
        Every ICY is redeemable for Bitcoin from the reserve above. The rate is
        the reserve divided by the circulating supply, so it moves only when one
        of them does.
      </p>
    </div>
  );
};

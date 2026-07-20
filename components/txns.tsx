import { BASE_URL, BTC_EXPLORER } from "@/envs";
import { isSSR, truncate } from "@dwarvesf/react-utils";
import { formatDistanceToNowStrict } from "date-fns";
import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { base } from "wagmi/chains";
import { cn, commify, fetchKeys } from "@/lib/utils";
import useSWR from "swr";
import { TX, Txns as TxnsSchema } from "@/schemas";
import { ConnectKitButton } from "connectkit";
import { formatUnits } from "viem";

// TODO: chain
const theChain = base;

const TOP_RESULT_COUNT = 8;

const STATUS_COPY: Record<TX["status"], string> = {
  completed: "Sent",
  pending: "In flight",
  failed: "Failed",
};

const STATUS_STYLE: Record<TX["status"], string> = {
  completed: "bg-icy-200/10 text-icy-200",
  pending: "bg-icy-500/10 text-icy-500",
  failed: "bg-brand/10 text-brand",
};

function Pill({ status }: { status: TX["status"] }) {
  return (
    <span
      className={cn(
        "self-start rounded-full py-[3px] px-2 text-[10px] font-semibold uppercase tracking-[0.05em]",
        STATUS_STYLE[status]
      )}
    >
      {STATUS_COPY[status]}
    </span>
  );
}

function Link({ href, children }: { href: string; children: React.ReactNode }) {
  // py/-my grows the hit area to the 24px minimum without moving the layout;
  // these sit shoulder to shoulder on a phone.
  return (
    <a
      href={href}
      rel="noreferrer"
      target="_blank"
      className="inline-flex items-center py-1 -my-1 min-h-[24px] hover:text-icy-100 hover:underline"
    >
      {children}
    </a>
  );
}

function Row({ tx }: { tx: TX }) {
  const icy = formatUnits(BigInt(tx.icy_swap_tx.icy_amount), 18);
  const created = new Date(tx.created_at);

  return (
    <li className="rounded-[9px] border border-white/5 bg-white/[0.025]">
      {/* The per-swap fee split was a tooltip before, which is the one place
          the real effective rate is discoverable. Kept, as a disclosure. */}
      <details className="group">
        <summary className="grid grid-cols-[1fr_auto] gap-y-1 gap-x-2.5 py-2.5 px-3 cursor-pointer list-none marker:hidden focus-visible:ring-2 focus-visible:ring-icy-100 rounded-[9px]">
          <span className="font-mono text-[13px] tabular-nums">
            {commify((+icy).toFixed(2))} ICY
            <span className="mx-1.5 text-gray-400">→</span>
            {commify(tx.total)} sats
          </span>
          <Pill status={tx.status} />
          <span className="flex flex-wrap col-span-2 gap-x-2.5 font-mono text-[11px] text-gray-400">
            <time dateTime={tx.created_at} title={created.toISOString()}>
              {formatDistanceToNowStrict(created)} ago
            </time>
            <span className="group-open:hidden">show fees</span>
            <span className="hidden group-open:inline">hide fees</span>
          </span>
        </summary>

        <dl className="grid gap-1 py-2.5 px-3 mx-3 mb-2.5 text-[11.5px] border-t border-white/5 text-gray-400">
          <div className="flex gap-3 justify-between">
            <dt>Converted</dt>
            <dd className="font-mono tabular-nums text-white">
              {commify(tx.subtotal)} sats
            </dd>
          </div>
          <div className="flex gap-3 justify-between">
            <dt>Service fee</dt>
            <dd className="font-mono tabular-nums text-white">
              −{commify(tx.service_fee)} sats
            </dd>
          </div>
          <div className="flex gap-3 justify-between">
            <dt>Received</dt>
            <dd className="font-mono tabular-nums text-icy-200">
              {commify(tx.total)} sats
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-2.5 pt-1.5 mt-1 font-mono border-t border-white/5">
            <Link href={`${BTC_EXPLORER}/address/${tx.btc_address}`}>
              {truncate(tx.btc_address, 8, true)}
            </Link>
            {tx.btc_transaction_hash ? (
              <Link href={`${BTC_EXPLORER}/tx/${tx.btc_transaction_hash}`}>
                bitcoin tx ↗
              </Link>
            ) : null}
            {tx.swap_transaction_hash ? (
              <Link
                href={`${theChain.blockExplorers.default.url}/tx/${tx.swap_transaction_hash}`}
              >
                base tx ↗
              </Link>
            ) : null}
          </div>
        </dl>
      </details>
    </li>
  );
}

export default function Txns() {
  const { isConnected, address } = useAccount();
  const [viewSelfTxs, setViewSelfTxs] = useState(false);
  const {
    data: txns,
    error,
    isLoading,
  } = useSWR([fetchKeys.TXNS, viewSelfTxs, address], async (keys) => {
    const [, viewSelf, address] = keys;
    return fetch(
      `${BASE_URL}/transactions${!viewSelf ? "" : `?evm_address=${address}`}`
    )
      .then((res) => res.json())
      .then((res) => TxnsSchema.parse(res).transactions);
  });

  const button = useMemo(() => {
    if (isSSR()) return null;
    const className =
      "inline-flex items-center py-1 -my-1 min-h-[24px] text-xs text-gray-400 hover:text-white";
    if (isConnected)
      return (
        <button
          type="button"
          onClick={() => setViewSelfTxs((o) => !o)}
          className={className}
        >
          {viewSelfTxs ? "Show all" : "Show only mine"}
        </button>
      );
    return (
      <ConnectKitButton.Custom>
        {({ show }) => (
          <button onClick={show} type="button" className={className}>
            Connect to see yours
          </button>
        )}
      </ConnectKitButton.Custom>
    );
  }, [isConnected, viewSelfTxs]);

  const rows = txns?.slice(0, TOP_RESULT_COUNT) ?? [];

  return (
    <div className="flex flex-col">
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-[10.5px] font-semibold tracking-[0.1em] text-gray-400 uppercase">
          Recent swaps
        </h2>
        {button}
      </div>

      {isLoading ? (
        <ul className="grid gap-2.5">
          {[0, 1, 2, 3].map((i) => (
            <li key={i} className="h-[58px] rounded-[9px] animate-pulse bg-white/[0.04]" />
          ))}
        </ul>
      ) : error ? (
        <p className="text-sm text-gray-400">
          Could not load recent swaps. They are still on chain, only this list is
          unavailable.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-400">
          {viewSelfTxs
            ? "You have not swapped yet. Your swaps will show up here."
            : "No swaps yet."}
        </p>
      ) : (
        <ul className="grid gap-2.5">
          {rows.map((tx) => (
            <Row key={tx.swap_transaction_hash ?? tx.id} tx={tx} />
          ))}
        </ul>
      )}
    </div>
  );
}

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
  return (
    <a
      href={href}
      rel="noreferrer"
      target="_blank"
      className="hover:text-icy-100 hover:underline"
    >
      {children}
    </a>
  );
}

function Row({ tx }: { tx: TX }) {
  const icy = formatUnits(BigInt(tx.icy_swap_tx.icy_amount), 18);

  return (
    <li className="grid grid-cols-[1fr_auto] gap-y-1 gap-x-2.5 py-2.5 px-3 rounded-[9px] border border-white/5 bg-white/[0.025]">
      <span className="font-mono text-[13px] tabular-nums">
        {commify((+icy).toFixed(2))} ICY
        <span className="mx-1.5 text-gray-500">→</span>
        {commify(tx.total)} sats
      </span>
      <Pill status={tx.status} />
      <span className="flex flex-wrap col-span-2 gap-x-2.5 font-mono text-[11px] text-gray-500">
        <span>{formatDistanceToNowStrict(new Date(tx.created_at))} ago</span>
        <Link href={`${BTC_EXPLORER}/address/${tx.btc_address}`}>
          {truncate(tx.btc_address, 8, true)}
        </Link>
        {tx.btc_transaction_hash ? (
          <Link href={`${BTC_EXPLORER}/tx/${tx.btc_transaction_hash}`}>
            btc tx
          </Link>
        ) : null}
        {tx.swap_transaction_hash ? (
          <Link
            href={`${theChain.blockExplorers.default.url}/tx/${tx.swap_transaction_hash}`}
          >
            base tx
          </Link>
        ) : null}
      </span>
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
    const className = "text-xs text-gray-500 hover:text-white";
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
        <h2 className="text-[10.5px] font-semibold tracking-[0.1em] text-gray-500 uppercase">
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
        <p className="text-sm text-gray-500">
          Could not load recent swaps. They are still on chain, only this list is
          unavailable.
        </p>
      ) : rows.length === 0 ? (
        <p className="text-sm text-gray-500">
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

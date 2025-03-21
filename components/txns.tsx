import { BASE_URL, BTC_EXPLORER } from "@/envs";
import { isSSR, truncate } from "@dwarvesf/react-utils";
import { LinkIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import React, { useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { VariantProps, cva } from "class-variance-authority";
import { base, baseSepolia } from "wagmi/chains";
import { cn, commify, fetchKeys } from "@/lib/utils";
import useSWR from "swr";
import { Txns as TxnsSchema } from "@/schemas";
import { Tooltip } from "@mochi-ui/core";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";
import { formatUnits } from "viem";

// TODO: chain
const theChain = base;

const cell = cva(
  "self-center p-2 h-full text-sm whitespace-nowrap border-b border-gray-700 flex items-center"
);

const TOP_RESULT_COUNT = 10;

const status = cva("capitalize", {
  variants: {
    state: {
      completed: "text-green-500",
      failed: "text-red-700",
      pending: "text-blue-600",
    },
  },
});

function Address({
  value,
  display = value,
}: {
  value: string | null;
  display?: string | null;
}) {
  if (!value || !display) return <span className={cell()}>⎯</span>;
  return (
    <a
      href={value}
      rel="noreferrer"
      target="_blank"
      className={cell({ className: "flex gap-x-1 cursor-pointer" })}
    >
      <span className="font-mono">{truncate(display ?? "", 8, true)}</span>
      <LinkIcon className="w-3.5 h-3.5" />
    </a>
  );
}

function Status({ value }: { value: VariantProps<typeof status>["state"] }) {
  return (
    <span
      className={cn(
        cell({ className: "font-medium" }),
        status({ state: value })
      )}
    >
      {value?.replaceAll("_", " ")}
    </span>
  );
}

export default function Txns({ rate }: { rate: number }) {
  const { isConnected, address } = useAccount();
  const [viewSelfTxs, setViewSelfTxs] = useState(false);
  const { data: txns, error } = useSWR(
    [fetchKeys.TXNS, viewSelfTxs, address],
    async (keys) => {
      const [, viewSelf, address] = keys;
      return fetch(
        `${BASE_URL}/transactions${!viewSelf ? "" : `?evm_address=${address}`}`
      )
        .then((res) => res.json())
        .then((res) => TxnsSchema.parse(res).transactions);
    }
  );

  if (error) {
    console.error(error);
  }

  const button = useMemo(() => {
    if (isSSR()) return null;
    if (isConnected)
      return (
        <button
          type="button"
          onClick={() => setViewSelfTxs((o) => !o)}
          className="p-0 text-sm text-gray-500 hover:underline"
        >
          {viewSelfTxs ? "View all" : "View own txs"}
        </button>
      );
    return (
      <ConnectKitButton.Custom>
        {({ show }) => {
          return (
            <button
              onClick={show}
              type="button"
              className="p-0 text-sm text-gray-500 hover:underline"
            >
              Connect wallet to view your own txs
            </button>
          );
        }}
      </ConnectKitButton.Custom>
    );
  }, [isConnected, viewSelfTxs]);

  return (
    <div className="flex flex-col h-[450px]">
      <div className="flex justify-between mb-1">
        <span className="text-xl">Recent transactions</span>
        {button}
      </div>

      <div className="grid overflow-y-auto auto-rows-auto w-full grid-cols-[repeat(3,max-content)_1fr_1fr_1fr_max-content] scrollbar-hide">
        {[
          "time",
          "icy",
          "sats",
          "btc address",
          "icy tx id",
          "btc tx id",
          "status",
        ].map((h) => {
          return (
            <span
              key={h}
              className={cn(
                "flex gap-x-1 p-2 mb-1 text-xs font-medium text-gray-500 uppercase whitespace-nowrap border-b border-gray-700",
                { "justify-end": h === "icy" || h === "sats" }
              )}
            >
              {h === "icy" ? (
                <Image
                  className="flex-shrink-0"
                  src="/ICY.png"
                  width={16}
                  height={16}
                  alt=""
                />
              ) : null}
              {h === "sats" ? (
                <Image
                  className="flex-shrink-0 p-0.5 bg-white rounded-full"
                  src="/satoshi.png"
                  width={16}
                  height={16}
                  alt=""
                />
              ) : null}
              {h}
            </span>
          );
        })}
        {txns?.slice(0, TOP_RESULT_COUNT).map((tx) => {
          return (
            <React.Fragment key={tx.swap_transaction_hash}>
              <span className={cell()}>
                {format(tx.created_at, "yyyy-MM-dd hh:mm")}
              </span>
              <span className={cell({ className: "font-mono justify-end" })}>
                {commify(formatUnits(BigInt(tx.icy_swap_tx.icy_amount), 18))}
              </span>
              <span className={cell({ className: "font-mono justify-end" })}>
                <Tooltip
                  content={
                    <div className="grid auto-rows-auto text-sm font-normal grid-cols-[max-content_max-content]">
                      <span className="text-gray-400">Rate:</span>
                      <span className="text-right">
                        1 ICY ≈ {commify(Math.floor(Number(tx.subtotal) / Number(formatUnits(BigInt(tx.icy_swap_tx.icy_amount), 18))))} SATS
                      </span>
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-right">
                        {commify(tx.subtotal)} SATS
                      </span>
                      <span className="pb-1 text-gray-400 border-b border-gray-300">
                        Service Fee:
                      </span>
                      <span className="pb-1 text-right border-b border-gray-300">
                        {Number(tx.service_fee) > 0
                          ? `-${commify(tx.service_fee)} SATS`
                          : `0 SATS`}
                      </span>
                      <span className="py-1 text-white">Final Amount:</span>
                      <span className="py-1 text-right text-white">
                        {`${commify(tx.total)} SATS`}
                      </span>
                    </div>
                  }
                >
                  {commify(tx.total)}
                </Tooltip>
              </span>
              <Address
                display={tx.btc_address}
                value={`${BTC_EXPLORER}/address/${tx.btc_address}`}
              />
              <Address
                display={tx.swap_transaction_hash}
                value={`${theChain.blockExplorers.default.url}/tx/${tx.swap_transaction_hash}`}
              />
              <Address
                display={tx.btc_transaction_hash}
                value={`${BTC_EXPLORER}/tx/${tx.btc_transaction_hash}`}
              />
              <Status value={tx.status} />
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

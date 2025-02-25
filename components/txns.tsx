import { BASE_URL, BTC_EXPLORER } from "@/envs";
import { truncate } from "@dwarvesf/react-utils";
import { CheckIcon, ClipboardIcon } from "@heroicons/react/24/outline";
import { format } from "date-fns";
import { useClipboard } from "@dwarvesf/react-hooks";
import React from "react";
import { useAccount } from "wagmi";
import { VariantProps, cva } from "class-variance-authority";
import { cn, fetchKeys } from "@/lib/utils";
import useSWR from "swr";
import { Txns as TxnsSchema } from "@/schemas";
import { Tooltip } from "@mochi-ui/core";
import { ConnectKitButton } from "connectkit";
import Image from "next/image";

const cell = cva(
  "self-center p-2 h-full text-sm whitespace-nowrap border-b border-gray-700 flex items-center"
);

const status = cva("capitalize", {
  variants: {
    state: {
      completed: "text-green-500",
      failed: "text-red-700",
      in_progress: "text-blue-600",
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
  const { hasCopied, onCopy } = useClipboard(value || "");
  if (!value) return <span className={cell()}>⎯</span>;
  return (
    <button
      type="button"
      onClick={onCopy}
      className={cell({ className: "flex gap-x-1 cursor-pointer" })}
    >
      <span className="font-mono">{truncate(display ?? "", 8, true)}</span>
      {hasCopied ? (
        <CheckIcon className="w-4 h-4" />
      ) : (
        <ClipboardIcon className="w-4 h-4" />
      )}
    </button>
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
  const { address, chain } = useAccount();
  const { data: txns, error } = useSWR(
    [fetchKeys.TXNS, address],
    async (keys) => {
      const [, address] = keys;
      if (!address) return [];
      return fetch(`${BASE_URL}/transactions?evm_address=${address}`)
        .then((res) => res.json())
        .then((res) => TxnsSchema.parse(res).transactions);
    }
  );

  if (error) {
    console.error(error);
  }

  return (
    <div className="grid overflow-y-auto auto-rows-auto w-full grid-cols-[max-content_1fr_1fr_1fr_1fr_1fr_1fr] scrollbar-hide">
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
            className="flex gap-x-1 p-2 mb-1 text-xs font-medium text-gray-500 uppercase whitespace-nowrap border-b border-gray-700"
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
      {txns?.length ? (
        txns?.slice(0, 5).map((tx) => {
          return (
            <React.Fragment key={tx.swap_transaction_hash}>
              <span className={cell()}>
                {format(tx.created_at, "yyyy-MM-dd hh:mm")}
              </span>
              <span className={cell({ className: "font-mono" })}>
                {tx.amount}
              </span>
              <span className={cell({ className: "font-mono" })}>
                <Tooltip
                  content={
                    <div className="grid auto-rows-auto text-sm font-normal grid-cols-[max-content_max-content]">
                      <span className="text-gray-400">Rate:</span>
                      <span className="text-right">
                        1 ICY ≈ {Math.floor((1 / rate) * Math.pow(10, 8))} SATS
                      </span>
                      <span className="text-gray-400">Amount:</span>
                      <span className="text-right">{tx.amount} SATS</span>
                      <span className="pb-1 text-gray-400 border-b border-gray-300">
                        Service Fee
                      </span>
                      <span className="pb-1 text-right border-b border-gray-300">
                        -TODO SATS
                      </span>
                      <span className="py-1 text-white">Final Amount:</span>
                      <span className="py-1 text-right text-white">
                        {tx.amount} SATS
                      </span>
                    </div>
                  }
                >
                  {tx.amount}
                </Tooltip>
              </span>
              <Address
                display={tx.btc_address}
                value={`${BTC_EXPLORER}/address/${tx.btc_address}`}
              />
              <Address
                display={tx.swap_transaction_hash}
                value={`${chain?.blockExplorers?.default.url}/tx/${tx.swap_transaction_hash}`}
              />
              <Address
                display={tx.btc_transaction_hash}
                value={`${BTC_EXPLORER}/tx/${tx.btc_address}`}
              />
              <Status value={tx.status} />
            </React.Fragment>
          );
        })
      ) : (
        <ConnectKitButton.Custom>
          {({ show }) => {
            return (
              <button
                onClick={show}
                type="button"
                className="col-span-7 p-2 text-center text-gray-500 transition hover:text-white"
              >
                ⎯ Connect wallet to view ⎯
              </button>
            );
          }}
        </ConnectKitButton.Custom>
      )}
    </div>
  );
}

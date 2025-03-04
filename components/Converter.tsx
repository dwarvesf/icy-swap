import { formatUnits } from "viem";
import React, { useState } from "react";
import cln from "classnames";
import { useAccount, useBalance, useWatchAsset } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";
import { cn } from "@/lib/utils";
import {
  Modal,
  ModalTrigger,
  ModalPortal,
  ModalOverlay,
  ModalContent,
  ModalTitle,
  ModalDescription,
  Button,
  Tooltip,
} from "@mochi-ui/core";

const Input = (props: {
  label: string;
  disableQuickFill?: boolean;
  token: { address?: `0x${string}`; icon: string; symbol: string };
  value: string;
  onChange: (v: string) => void;
  onAddToken?: () => void;
  feeRate?: number;
}) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: props.token.address,
    address,
  });

  const formatted = (+formatUnits(
    balance?.value ?? BigInt(0),
    balance?.decimals ?? 0
  )).toFixed(2);

  const symbol = balance?.symbol ? `$${balance.symbol}` : "";

  return (
    <div className="flex relative z-10 flex-col py-2 px-3 bg-gray-100 rounded shadow-md md:py-4 md:px-5">
      <div className="flex justify-between">
        <p className="text-xs font-medium text-gray-500">{props.label}</p>
        {balance && props.token.address ? (
          <button
            disabled={props.disableQuickFill}
            type="button"
            onClick={() => props.onChange(formatted)}
            className="text-xs text-gray-500"
          >
            Balance: {formatted} {symbol}
          </button>
        ) : null}
      </div>
      <div className="flex justify-between mt-4">
        <input
          value={props.value}
          onChange={(e) =>
            !Number.isNaN(Number(e.target.value)) &&
            props.onChange(e.target.value)
          }
          type="text"
          placeholder="0.00"
          className="p-0 mr-5 min-w-0 text-2xl bg-transparent !ring-transparent !border-none !shadow-none outline-none focus:outline-none text-foreground"
        />
        <button
          type="button"
          onClick={props.onAddToken}
          className="flex flex-shrink-0 items-center py-1 pr-2 pl-1 space-x-1.5 bg-white rounded-full border border-gray-200"
        >
          <Image
            className="flex-shrink-0"
            src={props.token.icon}
            width={24}
            height={24}
            alt=""
          />
          <p className="font-medium text-gray-700">{props.token.symbol}</p>
        </button>
      </div>
    </div>
  );
};

export const Converter = ({
  tokenA,
  tokenB,
  setAmountTokenA,
  setAmountTokenB,
  rate,
  children,
  addressTokenB,
  setAddressTokenB,
  feeRate,
  minSats,
}: {
  tokenA: string;
  setAmountTokenA: (v: string) => void;
  tokenB: string;
  setAmountTokenB: (v: string) => void;
  rate: number;
  addressTokenB: string;
  setAddressTokenB: (v: string) => void;
  children?: React.ReactNode;
  feeRate: number;
  minSats: string;
}) => {
  const { watchAsset } = useWatchAsset();
  const requestWatch = async ({
    address,
    symbol,
    decimals,
  }: {
    address: `0x${string}`;
    symbol: string;
    decimals: number;
  }) => {
    watchAsset({
      type: "ERC20",
      options: {
        address,
        symbol,
        decimals,
      },
    });
  };
  const [modalFee, setModalFee] = useState(false);

  return (
    <div
      className={cln("flex-col flex max-w-[280px]", {
        "space-y-3": !Boolean(children),
      })}
    >
      <Input
        value={tokenA}
        onChange={(v) => {
          if (!rate) return;
          setAmountTokenA(v);
          setAmountTokenB(`${Math.floor(Number(v) * rate)}`);
        }}
        label="From"
        token={{
          icon: "/ICY.png",
          symbol: "ICY",
          address: contractAddress,
        }}
        onAddToken={() =>
          requestWatch({
            address: ICY_CONTRACT_ADDRESS,
            symbol: "ICY",
            decimals: 18,
          })
        }
      />
      {children ? (
        children
      ) : (
        <ArrowDownIcon width={20} height={20} className="mx-auto text-white" />
      )}
      <Input
        value={tokenB}
        onChange={(v) => {
          if (!rate) return;
          setAmountTokenB(Math.floor(+v).toString());
          setAmountTokenA(`${Number(v) / rate}`);
        }}
        label="To"
        token={{
          icon: "/satoshi.png",
          symbol: "SATS",
        }}
        feeRate={feeRate}
      />
      <div className="flex flex-col py-2 px-3 bg-white rounded md:py-4 md:px-5">
        <div className="flex gap-x-1 items-center">
          <span className="text-xs font-medium text-gray-500">
            To BTC address
          </span>
          <Tooltip
            className="relative z-20"
            content={
              <div className="max-w-xs font-normal text-white">
                <p>
                  Base and Bitcoin doesn&apos;t share the same wallet address
                  format.
                </p>
                <p>
                  So we can&apos;t assume sending addr == receiving addr, hence
                  this field.
                </p>
              </div>
            }
          >
            <QuestionMarkCircleIcon className="w-4 h-4 text-gray-500" />
          </Tooltip>
        </div>
        <input
          value={addressTokenB}
          onChange={(e) => setAddressTokenB(e.target.value)}
          className="text-2xl mt-4 p-0 w-full bg-transparent border-none !ring-transparent focus:ring-transparent outline-none focus:outline-none text-foreground"
        />
      </div>

      <Modal modal={modalFee}>
        <ModalTrigger asChild>
          <button
            onClick={() => setModalFee(true)}
            type="button"
            className={cn(
              "self-start mt-1 text-gray-500 flex text-xs font-medium hover:underline hover:cursor-pointer"
            )}
          >
            {(feeRate ?? 0) * 100}% Service Fee, min {minSats} SATS
          </button>
        </ModalTrigger>
        <ModalPortal>
          <ModalOverlay />
          <ModalContent className="!p-5 max-w-sm overflow-hidden">
            <div className="flex relative flex-col">
              <ModalTitle className="relative">About service fee</ModalTitle>
              <ModalDescription className="flex relative flex-col gap-y-2 mt-5">
                <span className="font-medium">
                  You&apos;re sending fund to a Bitcoin wallet
                </span>
                <span>
                  Exchange to Bitcoin addresses can only be done through
                  on-chain transfer, which will be sent on blockchain, which
                  network fees charged.
                </span>
              </ModalDescription>
              <ModalTrigger asChild className="relative">
                <Button
                  className="mt-3 w-full"
                  onClick={() => setModalFee(false)}
                >
                  OK
                </Button>
              </ModalTrigger>
            </div>
          </ModalContent>
        </ModalPortal>
      </Modal>
    </div>
  );
};

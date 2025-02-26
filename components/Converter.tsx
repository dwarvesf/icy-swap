import { formatUnits } from "viem";
import React from "react";
import cln from "classnames";
import { useAccount, useBalance, useWatchAsset } from "wagmi";
import { Tooltip, TooltipContent, TooltipTrigger } from "components/ui/tooltip";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";
import { QuestionMarkCircleIcon } from "@heroicons/react/24/solid";

const Input = (props: {
  label: string;
  disableQuickFill?: boolean;
  token: { address?: `0x${string}`; icon: string; symbol: string };
  value: string;
  onChange: (v: string) => void;
  onAddToken?: () => void;
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
}: {
  tokenA: string;
  setAmountTokenA: (v: string) => void;
  tokenB: string;
  setAmountTokenB: (v: string) => void;
  rate: number;
  addressTokenB: string;
  setAddressTokenB: (v: string) => void;
  children?: React.ReactNode;
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
          setAmountTokenB(
            `${Math.floor((Number(v) / rate) * Math.pow(10, 8))}`
          );
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
          setAmountTokenA(`${(Number(v) * rate) / Math.pow(10, 8)}`);
        }}
        label="To"
        token={{
          icon: "/satoshi.png",
          symbol: "SATS",
        }}
      />
      <div className="flex flex-col py-2 px-3 bg-white rounded md:py-4 md:px-5">
        <span className="text-xs font-medium text-gray-500">
          To BTC address
        </span>
        <input
          value={addressTokenB}
          onChange={(e) => setAddressTokenB(e.target.value)}
          className="text-2xl mt-4 p-0 w-full bg-transparent border-none !ring-transparent focus:ring-transparent outline-none focus:outline-none text-foreground"
        />
      </div>
      <Tooltip delayDuration={100}>
        <TooltipTrigger className="inline-flex items-center w-max text-sm text-left text-white hover:underline">
          <QuestionMarkCircleIcon className="mr-1 w-4 h-4" />
          Why do I need this address
        </TooltipTrigger>
        <TooltipContent className="max-w-xs">
          <p>
            Base and Bitcoin doesn&apos;t share the same wallet address format.
          </p>
          <p>
            So we can&apos;t assume sending addr == receiving addr, hence this
            field.
          </p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
};

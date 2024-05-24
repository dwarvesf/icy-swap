import { formatUnits } from "viem";
import React, { useEffect } from "react";
import cln from "classnames";
import { useAccount, useBalance } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { ICY_CONTRACT_ADDRESS, RATE, USDC_CONTRACT_ADDRESS } from "../envs";
import { ArrowDownIcon } from "@heroicons/react/20/solid";

const Input = (props: {
  label: string;
  disableQuickFill?: boolean;
  token: { address: `0x${string}`; icon: string; symbol: string };
  value: string;
  onChange: (v: string) => void;
  onAddToken: () => void;
}) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: props.token.address,
    address,
  });

  const formatted = formatUnits(
    balance?.value ?? BigInt(0),
    balance?.decimals ?? 0
  );

  const symbol = balance?.symbol ? `$${balance.symbol}` : "";

  return (
    <div className="flex relative z-10 flex-col py-2 px-3 bg-gray-100 rounded shadow-md md:py-4 md:px-5">
      <div className="flex justify-between">
        <p className="text-xs font-medium text-gray-500">{props.label}</p>
        <button
          disabled={props.disableQuickFill}
          type="button"
          onClick={() => props.onChange(formatted)}
          className="text-xs text-gray-500"
        >
          Balance: {formatted} {symbol}
        </button>
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
  setUsdc,
  icy,
  usdc,
  setIcy,
  onChange,
  children,
}: {
  icy: string;
  setIcy: (v: string) => void;
  usdc: string;
  setUsdc: (v: string) => void;
  onChange: (value: bigint) => void;
  children?: React.ReactNode;
}) => {
  const requestWatch = async ({
    address,
    symbol,
    decimals,
  }: {
    address: `0x${string}`;
    symbol: string;
    decimals: number;
  }) => {
    await window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address,
          symbol,
          decimals,
        },
      },
    });
  };

  useEffect(() => {
    if (icy.endsWith(".")) return;
    let num = Number(icy);
    let diffDeci = 0;
    while (num !== 0 && !Number.isInteger(num)) {
      diffDeci += 1;
      num *= 10;
    }
    if (icy) {
      onChange(BigInt(num) * BigInt(10 ** (18 - diffDeci)));
    } else {
      onChange(BigInt(0));
    }
  }, [icy, onChange]);

  return (
    <div
      className={cln("flex-col flex max-w-[280px]", {
        "space-y-3": !Boolean(children),
      })}
    >
      <Input
        value={icy}
        onChange={(v) => {
          setIcy(v);
          setUsdc(`${Number(v) * RATE}`);
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
        value={usdc}
        onChange={(v) => {
          setUsdc(v);
          setIcy(`${Number(v) / RATE}`);
        }}
        label="To"
        token={{
          icon: "/usdc.webp",
          symbol: "USDC",
          address: USDC_CONTRACT_ADDRESS,
        }}
        onAddToken={() =>
          requestWatch({
            address: USDC_CONTRACT_ADDRESS,
            symbol: "USDC",
            decimals: 6,
          })
        }
      />
    </div>
  );
};

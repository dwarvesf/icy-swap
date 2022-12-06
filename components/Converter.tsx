import React, { useEffect, useState } from "react";
import cln from "classnames";
import { useAccount, useBalance } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { BigNumber } from "bignumber.js";
import { RATE, USDC_CONTRACT_ADDRESS } from "../envs";

const Input = (props: {
  label: string;
  disableQuickFill?: boolean;
  token: { address: `0x${string}`; icon: string; symbol: string };
  value: string;
  onChange: (v: string) => void;
}) => {
  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: props.token.address,
    addressOrName: address,
    watch: true,
  });

  return (
    <div className="relative z-10 shadow-md flex flex-col bg-gray-100 rounded md:px-5 md:py-4 px-3 py-2">
      <div className="flex justify-between">
        <p className="text-xs font-medium text-gray-500">{props.label}</p>
        <button
          disabled={props.disableQuickFill}
          type="button"
          onClick={() => props.onChange(balance?.formatted ?? "")}
          className="text-xs text-gray-500"
        >
          Balance: {balance?.formatted} ${balance?.symbol}
        </button>
      </div>
      <div className="flex mt-4 justify-between">
        <input
          value={props.value}
          onChange={(e) => props.onChange(e.target.value)}
          type="number"
          placeholder="0.00"
          min={0}
          className="mr-5 min-w-0 focus:shadow-none text-2xl bg-transparent border-none outline-none focus:outline-none form-input p-0"
        />
        <div className="flex-shrink-0 flex rounded-full bg-white border border-gray-200 py-1 px-2 space-x-2 items-center">
          <Image
            className="flex-shrink-0"
            src={props.token.icon}
            width={24}
            height={24}
            alt=""
          />
          <p className="font-medium text-gray-700">{props.token.symbol}</p>
        </div>
      </div>
    </div>
  );
};

export const Converter = ({
  onChange,
  children,
}: {
  onChange: (value: BigNumber) => void;
  children: React.ReactNode;
}) => {
  const [icy, setIcy] = useState("");
  const [usdc, setUsdc] = useState("");

  useEffect(() => {
    if (icy) {
      onChange(new BigNumber(icy).times(10 ** 18));
    } else {
      onChange(new BigNumber(0));
    }
  }, [icy, onChange]);

  return (
    <div className={cln("flex-col flex max-w-[280px]")}>
      <Input
        value={icy}
        onChange={(v) => {
          setIcy(v);
          setUsdc(`${Number(v) * RATE}`);
        }}
        label="From"
        token={{
          icon: "/ICY.webp",
          symbol: "ICY",
          address: contractAddress,
        }}
      />
      {children}
      <Input
        value={usdc}
        onChange={(v) => {
          setUsdc(v);
          setIcy(`${Number(v) / RATE}`);
        }}
        label="To"
        token={{
          icon: "/USDC.webp",
          symbol: "USDC",
          address: USDC_CONTRACT_ADDRESS,
        }}
      />
    </div>
  );
};

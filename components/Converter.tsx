import { ArrowsUpDownIcon } from "@heroicons/react/20/solid";
import React, { useEffect, useState } from "react";
import cln from "classnames";
import { useAccount, useBalance } from "wagmi";
import Image from "next/image";
import { address as contractAddress } from "../contract/icy";
import { BigNumber } from "bignumber.js";
import { USDC_CONTRACT_ADDRESS } from "../envs";

const RATE = 1.5;

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
    <div className="shadow-md flex flex-col bg-gray-100 rounded md:px-5 md:py-4 px-3 py-2">
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
  fromIcy,
  setFromIcy,
}: {
  onChange: (value: BigNumber) => void;
  fromIcy: boolean;
  setFromIcy: () => void;
}) => {
  const [icy, setIcy] = useState("");
  const [usdc, setUsdc] = useState("");

  useEffect(() => {
    if (icy && fromIcy) {
      onChange(new BigNumber(icy).times(10 ** 18));
    } else if (usdc && !fromIcy) {
      onChange(new BigNumber(usdc).times(10 ** 6));
    } else {
      onChange(new BigNumber(0));
    }
  }, [icy, usdc, onChange, fromIcy]);

  return (
    <div
      className={cln("flex gap-y-3 max-w-[280px]", {
        "flex-col": fromIcy,
        "flex-col-reverse": !fromIcy,
      })}
    >
      <Input
        value={icy}
        onChange={(v) => {
          setIcy(v);
          setUsdc(`${Number(v) * RATE}`);
        }}
        label={fromIcy ? "From" : "To"}
        token={{
          icon: "/ICY.webp",
          symbol: "ICY",
          address: contractAddress,
        }}
      />
      <button
        type="button"
        onClick={setFromIcy}
        className="mx-auto rounded p-1 text-gray-700 hover:bg-gray-100"
      >
        {/* <ArrowDownIcon width={20} height={20} /> */}
        <ArrowsUpDownIcon width={20} height={20} />
      </button>
      <Input
        value={usdc}
        onChange={(v) => {
          setUsdc(v);
          setIcy(`${Number(v) / RATE}`);
        }}
        label={fromIcy ? "To" : "From"}
        token={{
          icon: "/USDC.webp",
          symbol: "USDC",
          address: USDC_CONTRACT_ADDRESS,
        }}
      />
    </div>
  );
};

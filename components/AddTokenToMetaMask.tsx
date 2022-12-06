import Image from "next/image";
import React from "react";

const scale = 60;

export const AddTokenToMetaMask = (props: {
  address: string;
  symbol: string;
  decimals: number;
}) => {
  const requestWatch = async () => {
    await window.ethereum?.request({
      method: "wallet_watchAsset",
      params: {
        type: "ERC20",
        options: {
          address: props.address,
          symbol: props.symbol,
          decimals: props.decimals,
        },
      },
    });
  };

  return (
    <button
      onClick={requestWatch}
      type="button"
      className="font-light text-xs flex items-center space-x-2 text-white underline"
    >
      <Image
        src="/metamask.svg"
        width={1280 / scale}
        height={827 / scale}
        alt=""
      />
      <p>Track {props.symbol} in MetaMask</p>
    </button>
  );
};

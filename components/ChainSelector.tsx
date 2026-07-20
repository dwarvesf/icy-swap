import React from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { base } from "wagmi/chains";
import { useAccount, useSwitchChain } from "wagmi";
import Image from "next/image";

// TODO: chain
const theChain = base;

/**
 * Base is the only chain this app serves, so the picker was a dropdown whose
 * menu held exactly one item: a control that cannot change anything. What is
 * left is a label, which becomes a real action only when the wallet is
 * somewhere else and there is genuinely something to switch.
 */
export const ChainSelector = () => {
  const { chain, isConnected } = useAccount();
  const { switchChain, isPending } = useSwitchChain();

  if (isConnected && chain && chain.id !== theChain.id) {
    return (
      <button
        type="button"
        onClick={() => switchChain?.({ chainId: theChain.id })}
        disabled={isPending}
        className="flex gap-2 items-center py-1.5 px-3 min-h-[32px] text-sm font-medium rounded-lg border transition-colors bg-brand/10 border-brand/40 text-brand-300 hover:bg-brand/20 focus-visible:ring-2 focus-visible:ring-brand disabled:opacity-60"
      >
        <ExclamationTriangleIcon width={16} height={16} />
        {isPending ? "Switching..." : `Switch to ${theChain.name}`}
      </button>
    );
  }

  return (
    <span className="flex gap-2 items-center py-1.5 px-3 min-h-[32px] text-sm font-medium rounded-lg text-ink-2">
      <Image width={16} height={16} src="/base.webp" alt="" />
      {theChain.name}
    </span>
  );
};

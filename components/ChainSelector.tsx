import React from "react";
import { Listbox } from "@headlessui/react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { ChevronDownIcon } from "@heroicons/react/20/solid";
import { chain as defaultChain, useNetwork, useSwitchNetwork } from "wagmi";
import Image from "next/image";
import cln from "classnames";

export const ChainSelector = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();

  const wrongChain =
    chain?.unsupported || chain?.id !== defaultChain.polygon.id;

  return (
    <Listbox onChange={(id) => switchNetwork?.(Number(id))}>
      <div className="relative">
        <Listbox.Button
          className={({ open }) =>
            cln(
              "space-x-2 h-full text-white hover:bg-white/5 active:bg-white/5 px-2 rounded-lg flex items-center transition-all duration-100 ease-in-out",
              {
                "bg-white/10": open,
              }
            )
          }
        >
          {wrongChain ? (
            <>
              <ExclamationTriangleIcon height={20} width={20} />
              <p className="text-sm font-medium">Unsupported</p>
            </>
          ) : (
            <>
              <Image width={16} height={16} src="/polygon.svg" alt="" />
              <p className="text-sm font-medium">Polygon</p>
            </>
          )}
          <ChevronDownIcon width={20} height={20} />
        </Listbox.Button>
        <Listbox.Options className="absolute left-0 top-full p-2 rounded-lg border border-gray-700 shadow translate-y-2 min-w-[200px] bg-foreground-100">
          <Listbox.Option
            className="flex items-center p-2 space-x-2 text-white rounded-lg transition-all duration-100 ease-in-out cursor-pointer hover:bg-white/5"
            value={defaultChain.polygon.id}
          >
            <Image width={16} height={16} src="/polygon.svg" alt="" />
            <p>Polygon</p>
          </Listbox.Option>
        </Listbox.Options>
      </div>
    </Listbox>
  );
};

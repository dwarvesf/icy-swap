import { ConnectKitButton } from "connectkit";
import {
  useSwitchNetwork,
  useNetwork,
  useAccount,
  chain as defaultChain,
  useBalance,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Stepper } from "../Stepper";
import { isSSR } from "@dwarvesf/react-utils";
import { Converter } from "../Converter";
import { useEffect, useReducer, useState } from "react";
import cln from "classnames";
import { BigNumber } from "bignumber.js";
import {
  ICY_CONTRACT_ADDRESS,
  ICY_SWAPPER_CONTRACT_ADDRESS,
  USDC_CONTRACT_ADDRESS,
} from "../../envs";
import { abi as swapperABI } from "../../contract/swapper";
import { useApproveToken } from "../../hooks/useApproveToken";
import { Spinner } from "../Spinner";
import { AddTokenToMetaMask } from "../AddTokenToMetaMask";

export const Swap = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isConnected } = useAccount();
  const [fromIcy, toggleFromIcy] = useReducer((fromIcy) => !fromIcy, true);

  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: fromIcy ? ICY_CONTRACT_ADDRESS : USDC_CONTRACT_ADDRESS,
    addressOrName: address,
    watch: true,
  });

  const [value, setValue] = useState(new BigNumber(0));

  const { config, error } = usePrepareContractWrite({
    address: ICY_SWAPPER_CONTRACT_ADDRESS,
    abi: swapperABI,
    functionName: "swap",
    args: [
      fromIcy ? ICY_CONTRACT_ADDRESS : USDC_CONTRACT_ADDRESS,
      value.toString(),
    ],
  });

  const isOutOfMoneyError = error?.message
    ?.toLowerCase()
    .includes("out of money");

  const {
    data,
    write,
    isLoading: confirmingSwap,
  } = useContractWrite(config as any);

  const { data: swapResult, isLoading: swapping } = useWaitForTransaction(data);

  const {
    confirmingApprove,
    approving,
    isApproved,
    approve: _approve,
  } = useApproveToken(
    value.toString(),
    fromIcy ? ICY_CONTRACT_ADDRESS : USDC_CONTRACT_ADDRESS,
    address
  );

  const notEnoughBal = !balance || balance.value.lt(value.toString());

  const [tx, setTx] = useState("");

  const swap = () => {
    setTx("");
    write?.();
  };

  const approve = () => {
    setTx("");
    _approve?.();
  };

  useEffect(() => {
    if (swapResult && chain) {
      setTx(
        `${chain?.blockExplorers?.default.url}/tx/${swapResult.transactionHash}`
      );
    }
  }, [swapResult, chain]);

  if (chain?.unsupported) {
    return (
      <div className="mt-16 flex flex-col items-center justify-center">
        <ConnectKitButton />
        <p className="mt-3 text-xl font-medium w-96 text-center">
          You need to connect to the{" "}
          <button
            type="button"
            onClick={() => switchNetwork?.(defaultChain.polygon.id)}
            className="text-[#8247e5] underline"
          >
            Polygon
          </button>{" "}
          network to swap $ICY
        </p>
      </div>
    );
  }

  return (
    <div className="mt-16 flex flex-col items-center justify-center">
      <ConnectKitButton />
      {(isConnected || isSSR()) && (
        <>
          <div className="flex flex-col items-center gap-2 mt-3">
            <AddTokenToMetaMask
              address={ICY_CONTRACT_ADDRESS}
              decimals={18}
              symbol="ICY"
            />
            <AddTokenToMetaMask
              address={USDC_CONTRACT_ADDRESS}
              decimals={6}
              symbol="USDC"
            />
          </div>
          <div className="mt-10">
            <Converter
              fromIcy={fromIcy}
              setFromIcy={toggleFromIcy}
              onChange={setValue}
            />
          </div>
          <button
            type="button"
            className={cln("mt-4 text-white px-5 py-2.5 rounded-sm", {
              "bg-gray-200":
                value.isZero() || value.isNegative() || notEnoughBal,
              "bg-brand": !value.isZero() && !value.isNegative(),
            })}
            disabled={value.isZero() || value.isNegative() || notEnoughBal}
            onClick={!isApproved ? approve : swap}
          >
            {confirmingSwap || confirmingApprove || swapping || approving ? (
              <Spinner className="w-5 h-5" />
            ) : !isApproved ? (
              "Approve"
            ) : (
              `Swap $${fromIcy ? "ICY" : "USDC"} for $${
                fromIcy ? "USDC" : "ICY"
              }`
            )}
          </button>

          {isOutOfMoneyError ? (
            <p className="mt-2 text-red-400 font-medium">
              Error: contract out of money
            </p>
          ) : null}

          <div className="mt-12 flex w-72">
            <Stepper.Container
              current={
                !isConnected
                  ? 1
                  : value.isZero() || value.isNegative() || notEnoughBal
                  ? 2
                  : !tx
                  ? 3
                  : 4
              }
              loading={
                confirmingSwap || swapping || confirmingApprove || approving
              }
            >
              <Stepper.Step num={1} title="Step 1">
                Connect your wallet to Polygon network
              </Stepper.Step>
              <Stepper.Step num={2} title="Step 2">
                {notEnoughBal
                  ? "You don't have enough balance!"
                  : "Specify how much you want to receive"}
              </Stepper.Step>
              <Stepper.Step num={3} title="Step 3">
                {!isApproved
                  ? "Approve the swapping amount"
                  : "Perform the swap"}
              </Stepper.Step>
              <Stepper.Step num={4} title="Step 4">
                Check your balance,{" "}
                <a
                  className={cln({
                    "underline text-blue-300": tx,
                  })}
                  href={!tx ? "#" : tx}
                  rel="noreferrer"
                  target="_blank"
                >
                  tx receipt
                </a>
              </Stepper.Step>
            </Stepper.Container>
          </div>
        </>
      )}
    </div>
  );
};

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
import { useEffect, useState } from "react";
import cln from "classnames";
import { BigNumber } from "bignumber.js";
import { ICY_CONTRACT_ADDRESS, ICY_SWAPPER_CONTRACT_ADDRESS } from "../../envs";
import { abi as swapperABI } from "../../contract/swapper";
import { useApproveToken } from "../../hooks/useApproveToken";
import { Spinner } from "../Spinner";

export const Swap = () => {
  const { chain } = useNetwork();
  const { switchNetwork } = useSwitchNetwork();
  const { isConnected } = useAccount();

  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: ICY_CONTRACT_ADDRESS,
    addressOrName: address,
    watch: true,
  });

  const [icy, setIcy] = useState(new BigNumber(0));

  const { config } = usePrepareContractWrite({
    address: ICY_SWAPPER_CONTRACT_ADDRESS,
    abi: swapperABI,
    functionName: "swap",
    args: [ICY_CONTRACT_ADDRESS, icy.toString()],
  });

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
  } = useApproveToken(icy.toString(), address);

  const notEnoughBal = !balance || balance.value.lt(icy.toString());

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
          <div className="mt-10">
            <Converter onChange={setIcy} />
          </div>
          <button
            type="button"
            className={cln("mt-4 text-white px-5 py-2.5 rounded-sm", {
              "bg-gray-200": icy.isZero() || icy.isNegative() || notEnoughBal,
              "bg-brand": !icy.isZero() && !icy.isNegative(),
            })}
            disabled={icy.isZero() || icy.isNegative() || notEnoughBal}
            onClick={!isApproved ? approve : swap}
          >
            {confirmingSwap || confirmingApprove || swapping || approving ? (
              <Spinner className="w-5 h-5" />
            ) : !isApproved ? (
              "Approve"
            ) : (
              "Swap $ICY for $USDC"
            )}
          </button>

          <div className="mt-12 flex w-72">
            <Stepper.Container
              current={
                !isConnected
                  ? 1
                  : icy.isZero() || icy.isNegative() || notEnoughBal
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
                  : "Specify how much $USDC you want to receive"}
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

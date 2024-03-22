import {
  useAccount,
  useBalance,
  useBlockNumber,
  useSimulateContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { base } from "wagmi/chains";
import { Converter } from "../Converter";
import { useCallback, useEffect, useState } from "react";
import cln from "classnames";
import { ICY_CONTRACT_ADDRESS, ICY_SWAPPER_CONTRACT_ADDRESS } from "../../envs";
import { abi as swapperABI } from "../../contract/swapper";
import { useApproveToken } from "../../hooks/useApproveToken";
import { Spinner } from "../Spinner";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { formatUnits } from "viem";

const getContractConfig = (value: bigint) => ({
  address: ICY_SWAPPER_CONTRACT_ADDRESS,
  abi: swapperABI,
  functionName: "swap",
  args: [value.toString()],
});

export const Swap = () => {
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { address } = useAccount();
  const { data: balance, queryKey } = useBalance({
    token: ICY_CONTRACT_ADDRESS,
    address,
  });

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient]);

  const [value, setValue] = useState(BigInt(0));

  // @ts-ignore
  const { error } = useSimulateContract(getContractConfig(value));

  const isOutOfMoneyError = error?.message
    ?.toLowerCase()
    .includes("out of money");

  const {
    data,
    writeContractAsync,
    isPending: confirmingSwap,
  } = useWriteContract();

  const { isLoading: swapping } = useWaitForTransactionReceipt({ hash: data });

  const {
    confirmingApprove,
    approving,
    isApproved,
    approve: _approve,
  } = useApproveToken(ICY_CONTRACT_ADDRESS, address, value);

  const notEnoughBal = !balance || balance.value < value;

  const [icy, setIcy] = useState("");
  const [usdc, setUsdc] = useState("");

  const swap = useCallback(() => {
    if (isApproved) {
      // @ts-ignore
      writeContractAsync(getContractConfig(value))
        .then((data: any) => data.wait())
        .then(async (data: any) => {
          setIcy("");
          setUsdc("");
          toast.success("Success", { position: "bottom-center" });
          fetch(
            `/api/discord?address=${address}&tx=${`${base.blockExplorers?.default.url}/tx/${data.transactionHash}`}&value=${(
              value / BigInt(10 ** 18)
            ).toString()}`
          );
        })
        .catch(() => null);
      toast("Swapping...", {
        position: "bottom-center",
      });
    }
  }, [address, isApproved, value, writeContractAsync]);

  const approve = () => {
    _approve?.();
  };

  const loading = confirmingSwap || confirmingApprove || swapping || approving;

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <Converter
          icy={icy}
          setIcy={setIcy}
          usdc={usdc}
          setUsdc={setUsdc}
          onChange={setValue}
        />
      </div>
      <button
        type="button"
        className={cln("w-1/2 mt-10 text-white px-5 py-2.5 rounded-sm", {
          "bg-gray-400": value <= 0 || notEnoughBal,
          "bg-brand": value > 0,
        })}
        disabled={value <= 0 || notEnoughBal || loading}
        onClick={!isApproved ? approve : swap}
      >
        {loading ? (
          <Spinner className="w-5 h-5" />
        ) : !isApproved ? (
          "Approve"
        ) : (
          "Swap"
        )}
      </button>

      {isOutOfMoneyError ? (
        <p className="mt-2 font-medium text-red-400">
          Error: contract out of money
        </p>
      ) : null}
    </div>
  );
};

import {
  useNetwork,
  useAccount,
  useBalance,
  usePrepareContractWrite,
  useContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { Converter } from "../Converter";
import { useEffect, useState } from "react";
import cln from "classnames";
import { BigNumber } from "bignumber.js";
import { ICY_CONTRACT_ADDRESS, ICY_SWAPPER_CONTRACT_ADDRESS } from "../../envs";
import { abi as swapperABI } from "../../contract/swapper";
import { useApproveToken } from "../../hooks/useApproveToken";
import { Spinner } from "../Spinner";
import toast from "react-hot-toast";

export const Swap = () => {
  const { chain } = useNetwork();

  const { address } = useAccount();
  const { data: balance } = useBalance({
    token: ICY_CONTRACT_ADDRESS,
    addressOrName: address,
    watch: true,
  });

  const [value, setValue] = useState(new BigNumber(0));

  const { config, error } = usePrepareContractWrite({
    address: ICY_SWAPPER_CONTRACT_ADDRESS,
    abi: swapperABI,
    functionName: "swap",
    args: [value.toString()],
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
  } = useApproveToken(ICY_CONTRACT_ADDRESS, address);

  const notEnoughBal = !balance || balance.value.lt(value.toString());

  const swap = () => {
    if (write) {
      write();
      toast("Swapping...", {
        position: "bottom-center",
      });
    }
  };

  const approve = () => {
    _approve?.();
  };

  useEffect(() => {
    if (swapResult && chain) {
      toast.success("Success", { position: "bottom-center" });
    }
  }, [swapResult, chain]);

  return (
    <div className="flex flex-col items-center justify-center">
      <div>
        <Converter onChange={setValue} />
      </div>
      <button
        type="button"
        className={cln("w-1/2 mt-10 text-white px-5 py-2.5 rounded-sm", {
          "bg-gray-400": value.isZero() || value.isNegative() || notEnoughBal,
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
          "Swap"
        )}
      </button>

      {isOutOfMoneyError ? (
        <p className="mt-2 text-red-400 font-medium">
          Error: contract out of money
        </p>
      ) : null}
    </div>
  );
};

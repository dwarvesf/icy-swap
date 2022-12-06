import { BigNumber, constants } from "ethers";
import {
  erc20ABI,
  useContractRead,
  useContractWrite,
  usePrepareContractWrite,
  useWaitForTransaction,
} from "wagmi";
import { ICY_SWAPPER_CONTRACT_ADDRESS } from "../envs";

export function useApproveToken(
  token: `0x${string}`,
  owner: `0x${string}` = constants.AddressZero
) {
  const { data: allowance } = useContractRead({
    functionName: "allowance",
    args: [owner, ICY_SWAPPER_CONTRACT_ADDRESS],
    abi: erc20ABI,
    address: token,
    isDataEqual: (prev, next) => prev === next,
    watch: true,
  });

  const { config } = usePrepareContractWrite({
    address: token,
    abi: erc20ABI,
    functionName: "approve",
    args: [ICY_SWAPPER_CONTRACT_ADDRESS, constants.MaxUint256],
  });

  const {
    data,
    write,
    isLoading: confirmingApprove,
  } = useContractWrite(config);

  const { isLoading: approving } = useWaitForTransaction(data);

  return {
    isApproved: !allowance?.isZero(),
    approve: write,
    confirmingApprove,
    approving,
  };
}

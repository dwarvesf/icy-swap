import { BigNumber as ethersBN, constants } from "ethers";
import { BigNumber } from "bignumber.js";
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
  owner: `0x${string}` = constants.AddressZero,
  value: BigNumber
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
    args: [ICY_SWAPPER_CONTRACT_ADDRESS, ethersBN.from(value.toString())],
  });

  const {
    data,
    write,
    isLoading: confirmingApprove,
  } = useContractWrite(config);

  const { isLoading: approving } = useWaitForTransaction(data);

  const isWithinAllowanceCap = allowance?.gte(value.toString());

  return {
    isApproved: !allowance?.isZero() && isWithinAllowanceCap,
    isWithinAllowanceCap,
    approve: write,
    confirmingApprove,
    approving,
  };
}

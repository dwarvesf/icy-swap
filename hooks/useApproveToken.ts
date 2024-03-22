import { constants } from "ethers";
import { erc20Abi } from "viem";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ICY_SWAPPER_CONTRACT_ADDRESS } from "../envs";

const getConfig = (token: `0x${string}`, value: bigint) => ({
  address: token,
  abi: erc20Abi,
  functionName: "approve",
  args: [ICY_SWAPPER_CONTRACT_ADDRESS, value.toString()],
});

export function useApproveToken(
  token: `0x${string}`,
  owner: `0x${string}` = constants.AddressZero,
  value: bigint
) {
  // @ts-ignore
  const { data: allowance = BigInt(0) } = useReadContract({
    functionName: "allowance",
    args: [owner, ICY_SWAPPER_CONTRACT_ADDRESS],
    abi: erc20Abi,
    address: token,
  });

  const {
    data,
    writeContract,
    isPending: confirmingApprove,
  } = useWriteContract();

  const { isLoading: approving } = useWaitForTransactionReceipt({ hash: data });

  const isWithinAllowanceCap = allowance >= value;

  return {
    isApproved: allowance !== BigInt(0) && isWithinAllowanceCap,
    isWithinAllowanceCap,
    // @ts-ignore
    approve: () => writeContract(getConfig(token, value)),
    confirmingApprove,
    approving,
  };
}

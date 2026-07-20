import { erc20Abi, zeroAddress } from "viem";
import {
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { ICY_SWAPPER_CONTRACT_ADDRESS } from "../envs";
import { theChain } from "@/lib/chain";

const getConfig = (token: `0x${string}`, value: bigint) => ({
  address: token,
  abi: erc20Abi,
  functionName: "approve",
  args: [ICY_SWAPPER_CONTRACT_ADDRESS, value.toString()],
  // Pin the approval to Base: an approval mined on another chain both fails
  // this app and leaves a live allowance where nobody is looking for it.
  chainId: theChain.id,
});

export function useApproveToken(
  token: `0x${string}`,
  owner: `0x${string}` = zeroAddress,
  value: bigint
) {
  const { data: allowance = BigInt(0) } = useReadContract({
    functionName: "allowance",
    args: [owner, ICY_SWAPPER_CONTRACT_ADDRESS],
    abi: erc20Abi,
    address: token,
    // Same pin as the write: an allowance read against the wrong chain
    // reports 0 and walks the user into approving there.
    chainId: theChain.id,
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

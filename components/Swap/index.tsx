import {
  useAccount,
  useBalance,
  useBlockNumber,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Converter } from "../Converter";
import { useCallback, useEffect, useState } from "react";
import cln from "classnames";
import {
  API_KEY,
  BASE_URL,
  ICY_CONTRACT_ADDRESS,
  ICY_SWAPPER_CONTRACT_ADDRESS,
} from "../../envs";
import { abi as swapperABI } from "../../contract/swapper";
import { Spinner } from "../Spinner";
import toast from "react-hot-toast";
import { useQueryClient } from "@tanstack/react-query";
import { validate as validateBtcAddr } from "bitcoin-address-validation";
import { signatureRequest, signatureResponse } from "@/schemas";
import { useApproveToken } from "@/hooks/useApproveToken";
import { maxUint256 } from "viem";
import { mutate } from "swr";
import { fetchKeys } from "@/lib/utils";

const getContractConfig = (
  icy: BigInt,
  btcAddr: string,
  btc: BigInt,
  nonce: BigInt,
  deadline: BigInt,
  signature: string
) => ({
  address: ICY_SWAPPER_CONTRACT_ADDRESS,
  abi: swapperABI,
  functionName: "swap",
  args: [icy, btcAddr, btc, nonce, deadline, signature],
});

export const Swap = ({
  rate,
  minIcy,
  feeRate,
}: {
  rate: number;
  minIcy: number;
  feeRate: number;
}) => {
  const queryClient = useQueryClient();
  const { data: blockNumber } = useBlockNumber({ watch: true });
  const { address } = useAccount();
  const { queryKey } = useBalance({
    token: ICY_CONTRACT_ADDRESS,
    address,
  });
  const [generatingSignature, setGeneratingSignature] = useState(false);

  useEffect(() => {
    queryClient.invalidateQueries({ queryKey });
  }, [blockNumber, queryClient]);

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
  } = useApproveToken(ICY_CONTRACT_ADDRESS, address, maxUint256);

  const [icy, setIcy] = useState("");
  const [btc, setBtc] = useState("");
  const [btcAddress, setBtcAddress] = useState("");

  const swap = useCallback(() => {
    if (!isApproved) return;
    if (!validateBtcAddr(btcAddress)) {
      return;
    }
    const icyAmount = (+icy * 10 ** 18).toLocaleString("fullwide", {
      useGrouping: false,
      maximumFractionDigits: 18,
      notation: "standard",
    });
    const btcAmount = btc;
    if (+btcAmount < 1) {
      window.alert("Invalid BTC amount");
      return;
    }
    setGeneratingSignature(true);
    toast("Swapping...", {
      position: "bottom-center",
    });
    fetch(`${BASE_URL}/swap/generate-signature`, {
      method: "POST",
      headers: {
        Authorization: `ApiKey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(
        signatureRequest.parse({
          btc_address: btcAddress,
          icy_amount: icyAmount,
          btc_amount: btcAmount,
        })
      ),
    })
      .then((res) => res.json())
      .then((res) => {
        const { data } = signatureResponse.parse(res);
        writeContractAsync(
          getContractConfig(
            BigInt(data.icy_amount),
            btcAddress,
            BigInt(data.btc_amount),
            BigInt(data.nonce),
            BigInt(data.deadline),
            `0x${data.signature}`
          )
        )
          .then(async () => {
            setIcy("");
            setBtc("");
            toast.success("Success", { position: "bottom-center" });

            // revalidate txns data
            mutate([fetchKeys.TXNS, true, address]);
            mutate([fetchKeys.TXNS, false, address]);
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            setGeneratingSignature(false);
          });
      });
  }, [icy, btc, btcAddress, isApproved, writeContractAsync, address]);

  const approve = () => {
    _approve?.();
  };

  const loading =
    generatingSignature ||
    confirmingSwap ||
    swapping ||
    confirmingApprove ||
    approving;

  return (
    <div className="flex flex-col justify-center items-center">
      <div>
        <Converter
          tokenA={icy}
          setAmountTokenA={setIcy}
          tokenB={btc}
          setAmountTokenB={setBtc}
          addressTokenB={btcAddress}
          setAddressTokenB={setBtcAddress}
          rate={rate}
          feeRate={feeRate}
        />
      </div>
      <button
        type="button"
        className={cln("w-max mt-10 text-white px-5 py-2.5 rounded-sm", {
          "bg-gray-400":
            +icy < minIcy || !btcAddress || !validateBtcAddr(btcAddress),
          "bg-brand":
            +icy >= minIcy && btcAddress && validateBtcAddr(btcAddress),
        })}
        disabled={loading || +icy < minIcy || !validateBtcAddr(btcAddress)}
        onClick={!isApproved ? approve : swap}
      >
        {loading ? (
          <Spinner className="w-5 h-5" />
        ) : !validateBtcAddr(btcAddress) ? (
          "Invalid BTC address"
        ) : +icy < minIcy ? (
          `Min swap amount: ${minIcy} $ICY`
        ) : !isApproved ? (
          "Approve"
        ) : !rate ? (
          "Cannot fetch rate"
        ) : (
          "Swap"
        )}
      </button>

      {/* {isOutOfMoneyError ? ( */}
      {/*   <p className="mt-2 font-medium text-red-400"> */}
      {/*     Error: contract out of money */}
      {/*   </p> */}
      {/* ) : null} */}
    </div>
  );
};

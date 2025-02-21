import {
  useAccount,
  useBalance,
  useBlockNumber,
  useSimulateContract,
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

export const Swap = ({ rate }: { rate: number }) => {
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
    error: swapError,
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
  const [btc, setBtc] = useState("");
  const [btcAddress, setBtcAddress] = useState("");

  const swap = useCallback(() => {
    if (!isApproved) return;
    if (!validateBtcAddr(btcAddress)) {
      window.alert("BTC address invalid");
      return;
    }
    const icyAmount = (+icy * 10 ** 18).toLocaleString("fullwide", {
      useGrouping: false,
      maximumFractionDigits: 18,
      notation: "standard",
    });
    const btcAmount = Math.floor(+btc * 10 ** 8).toString();
    if (+btcAmount < 1) {
      window.alert("Invalid BTC amount");
      return;
    }
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
          .then((data: any) => data.wait())
          .then(async () => {
            setIcy("");
            setBtc("");
            toast.success("Success", { position: "bottom-center" });
          })
          .catch(() => null);
        toast("Swapping...", {
          position: "bottom-center",
        });
      });
  }, [icy, btc, btcAddress, isApproved, writeContractAsync]);

  const approve = () => {
    _approve?.();
  };

  const loading = confirmingSwap || swapping || confirmingApprove || approving;

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
          onChange={setValue}
          rate={rate}
        />
      </div>
      <button
        type="button"
        className={cln("w-1/2 mt-10 text-white px-5 py-2.5 rounded-sm", {
          "bg-gray-400": value <= 0 || notEnoughBal,
          "bg-brand": value > 0,
        })}
        disabled={value <= 0 || loading || notEnoughBal}
        onClick={!isApproved ? approve : swap}
      >
        {loading ? (
          <Spinner className="w-5 h-5" />
        ) : !isApproved ? (
          "Approve"
        ) : !rate ? (
          "Cannot fetch rate"
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

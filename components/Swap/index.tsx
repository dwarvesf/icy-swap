import {
  useAccount,
  useBalance,
  useBlockNumber,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { Converter } from "../Converter";
import { useCallback, useEffect, useState } from "react";
import { ConnectKitButton } from "connectkit";
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
import { icyToWei, isMainnetBtcAddress } from "@/lib/btc";
import { signatureRequest, signatureResponse } from "@/schemas";
import { useApproveToken } from "@/hooks/useApproveToken";
import { mutate } from "swr";
import { cn, commify, fetchKeys } from "@/lib/utils";

const cta =
  "mt-4 w-full rounded-[10px] py-3 text-[14.5px] font-semibold transition-colors focus-visible:ring-2 focus-visible:ring-icy-100";

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
  minSats,
  satoshiPerUsd,
  loadingRate,
}: {
  rate: number;
  minIcy: number;
  feeRate: number;
  minSats: string;
  satoshiPerUsd: number;
  loadingRate: boolean;
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

  const [icy, setIcy] = useState("");
  const [btc, setBtc] = useState("");
  const [btcAddress, setBtcAddress] = useState("");

  // Approve only what this swap spends, not an unlimited allowance. An older
  // unlimited approval still satisfies the >= check, so nobody is forced to
  // re-approve; new users simply stop granting one.
  const {
    confirmingApprove,
    approving,
    isApproved,
    approve: _approve,
  } = useApproveToken(ICY_CONTRACT_ADDRESS, address, BigInt(icyToWei(icy)));

  const swap = useCallback(() => {
    if (!isApproved) return;
    if (!isMainnetBtcAddress(btcAddress)) {
      return;
    }
    const icyAmount = icyToWei(icy);
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
      .then(async (res) => {
        if (!res.ok) throw new Error(`Signature request failed (${res.status})`);
        return signatureResponse.parse(await res.json());
      })
      .then(({ data }) => {
        // The backend derives the payout itself from the oracle (exact integer
        // division) and signs that, so it legitimately differs from our
        // float-derived figure by a few sats. Only a materially SMALLER payout
        // is a broken promise; more is fine. Mirrors the backend's own 1%
        // tolerance on the other side of the same comparison.
        if (data.icy_amount !== icyAmount) {
          throw new Error(
            "The swap amount changed while we were preparing it. Try again."
          );
        }
        const shown = BigInt(btcAmount);
        const signed = BigInt(data.btc_amount);
        if (signed * BigInt(100) < shown * BigInt(99)) {
          throw new Error(
            "The rate moved while we were preparing your swap. Check the new amount and try again."
          );
        }
        return writeContractAsync(
          getContractConfig(
            BigInt(data.icy_amount),
            btcAddress,
            BigInt(data.btc_amount),
            BigInt(data.nonce),
            BigInt(data.deadline),
            `0x${data.signature}`
          )
        );
      })
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
        toast.error(
          e instanceof Error && e.message
            ? e.message
            : "The swap could not be prepared. Nothing was sent.",
          { position: "bottom-center" }
        );
      })
      // One terminal finally, so any failure above still releases the button.
      .finally(() => {
        setGeneratingSignature(false);
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

  const addressValid = isMainnetBtcAddress(btcAddress);
  const amountTooSmall = Boolean(icy) && +icy < minIcy;
  const ready =
    Boolean(rate) && Boolean(address) && +icy >= minIcy && addressValid;

  // A control says what it does. Anything the user still has to fix is stated
  // next to the field that caused it, not written over the button label.
  const label = () => {
    if (loadingRate) return "Loading the rate";
    if (!rate) return "Rate unavailable";
    if (!address) return "Connect a wallet to swap";
    if (!icy || +icy <= 0) return "Enter an amount";
    if (!isApproved) return "Approve ICY";
    return `Swap ${commify(icy)} ICY for Bitcoin`;
  };

  return (
    <div className="flex flex-col">
      <Converter
        tokenA={icy}
        setAmountTokenA={setIcy}
        tokenB={btc}
        setAmountTokenB={setBtc}
        addressTokenB={btcAddress}
        setAddressTokenB={setBtcAddress}
        rate={rate}
        feeRate={feeRate}
        minSats={minSats}
        minIcy={minIcy}
        satoshiPerUsd={satoshiPerUsd}
      />

      {amountTooSmall ? (
        <p role="alert" className="mt-3 text-xs text-red-400">
          The smallest swap is {commify(minIcy)} ICY.
        </p>
      ) : null}
      {!rate && !loadingRate ? (
        <p role="alert" className="mt-3 text-xs text-red-400">
          We could not reach the rate service, so swapping is paused. Refresh in
          a moment.
        </p>
      ) : null}

      {/* Disconnected is an action, not an error: render a real Connect
          control rather than a greyed button telling them to connect. */}
      {!address && !loadingRate ? (
        <ConnectKitButton.Custom>
          {({ show }) => (
            <button
              type="button"
              onClick={show}
              className={cn(cta, "bg-brand-600 text-white hover:bg-brand-700")}
            >
              Connect a wallet to swap
            </button>
          )}
        </ConnectKitButton.Custom>
      ) : (
        <button
          type="button"
          className={cn(cta, {
            "bg-white/[0.07] text-gray-400 cursor-not-allowed":
              !ready || loading,
            "bg-brand-600 text-white hover:bg-brand-700": ready && !loading,
          })}
          disabled={loading || !ready}
          onClick={!isApproved ? approve : swap}
        >
          {loading ? <Spinner className="mx-auto w-5 h-5" /> : label()}
        </button>
      )}
    </div>
  );
};

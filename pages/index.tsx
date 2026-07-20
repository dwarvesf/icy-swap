import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import Image from "next/image";
import { ChainSelector } from "../components/ChainSelector";
import { Swap } from "../components/Swap";
import { ReserveStrip } from "../components/ReserveStrip";
import { BASE_URL } from "../envs";
import { infoResponse } from "@/schemas";
import Txns from "@/components/txns";
import useSWR from "swr";
import { fetchKeys } from "@/lib/utils";

const DESCRIPTION =
  "Swap $ICY for Bitcoin at the reserve rate. The token of Dwarves Network, backed by a public Bitcoin reserve.";

export default function Home() {
  const { data, error, isLoading } = useSWR(fetchKeys.SWAP_INFO, () =>
    fetch(`${BASE_URL}/swap/info`)
      .then((res) => res.json())
      .then((res) => infoResponse.parse(res))
  );

  const info = data?.data;
  const rate = info ? +info.icy_satoshi_rate : 0;
  const circulating = info
    ? +info.circulated_icy_balance / Math.pow(10, 18)
    : 0;

  return (
    <div>
      <Head>
        <title>🧊 $ICY</title>
        <meta name="title" content="🧊 $ICY" />
        <meta name="description" content={DESCRIPTION} />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://icy.so" />
        <meta property="og:title" content="🧊 $ICY" />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:image" content="/banner.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://icy.so" />
        <meta property="twitter:title" content="🧊 $ICY" />
        <meta property="twitter:description" content={DESCRIPTION} />
        <meta property="twitter:image" content="/banner.png" />
      </Head>

      <main className="flex flex-col items-center px-4 py-8 min-h-screen text-white bg-foreground md:py-14">
        <div className="w-full max-w-4xl rounded-[14px] border border-white/10 bg-foreground shadow-[0_18px_50px_-20px_rgba(0,0,0,0.55)] overflow-hidden">
          <div className="flex gap-3 items-center py-3.5 px-5 border-b border-white/10">
            <span className="flex gap-2.5 items-center text-[15px] font-semibold">
              <Image src="/ICY.png" width={22} height={22} alt="" />
              $ICY
            </span>
            <span className="flex-1" />
            <ChainSelector />
            <ConnectKitButton />
          </div>

          <ReserveStrip
            rate={rate}
            satoshiBalance={info?.satoshi_balance ?? "0"}
            circulatingIcy={circulating}
            satoshiPerUsd={info?.satoshi_per_usd ?? 0}
            loading={isLoading}
            error={Boolean(error)}
          />

          <div className="grid gap-6 items-start py-7 px-5 md:grid-cols-[minmax(0,1fr)_300px]">
            <div className="p-[18px] rounded-xl border border-white/10 bg-foreground-100">
              <Swap
                rate={rate}
                minIcy={Math.ceil(
                  +(info?.min_icy_to_swap ?? 0) / Math.pow(10, 18)
                )}
                feeRate={info?.service_fee_rate ?? 0}
                minSats={info?.min_satoshi_fee ?? ""}
                satoshiPerUsd={info?.satoshi_per_usd ?? 0}
              />
            </div>

            <Txns />
          </div>

          <div className="flex flex-wrap gap-y-1.5 gap-x-[18px] items-center py-3 px-5 text-[12.5px] text-gray-500 border-t border-white/10">
            <span>The token of Dwarves Network</span>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://earn.d.foundation/"
              className="text-gray-400 hover:text-icy-100"
            >
              Radar
            </a>
            <a
              rel="noreferrer"
              target="_blank"
              href="https://discord.gg/dwarvesv"
              className="text-gray-400 hover:text-icy-100"
            >
              Discord
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

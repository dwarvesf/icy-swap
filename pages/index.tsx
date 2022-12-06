import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import Image from "next/image";
import { AddTokenToMetaMask } from "../components/AddTokenToMetaMask";
import { Swap } from "../components/Swap";
import { ICY_CONTRACT_ADDRESS, USDC_CONTRACT_ADDRESS } from "../envs";

export default function Home() {
  return (
    <div>
      <Head>
        <title>ICY Swap</title>
        <meta name="title" content="ICY Swap" />
        <meta
          name="description"
          content="$ICY is the token of the Dwarves Network, used to reward network members. Earn $ICY now."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://icy.d.foundation" />
        <meta property="og:title" content="ICY Swap" />
        <meta
          property="og:description"
          content="$ICY is the token of the Dwarves Network, used to reward network members. Earn $ICY now."
        />
        <meta property="og:image" content="/banner.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://icy.d.foundation" />
        <meta property="twitter:title" content="ICY Swap" />
        <meta
          property="twitter:description"
          content="$ICY is the token of the Dwarves Network, used to reward network members. Earn $ICY now."
        />
        <meta property="twitter:image" content="/banner.png" />
      </Head>

      <main>
        <div className="bg-foreground overflow-hidden relative">
          <div className="mx-auto max-w-5xl w-full px-20 py-5 flex justify-center md:justify-end">
            <ConnectKitButton />
          </div>
          <div className="max-w-5xl mx-auto flex flex-col-reverse gap-y-20 md:gap-y-0 p-5 md:flex-row w-full justify-between md:p-20 md:pt-0 md:pb-10">
            <div className="flex-1 flex flex-col">
              <Image width={64} height={64} src="/ICY.png" alt="" />
              <p className="mt-5 text-white text-left text-5xl font-semibold">
                The token of
                <br />
                <span className="text-brand">Dwarves Network</span>
              </p>
              <p className="text-white mt-1 text-lg">
                A mix between an open company &amp; a community
              </p>
              <div className="mt-10 text-white flex flex-col space-y-2">
                {[
                  {
                    color: "bg-icy-100",
                    emoji: "🧠",
                    text: (
                      <>
                        Contribute to{" "}
                        <a
                          className="underline text-blue-500"
                          href="https://brain.d.foundation/"
                        >
                          brainery
                        </a>{" "}
                        i.e. merge a note
                      </>
                    ),
                  },
                  {
                    color: "bg-icy-300",
                    emoji: "🎙",
                    text: "Giving a talk or participate in events",
                  },
                  {
                    color: "bg-icy-500",
                    emoji: "💬",
                    text: "Sharing & discuss",
                  },
                  {
                    color: "bg-icy-200",
                    emoji: "🤝",
                    text: "Invite friends",
                  },
                  {
                    color: "bg-icy-400",
                    emoji: "📣",
                    text: "Be an ambassador & share about Dwarves",
                  },
                  {
                    color: "bg-icy-100",
                    emoji: "📜",
                    text: "Season quests",
                  },
                ].map((i, idx) => {
                  return (
                    <p key={`earn-${idx}`} className="text-base">
                      <span>{i.emoji}</span> {i.text}
                    </p>
                  );
                })}
              </div>
              <div className="mt-20 flex flex-col items-start">
                <AddTokenToMetaMask
                  address={ICY_CONTRACT_ADDRESS}
                  decimals={18}
                  symbol="ICY"
                />
                <AddTokenToMetaMask
                  address={USDC_CONTRACT_ADDRESS}
                  decimals={6}
                  symbol="USDC"
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              <Swap />
            </div>
          </div>
        </div>
        <div className="overflow-hidden w-full flex justify-center bg-gray-100 px-10 py-32 relative">
          <img
            src="/chaos.svg"
            className="h-[700px] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-70"
          />
          <div className="relative max-5xl flex flex-col justify-center items-center">
            <p className="text-center text-4xl font-medium">
              Want to earn $ICY?
              <br />
              Venture into the Woodland
            </p>
            <a
              href="https://discord.gg/dwarvesv"
              className="mt-8 px-5 py-2.5 rounded-sm bg-brand text-white"
            >
              Join Discord
            </a>
          </div>
        </div>
      </main>

      <footer className="max-w-5xl mx-auto px-5 md:px-10 pt-36">
        <div className="pb-10">
          <ul className="flex flex-col gap-y-1">
            {[
              ["CA", "8 Leavey Court, Toronto"],
              ["US", "2035 Sunset Lake, Delaware"],
              ["VN", "200 Ba Thang Hai, Ho Chi Minh"],
            ].map((t) => {
              return (
                <li key={`footer-${t[0]}`}>
                  <span className="font-medium">{t[0]}:</span> {t[1]}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="opacity-70 text-sm flex flex-col md:flex-row justify-between border-t border-gray-200 py-4">
          <p>Dwarves, LLC &copy; 2015 - 2022 All rights reserved.</p>
          <div className="flex gap-2 mt-20 md:mt-0">
            <a href="mailto:team@dwarves.foundation">team@dwarves.foundation</a>
            <a href="https://t.me/dwarvesf">@dwarvesf</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

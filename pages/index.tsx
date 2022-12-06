import { ChevronRightIcon } from "@heroicons/react/20/solid";
import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import Image from "next/image";
import { ChainSelector } from "../components/ChainSelector";
import { Swap } from "../components/Swap";
import { RATE } from "../envs";

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
        <div className="text-white flex flex-col justify-center items-center bg-foreground overflow-auto relative h-screen w-screen">
          <div className="z-50 fixed flex flex-col-reverse md:flex-row gap-4 md:justify-end top-5 right-5">
            <ChainSelector />
            <ConnectKitButton />
          </div>
          <div className="mt-40 md:mt-0 max-w-5xl mx-auto flex flex-col-reverse gap-y-20 md:gap-y-0 p-5 md:flex-row w-full justify-between md:p-20 md:pt-0 md:pb-10">
            <div className="flex-1 flex flex-col">
              <Image width={64} height={64} src="/ICY.png" alt="" />
              <p className="mt-5 text-left text-5xl font-semibold">
                The token of
                <br />
                <span className="text-brand">Dwarves Network</span>
              </p>
              <p className="mt-1 text-lg">
                A mix between an open company &amp; a community
              </p>
              <p className="mt-10 text-lg font-medium">1 $ICY = {RATE} $USDC</p>
              <div className="h-px w-10 bg-gray-600 my-3" />
              <ul className="flex flex-col gap-2 -ml-1">
                <li className="flex gap-1 items-center">
                  <ChevronRightIcon width={20} height={20} />
                  <p>
                    Head to{" "}
                    <a
                      rel="noreferrer"
                      href="https://earn.d.foundation/"
                      target="_blank"
                      className="text-brand"
                    >
                      earn.d.foundation
                    </a>{" "}
                    to see available quests and r&d topics.
                  </p>
                </li>
                <li className="flex gap-1 items-center">
                  <ChevronRightIcon width={20} height={20} />
                  <p>
                    Join discussion & events at{" "}
                    <a
                      rel="noreferrer"
                      target="_blank"
                      href="https://discord.gg/dwarvesv"
                      className="text-brand"
                    >
                      our Discord.
                    </a>
                  </p>
                </li>
              </ul>
            </div>
            <div className="flex flex-col flex-shrink-0">
              <div className="hidden md:block mb-5 w-16 h-16" />
              <Swap />
            </div>
          </div>
          <div className="my-10 md:my-0 ml-auto md:fixed bottom-5 right-5 flex flex-col items-start">
            <a
              href="https://careers.d.foundation/"
              target="_blank"
              rel="noreferrer"
              className="text-base"
            >
              Join us
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

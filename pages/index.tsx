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
        <title>🧊 $ICY</title>
        <meta name="title" content="🧊 $ICY" />
        <meta
          name="description"
          content="The Dwarves Community Token, use $ICY to claim $USDC, exclusive merch & more benefits later on."
        />

        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://icy.d.foundation" />
        <meta property="og:title" content="🧊 $ICY" />
        <meta
          property="og:description"
          content="The Dwarves Community Token, use $ICY to claim $USDC, exclusive merch & more benefits later on."
        />
        <meta property="og:image" content="/banner.png" />

        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://icy.d.foundation" />
        <meta property="twitter:title" content="🧊 $ICY" />
        <meta
          property="twitter:description"
          content="The Dwarves Community Token, use $ICY to claim $USDC, exclusive merch & more benefits later on."
        />
        <meta property="twitter:image" content="/banner.png" />
      </Head>

      <main>
        <div className="flex relative flex-col items-center w-screen min-h-screen text-white bg-foreground">
          <div className="flex gap-4 pb-10 mt-5 mr-5 mb-auto ml-auto md:justify-end md:pb-0">
            <ChainSelector />
            <ConnectKitButton />
          </div>
          <div className="flex flex-col-reverse gap-y-20 justify-between p-5 mx-auto w-full max-w-5xl md:flex-row md:gap-y-0 md:p-20 md:my-auto">
            <div className="flex flex-col flex-1">
              <Image width={64} height={64} src="/ICY.png" alt="" />
              <p className="mt-5 text-5xl font-semibold text-left">
                The token of
                <br />
                <span className="text-brand">Dwarves Network</span>
              </p>
              <p className="mt-1 text-lg">
                A mix between an open company &amp; a community
              </p>
              <p className="mt-10 text-lg font-medium">1 $ICY = {RATE} $USDC</p>
              <div className="my-3 w-10 h-px bg-gray-600" />
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
              <div className="hidden mb-5 w-16 h-16 md:block" />
              <Swap />
            </div>
          </div>
          <div className="flex flex-col items-start mt-auto mr-5 mb-10 ml-auto">
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

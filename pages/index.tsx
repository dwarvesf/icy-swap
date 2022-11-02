import Head from "next/head";
import Image from "next/image";
import { Swap } from "../components/Swap";

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
        <div className="overflow-hidden relative">
          <img
            className="h-[800px] w-full object-center object-center"
            src="/bg.svg"
            alt=""
          />
          <div className="absolute w-full h-full top-0 left-0 flex flex-col justify-center items-center">
            <Image
              src="/icy-logo.png"
              width={150}
              height={150}
              alt="Logo of ICY"
              className="drop-shadow-2xl"
            />
            <p className="relative text-5xl text-[#9cc2d5] title drop-shadow-2xl">
              ICY
            </p>
          </div>
        </div>

        <div className="max-w-5xl pt-8 px-10 mx-auto">
          <Swap />
          <div className="text-foreground flex mt-52">
            <div>
              <p className="text-left text-5xl font-semibold">
                The token of
                <br />
                <span className="text-brand">Dwarves Network</span>
              </p>
              <p className="mt-3 text-lg">
                A mix between an open company &amp; a community
              </p>
            </div>
            <div className="hidden relative flex-1 flex justify-center">
              <img
                src="/fade.svg"
                className="scale-[1.5] absolute -translate-x-1/5 -translate-y-1/3 top-0 left-0"
              />
              <Image
                src="/icy-logo.png"
                width={100}
                height={100}
                alt="Logo of ICY"
                className="relative -top-6 object-contain drop-shadow-2xl"
              />
            </div>
          </div>

          <div className="text-foreground mt-36 grid grid-cols-2 grid-rows-3 md:grid-cols-3 md:grid-rows-2 gap-y-10">
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
                <div className="flex flex-col items-center" key={`earn-${idx}`}>
                  <p className={`text-5xl rounded-full p-5 mb-4 ${i.color}`}>
                    {i.emoji}
                  </p>
                  <p className="px-4 text-xl text-center font-medium">
                    {i.text}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
        <div className="overflow-hidden w-full flex justify-center mt-48 bg-gray-100 px-10 py-32 relative">
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

      <footer className="max-w-5xl mx-auto px-10 pt-36">
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
        <div className="opacity-70 text-sm flex justify-between border-t border-gray-200 py-4">
          <p>Dwarves, LLC &copy; 2015 - 2022 All rights reserved.</p>
          <div className="flex gap-2">
            <a href="mailto:team@dwarves.foundation">team@dwarves.foundation</a>
            <a href="https://t.me/dwarvesf">@dwarvesf</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

import "@fontsource/rubik-wet-paint";
import "@fontsource/ibm-plex-sans";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/700.css";
import "../styles/globals.css";
import type { AppProps } from "next/app";
import { WagmiConfig, createClient, chain } from "wagmi";
import { ConnectKitProvider, getDefaultClient } from "connectkit";

const client = createClient(
  getDefaultClient({
    appName: "ICY SWAP",
    chains: [chain.polygon],
  })
);

export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig client={client}>
      <ConnectKitProvider theme="soft">
        <Component {...pageProps} />
      </ConnectKitProvider>
    </WagmiConfig>
  );
}

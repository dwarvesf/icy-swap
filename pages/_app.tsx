import "@fontsource/ibm-plex-sans";
import "@fontsource/ibm-plex-sans/500.css";
// 600 was missing while font-semibold is used on the CTA, the logo and every
// status pill, so the browser was snapping those to 700 and they rendered a
// weight heavier than the design.
import "@fontsource/ibm-plex-sans/600.css";
import "@fontsource/ibm-plex-sans/700.css";
import "../styles/globals.css";
import { WagmiProvider, http, createConfig } from "wagmi";
import { base, baseSepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

// TODO: chain
const theChain = base;

const config = createConfig(
  // @ts-ignore
  getDefaultConfig({
    chains: [theChain],
    transports: {
      [theChain.id]: http(),
    },
    walletConnectProjectId: "1830f624b03c2fc3d99fd758fb040ce0",
    appName: "Icy Swap",
    appDescription: "Swap ICY to BTC",
    appUrl: "https://icy.so",
    appIcon: "https://icy.so/ICY.png",
  })
);

const queryClient = new QueryClient();

export default function App({ Component, pageProps }: any) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ConnectKit's "soft" theme ships a white pill, which was the one
            control on the page not speaking the brand. Only the connect button
            is overridden; the modal keeps ConnectKit's own dark treatment. */}
        <ConnectKitProvider
          theme="midnight"
          customTheme={{
            "--ck-font-family": "inherit",
            "--ck-connectbutton-border-radius": "8px",
            "--ck-connectbutton-font-size": "13px",
            "--ck-connectbutton-color": "#fff",
            "--ck-connectbutton-background": "#e03e5e",
            "--ck-connectbutton-hover-background": "#c51f4a",
            "--ck-connectbutton-active-background": "#aa0036",
          }}
        >
          <Toaster />
          <Component {...pageProps} />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

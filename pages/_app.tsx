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

/**
 * ConnectKit's default is a generated gradient blob, which is a stranger's
 * identity on a page that only ever deals in one token. The ICY mark says
 * whose app this wallet is connected to.
 */
const IcyAvatar = ({ size }: { size: number }) => (
  // eslint-disable-next-line @next/next/no-img-element
  <img
    src="/ICY.png"
    alt=""
    width={size}
    height={size}
    style={{ borderRadius: size, display: "block" }}
  />
);

export default function App({ Component, pageProps }: any) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* ConnectKit's "soft" theme ships a white pill, which was the one
            control on the page not speaking the brand. Only the connect button
            is overridden; the modal keeps ConnectKit's own dark treatment. */}
        <ConnectKitProvider
          theme="midnight"
          options={{
            // The connected modal led with an ETH balance. This app never
            // touches ETH, so it was reporting "0.00" as if something were
            // wrong, about a token nobody came here for.
            hideBalance: true,
            customAvatar: IcyAvatar,
            // Base is the only supported chain, so let ConnectKit refuse a
            // wrong-network wallet at the source rather than leaving the app
            // to notice afterwards.
            enforceSupportedChains: true,
            hideQuestionMarkCTA: true,
            hideNoWalletCTA: true,
            overlayBlur: 3,
          }}
          customTheme={{
            // Named, not "inherit": ConnectKit resolves this outside the
            // cascade our body font reaches, and inherit was falling through
            // to the serif default.
            "--ck-font-family": '"IBM Plex Sans", sans-serif',
            "--ck-connectbutton-border-radius": "8px",
            "--ck-connectbutton-font-size": "13px",
            // Deliberately NOT brand. The swap CTA is the page's one primary;
            // a second red control in the header competes with it and says the
            // same thing twice. This one recedes until it is needed.
            "--ck-connectbutton-color": "#f2f3f5",
            "--ck-connectbutton-background": "rgba(255,255,255,0.06)",
            "--ck-connectbutton-hover-background": "rgba(255,255,255,0.11)",
            "--ck-connectbutton-active-background": "rgba(255,255,255,0.14)",
          }}
        >
          <Toaster />
          <Component {...pageProps} />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

import "@fontsource/ibm-plex-sans";
import "@fontsource/ibm-plex-sans/500.css";
import "@fontsource/ibm-plex-sans/700.css";
import "../styles/globals.css";
import { WagmiProvider, http, createConfig } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { ConnectKitProvider, getDefaultConfig } from "connectkit";
import { Toaster } from "react-hot-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const config = createConfig(
  // @ts-ignore
  getDefaultConfig({
    chains: [baseSepolia],
    transports: {
      [baseSepolia.id]: http(),
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
        <ConnectKitProvider theme="soft">
          <Toaster />
          <Component {...pageProps} />
        </ConnectKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

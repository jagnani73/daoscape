import { WagmiProvider } from "wagmi";
import { ProofProvider } from "@vlayer/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import {
  NotificationProvider,
  TransactionPopupProvider,
} from "@blockscout/app-sdk";
import { AppProvider } from "./contexts/AppContext";
import { MainLayout } from "./components/layout";
import { baseSepolia } from "@reown/appkit/networks";

const queryClient = new QueryClient();
const projectId = "09d01f06d56d17861918b3c024e8d763";

const networks = [baseSepolia];

const metadata = {
  name: "Eth Prague",
  description: "AppKit Example",
  url: "https://reown.com/appkit",
  icons: ["https://assets.reown.com/reown-profile-pic.png"],
};

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: true,
});

createAppKit({
  adapters: [wagmiAdapter],
  //@ts-expect-error - TODO: fix this
  networks,
  projectId,
  metadata,
  features: {
    analytics: true,
  },
});

const App = () => {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <NotificationProvider>
          <TransactionPopupProvider>
            <ProofProvider
              config={{
                proverUrl: import.meta.env.VITE_PROVER_URL,
                wsProxyUrl: import.meta.env.VITE_WS_PROXY_URL,
                notaryUrl: import.meta.env.VITE_NOTARY_URL,
                token: import.meta.env.VITE_VLAYER_API_TOKEN,
              }}
            >
              <AppProvider>
                <MainLayout />
              </AppProvider>
            </ProofProvider>
          </TransactionPopupProvider>
        </NotificationProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;

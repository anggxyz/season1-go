import { type AppType } from "next/app";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig, type SIWESession } from "connectkit";
import { siweClient } from "src/utils/siweClient";
import { ThemeProvider } from 'styled-components';
import original from 'react95/dist/themes/original';
import { CHAINS, publicClient, webSocketPublicClient } from "~src/utils/onChainConfig";

const config = createConfig(getDefaultConfig({
  alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
  // /env.mjs ensures the the app isn't built without .env vars
  walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!,
  appName: "VC-S1",
  appDescription: "VCS1",
  appUrl: "https://season1-go.vercel.app",
  appIcon: "https://season1-go.vercel.app/logo.png",
  publicClient,
  webSocketPublicClient,
  chains: CHAINS
}));



const MyApp: AppType = ({
  Component,
  pageProps: { ...pageProps },
}) => {
  return (
    <>
      <ThemeProvider theme={original}>
        <WagmiConfig config={config}>
          <siweClient.Provider
            // Optional parameters
            enabled={true} // defaults true
            nonceRefetchInterval={300000} // in milliseconds, defaults to 5 minutes
            sessionRefetchInterval={300000}// in milliseconds, defaults to 5 minutes
            signOutOnDisconnect={true} // defaults true
            signOutOnAccountChange={true} // defaults true
            signOutOnNetworkChange={true} // defaults true
            onSignIn={(session?: SIWESession) => { console.log({ session }) }}
            onSignOut={() => console.log("signed out")}
          >
            <ConnectKitProvider theme="web95">
              <Component {...pageProps} />
            </ConnectKitProvider>
          </siweClient.Provider>
        </WagmiConfig>
      </ThemeProvider>
    </>
  );
};

export default MyApp;

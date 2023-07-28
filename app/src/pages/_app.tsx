/* eslint-disable @typescript-eslint/no-unsafe-return */
import { type AppType } from "next/app";
import { WagmiConfig, createConfig } from "wagmi";
import { ConnectKitProvider, getDefaultConfig, type SIWESession } from "connectkit";
import { siweClient } from "src/utils/siweClient";
import { ThemeProvider } from 'styled-components';
import original from 'react95/dist/themes/original';

if (!process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID) {
  throw "WALLETCONNECT_PROJECT_ID not found in .env";
}

const config = createConfig(
  getDefaultConfig({
    alchemyId: process.env.NEXT_PUBLIC_ALCHEMY_ID,
    walletConnectProjectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
    // Required
    appName: "Your App Name",
    // Optional
    appDescription: "Your App Description",
    appUrl: "https://season1-go.vercel.app", // your app's url
    appIcon: "https://season1-go.vercel.app/logo.png", // your app's icon, no bigger than 1024x1024px (max. 1MB)
  }),
);


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

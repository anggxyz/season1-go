import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAccount } from "wagmi";

const MyComponent = () => {
  const { address, isConnecting, isDisconnected } = useAccount();
  const [connectStatus, setConnectStatus] = useState(false);
  useEffect(() => {
    if (isConnecting) {
      setConnectStatus(isConnecting)
    }
    if(isDisconnected) {
      setConnectStatus(!isDisconnected)
    }
  }, [isConnecting, isDisconnected])
  return (
  <div>
    <div>
      {JSON.stringify(connectStatus)}
    </div>
    Connected Wallet: {address}
  </div>

  );
};

export default function Home() {
  return (
    <>
      <Head>
        <title>Season 1</title>
        <meta name="description" content="season1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-5xl font-extrabold tracking-tight text-white sm:text-[5rem]">
            Mint <span className="text-[hsl(280,100%,70%)]">Season1</span> NFT
          </h1>
          {/* <MyComponent/> */}
          <ConnectKitButton />

        </div>
      </main>
    </>
  );
}

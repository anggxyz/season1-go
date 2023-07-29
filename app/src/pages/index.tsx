/* eslint-disable @typescript-eslint/no-unsafe-return */
import { ConnectKitButton } from "connectkit";
import Head from "next/head";
import { useEffect, useState } from "react";
import { Button, Window, WindowContent, WindowHeader, Hourglass, GroupBox } from "react95";
import Main from "src/layouts/Main";
import styled from 'styled-components';
import { useAccount } from 'wagmi'
import { useMintPrice } from "~src/hooks/useMintPrice";
import { useWhitelistStatus } from "~src/hooks/useWhitelistStatus";
import { useMint } from "~src/hooks/useMint";
import { useIsOwner } from "~src/hooks/useIsOwner";
import { useIsPaused } from "~src/hooks/useIsPaused";

const MESSAGES = {
  whitelisted: 'You are in the Whitelist',
  nonWhitelisted: 'Your Address is not whitelisted, mint the NFT below and enter the game (todo, add better description here)'
}
const Wrapper = styled.div`
  display: flex;
  gap: 18px;
  .window {
    width: 400px;
    height: 600px;
    display: flex;
    flex-direction: column;
  }
  .connect-wallet-window {
    width: 300px;
    height: min-content;
    margin-top: 50px;
    margin-left: 50px;
  }
  .window-title {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
  .close-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    margin-left: -1px;
    margin-top: -1px;
    transform: rotateZ(45deg);
    position: relative;
    &:before,
    &:after {
      content: '';
      position: absolute;
      background: ${({ theme }) => theme.materialText};
    }
    &:before {
      height: 100%;
      width: 3px;
      left: 50%;
      transform: translateX(-50%);
    }
    &:after {
      height: 3px;
      width: 100%;
      left: 0px;
      top: 50%;
      transform: translateY(-50%);
    }
  }
  .window-content {
    flex: 1;
  }
  .footer {
    display: block;
    margin: 0.25rem;
    height: 31px;
    line-height: 31px;
    padding-left: 0.25rem;
    flex: grow;
  }
  .image-placeholder {
    height: 100%;
    width: 100%;
    background-color: ${({ theme }) => theme.materialDark};;
  }
  .mint-button {
    padding: 1.5rem;
  }
  @media (max-width: 768px) {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    .window {
      width: 100%;
      height: 450px;
      padding: 0;
    }
    .connect-wallet-window {
      margin-top: 0;
      margin-left: 0;
    }
  }
`

export default function Home() {
  const [displayConnectWalletWindow, setDisplayConnectWalletWindow] = useState<boolean>(false);
  const { address, isDisconnected } = useAccount()
  const isAccountConnected = Boolean(address) || Boolean(!isDisconnected);
  const [mintButtonLabel, setMintButtonLabel] = useState<string>("Mint");
  const paused = useIsPaused();
  const { status } = useWhitelistStatus();
  const mintPrice = useMintPrice();
  const {isMinting, isError, mint} = useMint();
  const {isOwner,tokenId} = useIsOwner();

  useEffect(() => {
    if (isAccountConnected) {
      setMintButtonLabel("Mint");
    }
    if (!isAccountConnected) {
      setMintButtonLabel("Connect Account");
    }
  }, [isAccountConnected])
  const getWhitelistInfoMessage = (status: boolean) => {
    switch(status) {
      case true: return MESSAGES.whitelisted;
      case false: return MESSAGES.nonWhitelisted;
      default: return "Whitelist Status";
    }
  }
  const closeConnectWalletWindow = () => setDisplayConnectWalletWindow(false);
  const openConnectWalletWindow = () => {
    setDisplayConnectWalletWindow(true);
  }

  const onClickMint = () => {
    if (!isAccountConnected) {
      openConnectWalletWindow();
      return;
    }
    mint();
    return;
  }

  return (
    <>
      <Head>
        <title>Season 1</title>
        <meta name="description" content="season1" />
        <link rel="icon" href="/favicon.png" />
      </Head>
      <Main>
        <>
        <Window style={{ padding: '0.2rem', width: '100%', height: 'min-content', marginBottom: '1rem' }}>
          <WindowContent>
          <GroupBox label="Your whitelist status">
              <p>todo (need better description here)</p>
              <p>
                Contract pause status: {String(paused)}
              </p>
              <p>
                {getWhitelistInfoMessage(status)}
              </p>
            </GroupBox>
          </WindowContent>
        </Window>
        <Wrapper>
          {/* mint window */}
          <Window className="window">
            <WindowHeader>
              Mint
            </WindowHeader>
            <WindowContent className="window-content">
              <div className="image-placeholder">
              </div>
            </WindowContent>
            {
              isOwner ?
              <Button active>You own tokenId: {tokenId}</Button>
              :
              <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
              <Button active>Mint Price: {mintPrice}</Button>
              {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
              <Button className="mint-button" onClick={onClickMint}>
                {isMinting ? <Hourglass size={32} style={{ margin: 20 }} /> : mintButtonLabel}
              </Button>
            </div>
            }
            {isAccountConnected && !displayConnectWalletWindow && <Button onClick={() => openConnectWalletWindow()}>
                View Connected Account
              </Button>}

          </Window>

          {/* connect wallet window */}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            {displayConnectWalletWindow && <Window className="connect-wallet-window">
              <WindowHeader className="window-title">
                {isAccountConnected ? <span>Connected Account</span> : <span>Connect Wallet</span>}
                <Button onClick={closeConnectWalletWindow}><span className='close-icon' /></Button>
              </WindowHeader>
              <WindowContent className="window-content">
                <ConnectKitButton showAvatar showBalance />
              </WindowContent>
            </Window>}
            {isError && <Window style={{
              height: "min-content",
              width: "100%",
              padding: "8px",
              display: "flex",
              flexDirection: "column"
            }} >
            <WindowHeader className="window-title">
              <span>Error</span>
            </WindowHeader>
            <p>There was an error</p>
            <Button primary>Try again?</Button>
          </Window>}
          </div>
        </Wrapper>
        </>
      </Main>
    </>
  );
}


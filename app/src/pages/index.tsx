/* eslint-disable @typescript-eslint/no-unsafe-return */
import Head from "next/head";
import { useEffect, useState } from "react";
import { Button, Window, WindowContent, WindowHeader, Hourglass, GroupBox } from "react95";
import Main from "src/layouts/Main";
import styled from 'styled-components';
import { useAccount } from 'wagmi'
import { useMintPrice } from "~src/hooks/useMintPrice";
import { useMint } from "~src/hooks/useMint";
import { useIsOwnerOfToken } from "~src/hooks/useIsOwnerOfToken";
import { useIsPaused } from "~src/hooks/useIsPaused";
import { ConnectAccountsWindow } from "~src/components/ConnectAccountsWindow";
import { ErrorWindow } from "~src/components/ErrorWindow";
import { useWhitelistStatus } from "~src/hooks/useWhitelistStatus";
import { useConnectedTwitterAccount } from "~src/hooks/useConnectedTwitterAccount";

const MESSAGES = {
  whitelisted: 'Your twitter account is in the Whitelist',
  nonWhitelisted: 'Your twitter account is not whitelisted, mint the NFT below and enter the game'
}
const getWhitelistInfoMessage = (status: boolean) => {
  switch(status) {
    case true: return MESSAGES.whitelisted;
    case false: return MESSAGES.nonWhitelisted;
    default: return "Whitelist Status";
  }
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
  }
`

export default function Home() {
  const [displayConnectWalletWindow, setDisplayConnectWalletWindow] = useState<boolean>(false);
  const [displayErrorWindow, setDisplayErrorWindow] = useState<boolean>(false);
  const { address, isDisconnected } = useAccount()
  const isAccountConnected = Boolean(address) || Boolean(!isDisconnected);
  const [mintButtonLabel, setMintButtonLabel] = useState<string>("Mint");
  const paused = useIsPaused();
  const status = useWhitelistStatus();
  const {mintPrice} = useMintPrice();
  const {publicMint, whitelistMint, publicMintIsError, whitelistMintIsError, publicMintIsLoading, whitelistMintIsLoading} = useMint();
  const isMinting = publicMintIsLoading || whitelistMintIsLoading;
  const {isOwner,tokenId} = useIsOwnerOfToken();
  const {isConnected: isTwitterConnected} = useConnectedTwitterAccount();

  useEffect(() => {
    setDisplayErrorWindow(publicMintIsError || whitelistMintIsError);
  }, [publicMintIsError, whitelistMintIsError])

  useEffect(() => {
    if (isAccountConnected) {
      setMintButtonLabel("Mint");
    }
    if (!isAccountConnected) {
      setMintButtonLabel("Connect");
    }
    if (isTwitterConnected && !status && paused) {
      setMintButtonLabel("Paused for public mints");
    }
  }, [isAccountConnected, status, paused, isTwitterConnected])
  const isButtonDisabled = Boolean(isTwitterConnected && !status && paused);

  const closeConnectWalletWindow = () => setDisplayConnectWalletWindow(false);
  const openConnectWalletWindow = () => {
    setDisplayConnectWalletWindow(true);
  }

  const onClickMint = () => {
    if (!isAccountConnected) {
      openConnectWalletWindow();
      return;
    }
    if (status) {
      return whitelistMint();
    } else {
      return publicMint();
    }
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
              <p>
                Public mints paused: {String(paused.publicMints)}
              </p>
              <p>
                Whitelist transfer paused: {String(paused.whitelistTransfers)}
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
              <Button className="mint-button" onClick={onClickMint} disabled={isButtonDisabled}>
                {isMinting ? <Hourglass size={32} style={{ margin: 20 }} /> : mintButtonLabel}
              </Button>
            </div>
            }
            {
              isAccountConnected && !displayConnectWalletWindow &&
                <Button onClick={() => openConnectWalletWindow()}>
                  View Connected Accounts
                </Button>
            }

          </Window>

          {/* connect wallet window */}

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>

            {
              displayConnectWalletWindow &&
              <ConnectAccountsWindow
                onClose={closeConnectWalletWindow}
                displayConnectedAccount={isAccountConnected}
              />
            }
            {
              displayErrorWindow && <ErrorWindow onClose={() => setDisplayErrorWindow(false)} />
            }
          </div>
        </Wrapper>
        </>
      </Main>
    </>
  );
}


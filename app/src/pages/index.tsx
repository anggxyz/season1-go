/* eslint-disable @typescript-eslint/no-unsafe-return */
import Head from "next/head";
import { useEffect, useState } from "react";
import { Button, Window, WindowContent, WindowHeader, Hourglass, GroupBox, Checkbox } from "react95";
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
import { useAccountsConnectedStatus } from "~src/hooks/useAccountsConnectedStatus";

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
export const Wrapper = styled.div`
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
  const [displayInfoBox, setDisplayInfoBox] = useState<boolean>(false);

  const { isConnected: isWalletConnected } = useAccount()
  const [mintButtonLabel, setMintButtonLabel] = useState<string>("Mint");
  const {
    whitelistTransfers: whitelistTransfersPaused,
    publicMints: publicMintsPaused
  } = useIsPaused();
  const status = useWhitelistStatus();
  const {formatted: mintPrice} = useMintPrice();
  const {publicMint, whitelistMint, publicMintIsError, whitelistMintIsError, publicMintIsLoading, whitelistMintIsLoading} = useMint();
  const isMinting = publicMintIsLoading || whitelistMintIsLoading;
  const { isOwner, tokenId, ownershipType } = useIsOwnerOfToken();
  const {isConnected: isTwitterConnected} = useConnectedTwitterAccount();

  const connectStatus = useAccountsConnectedStatus();

  useEffect(() => {
    setDisplayErrorWindow(publicMintIsError || whitelistMintIsError);
  }, [publicMintIsError, whitelistMintIsError])

  useEffect(() => {
    if (Object.values(connectStatus).some((st) => st === "DISCONNECTED")) {
      return setMintButtonLabel("Connect");
    }

    if (!status && publicMintsPaused) {
      return setMintButtonLabel("Paused for public mints");
    }
    if (Object.values(connectStatus).every((st) => st === "CONNECTED")) {
      return setMintButtonLabel("Mint");
    }

  }, [
    connectStatus.twitter,
    connectStatus.wallet,
    status,
    publicMintsPaused,
    isWalletConnected,
    isTwitterConnected,
    connectStatus
  ])

  const isButtonDisabled = Boolean(connectStatus.twitter==="CONNECTED" && !status && publicMintsPaused);

  const closeConnectWalletWindow = () => setDisplayConnectWalletWindow(false);
  const openConnectWalletWindow = () => {
    setDisplayConnectWalletWindow(true);
  }

  const onClickMint = () => {
    if (
      connectStatus.wallet === "DISCONNECTED"
      || connectStatus.twitter === "DISCONNECTED"
    ) {
      openConnectWalletWindow();
      return;
    }
    if (status) {
      return whitelistMint();
    } else {
      return publicMint();
    }
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
                Public mints paused: {String(publicMintsPaused)}
              </p>
              <p>
                Whitelist transfer paused: {String(whitelistTransfersPaused)}
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
              <div style={{
                display: "flex",
                flexDirection: "row",
                gap: "8px",
                margin: "8px 0 8px 0"
              }}>
              <Button active fullWidth>You own tokenId: {tokenId}</Button>
              <Button square onClick={() => {
                setDisplayInfoBox((box) => !box)
              }}>ℹ️</Button>
              </div>
              :
              <div style={{display: "flex", flexDirection: "column", gap: "8px"}}>
                <Button active>{mintPrice}</Button>
                {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
                <Button className="mint-button" onClick={onClickMint} disabled={isButtonDisabled}>
                  {isMinting ? <Hourglass size={32} style={{ margin: 20 }} /> : mintButtonLabel}
                </Button>
              </div>
            }
            {
              (connectStatus.wallet === "CONNECTED" || connectStatus.twitter === "CONNECTED") && !displayConnectWalletWindow &&
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
              <ConnectAccountsWindow onClose={closeConnectWalletWindow} />
            }
            {
              displayErrorWindow && <ErrorWindow onClose={() => setDisplayErrorWindow(false)} />
            }
            {
              displayInfoBox &&
              <Window style={{
                height: "min-content",
                width: "450px",
                padding: "8px",
                display: "flex",
                flexDirection: "column"
              }}>
                <WindowHeader className="window-title">
                  <span>Info</span>
                  <Button onClick={() => setDisplayInfoBox(false)}>
                    <span className='close-icon' />
                  </Button>
                </WindowHeader>
                  <GroupBox label='Ownership Order'>
                    <div style={{
                      paddingLeft: '1.5rem',
                      display: 'flex',
                      flexDirection: 'column'
                    }}>
                      <Checkbox
                        checked={!!ownershipType.AddressMinted}
                        value='addressMinted'
                        label='Address minted'
                        name='addressMinted'
                      />
                      <Checkbox
                        checked={!!ownershipType.WalletOwns}
                        value='walletOwns'
                        label='Wallet owns'
                        name='walletOwns'
                      />
                      <Checkbox
                        checked={!!ownershipType.TwitterMinted}
                        value='twitterMinted'
                        label='Twitter minted'
                        name='twitter minted'
                      />
                    </div>
                  </GroupBox>
                <div style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: "8px"
                }}>
                  <Button primary onClick={() => setDisplayInfoBox(false)} fullWidth>
                    Okay
                  </Button>
                  <Button primary onClick={() => setDisplayInfoBox(false)} fullWidth>
                    Okay
                  </Button>
                </div>
              </Window>
            }
          </div>
        </Wrapper>
        </>
      </Main>
    </>
  );
}


import { Button, Window, WindowContent, WindowHeader } from "react95"
import { ConnectOrDisplayTwitterButton } from "./ConnectOrDisplayTwitterButton"
import { ConnectOrDisplayWalletButton } from "./ConnectOrDisplayWalletButton"
import { useAccountsConnectedStatus } from "~src/hooks/useAccountsConnectedStatus"


export const ConnectAccountsWindow = ({
  onClose,
}: {
  onClose: () => void,
}) => {
  const connectStatus = useAccountsConnectedStatus();

  return (
    <Window style={{
      width: "300px",
      height: "min-content",
      marginTop: "50px",
      marginLeft: "50px"
    }}>
      <WindowHeader className="window-title">
        <span>
          Accounts
        </span>
        <Button onClick={onClose}><span className='close-icon'></span></Button>
      </WindowHeader>
      <WindowContent className="window-content">
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          <ConnectOrDisplayTwitterButton />
          <ConnectOrDisplayWalletButton disabled={connectStatus.twitter === "DISCONNECTED"} />
        </div>
      </WindowContent>
    </Window>
  )
}
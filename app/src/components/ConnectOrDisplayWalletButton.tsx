import { ConnectKitButton, useModal } from "connectkit"
import { Button } from "react95"
import { useAccount } from "wagmi"

export const ConnectOrDisplayWalletButton = () => {
  const { address, isDisconnected, isConnected } = useAccount()
  const { setOpen } = useModal();

  if (isConnected) {
    return (
      <div>
        <ConnectKitButton showAvatar showBalance />
      </div>
    )
  }
  return (
    <Button variant="flat" fullWidth onClick={() => setOpen(true)}>
      Connect Wallet
    </Button>
  )
}

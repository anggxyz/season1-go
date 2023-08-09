import { ConnectKitButton, useModal } from "connectkit"
import { Button } from "react95"
import { useAccount } from "wagmi"

export const ConnectOrDisplayWalletButton = ({disabled}: {disabled: boolean}) => {
  const { isConnected } = useAccount()
  const { setOpen } = useModal();
  console.log({disabled});
  if (isConnected) {
    return (
      <div>
        <ConnectKitButton showAvatar showBalance />
      </div>
    )
  }
  return (
    <Button variant="flat" fullWidth onClick={() => setOpen(true)} disabled={disabled}>
      Connect Wallet
    </Button>
  )
}

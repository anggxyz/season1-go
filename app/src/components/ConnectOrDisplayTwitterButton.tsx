/* eslint-disable @typescript-eslint/no-misused-promises */
import { Button } from "react95"
import { useConnectedTwitterAccount } from "~src/hooks/useConnectedTwitterAccount"
import { getTwitterOauthUrl } from "~src/utils/twitterAuth"

export const ConnectOrDisplayTwitterButton = () => {
  const {data, disconnect} = useConnectedTwitterAccount();
  if (data?.payload) {
    return (
      <>
        <Button variant="flat" fullWidth>
          {data.payload.username}
        </Button>
        <Button onClick={disconnect}>
          disconnect
        </Button>
      </>
    )
  }
  return (
    <a href={getTwitterOauthUrl()}>
      <Button variant="flat" fullWidth>
        Connect Twitter
      </Button>
    </a>
  )
}


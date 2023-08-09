import { getTwitterOauthUrl } from "~src/utils/twitterAuth";


const ConnectTwitterButton = () => {
  return (
    <a href={getTwitterOauthUrl()}>
      Connect Twitter
    </a>
  )
}

export default ConnectTwitterButton;

import { URL } from "./getUrl";

const redirectURL = `${URL}/api/auth/callback/twitter`
export const getTwitterOauthUrl = () => {
  const rootUrl = "https://twitter.com/i/oauth2/authorize";
  const options = {
    redirect_uri: `${redirectURL}`,
    client_id: process.env.NEXT_PUBLIC_TWITTER_CLIENT_ID!,
    state: "state",
    response_type: "code",
    // @todo
    code_challenge: "y_SfRG4BmOES02uqWeIkIgLQAlTBggyf_G7uKT51ku8",
    code_challenge_method: "S256",
    scope: ["users.read", "tweet.read"].join(" ")
  };
  const qs = new URLSearchParams(options).toString();
  return `${rootUrl}?${qs}`;
}

export const TWITTER_COOKIE_NAME =  "twitter_token"

import { URL } from "~src/utils/getUrl";

export interface TwitterTokenResponse {
  token_type: "bearer";
  expires_in: 7200;
  access_token: string;
  scope: string;
};

export const TWITTER_OAUTH_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";

export const TWITTER_ME_URL="https://api.twitter.com/2/users/me"

export const twitterOauthTokenParams = {
  client_id: process.env.TWITTER_CLIENT_ID!,
  // @todo
  code_verifier: "8KxxO-RPl0bLSxX5AWwgdiFbMnry_VOKzFeIlVA7NoA",
  redirect_uri: `${URL}/api/auth/callback/twitter`,
  grant_type: "authorization_code",
};

export interface TwitterUser {
  id: string;
  name: string;
  username: string;
}
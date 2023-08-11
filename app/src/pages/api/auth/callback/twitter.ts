import axios from "axios";
import { pick } from "lodash";
import { type NextApiRequest, type NextApiResponse } from "next";
import jwt from 'jsonwebtoken'
import { TWITTER_OAUTH_TOKEN_URL, type TwitterTokenResponse, twitterOauthTokenParams, TWITTER_ME_URL, type TwitterUser } from "~src/server/utils/twitterAuth";
import { TWITTER_COOKIE_NAME } from "~src/utils/twitterAuth";

export async function getTwitterOAuthToken(code: string) {
  try {
    // POST request to the token url to get the access token
    const res = await axios.post<TwitterTokenResponse>(
      TWITTER_OAUTH_TOKEN_URL,
      new URLSearchParams({ ...twitterOauthTokenParams, code }).toString(),
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );
    return res.data;
  } catch (err) {
    throw err
  }
}

export async function getTwitterUser(accessToken: string): Promise<TwitterUser | null> {
  try {
    const res = await axios.get<{ data: TwitterUser }>(TWITTER_ME_URL, {
      headers: {
        "Content-type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return res.data.data ?? null;
  } catch (err) {
    throw err;
  }
}


export default async function twitter(req: NextApiRequest, res: NextApiResponse) {
  const { code } = pick(req.query, ["code"]) as  {code:string};
  let TwitterOAuthToken, twitterUser;
  try {
    TwitterOAuthToken = await getTwitterOAuthToken(code);
  } catch (err) {
    return res.status(200).json({ ok: false, reason: err });
  }

  try {
    twitterUser = await getTwitterUser(TwitterOAuthToken.access_token);
  } catch(err) {
    return res.status(200).json({ok: false, reason: err});
  }

  // this if block is only to satisfy typescript,
  // flow shouldn ever reach here
  if (!TwitterOAuthToken || !twitterUser) {
    throw "TwitterOauthtoken or twitter user not found";
  }


  const token = jwt.sign({ // Signing the token to send to client side
    id: twitterUser.id,
    accessToken: TwitterOAuthToken.access_token,
    name: twitterUser.name,
    username: twitterUser.username
  }, process.env.TWITTER_COOKIE_SECRET!);

  res.setHeader('Set-Cookie', `${TWITTER_COOKIE_NAME}=${token}; path=/; samesite=lax; httponly; Max-Age=259200`)

  return res.redirect("/");
}

import axios from "axios";
import { pick } from "lodash";
import { type NextApiRequest, type NextApiResponse } from "next";
import jwt from 'jsonwebtoken'
import { TWITTER_OAUTH_TOKEN_URL, type TwitterTokenResponse, twitterOauthTokenParams, TWITTER_ME_URL, type TwitterUser } from "~src/server/utils/twitterAuth";

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
    return null;
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
    console.log(err);
    return null;
  }
}


export default async function twitter(req: NextApiRequest, res: NextApiResponse) {
  const { code } = pick(req.query, ["code"]) as  {code:string};

  const TwitterOAuthToken = await getTwitterOAuthToken(code);
  console.log({TwitterOAuthToken});

  if (!TwitterOAuthToken) {
    return res.status(200).json({ok: false});
  }

  const twitterUser = await getTwitterUser(TwitterOAuthToken.access_token);

  if (!twitterUser) {
    return res.status(200).json({ok: false});
  }

  const token = jwt.sign({ // Signing the token to send to client side
    id: twitterUser.id,
    accessToken: TwitterOAuthToken.access_token,
    name: twitterUser.name,
    username: twitterUser.username
  }, process.env.TWITTER_COOKIE_SECRET!);

  res.setHeader('Set-Cookie', `twitter_token=${token}; path=/; samesite=lax; httponly; Max-Age=259200`)

  return res.status(200).json({ok: true, TwitterOAuthToken, twitterUser, token})
}

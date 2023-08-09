import { type NextApiRequest, type NextApiResponse } from "next";
import { TWITTER_COOKIE_NAME } from "~src/utils/twitterAuth";

export default function signout(req: NextApiRequest, res: NextApiResponse) {
  res.setHeader('Set-Cookie', `${TWITTER_COOKIE_NAME}=${""}; path=/; samesite=lax; httponly; Max-Age=1`)
  return res.redirect("/");
}

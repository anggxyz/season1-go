import { pick } from "lodash";
import jwt from "jsonwebtoken";
import { type NextApiRequest, type NextApiResponse } from "next";
import { TWITTER_COOKIE_NAME } from "~src/utils/twitterAuth";

export default function me(req: NextApiRequest, res: NextApiResponse) {
  const token = pick(req.cookies, [TWITTER_COOKIE_NAME]);

  if (!token[TWITTER_COOKIE_NAME]) {
    return res.status(200).json({
      ok: true,
      payload: null
    })
  }
  const payload = jwt.verify(token[TWITTER_COOKIE_NAME]!, process.env.TWITTER_COOKIE_SECRET!);
  return res.status(200).json({
    ok: true,
    payload
  })
}
import { pick } from "lodash";
import jwt from "jsonwebtoken";
import { type NextApiRequest, type NextApiResponse } from "next";

export default function me(req: NextApiRequest, res: NextApiResponse) {
  const { twitter_token } = pick(req.cookies, ["twitter_token"]) as  {twitter_token:string};
  const payload = jwt.verify(twitter_token, process.env.TWITTER_COOKIE_SECRET!);

  console.log({payload});

  return res.status(200).json({
    ok: true,
    payload
  })
}
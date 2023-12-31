import { type NextApiRequest, type NextApiResponse } from "next";
import { get } from '@vercel/edge-config';
import { pick } from "lodash";

// @todo add error handling
export default async function getKey (req: NextApiRequest, res: NextApiResponse) {
  const authorization = req.headers.authorization;
  if (authorization !== process.env.AUTH_TOKEN) {
    throw "Authorization mismatch"
  }

  const { key } = pick(req.body, ["key"]) as  { key: string };
  const data = await get(key);
  res.status(200).json({ data })
}

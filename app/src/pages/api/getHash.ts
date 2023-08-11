import { type NextApiRequest, type NextApiResponse } from "next";
import { computeHash } from "~src/server/utils/whitelistMerkleUtils";
import { pick } from "lodash";


export default function getHash (req: NextApiRequest, res: NextApiResponse) {
  const { key } = pick(req.body, ["key"]) as  { key: string };

  if (!key) {
    throw `error: no key provided. key: ${key}`;
  }

  const hash: string | undefined = computeHash(key);

  if (!hash) {
    throw `error: hash computed to be ${hash}`
  }

  res.status(200).json({ hash });
}

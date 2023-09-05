import { type NextApiRequest, type NextApiResponse } from "next";
import { pick } from "lodash";
import { getSignature } from "~src/server/utils/whitelistMerkleUtils";


const deployer = process.env.PRIVATE_KEY;


export default async function getHashForPublicMint (req: NextApiRequest, res: NextApiResponse) {
  const { key } = pick(req.body, ["key"]) as  { key: string };

  if (!deployer) {
    throw "PRIVATE_KEY not found";
  }

  if (!key) {
    throw `error: no key provided. key: ${key}`;
  }
  const { hash, signature } = await getSignature(key);

  if (!signature) {
    throw `error: no signature returned. signature: ${signature}`;
  }

  res.status(200).json({ hash, signature });
}

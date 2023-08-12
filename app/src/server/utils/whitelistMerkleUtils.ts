import { MerkleTree } from "~src/server/utils/merkle";
import Web3 from "web3";
import {
  createCipheriv,
  createHash,
  // createDecipheriv,
  // scryptSync
} from "crypto";
const { utils } = Web3;
const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.SECRETYSECRET;
if (!ENCRYPTION_KEY) {
  throw "key not found";
}

const KEY = createHash('sha256').update(ENCRYPTION_KEY).digest('base64').substr(0, 32);
const IV = Buffer.alloc(16,0)

// const decrypt = (encryptedText: string) => {
//   try {
//     const textParts = encryptedText.split(':');
//     const iv = Buffer.from(textParts.shift() ?? "", 'hex');
//     const encryptedData = Buffer.from(textParts.join(':'), 'hex');
//     const decipher = createDecipheriv(algorithm, KEY, iv);
//     const decrypted = decipher.update(encryptedData);
//     const decryptedText = Buffer.concat([decrypted, decipher.final()]);
//     return decryptedText.toString();
//   } catch (error) {
//     console.log(error)
//   }
// }

const encrypt = (text: string) => {
  const cipher = createCipheriv(algorithm, KEY, IV);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptedText = IV.toString('hex') + ':' + encrypted.toString('hex')
  return encryptedText;
}

export const computeHash = (element: string) => utils.soliditySha3(encrypt(element));

export const compressElements = (elements: string[]) => elements.map(d => computeHash(d));

export const getTreeRoot = (elements: string[]) => {
  const tree = new MerkleTree(compressElements(elements));
  const root: string = tree.getHexRoot() as string;
  return root;
}

export const computeProof = (element: string, allElements: string[]) => {
  const tree = new MerkleTree(compressElements(allElements));
  const proof = tree.getHexProof(element) as string[];
  return proof;
}

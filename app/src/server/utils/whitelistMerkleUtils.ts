import { MerkleTree } from "~src/server/utils/merkle";
import Web3 from "web3";
import {
  createCipheriv,
  // createDecipheriv,
  // randomBytes,
  scryptSync
} from "crypto";
const { utils } = Web3;
const algorithm = 'des';
const ENCRYPTION_KEY = process.env.SECRETYSECRET;
if (!ENCRYPTION_KEY) {
  throw "key not found";
}

// const decrypt = (text: string) => {
//   const textParts = text.split(':');
//   const iv = Buffer.from(textParts.shift() ?? "", 'hex');
//   const encryptedText = Buffer.from(textParts.join(':'), 'hex');
//   const keyBuffer = scryptSync(ENCRYPTION_KEY, 'salt', 8)
//   const decipher = createDecipheriv(algorithm, keyBuffer, iv);
//   let decrypted = decipher.update(encryptedText);
//   decrypted = Buffer.concat([decrypted, decipher.final()]);
//   return decrypted.toString();
// }
const encrypt = (text: string) => {
  const ivBuffer = Buffer.alloc(8, 0);
  const keyBuffer = scryptSync(ENCRYPTION_KEY, 'salt', 8);
  const cipher = createCipheriv(algorithm, keyBuffer, ivBuffer);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const encryptedTest = ivBuffer.toString('hex') + ':' + encrypted.toString('hex')
  return encryptedTest;
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

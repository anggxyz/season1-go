import { useState } from 'react';

// remove, just for testing
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export const useMint = (): {
  isMinting: boolean,
  isError: boolean,
  mint: () => Promise<void>;
  setIsError: (e: boolean) => void;
} => {
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isError, setIsError] = useState<boolean>(false);

  const mint = async () => {
    try {
      setIsMinting(true);
      // call contract here

      // remove, just for testing
      await sleep(3000);
      setIsMinting(false);
      
      throw "";
    } catch (err) {
      setIsError(true);
      setIsMinting(false);
    }
  }

  return {
    isMinting, isError, mint, setIsError
  }
};

import { useState } from 'react';


export const useIsOwner = (): {isOwner: boolean, tokenId: number} => {
  const [isOwner, setIsOwner] = useState<boolean>(false);
  const [tokenId, setTokenId] = useState<number>(0);
  // query contract to check owner
  return {isOwner, tokenId};
};

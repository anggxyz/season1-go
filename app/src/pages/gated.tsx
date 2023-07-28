// Test token gated page

import type { GetServerSideProps, NextPage } from "next";
import { siweServer } from "src/server/utils/siweServer";

const walletHasToken = (address: string): boolean => {
  console.log({address});
  return true
}

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { address } = await siweServer.getSession(req, res);
  console.log({address});
  if (!address || !(walletHasToken(address))) {
    return {
      redirect: {
        permanent: false,
        destination: '/', // Redirect if wallet does not have the required token
      }
    };
  }
  return {
    props: {}
  };
};

const CollectorsOnlyPage: NextPage = () => {
  return <>Welcome, collector.</>;
};

export default CollectorsOnlyPage;
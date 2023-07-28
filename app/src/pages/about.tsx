import type { GetServerSideProps, NextPage } from "next";
import { siweServer } from "src/server/utils/siweServer";
import { walletHasToken } from "~src/hooks/useIsTokenGated";
import Main from "~src/layouts/Main";


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

const About: NextPage = () => {
  return (
  <Main>
    <div>
      <div>This is a token gated page.</div>
      <div>Welcome, collector.</div>
    </div>
  </Main>
  );
};

export default About;
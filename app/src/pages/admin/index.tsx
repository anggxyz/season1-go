/* eslint-disable @typescript-eslint/no-misused-promises */
import { ConnectKitButton } from "connectkit";
import { type GetServerSideProps } from "next";
import { useEffect, useState } from "react";
import { Button, Frame, Hourglass, TextInput, Window, WindowContent, WindowHeader } from "react95";
import Main from "src/layouts/Main";
import { useContractRead, useContractWrite } from "wagmi";
import { ErrorWindow } from "~src/components/ErrorWindow";
import { useDataStore } from "~src/hooks/useDataStore";
import { useMerkleRoot } from "~src/hooks/useMerkleRoot";
import { siweServer } from "~src/server/utils/siweServer";
import { deployed } from "~src/utils/contracts/vcs1";
import { Wrapper } from "..";
import { isAddressAdmin } from "~src/server/utils/isAddressAdmin";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { address } = await siweServer.getSession(req, res);
  const isAdmin = await isAddressAdmin(address);
  if (!address || !isAdmin) {
    return {
      redirect: {
        permanent: false,
        destination: '/admin/auth',
      }
    };
  }
  return {
    props: {}
  };
};

const Admin = () => {
  return (
    <Main>
      <div>
        <ConnectKitButton />
        <br />
        {/* <ReadContract/> */}
        <AdminFunctions />
      </div>
    </Main>
  )
}

const AdminFunctions = () => {
  const [updateWhitelistArgs, setUpdateWhitelistArgs] = useState<string>("");
  // get whitelist from edge
  const { data: whitelist, refetch: refetchWhitelist } = useDataStore({ key: "whitelist" });

  useEffect(() => {
    if (whitelist) {
      setUpdateWhitelistArgs(whitelist.data.toString());
    }
  }, [whitelist])

  // fetch merkle root
  const { data: merkleRoot, /* isLoading: isMerkleRootLoading, */ error: isMerkleRootError, refetch: refetchRoot } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'merkleRoot',
    chainId: deployed.chainId,
    enabled: true
  })

  const {root, refetch: generateRoot} = useMerkleRoot();

  // set merkle root
  const { write: updateWhitelistOnContract, error: updateWhitelistOnContractError, isLoading: updateWhitelistLoading } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'updateMerkleRoot',
    args: [root],
    chainId: deployed.chainId,
    onSuccess: () => refetchRoot()
  })

  const [isError, setIsError] = useState<boolean>(false);

  useEffect(() => {
    setIsError(Boolean(updateWhitelistOnContractError) || Boolean(isMerkleRootError));
  }, [updateWhitelistOnContractError, isMerkleRootError])

  console.log(updateWhitelistOnContractError);

  console.log(root);


  return (
    <Wrapper>
    <Window style={{ padding: '0.2rem', height: 'min-content', marginBottom: '1rem' }}>
    <WindowHeader>
      Admin Functions
    </WindowHeader>
    <WindowContent style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <div style={{display: 'flex', flexDirection: 'column',  gap: '8px', width: '100%'}}>
          <TextInput
            multiline
            rows={6}
            value={String(updateWhitelistArgs)}
            contentEditable={false}
          />
          <Frame variant='well' style={{ padding: '10px' }} >
            Updating whitelist:
            <br />
            <ol>
              <li>Update array `whitelist` in <a href="https://vercel.com/angelagilhotra/season1-go/stores" target="_blank">edge config</a></li>
              <li>Click Refetch whitelist below, confirm the whitelist displayed above is the same as the one in Edge config</li>
              <li>Click Generate root below</li>
              <li>If generated root is different from Fetched root from contract, click `Update Root`</li>
            </ol>
          </Frame>
          <Button style={{ width: '300px' }} onClick={() => refetchWhitelist()}>Refetch whitelist from Edge</Button>
          <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
            <Button style={{width: '300px'}} onClick={() => generateRoot()}>Generate Root</Button>
            <TextInput value={root.toString() ?? ""} contentEditable={false} style={{width: "100%", flex: "1"}}/>
          </div>
          <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
            <Button style={{width: '300px'}} onClick={() => refetchRoot()}>Refetch Root from Contract</Button>
            <TextInput value={merkleRoot?.toString() ?? ""} contentEditable={false} style={{width: "100%", flex: "1"}}/>
          </div>
            <Button style={{width: '300px', marginTop: "10px"}} onClick={() => updateWhitelistOnContract()} size="lg" primary disabled={root === merkleRoot}>
              Update Root on Contract
              {
                updateWhitelistLoading &&
                <Hourglass />
              }
            </Button>
        </div>
      </div>
    </WindowContent>
  </Window>
    {
      isError &&
      <ErrorWindow onClose={() => setIsError(false)} text="" />
    }
  </Wrapper>
  )
}

export default Admin;

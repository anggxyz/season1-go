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
import { ADMINS } from "~src/utils/constants";
import { deployed } from "~src/utils/contracts/vcs1";
import { Wrapper } from "..";

export const getServerSideProps: GetServerSideProps = async ({ req, res }) => {
  const { address } = await siweServer.getSession(req, res);
  if (!address || !(ADMINS.includes(address))) {
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

const ReadContract = () => {
  const [checkWhitelistFor, setCheckWhitelistFor] = useState("0xDd35Ac3f8986aE81d7F8B7c59565E73a3a525B4E");
  const [vars, setVars] = useState<{
    isPaused: boolean,
    totalSupply: number,
    totalMints: number,
    whitelistStatus: boolean
  }>({
    isPaused: false,
    totalSupply: 0,
    totalMints: 0,
    whitelistStatus: false
  });

  // check whitelist status
  const {data: whitelistStatus, isLoading: checkWhitelistLoading, error: checkWhitelistError, refetch: checkWhitelistForRefetch} = useContractRead({
      address: deployed.address as `0x${string}`,
      abi: deployed.abi,
      functionName: 'isWhitelisted',
      chainId: deployed.chainId,
      args: [checkWhitelistFor],
      enabled: false
  })
  // @todo remove
  console.log({checkWhitelistError})
  // ispaused
  const {data: isPaused, isLoading: isPausedLoading, error: isPausedError, refetch: isPausedRefetch} = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'paused',
    chainId: deployed.chainId,
    enabled: false
  })
  // total supply
  const {data: totalSupply, isLoading: totalSupplyLoading, error: totalSupplyError, refetch: totalSupplyRefetch} = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'TOTAL_SUPPLY',
    chainId: deployed.chainId,
    enabled: false
  })
  // total minted
  const {data: totalMints, isLoading: totalMintsLoading, error: totalMintsError, refetch: totalMintsRefetch} = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'currentTokenId',
    chainId: deployed.chainId,
    enabled: false
  })

  useEffect(() => {
    setVars((currentVars) => {
      return {
        ...currentVars,
        isPaused: (!isPausedLoading && !isPausedError) ? Boolean(isPaused) : false,
        totalSupply: (!totalSupplyLoading && !totalSupplyError) ? Number(totalSupply) : 0,
        totalMints: (!totalMintsLoading && !totalMintsError) ? Number(totalMints) : 0,
        whitelistStatus: (!checkWhitelistError && !checkWhitelistLoading) ? Boolean(whitelistStatus) : false
      }
    })
  }, [
    isPaused,
    isPausedLoading,
    isPausedError,
    totalSupply,
    totalSupplyLoading,
    totalSupplyError,
    totalMints,
    totalMintsError,
    totalMintsLoading,
    checkWhitelistError,
    checkWhitelistLoading,
    whitelistStatus
  ])
  return (

    <Window style={{ padding: '0.2rem', width: '100%', height: 'min-content', marginBottom: '1rem' }}>
    <WindowHeader>
      READ
    </WindowHeader>
    <WindowContent style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      <div style={{display: 'flex', flexDirection: 'row', gap: '8px' }}>
        <Button style={{width: '150px'}} onClick={() => totalSupplyRefetch()}>Total Supply</Button>
        <TextInput value={vars.totalSupply} />
        {totalSupplyLoading && <Hourglass />}
      </div>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <Button style={{width: '150px'}} onClick={() => totalMintsRefetch()}>Total Mints</Button>
        <TextInput value={vars.totalMints} />
        {totalMintsLoading && <Hourglass />}
      </div>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <Button style={{width: '150px'}} onClick={() => isPausedRefetch()}>Is Paused</Button>
        <TextInput value={String(vars.isPaused)} />
        {isPausedLoading && <Hourglass />}
      </div>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <Button style={{width: '150px'}} onClick={() => checkWhitelistForRefetch()}>Is Whitelisted</Button>
        <TextInput value={checkWhitelistFor} onChange={(e) => {
          setCheckWhitelistFor(e.target.value)
        }} style={{
          width: '500px'
        }} />
        {checkWhitelistLoading && <Hourglass />}
        <span>{String(vars.whitelistStatus)}</span>
      </div>
    </WindowContent>
  </Window>

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

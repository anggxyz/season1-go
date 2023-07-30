/* eslint-disable @typescript-eslint/no-misused-promises */
import { ConnectKitButton } from "connectkit";
import { type NextPage } from "next";
import { useEffect, useState } from "react";
import { Button, Hourglass, TextInput, Window, WindowContent, WindowHeader } from "react95";
import Main from "src/layouts/Main";
import { useContractRead, useContractWrite } from "wagmi";
import { deployed } from "~src/utils/contracts/vcs1";

const Admin: NextPage = () => {
  return (
    <Main>
      <div>
        <ConnectKitButton />
        <br />
        <ReadContract/>
        <WriteContract/>
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

const WriteContract = () => {
  const [isPausedComponent, setIsPausedComponent] = useState<boolean>(false);
  const [updateWhitelistArgs, setUpdateWhitelistArgs] = useState<string>("0xe7BccBc3b85b52875fB449ac730C026e44221cB7,0xDd35Ac3f8986aE81d7F8B7c59565E73a3a525B4E");

  const generateArgsForWhitelistUpdate = () => {
    const addresses = updateWhitelistArgs.split(",");
    console.log("returning: ", [addresses, true])
    return [addresses, true]
  }

  // ispaused
  const { data: isPaused, isLoading: isPausedLoading, error: isPausedError } = useContractRead({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'paused',
    chainId: deployed.chainId,
    enabled: false
  })
  useEffect(() => {
    if (isPaused && !isPausedLoading && !isPausedError) {
      return setIsPausedComponent(Boolean(isPaused))
    }
    return setIsPausedComponent(false);
  }, [isPaused, isPausedLoading, isPausedError])

  // set whitelist
  const { write: updateWhitelist, error: updateWhitelistError } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'bulkUpdateWhitelist',
    args: generateArgsForWhitelistUpdate(),
    chainId: deployed.chainId,
  })

  // pause contract
  const { write: pause, error: pauseError } = useContractWrite({
      address: deployed.address as `0x${string}`,
      abi: deployed.abi,
      functionName: 'pause',
      chainId: deployed.chainId,
    })

  // unpause contract
  const { write: unpause, error: unpauseError } = useContractWrite({
    address: deployed.address as `0x${string}`,
    abi: deployed.abi,
    functionName: 'unpause',
    chainId: deployed.chainId,
  })

  console.log({pauseError, unpauseError})

  console.log(updateWhitelistError);
  return (
    <Window style={{ padding: '0.2rem', width: '100%', height: 'min-content', marginBottom: '1rem' }}>
    <WindowHeader>
      WRITE
    </WindowHeader>
    <WindowContent style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '18px'
    }}>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <Button style={{width: '150px'}} onClick={() => updateWhitelist()} primary>Whitelist</Button>
        <TextInput
          multiline
          rows={6}
          value={String(updateWhitelistArgs)}
          onChange={(e) => { setUpdateWhitelistArgs(e.target.value) }}
          style={{
            width: '500px'
          }}
        />
      </div>
      <div style={{display: 'flex', flexDirection: 'row',  gap: '8px'}}>
        <Button style={{width: '150px'}} onClick={() => {
          if (isPausedComponent) {
            return unpause();
          } else {
            return pause();
          }
        }} primary>{isPausedComponent ? "Unpause" : "Pause"}</Button>
      </div>
    </WindowContent>
  </Window>
  )
}

export default Admin;

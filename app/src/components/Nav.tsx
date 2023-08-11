import Link from 'next/link';
import React from 'react';
import { AppBar, Button, Toolbar } from 'react95';
import { useRouter } from 'next/router'
import { CHAIN } from '~src/utils/onChainConfig';
// import { useIsTokenGated } from '~src/hooks/useIsTokenGated';

type NavItem = "home" | "about" | "kya";

const getActiveNavItem = (path: string): NavItem | undefined => {
  if (path === "/") return "home";
  if (path.includes("about")) return "about";
  if (path.includes("kya")) return "kya";
  return;
}

const ActiveChain = () => {
  if (!CHAIN?.name) {
    return <></>
  }
  return <Button variant='menu' active={false} style={{margin: "5px"}}>Active chain: {CHAIN.name.toString()}</Button>
}

export default function Nav() {
  const router = useRouter()
  const activeNavItem = getActiveNavItem(router.pathname);
  // const locked = useIsTokenGated();
  return (
    <AppBar>
      <Toolbar style={{ justifyContent: "space-between", padding: "5px" }}>
        <div>
          <Link href={"/"}>
            <Button variant='menu' active={activeNavItem === "home"} style={{margin: "5px"}}>Mint</Button>
          </Link>
          {/* <Link href={"/about"}>
            <Button variant='menu' active={activeNavItem === "about"} disabled={locked}>About</Button>
          </Link> */}
          <Link href={"/kya"}>
            <Button variant='menu' active={activeNavItem === "kya"} disabled>Your KYA Score</Button>
          </Link>
        </div>
        <ActiveChain />
      </Toolbar>
    </AppBar>
  )
}
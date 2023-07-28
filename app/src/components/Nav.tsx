import Link from 'next/link';
import React from 'react';
import { AppBar, Button, Toolbar } from 'react95';
import { useRouter } from 'next/router'
import { useIsTokenGated } from '~src/hooks/useIsTokenGated';

type NavItem = "home" | "about" | "kya";

const getActiveNavItem = (path: string): NavItem => {
  if (path === "/") return "home";
  if (path.includes("about")) return "about";
  if (path.includes("kya")) return "kya";
  return "home";
}

export default function Nav() {
  const router = useRouter()
  const activeNavItem: NavItem = getActiveNavItem(router.pathname);
  const locked = useIsTokenGated();
  return (
    <AppBar>
      <Toolbar style={{ justifyContent: "space-between", padding: "5px" }}>
        <div>
          <Link href={"/"}>
            <Button variant='menu' active={activeNavItem === "home"} style={{margin: "5px"}}>Mint</Button>
          </Link>
          <Link href={"/about"}>
            <Button variant='menu' active={activeNavItem === "about"} disabled={locked}>About</Button>
          </Link>
          <Link href={"/kya"}>
            <Button variant='menu' active={activeNavItem === "kya"} disabled>Your KYA Score</Button>
          </Link>
        </div>
      </Toolbar>
    </AppBar>
  )
}
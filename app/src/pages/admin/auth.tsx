import { ConnectKitButton } from "connectkit";
import Link from "next/link";
import { Window, WindowContent } from "react95";
import useIsAdmin from "~src/hooks/useIsAdmin";
import Main from "~src/layouts/Main";

export default function Auth () {
  const isAdmin = useIsAdmin();

  return (
    <Main>
    <div>
      <Window style={{ padding: '0.2rem', width: '100%', height: 'min-content', marginBottom: '1rem' }}>
        <WindowContent>
          {isAdmin? "You are an admin" : "Connect an admin account"}
          {isAdmin &&
          <div>
            <br />
            <Link href="/admin">
              Admin Page
            </Link>
          </div>
          }
        </WindowContent>
      </Window>
      <br />
      <ConnectKitButton />
      <br />
    </div>
  </Main>
  )
}
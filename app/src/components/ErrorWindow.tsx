import { Button, Window, WindowHeader } from "react95"

export const ErrorWindow = ({
  onClose,
  text
}: {
  onClose: () => void;
  text?: string
}) => {
  return (
    <Window style={{
      height: "min-content",
      width: "250px",
      padding: "8px",
      display: "flex",
      flexDirection: "column"
    }}>
    <WindowHeader className="window-title">
      <span>Error</span>
      <Button onClick={onClose}><span className='close-icon' /></Button>
    </WindowHeader>
      <p>There was an error</p>
      {
        text && <p>{text}</p>
      }
      <Button primary onClick={onClose}>Try again?</Button>
    </Window>
  )
}
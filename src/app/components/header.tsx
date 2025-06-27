import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Header() {

  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
      <h1 style={{ margin: 0, fontSize: '2rem' }}>BabyCoin DApp</h1>
      <ConnectButton />
    </header>
  )
}
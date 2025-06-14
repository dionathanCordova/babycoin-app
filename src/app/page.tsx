// app/page.tsx
'use client'; // Indica que este componente deve ser renderizado no lado do cliente

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance } from 'wagmi';

export default function HomePage() {
  const { address, isConnected } = useAccount(); // Hook do Wagmi para informações da carteira
  const { data: ethBalance } = useBalance({ address: address }); // Hook do Wagmi para saldo de ETH

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>BabyCoin DApp</h1>
        <ConnectButton /> {/* Botão de conexão do RainbowKit */}
      </header>

      {isConnected ? (
        <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
          <h2>Minha Carteira</h2>
          <p><strong>Endereço:</strong> {address}</p>
          <p><strong>Saldo ETH:</strong> {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ${ethBalance.symbol}` : 'Carregando...'}</p>
          {/* Aqui adicionaremos o saldo de BabyCoin mais tarde */}
          <p><strong>Saldo BabyCoin:</strong> Carregando...</p>
        </section>
      ) : (
        <section style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '8px', color: '#666' }}>
          <p>Por favor, conecte sua carteira para interagir com o BabyCoin DApp.</p>
        </section>
      )}

      {/* Seções futuras */}
      <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Ações do Token BabyCoin</h2>
        <p>Conteúdo da seção de compra/venda de tokens virá aqui.</p>
      </section>

      <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Gerenciamento de Tarefas</h2>
        <p>Conteúdo da seção de tarefas virá aqui.</p>
      </section>

      <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
        <h2>Gerenciamento Multisig</h2>
        <p>Conteúdo da seção Multisig virá aqui.</p>
      </section>

      <footer style={{ textAlign: 'center', marginTop: '3rem', paddingTop: '1rem', borderTop: '1px solid #eee', color: '#777' }}>
        <p>&copy; 2025 BabyCoin DApp</p>
      </footer>
    </main>
  );
}
'use client';

import React from 'react';
import { useAccount } from 'wagmi';
import MyWallet from './myWallet';
import ExchangeActions from './exchangeActions';

export default function Wallet() {
  const { isConnected } = useAccount();

  return (
    <>
      {isConnected ? (
        <>
          <MyWallet />
          <ExchangeActions />
        </>
      ) : (
        <section style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '8px', color: '#666' }}>
          <p>Por favor, conecte sua carteira para interagir com o BabyCoin DApp.</p>
        </section>
      )}
    </>
  );
}
// app/page.tsx
'use client';

import React from 'react';
import Header from './components/header';
import Wallet from './components/wallet';

export default function HomePage() {

  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <Header />
      <Wallet />

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
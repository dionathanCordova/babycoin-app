// app/page.tsx
'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'; // Adicione useWriteContract e useWaitForTransactionReceipt
import { formatUnits, parseEther, parseUnits } from 'viem'; // Adicione parseEther e parseUnits
import { useState } from 'react'; // Para gerenciar o estado dos inputs

import { babyCoinTokenAbi, babyCoinExchangeAbi } from '../../lib/abi'; // Importe ambos os ABIs
import React from 'react';

const BABY_COIN_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // SEU ENDEREÇO DO TOKEN
const BABY_COIN_EXCHANGE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // SEU ENDEREÇO DO EXCHANGE

export default function HomePage() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: address });

  // Estado para inputs
  const [ethToBuy, setEthToBuy] = useState('');
  const [bbcToSell, setBbcToSell] = useState('');

  // --- Leitura de Saldos e Taxa de Câmbio ---
  const {
    data: babyCoinBalance,
    isLoading: isBabyCoinBalanceLoading,
    isError: isBabyCoinBalanceError,
    refetch: refetchBabyCoinBalance, // Para atualizar o saldo após transações
  } = useReadContract({
    address: BABY_COIN_TOKEN_ADDRESS,
    abi: babyCoinTokenAbi,
    functionName: 'balanceOf',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  const {
    data: exchangeRate,
    isLoading: isExchangeRateLoading,
    isError: isExchangeRateError,
  } = useReadContract({
    address: BABY_COIN_EXCHANGE_ADDRESS,
    abi: babyCoinExchangeAbi,
    functionName: 'exchangeRate',
    query: {
      enabled: isConnected,
    },
  });

  const {
    data: pendingEth,
    isLoading: isPendingEthLoading,
    isError: isPendingEthError,
    refetch: refetchPendingEth, // Para atualizar o saldo pendente
  } = useReadContract({
    address: BABY_COIN_EXCHANGE_ADDRESS,
    abi: babyCoinExchangeAbi,
    functionName: 'pendingWithdrawals',
    args: [address as `0x${string}`],
    query: {
      enabled: isConnected && !!address,
    },
  });

  // --- Funções de Escrita (Transações) ---

  // 1. Compra de BBC
  const {
    data: buyHash,
    writeContract: writeBuyTokens,
    isPending: isBuying,
    isError: isBuyError,
    error: buyError,
  } = useWriteContract();

  const { isLoading: isBuyConfirming, isSuccess: isBuyConfirmed, isError: isBuyTxError } =
    useWaitForTransactionReceipt({
      hash: buyHash,
    });

  const handleBuyTokens = async () => {
    if (!ethToBuy || parseFloat(ethToBuy) <= 0) {
      alert('Por favor, insira uma quantidade válida de ETH para comprar.');
      return;
    }
    try {
      // parseEther converte ETH para wei (18 decimais)
      const valueInWei = parseEther(ethToBuy);
      writeBuyTokens({
        address: BABY_COIN_EXCHANGE_ADDRESS,
        abi: babyCoinExchangeAbi,
        functionName: 'buyTokens',
        value: valueInWei, // O ETH a ser enviado
      });
    } catch (e) {
      console.error('Erro ao preparar transação de compra:', e);
    }
  };

  // Efeito para recarregar saldos após compra confirmada
  React.useEffect(() => {
    if (isBuyConfirmed) {
      alert('Compra de BabyCoin confirmada com sucesso!');
      refetchBabyCoinBalance(); // Atualiza o saldo de BBC
      // refetchEthBalance(); // Se houvesse um refetch para o saldo de ETH da carteira
      setEthToBuy(''); // Limpa o input
    }
    if (isBuyTxError) {
      alert(`Erro na transação de compra: ${buyError?.message}`);
    }
  }, [isBuyConfirmed, isBuyTxError, refetchBabyCoinBalance, buyError]);


  // 2. Venda de BBC (requer aprovação primeiro)

  // Aprovação do token para o Exchange
  const {
    data: approveHash,
    writeContract: writeApprove,
    isPending: isApproving,
    isError: isApproveError,
    error: approveError,
  } = useWriteContract();

  const { isLoading: isApproveConfirming, isSuccess: isApproveConfirmed, isError: isApproveTxError } =
    useWaitForTransactionReceipt({
      hash: approveHash,
    });

  // Venda do token
  const {
    data: sellHash,
    writeContract: writeSellTokens,
    isPending: isSelling,
    isError: isSellError,
    error: sellError,
  } = useWriteContract();

  const { isLoading: isSellConfirming, isSuccess: isSellConfirmed, isError: isSellTxError } =
    useWaitForTransactionReceipt({
      hash: sellHash,
    });

  const handleSellTokens = async () => {
    if (!bbcToSell || parseFloat(bbcToSell) <= 0) {
      alert('Por favor, insira uma quantidade válida de BBC para vender.');
      return;
    }
    try {
      // parseUnits converte BBC para wei (18 decimais)
      const amountInWei = parseUnits(bbcToSell, 18); // Assumindo 18 decimais para BBC

      // Primeiro, aprovar o contrato de troca para gastar os tokens BBC
      writeApprove({
        address: BABY_COIN_TOKEN_ADDRESS,
        abi: babyCoinTokenAbi,
        functionName: 'approve',
        args: [BABY_COIN_EXCHANGE_ADDRESS, amountInWei],
      });
    } catch (e) {
      console.error('Erro ao preparar transação de aprovação:', e);
    }
  };

  // Efeito para esperar a aprovação e então chamar a venda
  React.useEffect(() => {
    if (isApproveConfirmed) {
      alert('Aprovação de BabyCoin confirmada. Agora executando a venda...');
      // Se a aprovação foi bem-sucedida, chame a função de venda
      const amountInWei = parseUnits(bbcToSell, 18);
      writeSellTokens({
        address: BABY_COIN_EXCHANGE_ADDRESS,
        abi: babyCoinExchangeAbi,
        functionName: 'sellTokens',
        args: [amountInWei],
      });
    }
    if (isApproveTxError) {
      alert(`Erro na transação de aprovação: ${approveError?.message}`);
    }
  }, [isApproveConfirmed, isApproveTxError, bbcToSell, writeSellTokens, approveError]);

  // Efeito para recarregar saldos após venda confirmada
  React.useEffect(() => {
    if (isSellConfirmed) {
      alert('Venda de BabyCoin confirmada com sucesso!');
      refetchBabyCoinBalance(); // Atualiza o saldo de BBC
      refetchPendingEth(); // Atualiza ETH pendente
      setBbcToSell(''); // Limpa o input
    }
    if (isSellTxError) {
      alert(`Erro na transação de venda: ${sellError?.message}`);
    }
  }, [isSellConfirmed, isSellTxError, refetchBabyCoinBalance, refetchPendingEth, sellError]);


  // 3. Resgate de ETH Pendente
  const {
    data: withdrawHash,
    writeContract: writeWithdrawEth,
    isPending: isWithdrawing,
    isError: isWithdrawError,
    error: withdrawError,
  } = useWriteContract();

  const { isLoading: isWithdrawConfirming, isSuccess: isWithdrawConfirmed, isError: isWithdrawTxError } =
    useWaitForTransactionReceipt({
      hash: withdrawHash,
    });

  const handleWithdrawEth = async () => {
    try {
      writeWithdrawEth({
        address: BABY_COIN_EXCHANGE_ADDRESS,
        abi: babyCoinExchangeAbi,
        functionName: 'withdrawEth',
      });
    } catch (e) {
      console.error('Erro ao preparar transação de resgate de ETH:', e);
    }
  };

  // Efeito para recarregar saldos após resgate de ETH confirmado
  React.useEffect(() => {
    if (isWithdrawConfirmed) {
      alert('Resgate de ETH confirmado com sucesso!');
      refetchPendingEth(); // Atualiza o saldo pendente
      // refetchEthBalance(); // Se houvesse um refetch para o saldo de ETH da carteira
    }
    if (isWithdrawTxError) {
      alert(`Erro na transação de resgate de ETH: ${withdrawError?.message}`);
    }
  }, [isWithdrawConfirmed, isWithdrawTxError, refetchPendingEth, withdrawError]);


  return (
    <main style={{ padding: '2rem', maxWidth: '800px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid #eee', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, fontSize: '2rem' }}>BabyCoin DApp</h1>
        <ConnectButton />
      </header>

      {isConnected ? (
        <>
          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Minha Carteira</h2>
            <p><strong>Endereço:</strong> {address}</p>
            <p><strong>Saldo ETH:</strong> {ethBalance ? `${parseFloat(ethBalance.formatted).toFixed(4)} ${ethBalance.symbol}` : 'Carregando...'}</p>
            <p>
              <strong>Saldo BabyCoin:</strong>{' '}
              {isBabyCoinBalanceLoading ? (
                'Carregando...'
              ) : isBabyCoinBalanceError ? (
                'Erro ao carregar saldo'
              ) : (
                babyCoinBalance !== undefined && babyCoinBalance !== null ?
                  `${formatUnits(babyCoinBalance as bigint, 18)} BBC`
                  : 'Não disponível'
              )}
            </p>
            <p>
              <strong>ETH Pendente (Venda):</strong>{' '}
              {isPendingEthLoading ? (
                'Carregando...'
              ) : isPendingEthError ? (
                'Erro ao carregar ETH pendente'
              ) : (
                pendingEth !== undefined && pendingEth !== null ?
                  `${formatUnits(pendingEth as bigint, 18)} ETH`
                  : '0 ETH'
              )}
              {pendingEth !== undefined && pendingEth !== null && (pendingEth as bigint) > 0 && ( // Só mostra o botão se houver ETH pendente
                <button
                  onClick={handleWithdrawEth}
                  disabled={isWithdrawing || isWithdrawConfirming}
                  style={{ marginLeft: '1rem', padding: '0.5rem 1rem', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
                >
                  {isWithdrawing || isWithdrawConfirming ? 'Resgatando...' : 'Resgatar ETH'}
                </button>
              )}
            </p>
            {isWithdrawError && <p style={{ color: 'red' }}>Erro ao resgatar ETH: {withdrawError?.message}</p>}
            {isWithdrawConfirmed && <p style={{ color: 'green' }}>Resgate de ETH concluído!</p>}
          </section>

          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Ações do Token BabyCoin</h2>
            <p>Taxa de Câmbio: {isExchangeRateLoading ? 'Carregando...' : isExchangeRateError ? 'Erro' : `${formatUnits(exchangeRate as bigint, 18)} BBC por 1 ETH`}</p>

            {/* Compra de BBC */}
            <h3>Comprar BabyCoin</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <input
                type="number"
                placeholder="ETH para gastar"
                value={ethToBuy}
                onChange={(e) => setEthToBuy(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', flexGrow: 1 }}
              />
              <button
                onClick={handleBuyTokens}
                disabled={isBuying || isBuyConfirming}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {isBuying || isBuyConfirming ? 'Comprando...' : 'Comprar BBC'}
              </button>
            </div>
            {isBuyError && <p style={{ color: 'red' }}>Erro ao comprar: {buyError?.message}</p>}
            {isBuyConfirmed && <p style={{ color: 'green' }}>Compra concluída!</p>}

            {/* Venda de BBC */}
            <h3>Vender BabyCoin</h3>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem' }}>
              <input
                type="number"
                placeholder="BBC para vender"
                value={bbcToSell}
                onChange={(e) => setBbcToSell(e.target.value)}
                style={{ padding: '0.5rem', borderRadius: '5px', border: '1px solid #ccc', flexGrow: 1 }}
              />
              <button
                onClick={handleSellTokens}
                disabled={isApproving || isApproveConfirming || isSelling || isSellConfirming}
                style={{ padding: '0.5rem 1rem', backgroundColor: '#dc3545', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
              >
                {isApproving || isApproveConfirming ? 'Aprovando...' : isSelling || isSellConfirming ? 'Vendendo...' : 'Vender BBC'}
              </button>
            </div>
            {isApproveError && <p style={{ color: 'red' }}>Erro na aprovação: {approveError?.message}</p>}
            {isSellError && <p style={{ color: 'red' }}>Erro ao vender: {sellError?.message}</p>}
            {isSellConfirmed && <p style={{ color: 'green' }}>Venda concluída!</p>}
          </section>
        </>
      ) : (
        <section style={{ textAlign: 'center', padding: '2rem', border: '1px dashed #ccc', borderRadius: '8px', color: '#666' }}>
          <p>Por favor, conecte sua carteira para interagir com o BabyCoin DApp.</p>
        </section>
      )}

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
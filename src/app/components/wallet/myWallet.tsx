// app/page.tsx
'use client';

import React from 'react';
import { useAccount, useBalance, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'; // Adicione useWriteContract e useWaitForTransactionReceipt
import { formatUnits } from 'viem'; // Adicione parseEther e parseUnits

import { babyCoinTokenAbi, babyCoinExchangeAbi } from '../../../../lib/abi'; // Importe ambos os ABIs

const BABY_COIN_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // SEU ENDEREÇO DO TOKEN
const BABY_COIN_EXCHANGE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // SEU ENDEREÇO DO EXCHANGE

export default function MyWallet() {
  const { address, isConnected } = useAccount();
  const { data: ethBalance } = useBalance({ address: address });

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

  // 1. Compra de BBC
  const {
    data: buyHash,
    error: buyError,
  } = useWriteContract();

  const { isSuccess: isBuyConfirmed, isError: isBuyTxError } =
    useWaitForTransactionReceipt({
      hash: buyHash,
    });

  // Efeito para recarregar saldos após compra confirmada
  React.useEffect(() => {
    if (isBuyConfirmed) {
      alert('Compra de BabyCoin confirmada com sucesso!');
      refetchBabyCoinBalance(); // Atualiza o saldo de BBC
      // refetchEthBalance(); // Se houvesse um refetch para o saldo de ETH da carteira
    }
    if (isBuyTxError) {
      alert(`Erro na transação de compra: ${buyError?.message}`);
    }
  }, [isBuyConfirmed, isBuyTxError, refetchBabyCoinBalance, buyError]);

  // Efeito para esperar a aprovação e então chamar a venda
  // React.useEffect(() => {
  //   if (isApproveConfirmed) {
  //     alert('Aprovação de BabyCoin confirmada. Agora executando a venda...');
  //     // Se a aprovação foi bem-sucedida, chame a função de venda
  //     const amountInWei = parseUnits(bbcToSell, 18);
  //     writeSellTokens({
  //       address: BABY_COIN_EXCHANGE_ADDRESS,
  //       abi: babyCoinExchangeAbi,
  //       functionName: 'sellTokens',
  //       args: [amountInWei],
  //     });
  //   }
  //   if (isApproveTxError) {
  //     alert(`Erro na transação de aprovação: ${approveError?.message}`);
  //   }
  // }, [isApproveConfirmed, isApproveTxError, bbcToSell, writeSellTokens, approveError]);

  // // Efeito para recarregar saldos após venda confirmada
  // React.useEffect(() => {
  //   if (isSellConfirmed) {
  //     alert('Venda de BabyCoin confirmada com sucesso!');
  //     refetchBabyCoinBalance(); // Atualiza o saldo de BBC
  //     refetchPendingEth(); // Atualiza ETH pendente
  //     setBbcToSell(''); // Limpa o input
  //   }
  //   if (isSellTxError) {
  //     alert(`Erro na transação de venda: ${sellError?.message}`);
  //   }
  // }, [isSellConfirmed, isSellTxError, refetchBabyCoinBalance, refetchPendingEth, sellError]);


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
    </>
  );
}
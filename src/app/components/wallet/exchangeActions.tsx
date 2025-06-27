'use client';

import React, { useState } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'; // Adicione useWriteContract e useWaitForTransactionReceipt
import { parseEther, parseUnits } from 'viem';

import { babyCoinTokenAbi, babyCoinExchangeAbi } from '../../../../lib/abi'; // Importe ambos os ABIs

const BABY_COIN_TOKEN_ADDRESS = '0x5FbDB2315678afecb367f032d93F642f64180aa3'; // SEU ENDEREÇO DO TOKEN
const BABY_COIN_EXCHANGE_ADDRESS = '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512'; // SEU ENDEREÇO DO EXCHANGE

export default function ExchangeActions() {
  const { address, isConnected } = useAccount();

  // Estado para inputs
  const [ethToBuy, setEthToBuy] = useState('');
  const [bbcToSell, setBbcToSell] = useState('');

  // --- Leitura de Saldos e Taxa de Câmbio ---
  const {
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
    data: feePercentage,
    isLoading: isFeePercentageLoading,
    isError: isFeePercentageError,
  } = useReadContract({
    address: BABY_COIN_EXCHANGE_ADDRESS,
    abi: babyCoinExchangeAbi,
    functionName: 'feePercentage',
    query: {
      enabled: isConnected,
    },
  });

  const {
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

  return (
    <>
      {isConnected ? (
        <>
          <section style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #ccc', borderRadius: '8px' }}>
            <h2>Ações do Token BabyCoin</h2>
            <p>Taxa de Câmbio: {isFeePercentageLoading ? 'Carregando...' : isFeePercentageError ? 'Erro' : `${(feePercentage as bigint).toString()}%`}</p>
            <br />
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
    </>
  );
}
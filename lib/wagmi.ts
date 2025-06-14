// lib/wagmi.ts
import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  mainnet,
  sepolia,
  goerli, // Goerli está sendo descontinuada, mas é um exemplo
  hardhat, // Para o seu Anvil local
} from 'wagmi/chains';

// Para o Anvil, você pode adicionar a chain manualmente se ela não estiver no wagmi/chains
// Ou usar a 'hardhat' chain, que geralmente funciona para Anvil
const anvil = {
  id: 31337, // Default Chain ID for Anvil/Hardhat
  name: 'Anvil Localhost',
  nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
  rpcUrls: {
    default: { http: ['http://127.0.0.1:8545'] },
  },
  blockExplorers: {
    default: { name: 'Etherscan', url: 'https://etherscan.io' }, // Placeholder, Anvil não tem block explorer
  },
  testnet: true,
} as const;


export const config = getDefaultConfig({
  appName: 'BabyCoin DApp',
  projectId: 'YOUR_PROJECT_ID', // Crie um no WalletConnect Cloud: cloud.walletconnect.com
  chains: [
    anvil, // Adicione seu Anvil local aqui
    mainnet,
    sepolia,
    // goerli, // Adicione outras testnets ou mainnet conforme necessário
  ],
  ssr: true, // Habilita o Server-Side Rendering
});
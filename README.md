This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

/app
  /layout.tsx           // Configuração global de Wagmi/RainbowKit
  /page.tsx             // A página principal do seu DApp
  /api                  // Opcional: para APIs internas (se necessário)
/components
  /WalletConnectButton.tsx // Botão de conexão (RainbowKit)
  /TokenInfo.tsx           // Exibe preço, taxa, etc.
  /BuySellTokens.tsx       // Formulários de compra/venda
  /WithdrawEth.tsx         // Componente de saque
  /CreateTaskForm.tsx      // Formulário de criação de tarefa
  /TaskList.tsx            // Componente para listar e interagir com tarefas
/hooks
  /useBabyCoinToken.ts     // Hook customizado para interagir com BabyCoinToken
  /useBabyCoinTasks.ts     // Hook customizado para interagir com BabyCoinTasks
/lib
  /wagmi.ts               // Configuração de Wagmi e RainbowKit
  /abis.ts                // Exporta os ABIs dos seus contratos (importados dos artifacts)
/public                   // Imagens, ícones, etc.
/styles                   // Arquivos CSS (Tailwind CSS é uma ótima opção para dApps)


todo 
Melhorar o log que aparece ao realizar compra, mudar para toast
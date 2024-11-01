import { useMemo } from 'react';
import './App.css';
import { ConnectionProvider, useWallet, WalletProvider } from '@solana/wallet-adapter-react';
import { clusterApiUrl } from "@solana/web3.js";
import {
    GlowWalletAdapter,
    PhantomWalletAdapter,
    SolflareWalletAdapter,
    SolletWalletAdapter, TorusWalletAdapter
} from "@solana/wallet-adapter-wallets";
import { WalletAdapterNetwork } from "@solana/wallet-adapter-base";
import {
    WalletModalProvider,
    WalletMultiButton
} from "@solana/wallet-adapter-react-ui";


import EmployeeForm from './components/MainView';

import { Analytics } from '@vercel/analytics/react';

require('@solana/wallet-adapter-react-ui/styles.css');

const Content = () => {
    const wallet = useWallet()

    return (
        <header className="App-header">
            <div className='w-screen relative  flex flex-col justify-center  backdrop-blur-[80px]'>
                <div className='absolute top-0 right-0 m-4'>
                    <WalletMultiButton />
                </div>
            {wallet?.publicKey ? <EmployeeForm wallet={wallet} /> 
            : 
                <h1 className='absolute mt-[50%] mx-[50%]'>Please connect your wallet!</h1>
            }
            </div>
        </header>
    )
}

function App() {
    const network = WalletAdapterNetwork.Devnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);
    const wallets = useMemo(
        () => [
            new PhantomWalletAdapter(),
            new GlowWalletAdapter(),
            new SolflareWalletAdapter({ network }),
            new TorusWalletAdapter(),
            new SolletWalletAdapter({ network }),
        ],
        [network]
    );

    return (
        <div className="App w-screen h-screen">
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <Content />
                        <Analytics/>
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;

import React, { useMemo } from 'react';
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


import EmployeeForm from './components/EmployeeForm';


require('@solana/wallet-adapter-react-ui/styles.css');

const Content = () => {
    const wallet = useWallet()

    return (
        <header className="App-header">

            <div className='w-screen h-screen  flex flex-col justify-center  backdrop-blur-[80px]'>
                <div className='absolute top-0 right-0 m-4'>
                    <WalletMultiButton />
                </div>
              
                {wallet?.publicKey ? <EmployeeForm wallet={wallet} /> : null}
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
        <div className="App">
            <ConnectionProvider endpoint={endpoint}>
                <WalletProvider wallets={wallets} autoConnect>
                    <WalletModalProvider>
                        <Content />
                    </WalletModalProvider>
                </WalletProvider>
            </ConnectionProvider>
        </div>
    );
}

export default App;

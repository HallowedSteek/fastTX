import { WalletContextState } from "@solana/wallet-adapter-react";


export type Employee = {
  discordId: string;
  role: string;
  salary: number;
  walletAddress: string;
  solUsdc: string;
  edit: Boolean;
};

export type EA = {
  masterWallet: string;
  discordIds: [string];
  roles: [string];
  salaries: [number];
  walletAddresses: [string];
  edit: Boolean;
  subscription: Boolean;
  subscriptionDate: {
    start: string;
    end: string;
  };
  employeeArray: [Employee];
};
export type MainViewTypes = {
  wallet: WalletContextState;
};

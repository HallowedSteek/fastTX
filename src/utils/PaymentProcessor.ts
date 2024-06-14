import { Keypair, Transaction, SystemProgram, PublicKey, Connection, ParsedAccountData } from '@solana/web3.js';
import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { getOrCreateAssociatedTokenAccount, createTransferInstruction } from '@solana/spl-token';
import taxWallet from '../utils/bante.json'
import { Employee } from '../components/EmployeeForm';

class PaymentProcessor {
  private fromKeypair: Keypair;
  private publicKey: PublicKey;
  private connection: Connection;
  private employees: any[];
  private lamportsPerSol: number;
  private mintAddress: string;
  private sendTransaction: Function;

  constructor( publicKey: PublicKey, connection: Connection, employees: Employee[], lamportsPerSol: number, mintAddress: string, sendTransaction: Function) {
    this.fromKeypair = Keypair.fromSecretKey(new Uint8Array(taxWallet));
    this.publicKey = publicKey;
    this.connection = connection;
    this.employees = employees;
    this.lamportsPerSol = lamportsPerSol;
    this.mintAddress = mintAddress;
    this.sendTransaction = sendTransaction;

    if (!this.publicKey) throw new WalletNotConnectedError();
  }

  public async processPayment() {
    const transaction = new Transaction();

    this.processSolTable(transaction);
    await this.processUsdcTable(transaction);

    const latestBlockHash = await this.connection.getLatestBlockhash();
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
    transaction.feePayer = this.publicKey;

    await this.sendTransaction(transaction, this.connection);
  }

  private processSolTable(transaction: Transaction) {
    const solTable = this.employees.filter(item => item.solUsdc === 'SOL');
    solTable.forEach(item => {
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: this.publicKey,
          toPubkey: new PublicKey(item.walletAddress.trim()),
          lamports: item.salary * this.lamportsPerSol,
        })
      );
    });
  }

  private async processUsdcTable(transaction: Transaction) {
    const usdcTable = this.employees.filter(item => item.solUsdc === 'USDC');
    if (usdcTable.length > 0) {
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        this.connection,
        this.fromKeypair,
        new PublicKey(this.mintAddress),
        this.publicKey
      );

      const destinationAccounts: PublicKey[] = [];
      for (const item of usdcTable) {
        try {
          const destinationAccount = await getOrCreateAssociatedTokenAccount(
            this.connection,
            this.fromKeypair,
            new PublicKey(this.mintAddress),
            new PublicKey(item.walletAddress.trim())
          );
          destinationAccounts.push(destinationAccount.address);
        } catch (error) {
          console.log(error);
        }
      }

      const numberDecimals = await this.getNumberDecimals(this.mintAddress, this.connection);
      usdcTable.forEach((item, index) => {
        transaction.add(
          createTransferInstruction(
            sourceAccount.address,
            destinationAccounts[index],
            this.publicKey,
            item.salary * Math.pow(10, numberDecimals)
          )
        );
      });
    }
  }

  private async getNumberDecimals(mintAddress: string, connection: Connection): Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
  }
}

export default PaymentProcessor;

import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, Keypair, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { FC, useEffect, useState } from 'react';


import getEmployers from '../api/getEmployers';

import "../App.css";
import SubscriptionTable from './EmployerFormComp/SubscriptionTable';
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

import EmployeeTable from './EmployerFormComp/EmployeeTable';
import EmployeeAddSection from './EmployerFormComp/EmployeeAddSection';
import getWallet from '../api/getWallet';

import cazze from '../utils/bante.json'

export type Employee = {
  discordId: string,
  role: string,
  salary: number,
  walletAddress: string,
  solUsdc: string,
  edit: Boolean
}

export type EA = {
  masterWallet: string
  discordIds: [string],
  roles: [string],
  salaries: [number],
  walletAddresses: [string],
  edit: Boolean,
  subscription: Boolean,
  subscriptionDate: {
    start: string,
    end: string
  }
  employeeArray: [Employee]
}

interface Props {
  wallet: WalletContextState
}


const EmployeeForm: FC<Props> = ({ wallet }) => {


  //array cu database-ul
  const [employers, setEmployers] = useState<EA[]>([])

  const [employees, setEmployees] = useState<Employee[]>([])


  useEffect(() => {

    async function fetchEmployers() {
      setEmployers(await getEmployers())
    }
    fetchEmployers()

    async function fetchTokenWall() {
      setTokenWall(await getWallet())
    }
    fetchTokenWall()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const masterPosition = employers.findIndex(item => item.masterWallet === wallet.publicKey?.toBase58())


  useEffect(() => {
    try {
      setEmployees(employers[masterPosition].employeeArray)
    } catch (error) {
      console.log('fetching employees...')
    }

  }, [employers, masterPosition])


  //subscriptie

  const [weekly, setWeekly] = useState(false);



  //date wallet
  const { publicKey, sendTransaction } = wallet;
  // const { connection } = useConnection();

  const connection = new Connection(
    "https://few-solemn-county.solana-mainnet.discover.quiknode.pro/f8fa35bce484452cebe7789519c50638382bb03a/",
    'confirmed',
  );



  //tranzactii usdc

  const MINT_ADDRESS = 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v' //adresa de la usdc


  const [tokenWall, setTokenWall] = useState('')

  async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
  }


  //tranzactii sol


  const payment = async () => {

    const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(cazze));


    if (!publicKey) throw new WalletNotConnectedError();



    //sol
    const transaction = new Transaction()

    const solTable = employees.filter(item => item.solUsdc === 'SOL')

    if (solTable) {
      solTable.map((item) =>
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(item.walletAddress.trim()),
            lamports: item.salary * LAMPORTS_PER_SOL,
          })
        ))
    }


    //usdc



    const usdcTable = employees.filter(item => item.solUsdc === 'USDC')

    if (usdcTable) {
      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(publicKey)
      );

      const destinationAccounts: Array<PublicKey> = [];


      usdcTable.map(async (item) => {
        try {
          const destinationAccount = await getOrCreateAssociatedTokenAccount(
            connection,
            FROM_KEYPAIR,
            new PublicKey(MINT_ADDRESS),
            new PublicKey(item.walletAddress.trim())
          );
          destinationAccounts.push(destinationAccount.address)
        } catch (error) {
          console.log(error)
        }
      })



      const numberDecimals = await getNumberDecimals(MINT_ADDRESS);

      console.log(destinationAccounts)

      usdcTable.map(async (item, index: number) => {
        transaction.add(createTransferInstruction(
          sourceAccount.address,
          new PublicKey(destinationAccounts[index]),
          new PublicKey(publicKey),
          item.salary * Math.pow(10, numberDecimals)
        ))
      })
    }
    const signature = await sendTransaction(transaction, connection);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    });
  }

  const handleEdit = (index: number) => {
    const aux = [...employees]
    aux[index].edit = !aux[index].edit
    setEmployees(aux)
  }


  return (
    <>
      {
        employers.findIndex(item => item.masterWallet === wallet.publicKey?.toBase58()) > -1 ?
          <div className='flex justify-center'>

            {/* tabel */}

            <div className='relative'>
              {masterPosition > -1
                ?
                (employers[masterPosition].subscription)
                  ?
                  <>
                    <SubscriptionTable publicKey={publicKey} connection={connection} sendTransaction={sendTransaction} weekly={weekly} setWeekly={setWeekly} subscriptionDate={employers[masterPosition].subscriptionDate} />
                    {weekly
                      ?
                      <>

                        <EmployeeAddSection
                          employers={employers}
                          publicKey={publicKey}
                          masterPosition={masterPosition}
                          setEmployers={setEmployers}
                          setEmployees={setEmployees}
                        />

                        <EmployeeTable
                          employees={employees}
                          employers={employers}
                          publicKey={publicKey}
                          masterPosition={masterPosition}
                          setEmployers={setEmployers}
                          setEmployees={setEmployees}
                          handleEdit={handleEdit}
                        />

                        <button onClick={payment} className='bg-green-700 hover:bg-green-800  p-2 rounded-md text-lg absolute mt-2 right-0 shd'>SEND SALARY</button>

                      </>
                      : null
                    }
                  </>
                  :
                  <>


                    <EmployeeAddSection
                      employers={employers}
                      publicKey={publicKey}
                      masterPosition={masterPosition}
                      setEmployers={setEmployers}
                      setEmployees={setEmployees}
                    />

                    <EmployeeTable
                      employees={employees}
                      employers={employers}
                      publicKey={publicKey}
                      masterPosition={masterPosition}
                      setEmployers={setEmployers}
                      setEmployees={setEmployees}
                      handleEdit={handleEdit}
                    />

                    <button onClick={payment} className='bg-green-700 hover:bg-green-800  p-2 rounded-md text-lg absolute mt-2 right-0 shd' >SEND SALARY</button>


                  </>
                : null
              }
            </div>
          </div>
          :
          <>
            <h1>Your wallet is not registered! <br />If you are registered, please contact BigBoiSOL【Ø】#0587 on discord for further asistance! </h1> <br /> 💀💀💀

          </>
      }
    </>
  );
}
export default EmployeeForm;


import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, Keypair, ParsedAccountData, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { FC, useEffect, useState } from 'react';


import getEmployers from '../api/getEmployers';

import "../App.css";
import SubscriptionTable from './EmployerFormComp/SubscriptionTable';
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

import EmployeeTable from './EmployerFormComp/EmployeeTable';
import EmployeeAddSection from './EmployerFormComp/EmployeeAddSection';
import getWallet from '../api/getWallet';

import cazze from '../utils/bante.json'
import deleteAllEmployees from '../api/deleteAll';

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

type Props = {
  wallet: WalletContextState
}


const EmployeeForm: FC<Props> = ({ wallet }) => {

  const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(cazze));

  const LAMPORTS_PER_SOL = 100000000

  //array cu database-ul
  const [employers, setEmployers] = useState<EA[]>([])

  const [employees, setEmployees] = useState<Employee[]>([])

  useEffect(() => {

    async function fetchEmployers() {
      setEmployers(await getEmployers())
    }

    fetchEmployers()
    
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
    "https://api.devnet.solana.com",
    'confirmed',
  );

  // usdc stuff
  const MINT_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' //adresa de la usdc

  // decimale pentru spl tokens
  async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(mintAddress));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    return result;
  }

  //plata
  const payment = async () => {

    

    console.log(FROM_KEYPAIR)

    if (!publicKey) throw new WalletNotConnectedError();

    //sol table processing

    const solTable = employees.filter(item => item.solUsdc === 'SOL')
    
    let transaction = new Transaction()

    if (solTable) {
      solTable.map(async (item) => 
        {
          transaction.add(
            SystemProgram.transfer({
              fromPubkey: publicKey,
              toPubkey: new PublicKey(item.walletAddress.trim()),
              lamports: item.salary * 10 * LAMPORTS_PER_SOL,
            })
          )
        }
      )
    }

    //usdc table processing

    const usdcTable = employees.filter(item => item.solUsdc === 'USDC')
   
    if (usdcTable) {

      const sourceAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(publicKey)
      );

      console.log("source acc:")
      console.log(sourceAccount)

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

          console.log("destinationAccount:")
          console.log(destinationAccount)

        } catch (error) {
          console.log(error)
        }
      })

      const numberDecimals = await getNumberDecimals(MINT_ADDRESS);

      usdcTable.map(async (item, index: number) => 
      {
        transaction.add(createTransferInstruction(
          sourceAccount.address,
          new PublicKey(destinationAccounts[index]),
          new PublicKey(publicKey),
          item.salary * Math.pow(10, numberDecimals)
        ))
      })
    }

    const latestBlockHash = await connection.getLatestBlockhash();
    
    transaction.recentBlockhash = latestBlockHash.blockhash;
    transaction.lastValidBlockHeight = latestBlockHash.lastValidBlockHeight;
    transaction.feePayer = publicKey;
    
    await sendTransaction(transaction, connection);
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
                        <button onClick={async () => {
                          await deleteAllEmployees(publicKey!.toString());
                          setEmployers(await getEmployers());
                          setEmployees(employers[masterPosition].employeeArray);
                        }} className='bg-red-700 hover:bg-red-800  p-2 rounded-md text-lg absolute mt-2 left-0 shd' >DELETE ALL</button>


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
                    <button onClick={async () => {
                      await deleteAllEmployees(publicKey!.toString());
                      setEmployers(await getEmployers());
                      setEmployees(employers[masterPosition].employeeArray);
                    }} className='bg-red-700 hover:bg-red-800  p-2 rounded-md text-lg absolute mt-2 left-0 shd' >DELETE ALL</button>

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



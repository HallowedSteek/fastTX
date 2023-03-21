import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, Keypair, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } from "@solana/web3.js";
import { FC, useEffect, useState } from 'react';


import getEmployers from '../api/getEmployers';

import "../App.css";
import SubscriptionTable from './EmployerFormComp/SubscriptionTable';
import { createTransferInstruction, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';

import EmployeeTable from './EmployerFormComp/EmployeeTable';
import EmployeeAddSection from './EmployerFormComp/EmployeeAddSection';
import getWallet from '../api/getWallet';

import json from '../utils/resource.json'


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
    const FROM_KEYPAIR = new Keypair();



    console.log(FROM_KEYPAIR)

    if (!publicKey) throw new WalletNotConnectedError();


    console.log(`correct pk`)

    //sol
    const transaction = new Transaction()

    const solTable = employees.filter(item => item.solUsdc === 'SOL')

    console.log(`got sol table`)

    solTable.map((item) =>
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(item.walletAddress),
          lamports: item.salary * LAMPORTS_PER_SOL,
        })
      ))

    console.log(`added sol transactions`)

    //usdc

    const usdcTable = employees.filter(item => item.solUsdc === 'USDC')




    // console.log(`added usdc table`)

    // console.log(usdcTable)

    // let sourceAccount = await getOrCreateAssociatedTokenAccount(
    //   connection,
    //   FROM_KEYPAIR,
    //   new PublicKey(MINT_ADDRESS),
    //   new PublicKey(wallet.publicKey!)
    // );

    // console.log(`created usdc account  for sender`)

    // console.log(sourceAccount)


    // let destinationAccounts: Array<String> = [];

    // console.log(`destination accounts`)

    // usdcTable.map(async (item) => {
    //   let destinationAccount = await getOrCreateAssociatedTokenAccount(
    //     connection,
    //     FROM_KEYPAIR,
    //     new PublicKey(MINT_ADDRESS),
    //     new PublicKey(item.walletAddress)
    //   );
    //   destinationAccounts.push(destinationAccount.address.toString())
    // })

    // console.log(`usdc accounts for getters`)
    // console.log(destinationAccounts)

    // const numberDecimals = await getNumberDecimals(MINT_ADDRESS);



    // usdcTable.map(async (item, index: number) => {
    //   transaction.add(createTransferInstruction(
    //     sourceAccount.address,
    //     new PublicKey(destinationAccounts[index]),
    //     new PublicKey(wallet.publicKey!),
    //     item.salary * Math.pow(10, numberDecimals)
    //   ))

    // })


    // console.log(`created tx for usdc`)


    console.log(`My public key is: ${FROM_KEYPAIR.publicKey.toString()}.`);

    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      new PublicKey(publicKey)
    );
    console.log(`Source Account: ${sourceAccount.address.toString()}`);

    //Step 2

    let destinationAccounts: Array<string> = [];

    console.log(`2 - Getting Destination Token Account`);

    usdcTable.map(async (item) => {
      let destinationAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(item.walletAddress)
      );
      destinationAccounts.push(destinationAccount.address.toString())
    })

    console.log("destination accounts:")

    destinationAccounts.map(item=> console.log(item))

    //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`Number of Decimals: ${numberDecimals}`);

    //step 4
    console.log(`4 - Creating and Sending Transaction`);

    usdcTable.map(async (item, index: number) => {
      transaction.add(createTransferInstruction(
        sourceAccount.address,
        new PublicKey('4obspsEJwZ7iSP8XV4PtUScEZ5L7m4ZSfAHycrSk1nKa'),
        new PublicKey(publicKey),
        item.salary * Math.pow(10, numberDecimals)
      ))
    })

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


import { WalletContextState } from '@solana/wallet-adapter-react';
import { Connection, LAMPORTS_PER_SOL } from "@solana/web3.js";
import { FC, useEffect, useState } from 'react';


import getEmployers from '../api/getEmployers';

import "../App.css";
import SubscriptionTable from './EmployerFormComp/SubscriptionTable';

import EmployeeTable from './EmployerFormComp/EmployeeTable';
import EmployeeAddSection from './EmployerFormComp/EmployeeAddSection';

import deleteAllEmployees from '../api/deleteAll';
import PaymentProcessor from '../utils/PaymentProcessor';

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

  
  //date wallet
  const { publicKey, sendTransaction } = wallet;

  const connection = new Connection(
    "https://api.devnet.solana.com",
    'confirmed',
  );

  const MINT_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' //adresa de la usdc

  //array cu database-ul
  const [employers, setEmployers] = useState<EA[]>([])
  const [employees, setEmployees] = useState<Employee[]>([])
  
  //subscriptie
  const [weekly, setWeekly] = useState(false);

  const masterPosition = employers.findIndex(item => item.masterWallet === wallet.publicKey?.toBase58())

  useEffect(() => {

    async function fetchEmployers() {
      setEmployers(await getEmployers())
    }

    fetchEmployers()
    
  }, [])

  useEffect(() => {

      try {
        setEmployees(employers[masterPosition].employeeArray)
      } catch (error) {
        console.log('fetching employees...')
      }

    }, [employers, masterPosition])


  //plata
  const payment = async () => {

    if(publicKey == null)
      return;

    const paymentProcessor = new PaymentProcessor(publicKey, connection, employees, LAMPORTS_PER_SOL, MINT_ADDRESS, sendTransaction);
    await paymentProcessor.processPayment();

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



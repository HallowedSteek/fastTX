import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, WalletContextState } from '@solana/wallet-adapter-react';
import { Keypair, LAMPORTS_PER_SOL, ParsedAccountData, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Field, Formik } from 'formik';
import { FC, useEffect, useState } from 'react';

import secret from '../guideSecret.json'


import getEmployers from '../api/getEmployers';

import "../App.css";
import SubscriptionTable from './EmployerFormComp/SubscriptionTable';
import { createTransferInstruction, getAssociatedTokenAddress, getOrCreateAssociatedTokenAccount } from '@solana/spl-token';
import addEmployee from '../api/addEmployee';
import updateEmployee from '../api/updateEmployee';
import deleteEmployee from '../api/deleteEmployee';


interface TC {
  discordId: string,
  role: string,
  salary: string,
  walletAddress: string,
  coin: string,
  edit: Boolean,
}

export type Employee = {
  discordId: string,
  role: string,
  salary: number,
  walletAddress: string,
  solUsdc: string,
  edit: Boolean
}

interface EA {
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

  console.log(employees)

  //subscriptie

  const [weekly, setWeekly] = useState(false);

  //continut tabel
  const [tableContent, setTableContent] = useState<TC[]>([]);

  //date wallet
  const { publicKey, sendTransaction } = wallet;
  const { connection } = useConnection();

  //tranzactii usdc

  const MINT_ADDRESS = 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' //adresa de la usdc
  const TRANSFER_AMOUNT = 1
  const DESTINATION_WALLET = 'Bz1CaiuXaibkicZvCmAAnfiPitGKQsbo2WTLpCVX473E'

  const FROM_KEYPAIR = Keypair.fromSecretKey(new Uint8Array(secret))

  async function getNumberDecimals(mintAddress: string): Promise<number> {
    const info = await connection.getParsedAccountInfo(new PublicKey(MINT_ADDRESS));
    const result = (info.value?.data as ParsedAccountData).parsed.info.decimals as number;
    console.log(result)
    return result;
  }

  const input = 'text-black indent-2 rounded-xl shd'

  const payment2 = async () => {


    if (!publicKey) throw new WalletNotConnectedError();


    console.log(wallet.publicKey?.toBuffer())

    console.log(`Sending ${TRANSFER_AMOUNT} ${(MINT_ADDRESS)} from ${(FROM_KEYPAIR.publicKey?.toString())} to ${(DESTINATION_WALLET)}.`)
    //Step 1 creeaza daca nu exista cont pentru sender

    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      new PublicKey(wallet.publicKey!)
    );
    console.log(`Source Account: ${sourceAccount.address.toString()}`);


    //Step 2 creeaza daca nu exista cont pentru receiver

    console.log(`2 - Getting Destination Token Account`);
    let destinationAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      new PublicKey(DESTINATION_WALLET)
    );
    console.log(`Destination Account: ${destinationAccount.address.toString()}`);


    let tokenAddress = await getAssociatedTokenAddress(
      sourceAccount.address,
      new PublicKey(wallet.publicKey!),
    )

    console.log(tokenAddress)

    //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`Number of Decimals: ${numberDecimals}`);

    //Step 4
    console.log(`4 - Creating and Sending Transaction`);
    const tx = new Transaction();
    tx.add(createTransferInstruction(
      sourceAccount.address,
      destinationAccount.address,
      new PublicKey(wallet.publicKey!),
      TRANSFER_AMOUNT * Math.pow(10, numberDecimals)
    ))




    const signature = await sendTransaction(tx, connection);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    })

    console.log("SENT MOTHERFUCKER")


  }

  //tranzactii sol

  const tableDec = ''

  const payment = async () => {

    console.log(wallet.publicKey?.toBase58())

    if (!publicKey) throw new WalletNotConnectedError();

    //sol
    const transaction = new Transaction()

    const solTable = employees.filter(item => item.solUsdc === 'SOL')

    console.log(solTable)

    solTable.map((item) =>
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(item.walletAddress),
          lamports: item.salary * LAMPORTS_PER_SOL,
        })
      ))


    //usdc

    const usdcTable = employees.filter(item => item.solUsdc === 'USDC')
    console.log(usdcTable)


    console.log(`1 - Getting Source Token Account`);
    let sourceAccount = await getOrCreateAssociatedTokenAccount(
      connection,
      FROM_KEYPAIR,
      new PublicKey(MINT_ADDRESS),
      new PublicKey(wallet.publicKey!)
    );
    console.log(`Source Account: ${sourceAccount.address.toString()}`);


    let destinationAccounts: Array<String> = [];

    usdcTable.map(async (item) => {
      let destinationAccount = await getOrCreateAssociatedTokenAccount(
        connection,
        FROM_KEYPAIR,
        new PublicKey(MINT_ADDRESS),
        new PublicKey(item.walletAddress)
      );
      console.log(`pentru ${item.walletAddress} avem ${destinationAccount.address.toString()}`)
      destinationAccounts.push(destinationAccount.address.toString())
    })


    let tokenAddress = await getAssociatedTokenAddress(
      sourceAccount.address,
      new PublicKey(wallet.publicKey!),
    )

    console.log(tokenAddress)

    //Step 3
    console.log(`3 - Fetching Number of Decimals for Mint: ${MINT_ADDRESS}`);
    const numberDecimals = await getNumberDecimals(MINT_ADDRESS);
    console.log(`Number of Decimals: ${numberDecimals}`);



    usdcTable.map(async (item, index: number) => {
      transaction.add(createTransferInstruction(
        sourceAccount.address,
        new PublicKey(destinationAccounts[index]),
        new PublicKey(wallet.publicKey!),
        item.salary * Math.pow(10, numberDecimals)
      ))

    })

    //6LNwqPdxmrS14juqa6anaGjRY6YHmwgXFKXzEzLchGSF 9XkRjnCY8v167Zr4NRHH6BGtpQjW3EVg11hFzS8EQkfh

    const signature = await sendTransaction(transaction, connection);
    const latestBlockHash = await connection.getLatestBlockhash();

    await connection.confirmTransaction({
      blockhash: latestBlockHash.blockhash,
      lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
      signature: signature,
    })

  }


  const handleDelete = (index: number) => {
    setTableContent(tableContent.filter((item, i) => i !== index));
  };

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
                        <Formik
                          initialValues={{
                            discordId: '',
                            role: '',
                            salary: 0,
                            walletAddress: '',
                            solUsdc: 'SOL',
                            edit: false
                          }}
                          onSubmit={async (values, actions) => {
                            if (values.salary) {
                              // setTableContent(prevItem => [...prevItem, values])
                              if (publicKey) {
                                try {
                                  await addEmployee(values, publicKey.toString())
                                  setEmployers(await getEmployers())
                                  setEmployees(employers[masterPosition].employeeArray)
                                } catch (error) {
                                  console.log('fetching employees...')
                                }

                              }
                              console.log('good job')
                            }
                            else alert("fail")

                            actions.setSubmitting(false);
                            actions.resetForm();
                          }}

                        >
                          {props => (
                            <form className='form w-full flex flex-col mt-10' onSubmit={props.handleSubmit}>
                              <div className='flex justify-around gap-8'>
                                <input
                                  className={input}
                                  type="text"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.discordId}
                                  name="discordId"
                                  placeholder='Discord ID...'
                                />
                                <input
                                  className={input}
                                  type="text"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.role}
                                  name="role"
                                  placeholder='Role...'
                                />
                                <input
                                  className={input}
                                  type="text"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.salary}
                                  name="salary"
                                  placeholder={`Salary...`}
                                />

                                <Field onChange={props.handleChange} className={input} name="solUsdc" as="select">
                                  <option value="SOL">SOL</option>
                                  <option value="USDC">USDC</option>
                                </Field>

                                <input
                                  className={input}
                                  type="text"
                                  onChange={props.handleChange}
                                  onBlur={props.handleBlur}
                                  value={props.values.walletAddress}
                                  name="walletAddress"
                                  placeholder='Wallet Address...'
                                />
                              </div>


                              <button className=' bg-purple-600 hover:bg-purple-700 p-2 mt-4 text-xl rounded-xl w-auto self-end shd' type="submit">ADD EMPLOYEE</button>
                            </form>
                          )}
                        </Formik>


                    <table className=' w-full mt-20  border-purple-600 tableShd'>
                      <thead>
                        <tr>

                          <>
                            <th className=' min-w-[50px]'></th>
                            <th>Discord ID</th>
                            <th>Role</th>
                            <th>Salary</th>
                            <th>Wallet Address</th>
                          </>

                        </tr>

                      </thead>

                      <tbody>
                        {employees.map((item, index: number) =>
                          <tr key={index}>

                            <Formik
                              initialValues={item}
                              onSubmit={async (values, actions) => {
                                if (publicKey && values.salary) {
                                  try {

                                    await updateEmployee(values.discordId, values.role, values.salary, values.walletAddress, values.solUsdc, publicKey.toString(), index)
                                    setEmployers(await getEmployers())
                                    setEmployees(employers[masterPosition].employeeArray)
                                    console.log('update successful...')
                                  } catch (error) {
                                    console.log(error)
                                  }
                                }

                                else alert("fail")
                                actions.setSubmitting(false);
                              }

                              }

                            >
                              {props => (
                                <>
                                  <td>
                                    {item.edit ?
                                      <>
                                        <button type='button' className='bg-red-700 hover:bg-red-800 px-2  my-2 py-1 rounded-md ml-2' onClick={async () => {
                                          try {
                                            if (publicKey) await deleteEmployee(publicKey.toString(), index)
                                            setEmployers(await getEmployers())
                                            setEmployees(employers[masterPosition].employeeArray)
                                          } catch (error) {
                                            console.log(error)
                                          }
                                        }}>DELETE EMPLOYEE</button>
                                        <button type='button' className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>❌</button>
                                        <button type="button" className='bg-purple-600 px-2   mr-2 py-1 rounded-md hover:bg-purple-700' onClick={() => {
                                          props.handleSubmit();
                                          handleEdit(index);
                                        }}>✅</button>
                                      </> :
                                      <button className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>EDIT</button>

                                    }
                                  </td>

                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.discordId}
                                        name="discordId"
                                        placeholder='Discord ID...'
                                      /> : item.discordId
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.role}
                                        name="role"
                                        placeholder='Role...'
                                      /> : item.role
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <div className='flex flex-row'>
                                        <input
                                          className={input}
                                          type="text"
                                          onChange={props.handleChange}
                                          onBlur={props.handleBlur}
                                          value={props.values.salary}
                                          name="salary"
                                          placeholder='Salary...'
                                        />
                                        <Field onChange={props.handleChange} className={'text-black shd'} name="solUsdc" as="select">
                                          <option value="SOL">SOL</option>
                                          <option value="USDC">USDC</option>
                                        </Field>
                                      </div>
                                      // eslint-disable-next-line eqeqeq
                                      : `${item.salary} ${item.solUsdc == 'SOL' ? 'SOL' : 'USDC'}`
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.walletAddress}
                                        name="walletAddress"
                                        placeholder='walletAddress...'
                                      /> : item.walletAddress
                                    }
                                  </td>
                                </>
                              )}
                            </Formik>
                          </tr>
                        )}

                      </tbody>

                    </table>

                    <button onClick={payment} className='bg-green-700 hover:bg-green-800  p-2 rounded-md text-lg absolute mt-2 right-0 shd'>SEND SALARY</button>

                      </>
                      : null
                    }
                  </>
                  :
                  <>
                    <Formik
                      initialValues={{
                        discordId: '',
                        role: '',
                        salary: 0,
                        walletAddress: '',
                        solUsdc: 'SOL',
                        edit: false
                      }}
                      onSubmit={async (values, actions) => {
                        if (values.salary) {
                          // setTableContent(prevItem => [...prevItem, values])
                          if (publicKey) {
                            try {
                              await addEmployee(values, publicKey.toString())
                              setEmployers(await getEmployers())
                              setEmployees(employers[masterPosition].employeeArray)
                            } catch (error) {
                              console.log('fetching employees...')
                            }

                          }
                          console.log('good job')
                        }
                        else alert("fail")

                        actions.setSubmitting(false);
                        actions.resetForm();
                      }}

                    >
                      {props => (
                        <form className='form w-full flex flex-col' onSubmit={props.handleSubmit}>
                          <div className='flex justify-around gap-8'>
                            <input
                              className={input}
                              type="text"
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              value={props.values.discordId}
                              name="discordId"
                              placeholder='Discord ID...'
                            />
                            <input
                              className={input}
                              type="text"
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              value={props.values.role}
                              name="role"
                              placeholder='Role...'
                            />
                            <input
                              className={input}
                              type="text"
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              value={props.values.salary}
                              name="salary"
                              placeholder={`Salary...`}
                            />

                            <Field onChange={props.handleChange} className={input} name="solUsdc" as="select">
                              <option value="SOL">SOL</option>
                              <option value="USDC">USDC</option>
                            </Field>

                            <input
                              className={input}
                              type="text"
                              onChange={props.handleChange}
                              onBlur={props.handleBlur}
                              value={props.values.walletAddress}
                              name="walletAddress"
                              placeholder='Wallet Address...'
                            />
                          </div>


                          <button className=' bg-purple-600 hover:bg-purple-700 p-2 mt-4 text-xl rounded w-auto self-end shd' type="submit">ADD EMPLOYEE</button>
                        </form>
                      )}
                    </Formik>

                    <table className=' w-full mt-20  border-purple-600 tableShd'>
                      <thead>
                        <tr>

                          <>
                            <th className=' min-w-[50px]'></th>
                            <th>Discord ID</th>
                            <th>Role</th>
                            <th>Salary</th>
                            <th>Wallet Address</th>
                          </>

                        </tr>

                      </thead>

                      <tbody>
                        {employees.map((item, index: number) =>
                          <tr key={index}>

                            <Formik
                              initialValues={item}
                              onSubmit={async (values, actions) => {
                                if (publicKey && values.salary) {
                                  try {

                                    await updateEmployee(values.discordId, values.role, values.salary, values.walletAddress, values.solUsdc, publicKey.toString(), index)
                                    setEmployers(await getEmployers())
                                    setEmployees(employers[masterPosition].employeeArray)
                                    console.log('update successful...')
                                  } catch (error) {
                                    console.log(error)
                                  }
                                }

                                else alert("fail")
                                actions.setSubmitting(false);
                              }

                              }

                            >
                              {props => (
                                <>
                                  <td>
                                    {item.edit ?
                                      <>
                                        <button type='button' className='bg-red-700 hover:bg-red-800 px-2  my-2 py-1 rounded-md ml-2' onClick={async () => {
                                          try {
                                            if (publicKey) await deleteEmployee(publicKey.toString(), index)
                                            setEmployers(await getEmployers())
                                            setEmployees(employers[masterPosition].employeeArray)
                                          } catch (error) {
                                            console.log(error)
                                          }
                                        }}>DELETE EMPLOYEE</button>
                                        <button type='button' className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>❌</button>
                                        <button type="button" className='bg-purple-600 px-2   mr-2 py-1 rounded-md hover:bg-purple-700' onClick={() => {
                                          props.handleSubmit();
                                          handleEdit(index);
                                        }}>✅</button>
                                      </> :
                                      <button className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>EDIT</button>

                                    }
                                  </td>

                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.discordId}
                                        name="discordId"
                                        placeholder='Discord ID...'
                                      /> : item.discordId
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.role}
                                        name="role"
                                        placeholder='Role...'
                                      /> : item.role
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <div className='flex flex-row'>
                                        <input
                                          className={input}
                                          type="text"
                                          onChange={props.handleChange}
                                          onBlur={props.handleBlur}
                                          value={props.values.salary}
                                          name="salary"
                                          placeholder='Salary...'
                                        />
                                        <Field onChange={props.handleChange} className={'text-black'} name="solUsdc" as="select">
                                          <option value="SOL">SOL</option>
                                          <option value="USDC">USDC</option>
                                        </Field>
                                      </div>
                                      // eslint-disable-next-line eqeqeq
                                      : `${item.salary} ${item.solUsdc == 'SOL' ? 'SOL' : 'USDC'}`
                                    }
                                  </td>
                                  <td>
                                    {item.edit ?
                                      <input
                                        className={input}
                                        type="text"
                                        onChange={props.handleChange}
                                        onBlur={props.handleBlur}
                                        value={props.values.walletAddress}
                                        name="walletAddress"
                                        placeholder='walletAddress...'
                                      /> : item.walletAddress
                                    }
                                  </td>
                                </>
                              )}
                            </Formik>
                          </tr>
                        )}

                      </tbody>

                    </table>

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


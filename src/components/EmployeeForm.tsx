import { WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { useConnection, WalletContextState } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Transaction } from "@solana/web3.js";
import { Formik } from 'formik';
import { FC, useState } from 'react';
import "../App.css";



interface TC {
  discordId: string,
  role: string,
  salary: string,
  walletAddress: string,
  edit: Boolean
}

interface Props {
  wallet: WalletContextState
}

const EmployeeForm: FC<Props> = ({ wallet }) => {


  const { publicKey, sendTransaction } = wallet;
  const [tableContent, setTableContent] = useState<TC[]>([]);
  const { connection } = useConnection();

  const payment = async () => {
    if (!publicKey) throw new WalletNotConnectedError();
    connection.getBalance(publicKey).then(async (balance) => {
      const transaction = new Transaction()

      tableContent.map((item) =>
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: new PublicKey(item.walletAddress),
            lamports: parseFloat(item.salary) * LAMPORTS_PER_SOL,
          })
        ))



      const signature = await sendTransaction(transaction, connection);
      const latestBlockHash = await connection.getLatestBlockhash();

      await connection.confirmTransaction({
        blockhash: latestBlockHash.blockhash,
        lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
        signature: signature,
      })
      connection.getBalance(publicKey).then((bal) => {
        console.log(bal / LAMPORTS_PER_SOL + " SOL")
      });
    });

  }

  const clearTable = () => {
    setTableContent([])
  }

  const handleDelete = (index: number) => {
    setTableContent(tableContent.filter((item, i) => i !== index));
  };

  const handleEdit = (index: number) => {
    const aux = [...tableContent]
    aux[index].edit = !aux[index].edit
    setTableContent(aux)
  }

  return (



    <div className=''>
      <Formik
        initialValues={{
          discordId: '',
          role: '',
          salary: '',
          walletAddress: '',
          edit: false
        }}
        onSubmit={(values, actions) => {
          if (parseFloat(values.salary)) {
            setTableContent(prevItem => [...prevItem, values])
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
                className='text-black indent-2'
                type="text"
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.discordId}
                name="discordId"
                placeholder='Discord ID...'
              />
              <input
                className='text-black indent-2'
                type="text"
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.role}
                name="role"
                placeholder='Role...'
              />
              <input
                className='text-black indent-2'
                type="text"
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.salary}
                name="salary"
                placeholder='Salary in $SOL...'
              />
              <input
                className='text-black indent-2'
                type="text"
                onChange={props.handleChange}
                onBlur={props.handleBlur}
                value={props.values.walletAddress}
                name="walletAddress"
                placeholder='Wallet Address...'
              />
            </div>


            <button className=' bg-purple-600 hover:bg-purple-700 p-2 mt-4 text-xl rounded w-auto self-end' type="submit">ADD EMPLOYEE</button>
          </form>
        )}
      </Formik>

      {/* tabel */}

      <div className='relative'>
        <table className=' w-full mt-20  border-purple-600'>
          <thead>
            <tr>
              <th className=' min-w-[50px]'></th>
              <th>Discord ID</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Wallet Address</th>
            </tr>

          </thead>

          <tbody>
            {tableContent.map((item, index: number) =>
              <tr key={index}>

                <Formik
                  initialValues={item}
                  onSubmit={(values, actions) => {
                    if (parseFloat(values.salary)) {
                      const aux = [...tableContent]
                      // setTableContent(prevItem => [...prevItem, values])
                      aux[index] = values
                      setTableContent(aux)
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
                            <button className='bg-red-700 hover:bg-red-800 px-2  my-2 py-1 rounded-md ml-2' onClick={() => handleDelete(index)}>DELETE EMPLOYEE</button>
                            <button className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>❌</button>
                            <button className='bg-purple-600 px-2   mr-2 py-1 rounded-md hover:bg-purple-700' onClick={() => {
                              props.handleSubmit()
                              handleEdit(index)
                            }}>✅</button>
                          </> :
                          <button className='bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700' onClick={() => handleEdit(index)}>EDIT</button>

                        }
                      </td>

                      <td>
                        {item.edit ?
                          <input
                            className='text-black indent-2'
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
                            className='text-black indent-2'
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
                          <input
                            className='text-black indent-2'
                            type="text"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            value={props.values.salary}
                            name="salary"
                            placeholder='Salary...'
                          /> : item.salary
                        }
                      </td>
                      <td>
                        {item.edit ?
                          <input
                            className='text-black indent-2'
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

        <button onClick={payment} className='bg-green-700 hover:bg-green-800  p-2 rounded-md text-lg absolute mt-2 right-0'>SEND SALARY</button>
        <button onClick={clearTable} className='bg-red-700 hover:bg-red-800 p-2 rounded-md text-lg absolute mt-2 left-0'>CLEAR TABLE</button>

      </div>
    </div>
  );
}
export default EmployeeForm;
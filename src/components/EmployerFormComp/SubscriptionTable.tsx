import { WalletAdapterProps, WalletNotConnectedError } from '@solana/wallet-adapter-base';
import { Transaction, SystemProgram, PublicKey, LAMPORTS_PER_SOL, Connection } from '@solana/web3.js';
import React, { FC, useEffect, useState } from 'react'
import { addDays, addMinutes, formatDuration, intervalToDuration } from 'date-fns'
import updateDate from '../../api/updateDate';

interface Sub {
    weekly: Boolean,
    setWeekly: React.Dispatch<React.SetStateAction<boolean>>,
    publicKey: PublicKey | null,
    connection: Connection,
    subscriptionDate: {
        start: string,
        end: string
    }
    sendTransaction: WalletAdapterProps['sendTransaction'];
}

const SubTable: FC<Sub> = ({ publicKey, connection, sendTransaction, weekly, setWeekly, subscriptionDate }) => {

    const weeklyPayment = async () => {

        if (!publicKey) throw new WalletNotConnectedError();
        const transaction = new Transaction()
        transaction.add(
            SystemProgram.transfer({
                fromPubkey: publicKey,
                toPubkey: new PublicKey("AAmWi1DaTTorj7pe4bCUuqC5AXsGoAxj11eFBCLDkgfN"),
                lamports: 1.5 * LAMPORTS_PER_SOL
            })
        )

        const signature = await sendTransaction(transaction, connection);
        const latestBlockHash = await connection.getLatestBlockhash();

        await connection.confirmTransaction({
            blockhash: latestBlockHash.blockhash,
            lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
            signature: signature,
        })

        setWeekly(true);
    }


    const [countdown, setCountdown] = useState('');


    useEffect(() => {
        const intervalId = setInterval(() => {
            let duration = intervalToDuration({
                start: new Date(parseInt(subscriptionDate.end)),
                end: new Date(),
            })

            setCountdown(formatDuration(duration))
        }, 1000);

        return () => clearInterval(intervalId);
    }, [subscriptionDate.end])

    useEffect(() => {
        if (new Date().getTime() > new Date(parseInt(subscriptionDate.end)).getTime()) setWeekly(false)
        else setWeekly(true)
    }, [setWeekly, subscriptionDate.end, subscriptionDate.start])

    return (
        <table className=' w-full mt-20  border-purple-600 rounded tableShd'>

            <thead>
                <tr>
                    <th className=' min-w-[50px]'>Status</th>
                    <th>Contact (Discord ID)</th>
                    <th>Role</th>
                    <th>Weekly Payment </th>
                    <th>Actions</th>
                </tr>

            </thead>

            <tbody>
                <tr>
                    <td className='p-4'>SUBSCRIPTION <br />
                        {weekly ?
                            <b className='text-green-500'>PAID</b>
                            :
                            <b className='text-red-500'>NOT PAID</b>
                        }
                    </td>
                    <td className='p-4'>BigBoiSOL【Ø】#0587</td>
                    <td className='p-4'>TM Founder</td>
                    <td className='p-4'>1.5 SOL</td>
                    <td className='p-4'>
                        {weekly ?
                            <>

                                {`${countdown} `}
                                <br />
                                Until Next Payment
                            </>
                            :
                            <>
                                <button onClick={async () => {
                                    await weeklyPayment()
                                    if (publicKey) await updateDate(new Date().getTime().toString(), addDays(new Date(), 7).getTime().toString(), publicKey.toString())
                                    setWeekly(true)
                                }} className='bg-green-700 hover:bg-green-800  p-4 rounded-md text-3xl  '>PAY</button>
                            </>
                        }

                    </td>
                </tr>
            </tbody>

        </table>
    )
}

export default SubTable;
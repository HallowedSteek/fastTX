import { PublicKey } from '@solana/web3.js';
import { Formik, Field } from 'formik'
import { FC } from 'react'
import addEmployee from '../../api/addEmployee'
import getEmployers from '../../api/getEmployers'
import { EA, Employee } from "../EmployeeForm";

type Props = {
    employers: EA[];
    masterPosition: number;
    publicKey: PublicKey | null;
    setEmployers: (value: React.SetStateAction<EA[]>) => void;
    setEmployees: (value: React.SetStateAction<Employee[]>) => void;
}

const EmployeeAddSection:FC<Props> = ({publicKey,setEmployers,setEmployees,employers,masterPosition}) => {

    const input = 'text-black indent-2 rounded-xl shd'
    
    return(
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
    )
}



export default EmployeeAddSection;
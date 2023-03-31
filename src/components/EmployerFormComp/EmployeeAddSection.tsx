import { PublicKey } from '@solana/web3.js';
import { Formik, Field } from 'formik'
import { FC, useState } from 'react'
import addEmployee from '../../api/addEmployee'
import getEmployers from '../../api/getEmployers'
import { EA, Employee } from "../EmployeeForm";
import CSVReader from './CSVReader';

type Props = {
    employers: EA[];
    masterPosition: number;
    publicKey: PublicKey | null;
    setEmployers: (value: React.SetStateAction<EA[]>) => void;
    setEmployees: (value: React.SetStateAction<Employee[]>) => void;
}




const EmployeeAddSection: FC<Props> = ({ publicKey, setEmployers, setEmployees, employers, masterPosition }) => {

    const input = 'text-black indent-2 max-w-[300px] rounded-xl shd mr-12'

    return (
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
                    <form className='form w-full mt-52 lg:mt-12 flex flex-col' onSubmit={props.handleSubmit}>
                        <div className=' flex lg:flex-row flex-col justify-center items-center gap-2 lg:gap-0'>
                            <input
                                className={`${input} max-w-[250px]`}
                                type="text"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.discordId}
                                name="discordId"
                                placeholder='Discord ID...'
                            />
                            <input
                                className={`${input} max-w-[250px]`}
                                type="text"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.role}
                                name="role"
                                placeholder='Role...'
                            />
                            <div className='flex mx-auto'>
                                <input
                                    className={`text-black indent-2 rounded-xl border-l-0  shd  max-w-[90px] md:ml-auto salary`}
                                    type="text"
                                    onChange={props.handleChange}
                                    onBlur={props.handleBlur}
                                    value={props.values.salary}
                                    name="salary"
                                    placeholder={`Salary...`}
                                />

                                <Field onChange={props.handleChange} className={`${input} coin `} name="solUsdc" as="select">
                                    <option value="SOL">SOL</option>
                                    <option value="USDC">USDC</option>
                                </Field>
                            </div>


                            <input

                                className={`${input} lg:mr-0`}
                                type="text"
                                onChange={props.handleChange}
                                onBlur={props.handleBlur}
                                value={props.values.walletAddress}
                                name="walletAddress"
                                placeholder='Wallet Address...'
                            />
                        </div>
                        <div className='self-center mt-4 items-center justify-center content-center lg:self-end flex flex-col lg:flex-row gap-2 lg:gap-4'>
                            <CSVReader />
                            <button className=' bg-purple-600 hover:bg-purple-700 p-2  mr-8 lg:mr-0 text-xl rounded w-auto shd' type="submit">ADD EMPLOYEE</button>
                        </div>

                    </form>
                )}
            </Formik>

        </>
    )
}



export default EmployeeAddSection;
import { PublicKey } from "@solana/web3.js";
import { Field, Formik } from "formik";
import { FC } from "react";
import deleteEmployee from "../../api/deleteEmployee";
import getEmployers from "../../api/getEmployers";
import updateEmployee from "../../api/updateEmployee";
import { EA, Employee } from "../../Types/MainViewTypes";

type ImportEmployees = {
  employers: EA[];
  employees: Employee[];
  publicKey: PublicKey | null;
  masterPosition: number;
  setEmployers: (value: React.SetStateAction<EA[]>) => void;
  setEmployees: (value: React.SetStateAction<Employee[]>) => void;
  handleEdit: (index: number) => void;
};

const EmployeeTable: FC<ImportEmployees> = ({
  employees,
  employers,
  publicKey,
  masterPosition,
  setEmployers,
  setEmployees,
  handleEdit,
}) => {
  const input = "text-black indent-2 rounded-xl shd";
  const editInput = `${input} max-w-[150px] mx-4 `;

  return (
    <div className="respTable w-full mt-20  max-w-md lg:max-w-full overflow-auto max-h-[500px]  ">
      <table className="w-full self-center tableShd relative">
        <thead className="sticky top-0">
          <tr className=" h-[70px]">
            <th className="min-w-[50px]"></th>
            <th>Discord ID</th>
            <th>Role</th>
            <th>Salary</th>
            <th>Wallet Address</th>
          </tr>
        </thead>

        <tbody>
          {employees.map((item, index: number) => (
            <tr key={index}>
              <Formik
                initialValues={item}
                onSubmit={async (values, actions) => {
                  if (publicKey && values.salary) {
                    try {
                      await updateEmployee(
                        values.discordId,
                        values.role,
                        values.salary,
                        values.walletAddress,
                        values.solUsdc,
                        publicKey.toString(),
                        index
                      );
                      setEmployers(await getEmployers());
                      setEmployees(employers[masterPosition].employeeArray);
                      console.log("update successful...");
                    } catch (error) {
                      console.log(error);
                    }
                  } else alert("fail");
                  actions.setSubmitting(false);
                }}
              >
                {(props) => (
                  <>
                    <td>
                      {item.edit ? (
                        <div className="flex flex-col">
                          <button
                            type="button"
                            className="bg-red-700 hover:bg-red-800 px-2  my-2 py-1 rounded-md ml-2 text-sm"
                            onClick={async () => {
                              try {
                                if (publicKey)
                                  await deleteEmployee(
                                    publicKey.toString(),
                                    index
                                  );
                                setEmployers(await getEmployers());
                                setEmployees(
                                  employers[masterPosition].employeeArray
                                );
                              } catch (error) {
                                console.log(error);
                              }
                            }}
                          >
                            DELETE EMPLOYEE
                          </button>
                          <div>
                            <button
                              type="button"
                              className="bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700"
                              onClick={() => handleEdit(index)}
                            >
                              🔄
                            </button>
                            <button
                              type="button"
                              className="bg-purple-600 px-2   mr-2 py-1 rounded-md hover:bg-purple-700"
                              onClick={() => {
                                props.handleSubmit();
                                handleEdit(index);
                              }}
                            >
                              ✅
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="bg-purple-600 px-2 mx-2  my-2 py-1 rounded-md hover:bg-purple-700"
                          onClick={() => handleEdit(index)}
                        >
                          EDIT
                        </button>
                      )}
                    </td>

                    <td>
                      {item.edit ? (
                        <input
                          className={editInput}
                          type="text"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.discordId}
                          name="discordId"
                          placeholder="Discord ID..."
                        />
                      ) : (
                        item.discordId
                      )}
                    </td>
                    <td>
                      {item.edit ? (
                        <input
                          className={editInput}
                          type="text"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.role}
                          name="role"
                          placeholder="Role..."
                        />
                      ) : (
                        item.role
                      )}
                    </td>
                    <td>
                      {item.edit ? (
                        <div className="flex flex-row">
                          <input
                            className={`${editInput} salary`}
                            type="text"
                            onChange={props.handleChange}
                            onBlur={props.handleBlur}
                            value={props.values.salary}
                            name="salary"
                            placeholder="Salary..."
                          />
                          <Field
                            onChange={props.handleChange}
                            className={`${editInput} coin`}
                            name="solUsdc"
                            as="select"
                          >
                            <option value="SOL">SOL</option>
                            <option value="USDC">USDC</option>
                          </Field>
                        </div>
                      ) : (
                        `${item.salary} ${
                          item.solUsdc === "SOL" ? "SOL" : "USDC"
                        }`
                      )}
                    </td>
                    <td>
                      {item.edit ? (
                        <input
                          className={`${editInput} overflow-y-scroll wadd`}
                          type="text"
                          onChange={props.handleChange}
                          onBlur={props.handleBlur}
                          value={props.values.walletAddress}
                          name="walletAddress"
                          placeholder="walletAddress..."
                        />
                      ) : (
                        item.walletAddress
                      )}
                    </td>
                  </>
                )}
              </Formik>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default EmployeeTable;

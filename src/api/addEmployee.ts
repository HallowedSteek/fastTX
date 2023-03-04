import { Employee } from "./model/config";

const addEmployee = async (
  employeeModel: Employee,
  masterWallet: string
) => {
  const response = await fetch(
    `http://localhost:5000/addEmployee/${masterWallet}`,
    {
      method: "POST",
      //🔽 specificam tipul valorilor trimise
      headers: {
        "Content-Type": "application/json",
      },
      //🔽 valorile trimise
      body: JSON.stringify(employeeModel),
    }
  );
  return response.json();
};

export default addEmployee;

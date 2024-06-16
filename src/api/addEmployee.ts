import { Employee } from "./model/Entities";
import { HOST } from "./constants";

const addEmployee = async (
  employeeModel: Employee,
  masterWallet: string
) => {
  const response = await fetch(
    `${HOST}/addEmployee/${masterWallet}`,
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

import ky from "ky";
import { HOST } from "./utils";


const updateEmployee = async (
  newDiscordId: string,
  newRole: string,
  newSalary: number,
  newWalletAddress: string,
  newSolUsdc: string,
  masterWallet: string,
  index: number
) => {
  await ky.put(`${HOST}/updateEmployee/${masterWallet}/${index}`,
    {
      json: {
        newDiscordId: newDiscordId,
        newRole: newRole,
        newSalary: newSalary,
        newWalletAddress: newWalletAddress,
        newSolUsdc: newSolUsdc,
      },
    }
  );
};


export default updateEmployee;

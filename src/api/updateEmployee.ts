import ky from "ky";


const updateEmployee = async (
  newDiscordId: string,
  newRole: string,
  newSalary: number,
  newWalletAddress: string,
  newSolUsdc: string,
  masterWallet: string,
  index: number
) => {
  await ky.put(
    `http://localhost:5000/updateEmployee/${masterWallet}/${index}`,
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

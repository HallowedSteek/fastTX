import ky from "ky";

const deleteEmployee = async (masterWallet: string, index: number) => {
  await ky.delete(
    `http://localhost:5000/deleteEmployee/${masterWallet}/${index}`
  );
};

export default deleteEmployee;

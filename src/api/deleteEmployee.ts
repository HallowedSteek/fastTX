import ky from "ky";
import { HOST } from "./constants";

const deleteEmployee = async (masterWallet: string, index: number) => {
  await ky.delete(
    `${HOST}/deleteEmployee/${masterWallet}/${index}`
  );
};

export default deleteEmployee;

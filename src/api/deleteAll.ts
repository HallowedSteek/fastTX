import ky from "ky";
import { HOST } from "./constants";

const deleteAllEmployees = async (masterWallet: string) => {
  await ky.delete(
    `${HOST}/deleteAll/${masterWallet}`
  );
};

export default deleteAllEmployees;

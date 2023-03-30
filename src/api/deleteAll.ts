import ky from "ky";
import { HOST } from "./utils";

const deleteAllEmployees = async (masterWallet: string) => {
  await ky.delete(
    `${HOST}/deleteAll/${masterWallet}`
  );
};

export default deleteAllEmployees;

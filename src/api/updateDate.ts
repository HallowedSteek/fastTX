import ky from "ky";
import { HOST } from "./utils";

const updateDate = async (
  newStartDate: string,
  newEndDate: string,
  masterWallet: string
) => {
  await ky.put(`${HOST}/updateDate/${masterWallet}`, {
    json: {
      newStartDate: newStartDate,
      newEndDate: newEndDate,
    },
  });
};

export default updateDate;

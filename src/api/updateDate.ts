import ky from "ky";

const updateDate = async (
  newStartDate: string,
  newEndDate: string,
  masterWallet: string
) => {
  await ky.put(`http://localhost:5000/updateDate/${masterWallet}`, {
    json: {
      newStartDate: newStartDate,
      newEndDate: newEndDate,
    },
  });
};

export default updateDate;

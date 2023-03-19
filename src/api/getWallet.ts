import { HOST } from "./utils";

async function getWallet(){
    const response = await fetch(`${HOST}/getWallet`);
    
    return response.json();
  }
  
  export default getWallet;
  

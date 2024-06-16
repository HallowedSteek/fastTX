import { HOST } from "./constants";

async function getWallet(){
    const response = await fetch(`${HOST}/getWallet`);
    
    return response.json();
  }
  
  export default getWallet;
  

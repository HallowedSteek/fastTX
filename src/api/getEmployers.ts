import { HOST } from "./utils";

async function getEmployers(){
    const response = await fetch(`${HOST}/getEmployers`);
    
    return response.json();
  }
  
  export default getEmployers;
  


async function getWallet(){
    const response = await fetch(`http://localhost:5000/getWallet`);
    
    return response.json();
  }
  
  export default getWallet;
  

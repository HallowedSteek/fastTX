
async function getEmployers(){
    const response = await fetch(`http://localhost:5000/getEmployers`);
    
    return response.json();
  }
  
  export default getEmployers;
  

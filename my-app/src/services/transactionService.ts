import { type  Transaction } from "../types/Transaction"

export const fetchTransactions = async () => {
  try {
    const token = localStorage.getItem('token'); 

    const response = await fetch("/api/transactions", {
      method: "GET",
      headers: {
        
        'Authorization': `Bearer ${token}`, 
        'Content-Type': 'application/json'
      }
    });

    if(!response.ok){
          throw new Error(`Http Error!Status code : ${response.status}`)
        }
    
        const data = await response.json() as {transactions : Transaction[]};
        return data;
  }catch(ex) {
    console.log(ex);
    throw ex;
  }
}


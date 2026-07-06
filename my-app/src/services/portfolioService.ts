import { type BuyAssetCredentials } from "../types/BuyAssetCredentials";


const fetchUserPortfolio = async () => {
  const token = localStorage.getItem('token'); 

  const response = await fetch("/api/portfolio", {
    method: "GET",
    headers: {
      
      'Authorization': `Bearer ${token}`, 
      'Content-Type': 'application/json'
    }
  });
  if (!response.ok) {
    throw new Error(`Сервер повернув статус ${response.status}`);
  }

  
  return await response.json(); 
};

export default fetchUserPortfolio;

export const fetchBuyAsset = async (credentials : BuyAssetCredentials) => {
  const token = localStorage.getItem('token');

  const response = await fetch('/api/portfolio/buy', {
    method: "POST",
    headers: {
      'Authorization' : `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });


  if (!response.ok){
    throw new Error(`Server returned status ${response.status}`)
  }

  return await response.json();
}
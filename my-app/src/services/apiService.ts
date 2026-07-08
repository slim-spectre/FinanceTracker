import { type Asset } from "../types/Asset";

const fetchMarketAssets = async ()  => {
  try{
    const response = await fetch("/api/assets");

    if(!response.ok){
      throw new Error(`Http Error!Status code : ${response.status}`)
    }

    const data = await response.json() as {assets : Asset[]};
    return data;

  }catch(ex){
    console.log(ex);
    throw ex;
  }
} 

export default fetchMarketAssets
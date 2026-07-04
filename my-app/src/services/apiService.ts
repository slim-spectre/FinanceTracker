import { type Asset } from "../types/asset";

const fetchMarketAssets = async () : Promise<Asset[]> => {
  try{
    const response = await fetch("/api/assets");

    if(!response.ok){
      throw new Error(`Http Error!Status code : ${response.status}`)
    }

    const data = await response.json() as Asset[];
    return data;

  }catch(ex){
    console.log(ex);
    throw ex;
  }
} 

export default fetchMarketAssets
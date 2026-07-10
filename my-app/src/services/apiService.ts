import { type Asset } from "../types/Asset";
const API_URL = import.meta.env.VITE_API_URL || "";

const fetchMarketAssets = async () => {
  try {
    const response = await fetch(`${API_URL}/api/assets`);
    if (!response.ok) {
      throw new Error(`Http Error! Status code: ${response.status}`);
    }
    const data = await response.json() as { assets: Asset[] };
    return data;
  } catch (ex) {
    console.log(ex);
    throw ex;
  }
}
export default fetchMarketAssets;
import { useState } from "react"
import { useEffect } from "react";
import FetchMarketAssets from "../services/apiService"
import { type Asset } from "../types/Asset";


function MarketPage() {

  const [marketAssets,setMarketAssets] = useState<Asset[]>([]);
  const [isDownoading,setIsDownloading] = useState<boolean>(true);
  const [error,setError] = useState<string>("");

  useEffect(() => {
    const loadData = async ()  => {
        try{
          const funcResult = await FetchMarketAssets();
          setMarketAssets(funcResult);
        }catch(ex){
          setError(`${ex}`);
        }finally {
          setIsDownloading(false);
        }
      };

    loadData(); 
    },[]);

  return (
    <div>
   {isDownoading ? (
    <div>Downloading of assets</div>
   ) : error ? (
    <div className="">Error :{error}</div>
   ) : (
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Ticker</th>
          <th>Current price</th>
          <th>Last updated</th>
        </tr>
      </thead>
      <tbody>
        {marketAssets.map((item) => (
          <tr key={item.assetId}>
            <td>{item.name}</td>
            <td>{item.ticker}</td>
            <td>{item.currentPrice}</td>
            <td>{new Date(item.lastUpdated).toLocaleDateString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
   )} 
   </div>
  )
}

export default MarketPage

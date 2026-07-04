import { useState } from "react"
import { useEffect } from "react";
import FetchMarketAssets from "../services/apiService"
import { type Asset } from "../types/asset";


function MarketPage() {

  const [assets,setAssets] = useState<Asset[]>([]);
  const [isDownoading,setIsDownloading] = useState<boolean>(true);
  const [Error,setError] = useState<string>("");

  useEffect(() => {
    const loadData = async ()  => {
        try{
          const funcResult = await FetchMarketAssets();
          setAssets(funcResult);
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
   ) : Error ? (
    <div className="">Error :{Error}</div>
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
        {assets.map((item) => (
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

import { useState } from "react"
import { useEffect } from "react";
import fetchUserPortfolio from '../services/portfolioService'

import type { Portfolio } from "../types/Portfolio";


function PortfolioPage() {

  const [portfolioAssets,setPortfolioAssets] = useState<Portfolio[]>([]);
  const [isDownoading,setIsDownloading] = useState<boolean>(true);
  const [error,setError] = useState<string>("");

  useEffect(() => {
    const loadData = async ()  => {
        try{
          const funcResult = await fetchUserPortfolio();
          setPortfolioAssets(funcResult.Assets || []);
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
          <th>Ticker</th> 
          <th>Quantity</th>
          <th>Average price</th>
          <th>Total invested</th>
        </tr>
      </thead>
      <tbody>
        {Array.isArray(portfolioAssets) ? (
          portfolioAssets.map((item) => (
            <tr key={item.assetId}>
              <td>{item.ticker}</td>
              <td>{item.quantity}</td>
              <td>{item.averagePrice}</td>
              <td>{item.totalInvested}</td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan={4} style={{ textAlign: 'center', padding: '20px' }}>
              Не вдалося завантажити дані або доступ заборонено 🔒
            </td>
          </tr>
        )}
      </tbody>
    </table>
   )} 
   </div>
  )
}

export default PortfolioPage

import { useState, useEffect } from "react";
import fetchUserPortfolio from "../services/portfolioService";
import AddAssetForm from "../components/AddAssetForm";

function PortfolioPage() {
  const [portfolioData, setPortfolioData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  const loadData = async () => {
    try {
      setIsLoading(true);
      const data = await fetchUserPortfolio();
      setPortfolioData(data);
    } catch (ex) {
      setError(`${ex}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (isLoading) return <div>Loading portfolio...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="portfolio-container">
      <h2>My invest portfolio</h2>
      
      <div style={{ marginBottom: "20px", background: "#f9f9f9", padding: "15px" }}>
        <p><strong>General balance (NetWorth):</strong> ${portfolioData?.NetWorth}</p>
        <p><strong>Available money (CashBalance):</strong> ${portfolioData?.CashBalance}</p>
      </div>

      ---

      <div style={{ marginBottom: "30px", padding: "15px", border: "1px solid #ccc" }}>
        <h3>Buy new Asset</h3>
        <AddAssetForm onAssetBought={loadData} />
      </div>

      ---

      <table>
        <thead>
          <tr>
            <th>Asset ID</th>
            <th>Кількість</th>
            <th>Середня ціна</th>
            <th>Поточна ціна</th>
            <th>Прибуток/Збиток</th>
          </tr>
        </thead>
        <tbody>
          {portfolioData?.Assets?.map((item: any) => (
            <tr key={item.AssetId}>
              <td>{item.AssetId}</td>
              <td>{item.Quantity}</td>
              <td>${item.AveragePrice}</td>
              <td>${item.CurrentPrice}</td>
              <td style={{ color: item.UnrealizedPnL >= 0 ? "green" : "red" }}>
                ${item.UnrealizedPnL.toFixed(2)} ({item.RoiPercentage}%)
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PortfolioPage;
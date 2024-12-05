import React, { useState } from "react";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const App = () => {
  const [tokenId, setTokenId] = useState("");
  const [tokenData, setTokenData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [error, setError] = useState(null);
  const apiKey = "d363d0c5-46e0-434e-855a-05aeb9c597eb";

  const fetchTokenData = async () => {
    try {
      setError(null);
      setTokenData(null);
      setPriceHistory([]);

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: apiKey,
        },
      };

      const tokenResponse = await fetch(
        `https://api.mobula.io/api/1/market/data?asset=${tokenId}`,
        options
      );

      if (!tokenResponse.ok) {
        throw new Error("Token not found");
      }

      const tokenData = await tokenResponse.json();
      setTokenData(tokenData.data);

      const historyResponse = await fetch(
        `https://api.mobula.io/api/1/market/history?asset=${tokenId}`,
        options
      );

      if (!historyResponse.ok) {
        throw new Error("Unable to fetch historical data");
      }

      const historyData = await historyResponse.json();

      // Process price history
      if (historyData.data?.price_history) {
        setPriceHistory(
          historyData.data.price_history.map(([timestamp, price]) => ({
            timestamp,
            price,
          }))
        );
      }
    } catch (err) {
      setError(err.message);
    }
  };

  const chartData = {
    labels: priceHistory.map(({ timestamp }) =>
      new Date(timestamp).toLocaleDateString()
    ),
    datasets: [
      {
        label: "Price (USD)",
        data: priceHistory.map(({ price }) => price),
        borderColor: "rgba(75,192,192,1)",
        backgroundColor: "rgba(75,192,192,0.2)",
        tension: 0.4,
        yAxisID: "y-axis-price",
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    scales: {
      "y-axis-price": {
        type: "linear",
        display: true,
        position: "left",
        title: {
          display: true,
          text: "Price (USD)",
        },
      },
    },
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mobula Token Info</h1>
      <input
        type="text"
        placeholder="Enter token ID (e.g., bitcoin)"
        value={tokenId}
        onChange={(e) => setTokenId(e.target.value)}
        style={{ padding: "10px", width: "300px", marginRight: "10px" }}
      />
      <button
        onClick={fetchTokenData}
        style={{ padding: "10px 20px", cursor: "pointer" }}
      >
        Fetch Data
      </button>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {tokenData && (
        <div style={{ marginTop: "20px" }}>
          <h2>{tokenData.name}</h2>
          <p>Symbol: {tokenData.symbol.toUpperCase()}</p>
          <p>Market Cap (USD): ${tokenData.market_cap}</p>
          <p>Volume: {tokenData.volume}</p>
          <p>Liquidity: {tokenData.liquidity}</p>
          <p>Total Supply: {tokenData.total_supply}</p>
          <p>Current Price (USD): ${tokenData.price}</p>
        </div>
      )}
      {priceHistory.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Price History</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      )}
    </div>
  );
};

export default App;
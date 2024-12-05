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
  const [selectedNetwork, setSelectedNetwork] = useState("BNB");
  const [tokenData, setTokenData] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [error, setError] = useState(null);
  const apiKeyBscScan = "CCIYNJ5QSAK17ASFS38AK3GWJKYFU4CA9Q";
  const apiKeyMobula = "d363d0c5-46e0-434e-855a-05aeb9c597eb";

  const fetchTokenData = async () => {
    if (!tokenId || !selectedNetwork) {
      setError("Please provide a valid token ID and select a network.");
      return;
    }

    try {
      setError(null);
      setTokenData(null);
      setPriceHistory([]);

      // Call the BscScan API to check for the SRG20 Token
      const abiResponse = await fetch(
        `https://api.bscscan.com/api?module=contract&action=getabi&address=${tokenId}&apikey=${apiKeyBscScan}`
      );
      const abiData = await abiResponse.json();

      if (!abiData.result || !abiData.result.includes("amountSRGLiq")) {
        setError("THIS IS NOT A SRG20 TOKEN");
        return;
      }

      const options = {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: apiKeyMobula,
        },
      };

      // Fetch token market data
      const tokenResponse = await fetch(
        `https://api.mobula.io/api/1/market/data?asset=${tokenId}`,
        options
      );

      if (!tokenResponse.ok) {
        throw new Error("Token not found");
      }

      const tokenData = await tokenResponse.json();
      setTokenData(tokenData.data);

      // Fetch historical price data
      const historyResponse = await fetch(
        `https://api.mobula.io/api/1/market/history?asset=${tokenId}`,
        options
      );

      if (!historyResponse.ok) {
        throw new Error("Unable to fetch historical data");
      }

      const historyData = await historyResponse.json();

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

  const formatNumber = (number) => {
    if (!number && number !== 0) return "N/A";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(number);
  };

  const calculateFDV = (price, maxSupply) => {
    if (price && maxSupply) {
      return formatNumber(price * maxSupply);
    }
    return "N/A";
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      fetchTokenData();
    }
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>Mobula Token Info</h1>
      <div style={{ marginBottom: "20px" }}>
        <select
          value={selectedNetwork}
          onChange={(e) => setSelectedNetwork(e.target.value)}
          style={{
            padding: "10px",
            width: "150px",
            marginRight: "10px",
            cursor: "pointer",
          }}
          required
        >
          <option value="BNB">BNB</option>
          <option value="ETH">ETH</option>
          <option value="ARB">ARB</option>
        </select>
        <input
          type="text"
          placeholder="Enter token ID (e.g., bitcoin)"
          value={tokenId}
          onChange={(e) => setTokenId(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
          required
        />
        <button
          onClick={fetchTokenData}
          style={{ padding: "10px 20px", cursor: "pointer" }}
        >
          Fetch Data
        </button>
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {tokenData && (
        <div style={{ marginTop: "20px" }}>
          <h2>{tokenData.name}</h2>
          <p>Symbol: {tokenData.symbol.toUpperCase()}</p>
          <p>Market Cap (USD): {formatNumber(tokenData.market_cap)}</p>
          <p>Volume: {formatNumber(tokenData.volume)}</p>
          <p>Liquidity: {formatNumber(tokenData.liquidity)}</p>
          <p>Total Supply: {tokenData.total_supply}</p>
          <p>Max Supply: {tokenData.max_supply || "N/A"}</p>
          <p>Current Price (USD): {formatNumber(tokenData.price)}</p>
          <p>
            Fully-Diluted Value (FDV):{" "}
            {calculateFDV(tokenData.price, tokenData.max_supply)}
          </p>
        </div>
      )}
      {priceHistory.length > 0 && (
        <div style={{ marginTop: "20px" }}>
          <h3>Price History</h3>
          <Line
            data={{
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
                },
              ],
            }}
            options={{
              responsive: true,
              scales: {
                y: {
                  type: "linear",
                  title: {
                    display: true,
                    text: "Price (USD)",
                  },
                },
              },
            }}
          />
        </div>
      )}
    </div>
  );
};

export default App;
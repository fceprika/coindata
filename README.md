# Test Notes and Observations

## APIs Tested
During the testing process, several APIs were evaluated, including:
- **CoinGecko**
- **Moralis**
- **BscScan**
- **Mobula**

### Summary
Mobula stood out as the most comprehensible and user-friendly API for my needs.

---

## Bugs Identified in Mobula API

### 1. **Page Loading Performance**
- **Issue**: Pages are slow to load.

### 2. **Market History Endpoint Issues**
- **Endpoint**: [Market History API](https://docs.mobula.io/rest-api-reference/endpoint/market-history)
- **Description**: The page occasionally crashes under the following conditions:
  - When searching for Bitcoin and clicking "Send."
  - When selecting the `1h` time interval.

### 3. **Admin Dashboard Issues**
- **URL**: [Mobula Admin Panel](https://admin.mobula.fi/admin/default)
- **Description**: 
  - Discord and Telegram logos are not displaying correctly (KO).

---

## Conclusion
Further optimizations and fixes are recommended to enhance the overall user experience of the Mobula API and associated platforms.
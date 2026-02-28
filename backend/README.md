# Binance Futures Trading Bot (Simplified)

A full-stack Python + React application to place & monitor orders on the Binance Futures Testnet (USDT-M).

## Features
- Place **MARKET**, **LIMIT**, and **STOP_LIMIT** (bonus) orders via CLI or Dashboard UI.
- **Dashboard UI** — Real-time portfolio balance, live prices, positions, trade history.
- **Bot Configuration** — Place orders with full validation from the browser.
- **Analytics** — Win rate, P&L breakdown, asset distribution.
- Rich CLI output with summary tables.
- Comprehensive logging to `trading_bot.log`.
- Input validation and error handling.

## Setup Instructions

1.  **Clone the repository** (or unzip the folder).
2.  **Create a virtual environment** (recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```
3.  **Install Python dependencies**:
    ```bash
    pip install -r requirements.txt
    ```
4.  **Install UI dependencies**:
    ```bash
    cd "../Trading Bot Dashboard UI"
    npm install
    ```
5.  **Set up Environment Variables**:
    Create a `.env` file in the `Trading bot/` directory:
    ```env
    BINANCE_API_KEY=your_testnet_api_key
    BINANCE_API_SECRET=your_testnet_api_secret
    ```
    *Get credentials from [Binance Futures Testnet](https://testnet.binancefuture.com/).*

## How to Run

### Start the Dashboard (recommended)

**Terminal 1 — API Server:**
```bash
cd "Trading bot"
source venv/bin/activate
python api_server.py
```
Server runs on `http://localhost:5000`.

**Terminal 2 — Dashboard UI:**
```bash
cd "Trading Bot Dashboard UI"
npm run dev
```
UI runs on `http://localhost:5173` (auto-proxies API calls to Flask).

### CLI Usage

```bash
# Market Order
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.001

# Limit Order
python cli.py place-order --symbol BTCUSDT --side SELL --type LIMIT --quantity 0.001 --price 65000

# Stop-Limit Order (Bonus)
python cli.py place-order --symbol BTCUSDT --side BUY --type STOP_LIMIT --quantity 0.001 --price 60000 --stop-price 59500
```

## API Endpoints

| Endpoint | Method | Description |
|---|---|---|
| `/api/account` | GET | Account balances & equity |
| `/api/orders` | GET | Open orders |
| `/api/trades?symbol=BTCUSDT` | GET | Recent trades |
| `/api/ticker/BTCUSDT` | GET | Live price |
| `/api/tickers?symbols=BTCUSDT,ETHUSDT` | GET | Multiple prices |
| `/api/positions` | GET | Open positions |
| `/api/place-order` | POST | Place an order |

## Project Structure
```
Trading bot/                 # Python backend
  bot/
    client.py                # Binance API client wrapper
    orders.py                # Order placement logic
    validators.py            # Input validation
    logging_config.py        # Rotating file logger
  cli.py                     # CLI entry point (Click + Rich)
  api_server.py              # Flask REST API for Dashboard
  mock_test.py               # Unit tests
  requirements.txt

Trading Bot Dashboard UI/    # React frontend
  src/app/
    components/
      Dashboard.tsx          # Live portfolio & trades
      BotConfiguration.tsx   # Order placement UI
      Analytics.tsx          # Performance analytics
      MainLayout.tsx         # Sidebar navigation
    hooks/useApi.ts          # API fetch hooks
  vite.config.ts             # Dev proxy config
```

## Assumptions & Design
- **API Wrapper**: Uses `python-binance` configured for `testnet=True`.
- **Validation**: Ensures quantities and prices are positive, symbols are valid, required fields present.
- **Logging**: All API interactions logged to `trading_bot.log` (rotating, 5MB max).
- **CLI**: Built with `Click` + `Rich` for professional terminal output.
- **Dashboard**: React + TypeScript + Vite + Recharts + shadcn/ui components.
- **API Bridge**: Flask REST API reuses the same `bot/` modules as the CLI.

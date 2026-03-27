# QuantNova — Crypto Trading Bot Platform

A full-stack cryptocurrency trading bot platform that connects to the **Binance Futures Testnet** for real-time trade execution and monitoring. Features a premium React dashboard UI, a Python/Flask REST API backend, and a CLI for terminal-based trading.

---

## Architecture

| Layer | Tech | Deployment |
|-------|------|------------|
| **Frontend** | React 18 · Vite · TailwindCSS v4 · Recharts | Vercel |
| **Backend** | Flask · python-binance · Gunicorn | Render |
| **CLI** | Click · Rich | Local |
| **Exchange** | Binance Futures Testnet | — |

---

## Features

### Dashboard (`/`)
- Account overview with total equity & balances
- Live ticker prices (BTC, ETH, multi-symbol)
- Interactive performance chart (7D / 30D / All-time)
- Open orders & positions table
- Recent trades with PnL tracking
- Bot start/pause controls with auto-refresh

### Bot Configuration (`/configure`)
- Place Market, Limit, and Stop-Limit orders
- Risk management controls (stop-loss, take-profit, max position size)
- Strategy selection presets
- Real-time form validation & order feedback

### Analytics (`/analytics`)
- Total return, win rate, Sharpe ratio, max drawdown KPIs
- Cumulative ROI chart
- Win/loss distribution pie chart
- Profit by asset & time-of-day bar charts
- Live position breakdown with unrealized PnL

---

## Tech Stack

### Frontend

| Package | Purpose |
|---------|---------|
| React 18 + TypeScript | UI framework |
| Vite 6.3 | Build tool & dev server |
| TailwindCSS 4.1 | Utility-first styling |
| Radix UI / shadcn | 48 accessible UI components |
| Recharts | Area, Line, Bar, Pie charts |
| React Router 7 | Client-side routing |
| Motion | Animations |
| Lucide React | Icons |
| Sonner | Toast notifications |
| react-hook-form | Form management |
| date-fns | Date formatting |

### Backend

| Package | Purpose |
|---------|---------|
| Flask | REST API framework |
| Flask-CORS | Cross-origin requests |
| python-binance | Binance API SDK |
| Gunicorn | Production WSGI server |
| python-dotenv | Environment variables |

### CLI

| Package | Purpose |
|---------|---------|
| Click | CLI framework |
| Rich | Pretty terminal output |

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/health` | Health check & client status |
| `GET` | `/api/account` | Account balances & equity |
| `GET` | `/api/orders` | Open orders (optional `?symbol=`) |
| `GET` | `/api/trades` | Recent trades (`?symbol=`, `?limit=`) |
| `GET` | `/api/ticker/<symbol>` | Live price for one symbol |
| `GET` | `/api/tickers` | Batch prices (`?symbols=`) |
| `POST` | `/api/place-order` | Place Market/Limit/Stop-Limit order |
| `GET` | `/api/positions` | Open positions with unrealized PnL |

---

## Getting Started

### Prerequisites
- Node.js 18+
- Python 3.10+
- Binance Futures Testnet API key & secret

### Frontend

```bash
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
python api_server.py
```

### CLI

```bash
python cli.py place-order --symbol BTCUSDT --side BUY --type MARKET --quantity 0.01
python cli.py place-order --symbol ETHUSDT --side SELL --type LIMIT --quantity 0.5 --price 3000
```

---

## Environment Variables

| Variable | Location | Purpose |
|----------|----------|---------|
| `BINANCE_API_KEY` | Backend `.env` / Render | Testnet API key |
| `BINANCE_API_SECRET` | Backend `.env` / Render | Testnet API secret |
| `VITE_API_BASE_URL` | Frontend `.env.production` | Backend URL for production |

---

## Project Structure

```
├── src/
│   ├── app/
│   │   ├── components/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── BotConfiguration.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── MainLayout.tsx
│   │   │   └── ui/              # 48 shadcn/ui components
│   │   ├── hooks/useApi.ts
│   │   ├── routes.tsx
│   │   └── App.tsx
│   ├── styles/
│   └── main.tsx
├── backend/
│   ├── bot/
│   │   ├── client.py            # Binance API wrapper
│   │   ├── orders.py            # Order execution
│   │   ├── validators.py        # Input validation
│   │   └── logging_config.py    # Rotating file logger
│   ├── api_server.py            # Flask API (8 endpoints)
│   ├── cli.py                   # Terminal trading
│   └── mock_test.py             # Unit tests
├── vite.config.ts
├── render.yaml
└── package.json
```

---

## Deployment

- **Frontend** → Vercel (auto-deploys from Git)
- **Backend** → Render via `render.yaml` (Gunicorn)
- Dev server proxies `/api` to `localhost:5001` for local development

---

## Testing

```bash
cd backend
python -m pytest mock_test.py -v
```

Covers validator logic and mocked order placement for Market & Limit orders

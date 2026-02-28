"""
Flask REST API Server for Trading Bot Dashboard.
Bridges the React frontend with the Binance Futures Testnet API.
"""
from flask import Flask, jsonify, request
from flask_cors import CORS
from bot.client import BinanceFuturesClient
from bot.orders import OrderManager
from bot.validators import (
    validate_symbol, validate_side, validate_quantity,
    validate_price, validate_order_type
)
from bot.logging_config import logger

app = Flask(__name__)
CORS(app, origins=[
    "http://localhost:5173",
    "https://*.vercel.app",
])

# Initialize Binance client once at startup
try:
    client_wrapper = BinanceFuturesClient()
    client = client_wrapper.get_client()
    order_manager = OrderManager(client_wrapper)
    logger.info("API Server: Binance client initialized successfully.")
except Exception as e:
    logger.error(f"API Server: Failed to initialize Binance client: {e}")
    client = None
    order_manager = None


@app.route("/api/account", methods=["GET"])
def get_account():
    """Get account balances and equity summary."""
    try:
        balances = client.futures_account_balance()
        # Filter to assets with non-zero balance
        active_balances = [
            {
                "asset": b["asset"],
                "balance": float(b["balance"]),
                "availableBalance": float(b.get("availableBalance", b["balance"])),
            }
            for b in balances
            if float(b["balance"]) > 0
        ]
        total_equity = sum(b["balance"] for b in active_balances)
        return jsonify({
            "balances": active_balances,
            "totalEquity": total_equity,
        })
    except Exception as e:
        logger.error(f"API /account error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/orders", methods=["GET"])
def get_open_orders():
    """Get all open orders, optionally filtered by symbol."""
    try:
        symbol = request.args.get("symbol")
        if symbol:
            orders = client.futures_get_open_orders(symbol=symbol.upper())
        else:
            orders = client.futures_get_open_orders()

        formatted = [
            {
                "orderId": o["orderId"],
                "symbol": o["symbol"],
                "side": o["side"],
                "type": o["type"],
                "price": o.get("price", "0"),
                "quantity": o.get("origQty", "0"),
                "status": o["status"],
                "time": o.get("time", 0),
            }
            for o in orders
        ]
        return jsonify({"orders": formatted, "count": len(formatted)})
    except Exception as e:
        logger.error(f"API /orders error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/trades", methods=["GET"])
def get_recent_trades():
    """Get recent account trades for a symbol."""
    try:
        symbol = request.args.get("symbol", "BTCUSDT")
        limit = int(request.args.get("limit", 10))
        trades = client.futures_account_trades(symbol=symbol.upper(), limit=limit)

        formatted = [
            {
                "id": t["id"],
                "symbol": t["symbol"],
                "side": t["side"],
                "price": t["price"],
                "quantity": t["qty"],
                "realizedPnl": t.get("realizedPnl", "0"),
                "commission": t.get("commission", "0"),
                "time": t["time"],
            }
            for t in trades
        ]
        return jsonify({"trades": formatted, "count": len(formatted)})
    except Exception as e:
        logger.error(f"API /trades error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/ticker/<symbol>", methods=["GET"])
def get_ticker(symbol):
    """Get live price for a trading pair."""
    try:
        ticker = client.futures_symbol_ticker(symbol=symbol.upper())
        return jsonify({
            "symbol": ticker["symbol"],
            "price": float(ticker["price"]),
        })
    except Exception as e:
        logger.error(f"API /ticker error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/tickers", methods=["GET"])
def get_all_tickers():
    """Get live prices for multiple symbols."""
    try:
        symbols = request.args.get("symbols", "BTCUSDT,ETHUSDT").split(",")
        tickers = []
        for sym in symbols:
            try:
                t = client.futures_symbol_ticker(symbol=sym.strip().upper())
                tickers.append({"symbol": t["symbol"], "price": float(t["price"])})
            except Exception:
                pass
        return jsonify({"tickers": tickers})
    except Exception as e:
        logger.error(f"API /tickers error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/place-order", methods=["POST"])
def place_order():
    """Place an order via the existing OrderManager."""
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        # Validate inputs using existing validators
        symbol = validate_symbol(data.get("symbol", ""))
        side = validate_side(data.get("side", ""))
        order_type = validate_order_type(data.get("type", ""))
        quantity = validate_quantity(data.get("quantity", 0))

        price = data.get("price")
        stop_price = data.get("stopPrice")

        # Validate price for order types that need it
        if order_type in ["LIMIT", "STOP_LIMIT"]:
            price = validate_price(price, order_type)

        # Place order using existing OrderManager
        response = None
        if order_type == "MARKET":
            response = order_manager.place_market_order(symbol, side, quantity)
        elif order_type == "LIMIT":
            response = order_manager.place_limit_order(symbol, side, quantity, price)
        elif order_type == "STOP_LIMIT":
            if not stop_price:
                return jsonify({"error": "stopPrice is required for STOP_LIMIT orders"}), 400
            response = order_manager.place_stop_limit_order(symbol, side, quantity, price, stop_price)

        if response:
            return jsonify({
                "success": True,
                "order": {
                    "orderId": response.get("orderId"),
                    "status": response.get("status"),
                    "symbol": response.get("symbol"),
                    "side": response.get("side"),
                    "type": response.get("type"),
                    "executedQty": response.get("executedQty"),
                    "avgPrice": response.get("avgPrice", "N/A"),
                },
            })
        return jsonify({"error": "No response from exchange"}), 500

    except ValueError as e:
        logger.warning(f"API /place-order validation error: {e}")
        return jsonify({"error": str(e)}), 400
    except Exception as e:
        logger.error(f"API /place-order error: {e}")
        return jsonify({"error": str(e)}), 500


@app.route("/api/positions", methods=["GET"])
def get_positions():
    """Get current open positions."""
    try:
        positions = client.futures_position_information()
        active = [
            {
                "symbol": p["symbol"],
                "side": "LONG" if float(p["positionAmt"]) > 0 else "SHORT",
                "quantity": abs(float(p["positionAmt"])),
                "entryPrice": float(p["entryPrice"]),
                "markPrice": float(p.get("markPrice", 0)),
                "unrealizedPnl": float(p.get("unRealizedProfit", 0)),
                "leverage": p.get("leverage", "1"),
            }
            for p in positions
            if float(p["positionAmt"]) != 0
        ]
        return jsonify({"positions": active, "count": len(active)})
    except Exception as e:
        logger.error(f"API /positions error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    logger.info("Starting Trading Bot API Server on port 5001...")
    app.run(host="0.0.0.0", port=5001, debug=True)

from binance.exceptions import BinanceAPIException, BinanceOrderException
from bot.logging_config import logger
from bot.client import BinanceFuturesClient

class OrderManager:
    """Handles placing different types of orders on Binance Futures."""
    
    def __init__(self, client_wrapper: BinanceFuturesClient):
        self.client = client_wrapper.get_client()

    def place_market_order(self, symbol, side, quantity):
        """Places a MARKET order."""
        logger.info(f"Attempting MARKET {side} order for {quantity} {symbol}")
        try:
            response = self.client.futures_create_order(
                symbol=symbol,
                side=side,
                type="MARKET",
                quantity=quantity
            )
            logger.info(f"MARKET order successful: {response.get('orderId')}")
            return response
        except (BinanceAPIException, BinanceOrderException) as e:
            logger.error(f"Failed to place MARKET order: {e}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error during MARKET order: {e}")
            raise

    def place_limit_order(self, symbol, side, quantity, price):
        """Places a LIMIT order."""
        logger.info(f"Attempting LIMIT {side} order for {quantity} {symbol} @ {price}")
        try:
            response = self.client.futures_create_order(
                symbol=symbol,
                side=side,
                type="LIMIT",
                quantity=quantity,
                price=str(price),
                timeInForce="GTC"  # Good Till Cancel
            )
            logger.info(f"LIMIT order successful: {response.get('orderId')}")
            return response
        except (BinanceAPIException, BinanceOrderException) as e:
            logger.error(f"Failed to place LIMIT order: {e}")
            raise
        except Exception as e:
            logger.exception(f"Unexpected error during LIMIT order: {e}")
            raise

    def place_stop_limit_order(self, symbol, side, quantity, price, stop_price):
        """Places a STOP_LIMIT order (Bonus Requirement)."""
        logger.info(f"Attempting STOP_LIMIT {side} order for {quantity} {symbol} @ {price} (Stop: {stop_price})")
        try:
            response = self.client.futures_create_order(
                symbol=symbol,
                side=side,
                type="STOP",  # Binance Futures STOP is often STOP_MARKET or STOP_LIMIT depending on price param
                quantity=quantity,
                price=str(price),
                stopPrice=str(stop_price),
                timeInForce="GTC"
            )
            logger.info(f"STOP_LIMIT order successful: {response.get('orderId')}")
            return response
        except (BinanceAPIException, BinanceOrderException) as e:
            logger.error(f"Failed to place STOP_LIMIT order: {e}")
            raise

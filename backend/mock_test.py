import unittest
from unittest.mock import MagicMock, patch
from bot.orders import OrderManager
from bot.validators import validate_symbol, validate_quantity, validate_price

class TestTradingBot(unittest.TestCase):
    
    def setUp(self):
        self.mock_client_wrapper = MagicMock()
        self.mock_client = MagicMock()
        self.mock_client_wrapper.get_client.return_value = self.mock_client
        self.order_manager = OrderManager(self.mock_client_wrapper)

    def test_validate_symbol(self):
        self.assertEqual(validate_symbol("btcusdt"), "BTCUSDT")
        with self.assertRaises(ValueError):
            validate_symbol(None)

    def test_validate_quantity(self):
        self.assertEqual(validate_quantity(0.5), 0.5)
        with self.assertRaises(ValueError):
            validate_quantity(-1)

    def test_place_market_order(self):
        self.mock_client.futures_create_order.return_value = {"orderId": 12345, "status": "FILLED"}
        res = self.order_manager.place_market_order("BTCUSDT", "BUY", 0.1)
        self.assertEqual(res["orderId"], 12345)
        self.mock_client.futures_create_order.assert_called_once()

    def test_place_limit_order(self):
        self.mock_client.futures_create_order.return_value = {"orderId": 67890, "status": "NEW"}
        res = self.order_manager.place_limit_order("BTCUSDT", "SELL", 0.1, 50000)
        self.assertEqual(res["orderId"], 67890)
        self.mock_client.futures_create_order.assert_called_with(
            symbol="BTCUSDT", side="SELL", type="LIMIT", quantity=0.1, price="50000", timeInForce="GTC"
        )

if __name__ == "__main__":
    unittest.main()

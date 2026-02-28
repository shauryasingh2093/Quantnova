import os
from binance.client import Client
from binance.exceptions import BinanceAPIException
from bot.logging_config import logger
from dotenv import load_dotenv

load_dotenv()

class BinanceFuturesClient:
    """Wrapper for Binance Futures Testnet API Client."""
    
    BASE_URL = "https://testnet.binancefuture.com/fapi"
    
    def __init__(self, api_key=None, api_secret=None):
        self.api_key = api_key or os.getenv("BINANCE_API_KEY")
        self.api_secret = api_secret or os.getenv("BINANCE_API_SECRET")
        
        if not self.api_key or not self.api_secret:
            logger.warning("API Key or Secret missing. Trading will not work without credentials.")
        
        try:
            # Note: python-binance uses standard URLs by default. 
            # For Testnet, we need to specify testnet=True or pass the base URL.
            self.client = Client(self.api_key, self.api_secret, testnet=True)
            logger.info("Binance Futures Client initialized for Testnet.")
        except Exception as e:
            logger.error(f"Failed to initialize Binance Client: {e}")
            raise

    def get_client(self):
        return self.client

from bot.logging_config import logger

def validate_symbol(symbol: str):
    """Simple validation for symbol."""
    if not symbol or not isinstance(symbol, str):
        raise ValueError("Invalid symbol provided.")
    if not symbol.endswith("USDT"):
        logger.warning(f"Symbol {symbol} might not be a USDT-M pair.")
    return symbol.upper()

def validate_quantity(quantity: float):
    """Validate order quantity."""
    try:
        q = float(quantity)
        if q <= 0:
            raise ValueError("Quantity must be greater than zero.")
        return q
    except (ValueError, TypeError):
        raise ValueError("Quantity must be a valid number greater than zero.")

def validate_price(price: float, order_type: str):
    """Validate price for LIMIT/STOP_LIMIT orders."""
    if order_type.upper() in ["LIMIT", "STOP_LIMIT", "STOP"]:
        try:
            p = float(price)
            if p <= 0:
                raise ValueError("Price must be greater than zero.")
            return p
        except (ValueError, TypeError):
            raise ValueError(f"Price is required and must be a positive number for {order_type} orders.")
    return None

def validate_side(side: str):
    """Validate BUY/SELL side."""
    side = side.upper()
    if side not in ["BUY", "SELL"]:
        raise ValueError("Side must be either BUY or SELL.")
    return side

def validate_order_type(order_type: str):
    """Validate order type."""
    ot = order_type.upper()
    valid_types = ["MARKET", "LIMIT", "STOP_LIMIT", "STOP"]
    if ot not in valid_types:
        raise ValueError(f"Order type must be one of: {', '.join(valid_types)}")
    return ot

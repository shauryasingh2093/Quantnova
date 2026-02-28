import click
from rich.console import Console
from rich.table import Table
from bot.logging_config import logger
from bot.client import BinanceFuturesClient
from bot.orders import OrderManager
from bot.validators import (
    validate_symbol, validate_side, validate_quantity, 
    validate_price, validate_order_type
)

console = Console()

@click.group()
def cli():
    """Simplified Binance Futures Trading Bot CLI."""
    pass

@cli.command()
@click.option('--symbol', required=True, help='Trading pair (e.g., BTCUSDT)')
@click.option('--side', required=True, type=click.Choice(['BUY', 'SELL'], case_sensitive=False), help='BUY or SELL')
@click.option('--type', 'order_type', required=True, type=click.Choice(['MARKET', 'LIMIT', 'STOP_LIMIT'], case_sensitive=False), help='Order type')
@click.option('--quantity', required=True, type=float, help='Quantity to trade')
@click.option('--price', type=float, help='Price for LIMIT/STOP_LIMIT orders')
@click.option('--stop-price', type=float, help='Stop price for STOP_LIMIT orders')
def place_order(symbol, side, order_type, quantity, price, stop_price):
    """Place a new order on Binance Futures Testnet."""
    try:
        # 1. Validation
        symbol = validate_symbol(symbol)
        side = validate_side(side)
        order_type = validate_order_type(order_type)
        quantity = validate_quantity(quantity)
        
        if order_type in ["LIMIT", "STOP_LIMIT"]:
            price = validate_price(price, order_type)
        
        if order_type == "STOP_LIMIT" and not stop_price:
            raise click.UsageError("Stop price is required for STOP_LIMIT orders.")

        # 2. Summary Table
        table = Table(title="Order Request Summary")
        table.add_column("Property", style="cyan")
        table.add_column("Value", style="magenta")
        table.add_row("Symbol", symbol)
        table.add_row("Side", side)
        table.add_row("Type", order_type)
        table.add_row("Quantity", str(quantity))
        if price: table.add_row("Price", str(price))
        if stop_price: table.add_row("Stop Price", str(stop_price))
        
        console.print(table)

        # 3. Execution
        client_wrapper = BinanceFuturesClient()
        manager = OrderManager(client_wrapper)
        
        response = None
        if order_type == "MARKET":
            response = manager.place_market_order(symbol, side, quantity)
        elif order_type == "LIMIT":
            response = manager.place_limit_order(symbol, side, quantity, price)
        elif order_type == "STOP_LIMIT":
            response = manager.place_stop_limit_order(symbol, side, quantity, price, stop_price)

        # 4. Result
        if response:
            res_table = Table(title="Order Response Details", style="green")
            res_table.add_column("Key", style="cyan")
            res_table.add_column("Value", style="white")
            
            res_table.add_row("Order ID", str(response.get("orderId")))
            res_table.add_row("Status", str(response.get("status")))
            res_table.add_row("Executed Qty", str(response.get("executedQty")))
            res_table.add_row("Avg Price", str(response.get("avgPrice", "N/A")))
            
            console.print(res_table)
            console.print("[bold green]Success![/bold green] Order placed successfully.")

    except Exception as e:
        console.print(f"[bold red]Error:[/bold red] {str(e)}")
        logger.error(f"CLI Error: {e}")

if __name__ == "__main__":
    cli()

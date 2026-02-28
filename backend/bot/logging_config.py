import logging
import os
from logging.handlers import RotatingFileHandler

def setup_logging(log_file="trading_bot.log"):
    """Sets up dual logging to file and console."""
    
    # Create logger
    logger = logging.getLogger("trading_bot")
    logger.setLevel(logging.DEBUG)
    
    # Clear existing handlers if any
    if logger.handlers:
        logger.handlers.clear()
        
    # Formatter
    formatter = logging.Formatter(
        "%(asctime)s - %(name)s - %(levelname)s - %(message)s"
    )
    
    # File Handler (rotating to avoid massive logs)
    file_handler = RotatingFileHandler(
        log_file, maxBytes=5*1024*1024, backupCount=5
    )
    file_handler.setLevel(logging.DEBUG)
    file_handler.setFormatter(formatter)
    
    # Console Handler
    console_handler = logging.StreamHandler()
    console_handler.setLevel(logging.INFO)
    console_handler.setFormatter(formatter)
    
    # Add handlers to logger
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

# Singleton-like instance access
logger = setup_logging()

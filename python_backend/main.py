import asyncio
import logging
import sys
import uvicorn
from fastapi import FastAPI
from config import config
from api.webhook import router as webhook_router
from bots.telegram_bot import build_telegram_app
from sync.sync_engine import sync_engine

# Ensure UTF-8 encoding on Windows standard streams
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')
if hasattr(sys.stderr, 'reconfigure'):
    sys.stderr.reconfigure(encoding='utf-8')

# Configure Logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)-8s | %(name)s : %(message)s"
)
logger = logging.getLogger("aura_fit.main")

# FastAPI App Instance
app = FastAPI(
    title="AURA.FIT Telegram Bot & Webhook Backend Service",
    description="Python service running Telegram bot alongside FastAPI Webhook listener.",
    version="1.0.0"
)

# Enable CORS (Cross-Origin Resource Sharing)
from fastapi.middleware.cors import CORSMiddleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register Webhook API Router
app.include_router(webhook_router)

@app.get("/")
async def health_check():
    return {
        "status": "online",
        "service": "AURA.FIT Python Telegram Bot & Webhook Server",
        "version": "1.0.0"
    }

# Global reference for Telegram App
telegram_app = None

async def start_fastapi_server():
    """Run Uvicorn FastAPI server in background loop."""
    uv_config = uvicorn.Config(
        app=app,
        host=config.HOST,
        port=config.PORT,
        log_level="info"
    )
    server = uvicorn.Server(uv_config)
    logger.info(f"🌐 FastAPI Webhook server running on http://{config.HOST}:{config.PORT}")
    await server.serve()

async def start_telegram_bot():
    """Run python-telegram-bot application."""
    global telegram_app
    telegram_app = build_telegram_app()
    if not telegram_app:
        return
    from bots.telegram_bot import set_telegram_app
    set_telegram_app(telegram_app)
        
    logger.info("⚡ Starting Telegram bot...")
    try:
        await telegram_app.initialize()
        await telegram_app.start()
        await telegram_app.updater.start_polling()
    except Exception as e:
        logger.error(f"Telegram bot exception: {e}")

async def start_sync_worker():
    """Background task to process the sync queue."""
    logger.info("⚙️ Starting Universal Sync Engine worker...")
    while True:
        try:
            await sync_engine.process_queue()
        except Exception as e:
            logger.error(f"Sync worker error: {e}")
        await asyncio.sleep(5) # Poll every 5 seconds

async def main():
    """Asynchronous Entry Point running FastAPI and Telegram Bot concurrently."""
    logger.info("🚀 Launching AURA.FIT Telegram Bot & Webhook Service...")
    
    # Run all services concurrently using asyncio.gather
    tasks = [
        asyncio.create_task(start_fastapi_server()),
        asyncio.create_task(start_telegram_bot()),
        asyncio.create_task(start_sync_worker()),
    ]
    
    try:
        await asyncio.gather(*tasks)
    except KeyboardInterrupt:
        logger.info("🛑 Shutting down backend service...")
        if telegram_app:
            await telegram_app.updater.stop()
            await telegram_app.stop()
            await telegram_app.shutdown()

if __name__ == "__main__":
    asyncio.run(main())


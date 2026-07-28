FROM python:3.11-slim

WORKDIR /app

# Install dependencies
COPY python_backend/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy app code
COPY python_backend/ .

# Run main.py (starts FastAPI + Telegram bot concurrently)
CMD python main.py

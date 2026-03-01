# Backend Dockerfile for MediGraph-AI

# --- Stage 1: Build ---
FROM python:3.12-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Install python dependencies
COPY backend/requirements.txt .
RUN pip install --no-cache-dir --prefix=/install -r requirements.txt

# --- Stage 2: Production ---
FROM python:3.12-slim

WORKDIR /app

# Install runtime dependencies (OpenCV requires libgl1, Tesseract requires tesseract-ocr)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgl1 \
    libglib2.0-0 \
    tesseract-ocr \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed python packages from builder
COPY --from=builder /install /usr/local

# Copy application source
COPY backend /app/backend
COPY .env /app/.env

# Create non-root user for security
RUN useradd -m medgraph
USER medgraph

# Expose FastAPI port
EXPOSE 8000

ENV PYTHONPATH=/app/backend

CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]

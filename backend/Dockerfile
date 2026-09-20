# Multi-stage Dockerfile for SmartBinX FastAPI Backend
# Stage 1: Build & Dependency Resolution
FROM python:3.11-slim AS builder

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    gcc \
    libpq-dev \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --prefix=/install -r requirements.txt

# Stage 2: Minimal Production Runtime
FROM python:3.11-slim AS runtime

WORKDIR /app

# Install runtime shared libraries (libpq for PostgreSQL, curl for healthcheck)
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

# Copy installed Python packages from builder
COPY --from=builder /install /usr/local

# Copy application code
COPY . .

# Ensure data directory exists for persistent SQLite volumes
RUN mkdir -p /app/data

# Environment configuration
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

EXPOSE 8000

# Docker healthcheck probe using FastAPI /health endpoint
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Production Process Manager: Gunicorn master supervisor with UvicornWorker pool
CMD ["gunicorn", "-c", "gunicorn_conf.py", "app.main:app"]

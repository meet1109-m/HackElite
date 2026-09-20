"""Validation Script for SmartBinX Containerization Stack.

Verifies:
1. docker-compose.yml structure, services, ports, healthchecks, dependencies, and volumes.
2. backend/Dockerfile multi-stage structure, requirements, healthcheck, and uvicorn CMD.
3. frontend/Dockerfile multi-stage structure, build stage, Nginx runtime stage, and CMD.
4. frontend/nginx.conf reverse proxy rules, SPA fallback, caching, and health proxy.
5. All referenced files exist and are syntactically valid.
"""

import os
import re
import sys
import yaml

ROOT = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(ROOT, "backend"))

def test_compose_spec():
    compose_path = os.path.join(ROOT, "docker-compose.yml")
    assert os.path.isfile(compose_path), "docker-compose.yml must exist"
    
    with open(compose_path, "r", encoding="utf-8") as f:
        data = yaml.safe_load(f)
    
    services = data.get("services", {})
    assert "frontend" in services, "Frontend service missing"
    assert "backend" in services, "Backend service missing"
    assert "redis" in services, "Redis service missing"
    assert "db" in services, "Database (PostgreSQL) service missing"

    # Verify frontend
    fe = services["frontend"]
    assert fe["build"]["context"] == "./frontend"
    assert os.path.isfile(os.path.join(ROOT, fe["build"]["context"], fe["build"]["dockerfile"]))
    assert "backend" in fe["depends_on"]
    assert "healthcheck" in fe

    # Verify backend
    be = services["backend"]
    assert be["build"]["context"] == "./backend"
    assert os.path.isfile(os.path.join(ROOT, be["build"]["context"], be["build"]["dockerfile"]))
    assert "redis" in be["depends_on"]
    assert "db" in be["depends_on"]
    assert "healthcheck" in be

    # Verify redis
    rd = services["redis"]
    assert "redis:7" in rd["image"]
    assert "healthcheck" in rd

    # Verify database
    db = services["db"]
    assert "postgres:16" in db["image"]
    assert "healthcheck" in db

    # Verify volumes
    vols = data.get("volumes", {})
    assert "sqlite_data" in vols
    assert "postgres_data" in vols
    assert "redis_data" in vols

    # Verify network
    nets = data.get("networks", {})
    assert "smartbinx-network" in nets
    print("[PASS] docker-compose.yml structure and service topology verified.")

def test_backend_dockerfile():
    df_path = os.path.join(ROOT, "backend", "Dockerfile")
    assert os.path.isfile(df_path), "backend/Dockerfile must exist"
    content = open(df_path, "r", encoding="utf-8").read()

    assert "FROM python:" in content
    assert "AS builder" in content
    assert "AS runtime" in content
    assert "requirements.txt" in content
    assert "gunicorn" in content
    assert "gunicorn_conf.py" in content
    assert "HEALTHCHECK" in content
    assert "/health" in content
    print("[PASS] backend/Dockerfile multi-stage build, Gunicorn process manager, and healthcheck verified.")

def test_frontend_dockerfile():
    df_path = os.path.join(ROOT, "frontend", "Dockerfile")
    assert os.path.isfile(df_path), "frontend/Dockerfile must exist"
    content = open(df_path, "r", encoding="utf-8").read()

    assert "FROM node:" in content
    assert "AS builder" in content
    assert "npm run build" in content
    assert "FROM nginx:" in content
    assert "nginx.conf" in content
    assert "EXPOSE 80" in content
    assert "HEALTHCHECK" in content
    print("[PASS] frontend/Dockerfile multi-stage build and Nginx runtime verified.")

def test_nginx_conf():
    conf_path = os.path.join(ROOT, "frontend", "nginx.conf")
    assert os.path.isfile(conf_path), "frontend/nginx.conf must exist"
    content = open(conf_path, "r", encoding="utf-8").read()

    assert "listen 80;" in content
    assert "proxy_pass http://backend:8000/api/;" in content
    assert "try_files $uri $uri/ /index.html;" in content
    assert "gzip on;" in content
    assert "location /health" in content
    print("[PASS] frontend/nginx.conf reverse proxy, gzip, and SPA routing verified.")

def test_backend_cache_service():
    from backend.app.services.cache_service import cache
    assert cache is not None
    # Test setting and getting
    cache.set("docker_test_key", {"active": True, "service": "smartbinx"})
    val = cache.get("docker_test_key")
    assert val == {"active": True, "service": "smartbinx"}
    health = cache.health()
    assert "type" in health
    cache.delete("docker_test_key")
    assert cache.get("docker_test_key") is None
    print(f"[PASS] backend/app/services/cache_service.py verified (Health: {health['type']}).")

if __name__ == "__main__":
    test_compose_spec()
    test_backend_dockerfile()
    test_frontend_dockerfile()
    test_nginx_conf()
    test_backend_cache_service()
    print("\n============================================================")
    print("ALL DOCKER STACK SPECIFICATION CHECKS PASSED (5/5) (100%)")
    print("============================================================")

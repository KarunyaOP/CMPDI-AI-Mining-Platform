.PHONY: help install install-backend install-frontend run-backend run-frontend dev test clean

help:
	@echo "========================================================"
	@echo " GeoIntel CMPDI AI Mining Platform - Make Commands"
	@echo "========================================================"
	@echo " make install         - Install backend & frontend dependencies"
	@echo " make install-backend - Install Python backend dependencies"
	@echo " make install-frontend - Install Node frontend dependencies"
	@echo " make run-backend     - Run FastAPI backend (port 8000)"
	@echo " make run-frontend    - Run Vite frontend dev server"
	@echo " make test            - Run backend pytest tests"
	@echo " make clean           - Remove cache files and build artifacts"
	@echo "========================================================"

install: install-backend install-frontend

install-backend:
	@echo "Installing backend dependencies..."
	cd backend && pip install -r requirements.txt

install-frontend:
	@echo "Installing frontend dependencies..."
	cd frontend && npm install

run-backend:
	@echo "Starting FastAPI backend server on http://localhost:8000..."
	uvicorn backend.main:app --reload --port 8000

run-frontend:
	@echo "Starting Vite frontend dev server..."
	cd frontend && npm run dev

test:
	@echo "Running backend test suite..."
	cd backend && pytest

clean:
	@echo "Cleaning cache and build files..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	rm -rf .pytest_cache backend/.pytest_cache frontend/dist

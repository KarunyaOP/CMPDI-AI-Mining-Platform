# GeoIntel CMPDI AI Mining Platform

Professional geological intelligence, mining monitoring, and statutory reporting platform developed for **Central Mine Planning and Design Institute (CMPDI)** & **Coal India Limited (CIL)**.

---

## 🏗️ Monorepo Structure

- **`frontend/`**: React 18 + Vite frontend application (Dashboard, GIS Coalfield Map, MineGPT Assistant, Reports, Uploads).
- **`backend/`**: FastAPI Python backend application (RESTful endpoints, authentication, telemetry, AI report generation, and in-memory repository mirroring frontend data structures).

---

## 🚀 Getting Started & Running the Backend

### Why `ModuleNotFoundError: No module named 'backend'` Occurs
When running `uvicorn backend.main:app` from *inside* the `backend/` directory, Python's import search path considers `backend/` as the root working directory. Since there is no subdirectory or module named `backend` inside `backend/`, Python throws:
```bash
ModuleNotFoundError: No module named 'backend'
```

### Correct Startup Commands

Choose one of the following methods depending on your current working directory:

#### 1. From the Project Root Directory (Recommended)
```bash
uvicorn backend.main:app --reload --port 8000
```
*Alternative (explicit module execution)*:
```bash
python -m uvicorn backend.main:app --reload --port 8000
```

#### 2. From Inside the `backend` Directory
If you have `cd backend`, run `main:app` (do **not** prefix with `backend.`):
```bash
uvicorn main:app --reload --port 8000
```
*Alternative*:
```bash
python -m uvicorn main:app --reload --port 8000
```

---

## 🛠️ Convenient Startup Scripts & Make Commands

We provide automated scripts and a Makefile in the project root to simplify development:

### Using Makefile
- **Install all dependencies** (Backend & Frontend):
  ```bash
  make install
  ```
- **Run FastAPI Backend**:
  ```bash
  make run-backend
  ```
- **Run Vite Frontend**:
  ```bash
  make run-frontend
  ```
- **Run Tests**:
  ```bash
  make test
  ```

### Using Shell Script
- **Start Backend**:
  ```bash
  ./run-backend.sh
  ```

---

## 📦 Installation Manual

### 1. Python Backend Setup
```bash
cd backend
python -m venv venv
# Activate virtual environment:
# On Linux/macOS:
source venv/bin/activate
# On Windows:
# venv\Scripts\activate

pip install -r requirements.txt
```

### 2. Node.js Frontend Setup
```bash
cd frontend
npm install
```

---

## 📚 Documentation
- Backend API Architecture & Endpoints: see [`backend/README.md`](backend/README.md)
- Interactive API Swagger UI: [http://localhost:8000/docs](http://localhost:8000/docs)
- ReDoc Documentation: [http://localhost:8000/redoc](http://localhost:8000/redoc)

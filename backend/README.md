# GeoIntel CMPDI AI Mining Platform - Backend Architecture

Professional Python/FastAPI backend application serving the frontend React requirements of the **CMPDI & Coal India Limited (CIL)** AI Mining Platform.

---

## 🏗️ Architecture Overview

The backend is built with **FastAPI** and **Pydantic v2**, structured around clean architecture principles:
1. **Data & Schema Engineering**: Strongly typed Pydantic models mirroring frontend data structures (`miningData.js`), including subsidiaries, roles, mine telemetry, stratigraphy columns, core lab metrics, and DGMS compliance.
2. **RESTful API Endpoints**: Covering authentication (role-based login), dashboard KPIs, coalfield GIS spatial telemetry, geological reports repository, file uploads, official PDF downloads, and MineGPT natural language querying.
3. **Robust Error Handling**: RFC 7807 compliant error responses (`application/problem+json` structure).
4. **CORS & Security**: Configurable CORS middleware and secure headers.

---

## 🚀 Quick Start Instructions

### 1. Install Dependencies
```bash
cd backend
pip install -r requirements.txt
```

### 2. Run the FastAPI Server (Important: Avoiding ModuleNotFoundError)

If you experience `ModuleNotFoundError: No module named 'backend'`, it is due to running `uvicorn backend.main:app` from *inside* the `backend/` directory.

Use one of the following correct approaches:

#### Option A: Run from the Project Root Directory
```bash
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
```

#### Option B: Run from Inside the `backend` Directory
```bash
cd backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
*(Notice that inside `backend`, you run `main:app` without the `backend.` prefix).*

#### Option C: Use Root Makefile or Startup Script
From the project root, you can simply run:
```bash
make run-backend
```
or
```bash
./run-backend.sh
```

### 3. Explore Interactive API Documentation
- **Swagger UI**: [http://localhost:8000/docs](http://localhost:8000/docs)
- **ReDoc**: [http://localhost:8000/redoc](http://localhost:8000/redoc)

---

## 🔌 API Endpoints Summary

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/` | `GET` | Platform status and health check |
| `/api/auth/login` | `POST` | Role-based authentication (`geologist`, `engineer`, `reporting_officer`) |
| `/api/dashboard/kpis` | `GET` | Dashboard KPI metrics and performance indicators |
| `/api/subsidiaries` | `GET` | List of CIL subsidiaries & CMPDI institutes |
| `/api/coalfields` | `GET` | Coalfield spatial basin data, mine telemetry, and boreholes |
| `/api/reports` | `GET` | Geological reports repository with filtering & search |
| `/api/reports/{id}` | `GET` | Detailed stratigraphic and AI drilldown report |
| `/api/reports/upload` | `POST` | Multipart file upload (PDF/DOCX/XLSX/LAS) with AI OCR extraction |
| `/api/reports/{id}/download` | `GET` | Download official signed PDF geological report |
| `/api/minegpt/query` | `POST` | MineGPT Natural Language Q&A and knowledge retrieval |
| `/api/profile` | `PUT` | Update officer profile details |

---

## 📚 Documentation

The API includes interactive Swagger documentation at `/docs` with:
- Real-time testing capability
- Example requests for all endpoints
- Detailed parameter descriptions
- Response schema visualization

## 🔧 Technical Notes

1. **Data Sources**: All data is in-memory (mirroring `miningData.js`) for rapid prototyping
2. **Error Handling**: Standardized `application/problem+json` responses following RFC 7807
3. **Extensibility**: Clean architecture allows easy addition of database persistence
4. **Scalability**: Async support ready for high-concurrency scenarios

The backend is now fully functional and ready to integrate with your React frontend. All API contracts match the frontend expectations exactly.
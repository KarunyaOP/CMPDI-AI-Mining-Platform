import pytest
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_root():
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "Operational"

def test_login_success():
    response = client.post("/api/auth/login", json={
        "username": "sk.mahapatra",
        "password": "password123",
        "role_key": "geologist"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["user"]["id"] == "geologist"
    assert data["user"]["name"] == "Dr. S. K. Mahapatra"

def test_login_invalid_role():
    response = client.post("/api/auth/login", json={
        "username": "unknown",
        "password": "password123",
        "role_key": "invalid_role"
    })
    assert response.status_code == 401
    data = response.json()
    assert "detail" in data

def test_get_dashboard_kpis():
    response = client.get("/api/dashboard/kpis")
    assert response.status_code == 200
    data = response.json()
    assert "totalReports" in data
    assert data["totalReports"]["value"] == "1,482"
    assert "activeCoalfields" in data
    assert "riskAlerts" in data
    assert "aiQueries" in data

def test_get_subsidiaries():
    response = client.get("/api/subsidiaries")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) > 0
    assert data[0]["code"] == "ALL"

def test_get_coalfields():
    response = client.get("/api/coalfields")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_get_coalfields_filtered():
    response = client.get("/api/coalfields?subsidiary=BCCL")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    for cf in data:
        assert cf["subsidiary"].lower() == "bccl"

def test_get_reports():
    response = client.get("/api/reports")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) >= 2

def test_get_reports_filtered():
    response = client.get("/api/reports?subsidiary=BCCL&category=Slope%20Stability%20%26%20Geotechnical&risk_level=High")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert data[0]["subsidiary"] == "BCCL"

def test_get_report_detail():
    response = client.get("/api/reports/REP-2024-0891")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == "REP-2024-0891"
    assert "stratigraphy" in data
    assert "coreLabMetrics" in data

def test_get_report_detail_not_found():
    response = client.get("/api/reports/REP-9999-9999")
    assert response.status_code == 404
    data = response.json()
    assert "detail" in data
    assert "status" in data
    assert data["status"] == 404

def test_upload_report():
    files = {"file": ("test_report.pdf", b"%PDF-1.4 test content", "application/pdf")}
    data = {"subsidiary": "BCCL", "category": "Slope Stability & Geotechnical"}
    response = client.post("/api/reports/upload", files=files, data=data)
    assert response.status_code == 200
    res_data = response.json()
    assert "id" in res_data
    assert res_data["title"] == "test report"
    assert res_data["subsidiary"] == "BCCL"

def test_download_report():
    response = client.get("/api/reports/REP-2024-0891/download")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "download_url" in data

def test_download_report_not_found():
    response = client.get("/api/reports/REP-0000-0000/download")
    assert response.status_code == 404

def test_minegpt_query_matched():
    response = client.post("/api/minegpt/query", json={"query": "Summarize the uploaded report"})
    assert response.status_code == 200
    data = response.json()
    assert "responseTitle" in data
    assert "reply" in data
    assert "sources" in data

def test_minegpt_query_fallback():
    response = client.post("/api/minegpt/query", json={"query": "What is the coal production in Jharia?"})
    assert response.status_code == 200
    data = response.json()
    assert "responseTitle" in data
    assert "reply" in data

def test_update_profile():
    response = client.put("/api/profile", json={
        "name": "Dr. S. K. Mahapatra Updated",
        "email": "sk.mahapatra.updated@cmpdi.co.in",
        "department": "CMPDI RI-II"
    })
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Dr. S. K. Mahapatra Updated"
    assert data["email"] == "sk.mahapatra.updated@cmpdi.co.in"

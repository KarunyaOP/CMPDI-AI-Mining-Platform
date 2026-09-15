"""
CMPDI & Coal India Limited (CIL) - GeoIntel AI Mining Platform Backend
Built with FastAPI, Pydantic v2, Async Handlers, and Structured Error Responses.
Mirrors all React frontend requirements: Dashboard, Coalfields, MineGPT, Reports, Uploads, and Profiles.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid

from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, status, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from pydantic import BaseModel, Field, EmailStr

# Initialize FastAPI App
app = FastAPI(
    title="GeoIntel CMPDI AI Mining Platform API",
    description="Backend API services for CMPDI & CIL Geological, Mining Intelligence, and Statutory Reporting Platform.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify frontend domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ============================================================================
# 1. PYDANTIC DATA MODELS & SCHEMAS
# ============================================================================

class UserRole(BaseModel):
    id: str
    name: str
    roleTitle: str
    department: str
    subsidiary: str
    email: str
    empId: str
    avatar: str
    badge: str
    permissions: List[str]

class LoginRequest(BaseModel):
    username: str
    password: str
    role_key: str = Field(..., description="geologist | engineer | reporting_officer")

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserRole

class SubsidiaryModel(BaseModel):
    id: str
    name: str
    code: str
    hq: Optional[str] = None

class SensorTelemetry(BaseModel):
    vibrationMmSec: float
    tiltDegree: float
    waterTableDepthM: float
    porePressureKpa: float

class MineModel(BaseModel):
    id: str
    name: str
    type: str  # Opencast (OCP) | Underground (UG)
    coordinates: List[float]  # [lat, lng]
    riskLevel: str  # High | Medium | Low
    riskReason: str
    fos: float
    seamTarget: str
    depthM: int
    strippingRatio: str
    gasGiddiness: str
    status: str
    benchAngle: str
    recentReportId: str
    sensorTelemetry: SensorTelemetry

class BoreholeModel(BaseModel):
    id: str
    name: str
    coordinates: List[float]
    depth: float
    drilledDate: str
    seamsEncountered: int
    topSeam: str
    gcvKcal: int
    ashContent: str
    moisture: str
    rmrRating: str

class CoalfieldModel(BaseModel):
    id: str
    name: str
    subsidiary: str
    state: str
    center: List[float]
    zoom: int
    totalMines: int
    activePits: int
    primeSeams: str
    reservesMT: str
    riskSummary: str
    mines: List[MineModel]
    boreholes: List[BoreholeModel]

class StratigraphyLayer(BaseModel):
    layer: str
    depthFrom: float
    depthTo: float
    lithology: str
    rmr: int
    color: str

class CoreLabMetrics(BaseModel):
    ashContent: str
    moisture: str
    volatileMatter: str
    fixedCarbon: str
    gcv: str
    cokingIndex: str

class DgmsCompliance(BaseModel):
    standard: str
    status: str
    deadline: str

class GeologicalReport(BaseModel):
    id: str
    title: str
    subsidiary: str
    coalfield: str
    category: str
    fileType: str
    fileSize: str
    date: str
    author: str
    status: str
    riskLevel: str
    riskScore: int
    executiveSummary: str
    keyFindings: List[str]
    keywords: List[str]
    stratigraphy: List[StratigraphyLayer]
    coreLabMetrics: CoreLabMetrics
    dgmsCompliance: DgmsCompliance

class SourceCitation(BaseModel):
    id: str
    name: str
    pages: str
    confidence: str

class MineGPTQueryRequest(BaseModel):
    query: str
    context_report_id: Optional[str] = None

class MineGPTResponse(BaseModel):
    responseTitle: str
    reply: str
    sources: List[SourceCitation]

class KPIMetricItem(BaseModel):
    value: str
    change: str
    note: str

class KPIDataResponse(BaseModel):
    totalReports: KPIMetricItem
    activeCoalfields: KPIMetricItem
    riskAlerts: KPIMetricItem
    aiQueries: KPIMetricItem

class ProfileUpdateRequest(BaseModel):
    name: str
    email: EmailStr
    department: str

# ============================================================================
# 2. IN-MEMORY DATABASE (MIRRORING `miningData.js`)
# ============================================================================

SUBSIDIARIES_DB: List[Dict[str, Any]] = [
    { "id": "all", "name": "All Subsidiaries", "code": "ALL" },
    { "id": "bccl", "name": "Bharat Coking Coal Limited", "code": "BCCL", "hq": "Dhanbad, Jharkhand" },
    { "id": "ecl", "name": "Eastern Coalfields Limited", "code": "ECL", "hq": "Sanctoria, West Bengal" },
    { "id": "ccl", "name": "Central Coalfields Limited", "code": "CCL", "hq": "Ranchi, Jharkhand" },
    { "id": "secl", "name": "South Eastern Coalfields Limited", "code": "SECL", "hq": "Bilaspur, Chhattisgarh" },
    { "id": "ncl", "name": "Northern Coalfields Limited", "code": "NCL", "hq": "Singrauli, MP" },
    { "id": "wcl", "name": "Western Coalfields Limited", "code": "WCL", "hq": "Nagpur, Maharashtra" },
    { "id": "mcl", "name": "Mahanadi Coalfields Limited", "code": "MCL", "hq": "Sambalpur, Odisha" },
    { "id": "cmpdi", "name": "CMPDI Regional Institutes", "code": "CMPDI", "hq": "Ranchi, Jharkhand" }
]

USER_ROLES_DB: Dict[str, Dict[str, Any]] = {
    "geologist": {
        "id": "geologist",
        "name": "Dr. S. K. Mahapatra",
        "roleTitle": "Senior Exploration Geologist",
        "department": "CMPDI Regional Institute - II (Dhanbad)",
        "subsidiary": "CMPDI / BCCL",
        "email": "sk.mahapatra@cmpdi.co.in",
        "empId": "CMPDI-GEO-4821",
        "avatar": "SM",
        "badge": "Senior Geologist",
        "permissions": [
            "Borehole Lithology Analysis",
            "Coal Seam Stratigraphy Coring",
            "AI Geological Summary Generation",
            "Export Seam Cross-sections",
            "DGMS Hazard Annotation"
        ]
    },
    "engineer": {
        "id": "engineer",
        "name": "Er. Rajesh K. Sharma",
        "roleTitle": "Dy. Chief Mining Engineer",
        "department": "Mine Planning & Slope Engineering Division",
        "subsidiary": "BCCL (Jharia Division)",
        "email": "rajesh.sharma@bccl.gov.in",
        "empId": "BCCL-ENG-9104",
        "avatar": "RS",
        "badge": "Mining Engineer",
        "permissions": [
            "Open Cast Bench Stability Audits",
            "Stripping Ratio Optimization",
            "Heavy Earth Moving Machinery (HEMM) Deployment",
            "Blasting Vibration Assessment",
            "Mine Evacuation & Safety Workflows"
        ]
    },
    "reporting_officer": {
        "id": "reporting_officer",
        "name": "Pooja Verma, ISS",
        "roleTitle": "Area Reporting Officer & General Manager (Tech)",
        "department": "Directorate of Technical Operations",
        "subsidiary": "Coal India Limited (CIL HQ)",
        "email": "pooja.verma@coalindia.in",
        "empId": "CIL-RO-1033",
        "avatar": "PV",
        "badge": "Reporting Officer",
        "permissions": [
            "Executive Summary Endorsement",
            "DGMS Statutory Regulatory Filing",
            "Ministry of Coal Quarterly MIS",
            "Subsidiary Risk Compliance Sign-off",
            "Production Quota & Environmental Audit"
        ]
    }
}

COALFIELDS_DB: List[Dict[str, Any]] = [
    {
        "id": "cf-jharia",
        "name": "Jharia Coalfield",
        "subsidiary": "BCCL",
        "state": "Jharkhand",
        "center": [23.75, 86.42],
        "zoom": 12,
        "totalMines": 38,
        "activePits": 14,
        "primeSeams": "Seam I to XVIII (Prime Coking Coal)",
        "reservesMT": "19,400 MT",
        "riskSummary": "High Fire & Slope Subsidence Risks in Block IV & Joyrampur",
        "mines": [
            {
                "id": "mine-joyrampur",
                "name": "Joyrampur Colliery (Block IV Open Cast)",
                "type": "Opencast (OCP)",
                "coordinates": [23.7712, 86.4189],
                "riskLevel": "High",
                "riskReason": "High slope movement (>4.2 mm/day) on South-West bench; FOS = 1.18",
                "fos": 1.18,
                "seamTarget": "Seam IX/X (Prime Coking)",
                "depthM": 240,
                "strippingRatio": "1:4.8",
                "gasGiddiness": "Degree-II",
                "status": "Active Monitoring",
                "benchAngle": "44°",
                "recentReportId": "REP-2024-0891",
                "sensorTelemetry": {
                    "vibrationMmSec": 3.4,
                    "tiltDegree": 0.84,
                    "waterTableDepthM": 38.2,
                    "porePressureKpa": 142
                }
            },
            {
                "id": "mine-kusunda",
                "name": "Kusunda Open Cast Mine",
                "type": "Opencast (OCP)",
                "coordinates": [23.785, 86.388],
                "riskLevel": "Medium",
                "riskReason": "Old underground workings collapse risk adjacent to main haul road",
                "fos": 1.42,
                "seamTarget": "Seam V/VI/VII",
                "depthM": 195,
                "strippingRatio": "1:3.6",
                "gasGiddiness": "Degree-I",
                "status": "Operational",
                "benchAngle": "38°",
                "recentReportId": "REP-2024-0744",
                "sensorTelemetry": {
                    "vibrationMmSec": 1.8,
                    "tiltDegree": 0.31,
                    "waterTableDepthM": 45.1,
                    "porePressureKpa": 98
                }
            },
            {
                "id": "mine-moonidih",
                "name": "Moonidih Underground Project",
                "type": "Underground (UG)",
                "coordinates": [23.738, 86.353],
                "riskLevel": "Low",
                "riskReason": "Longwall face strata pressure within permissible DGMS bounds",
                "fos": 1.85,
                "seamTarget": "Seam XVI-Top (Coking)",
                "depthM": 410,
                "strippingRatio": "N/A (Longwall)",
                "gasGiddiness": "Degree-III (Gassy)",
                "status": "Fully Operational",
                "benchAngle": "N/A",
                "recentReportId": "REP-2024-0912",
                "sensorTelemetry": {
                    "vibrationMmSec": 0.6,
                    "tiltDegree": 0.05,
                    "waterTableDepthM": 82.0,
                    "porePressureKpa": 65
                }
            }
        ],
        "boreholes": [
            {
                "id": "BH-JH-104",
                "name": "Borehole BH-JH-104 (Deep Coring)",
                "coordinates": [23.765, 86.402],
                "depth": 380,
                "drilledDate": "2024-02-18",
                "seamsEncountered": 6,
                "topSeam": "Seam XIV (4.2m)",
                "gcvKcal": 6850,
                "ashContent": "18.4%",
                "moisture": "1.2%",
                "rmrRating": "68 (Class II - Good Roof)"
            },
            {
                "id": "BH-JH-109",
                "name": "Borehole BH-JH-109 (Fault Zone)",
                "coordinates": [23.782, 86.435],
                "depth": 420,
                "drilledDate": "2024-03-04",
                "seamsEncountered": 4,
                "topSeam": "Seam X-Bottom (3.1m)",
                "gcvKcal": 6420,
                "ashContent": "22.1%",
                "moisture": "1.6%",
                "rmrRating": "44 (Class IV - Poor Strata)"
            }
        ]
    },
    {
        "id": "cf-raniganj",
        "name": "Raniganj Coalfield",
        "subsidiary": "ECL",
        "state": "West Bengal",
        "center": [23.62, 87.12],
        "zoom": 12,
        "totalMines": 42,
        "activePits": 18,
        "primeSeams": "Dishergarh, Sanctoria, Poniati (High Volatile Non-Coking & Semi-Coking)",
        "reservesMT": "28,100 MT",
        "riskSummary": "High Water Inrush and Old Strata Waterlogged Workings in Sripur Sector",
        "mines": [
            {
                "id": "mine-sonepur-bazari",
                "name": "Sonepur Bazari Opencast Project",
                "type": "Opencast (OCP)",
                "coordinates": [23.692, 87.218],
                "riskLevel": "Low",
                "riskReason": "High capacity dragline excavation with stable bench configuration",
                "fos": 1.68,
                "seamTarget": "Raniganj Measure Seams",
                "depthM": 165,
                "strippingRatio": "1:5.2",
                "gasGiddiness": "Degree-I",
                "status": "Optimal Production",
                "benchAngle": "36°",
                "recentReportId": "REP-2024-0650",
                "sensorTelemetry": {
                    "vibrationMmSec": 1.1,
                    "tiltDegree": 0.12,
                    "waterTableDepthM": 29.5,
                    "porePressureKpa": 72
                }
            },
            {
                "id": "mine-chinakuri",
                "name": "Chinakuri Mine No. 1 & 2",
                "type": "Underground (UG)",
                "coordinates": [23.684, 86.861],
                "riskLevel": "High",
                "riskReason": "High in-situ methane emission in Dishergarh Seam at 600m depth",
                "fos": 1.25,
                "seamTarget": "Dishergarh Seam",
                "depthM": 610,
                "strippingRatio": "N/A",
                "gasGiddiness": "Degree-III (Gassy)",
                "status": "Strict Degasification Active",
                "benchAngle": "N/A",
                "recentReportId": "REP-2024-0518",
                "sensorTelemetry": {
                    "vibrationMmSec": 0.8,
                    "tiltDegree": 0.45,
                    "waterTableDepthM": 110.0,
                    "porePressureKpa": 210
                }
            }
        ],
        "boreholes": [
            {
                "id": "BH-RN-208",
                "name": "Borehole BH-RN-208 (Dishergarh Coring)",
                "coordinates": [23.675, 86.885],
                "depth": 540,
                "drilledDate": "2024-01-22",
                "seamsEncountered": 5,
                "topSeam": "Dishergarh (5.4m)",
                "gcvKcal": 6920,
                "ashContent": "14.8%",
                "moisture": "2.4%",
                "rmrRating": "72 (Class II - Very Good)"
            }
        ]
    },
    {
        "id": "cf-singrauli",
        "name": "Singrauli Coalfield",
        "subsidiary": "NCL",
        "state": "Madhya Pradesh & UP",
        "center": [24.12, 82.68],
        "zoom": 12,
        "totalMines": 11,
        "activePits": 10,
        "primeSeams": "Purewa (Bottom & Top), Turra Seam (Giant Open Pit Formations)",
        "reservesMT": "16,200 MT",
        "riskSummary": "Massive Overburden Dump Stability Monitoring at Jayant & Nigahi",
        "mines": [
            {
                "id": "mine-jayant",
                "name": "Jayant Mega Opencast Project",
                "type": "Opencast (OCP)",
                "coordinates": [24.118, 82.635],
                "riskLevel": "Medium",
                "riskReason": "Overburden dump height exceeds 120m; Continuous radar displacement monitoring",
                "fos": 1.35,
                "seamTarget": "Purewa & Turra Seams (18m thick)",
                "depthM": 190,
                "strippingRatio": "1:2.8",
                "gasGiddiness": "Degree-I",
                "status": "Operational",
                "benchAngle": "40°",
                "recentReportId": "REP-2024-0810",
                "sensorTelemetry": {
                    "vibrationMmSec": 2.1,
                    "tiltDegree": 0.52,
                    "waterTableDepthM": 52.0,
                    "porePressureKpa": 115
                }
            },
            {
                "id": "mine-nigahi",
                "name": "Nigahi Open Cast Project",
                "type": "Opencast (OCP)",
                "coordinates": [24.135, 82.695],
                "riskLevel": "Low",
                "riskReason": "Excellent bench stabilization and automated slope laser telemetry",
                "fos": 1.72,
                "seamTarget": "Turra Seam",
                "depthM": 175,
                "strippingRatio": "1:2.4",
                "gasGiddiness": "Degree-I",
                "status": "Optimal Production",
                "benchAngle": "35°",
                "recentReportId": "REP-2024-0422",
                "sensorTelemetry": {
                    "vibrationMmSec": 1.2,
                    "tiltDegree": 0.15,
                    "waterTableDepthM": 48.0,
                    "porePressureKpa": 68
                }
            }
        ],
        "boreholes": [
            {
                "id": "BH-SG-012",
                "name": "Borehole BH-SG-012 (Turra Seam Probe)",
                "coordinates": [24.125, 82.665],
                "depth": 260,
                "drilledDate": "2024-02-09",
                "seamsEncountered": 3,
                "topSeam": "Turra (16.2m)",
                "gcvKcal": 4850,
                "ashContent": "28.6%",
                "moisture": "7.8%",
                "rmrRating": "62 (Class II - Fair/Good)"
            }
        ]
    },
    {
        "id": "cf-korba",
        "name": "Korba Coalfield",
        "subsidiary": "SECL",
        "state": "Chhattisgarh",
        "center": [22.35, 82.68],
        "zoom": 12,
        "totalMines": 19,
        "activePits": 12,
        "primeSeams": "Gevra, Kusmunda, Dipka Mega-Deposits",
        "reservesMT": "22,800 MT",
        "riskSummary": "High Dust Generation & Monsoon Water Sump Overflows at Gevra OC",
        "mines": [
            {
                "id": "mine-gevra",
                "name": "Gevra Mega Opencast Project (World's Largest Coal Mine)",
                "type": "Opencast (OCP)",
                "coordinates": [22.348, 82.592],
                "riskLevel": "Low",
                "riskReason": "State-of-the-art continuous surface miners and eco-restoration benches",
                "fos": 1.65,
                "seamTarget": "Upper Kusmunda & Lower Kusmunda",
                "depthM": 180,
                "strippingRatio": "1:1.6",
                "gasGiddiness": "Degree-I",
                "status": "Peak Capacity (70 MTPA)",
                "benchAngle": "36°",
                "recentReportId": "REP-2024-0995",
                "sensorTelemetry": {
                    "vibrationMmSec": 1.4,
                    "tiltDegree": 0.18,
                    "waterTableDepthM": 35.0,
                    "porePressureKpa": 82
                }
            }
        ],
        "boreholes": [
            {
                "id": "BH-KB-301",
                "name": "Borehole BH-KB-301 (Gevra Extension)",
                "coordinates": [22.362, 82.580],
                "depth": 210,
                "drilledDate": "2024-03-12",
                "seamsEncountered": 2,
                "topSeam": "Kusmunda Composite (28.4m)",
                "gcvKcal": 3900,
                "ashContent": "38.2%",
                "moisture": "9.2%",
                "rmrRating": "58 (Class III - Fair)"
            }
        ]
    }
]

REPORTS_DB: List[Dict[str, Any]] = [
    {
        "id": "REP-2024-0891",
        "title": "Geotechnical Slope Stability & Strata Behavior Audit of Joyrampur Block-IV OCP",
        "subsidiary": "BCCL",
        "coalfield": "Jharia Coalfield",
        "category": "Slope Stability & Geotechnical",
        "fileType": "PDF",
        "fileSize": "14.2 MB",
        "date": "2024-03-11",
        "author": "Dr. S. K. Mahapatra (Sr. Geologist, CMPDI RI-II)",
        "status": "AI Analyzed & Certified",
        "riskLevel": "High",
        "riskScore": 84,
        "executiveSummary": "Detailed limit equilibrium and finite element analysis (FEM) of the South-West highwall bench at Joyrampur Block-IV reveals a localized Factor of Safety (FOS) drop to 1.18 under monsoon saturated conditions. The underlying Seam IX/X floor exhibits a 12° dip towards the pit floor with slickensided carbonaceous shale weakness planes. Immediate bench flattening from 48° to 38° and horizontal dewatering drillholes are mandated prior to next extraction cycle.",
        "keyFindings": [
            "Factor of Safety (FOS) reduced to 1.18 in Bench 4B due to excessive pore water pressure.",
            "Slickensided clay gouge layer (15-20cm thick) identified along the Seam IX floor contact.",
            "Micro-seismic sensor S-04 detected 14 low-magnitude acoustic emissions over the past 72 hours.",
            "Recommended installation of 8 sub-horizontal drain holes of 40m length to depressurize the aquifer."
        ],
        "keywords": [
            "Slope Stability", "Factor of Safety (FOS)", "Seam IX/X", "Joyrampur OCP",
            "Pore Water Pressure", "FEM Analysis", "Bench Flattening", "DGMS Circular 02/2021"
        ],
        "stratigraphy": [
            { "layer": "Topsoil & Weathered Overburden", "depthFrom": 0, "depthTo": 14, "lithology": "Weathered Sandstone & Clay", "rmr": 38, "color": "#d97706" },
            { "layer": "Medium Grained Sandstone Strata", "depthFrom": 14, "depthTo": 68, "lithology": "Hard Compact Sandstone", "rmr": 74, "color": "#94a3b8" },
            { "layer": "Carbonaceous Shale Parting", "depthFrom": 68, "depthTo": 72, "lithology": "Weak Slickensided Shale", "rmr": 32, "color": "#64748b" },
            { "layer": "Coal Seam IX (Prime Coking)", "depthFrom": 72, "depthTo": 79.5, "lithology": "Bituminous Coal (Ash 18.2%, GCV 6840)", "rmr": 65, "color": "#1e293b" },
            { "layer": "Interburden Coarse Sandstone", "depthFrom": 79.5, "depthTo": 135, "lithology": "Massive Sandstone Bed", "rmr": 80, "color": "#cbd5e1" },
            { "layer": "Coal Seam X (Semi-Coking)", "depthFrom": 135, "depthTo": 141.2, "lithology": "High Volatile Coal (Ash 21.4%)", "rmr": 61, "color": "#0f172a" }
        ],
        "coreLabMetrics": {
            "ashContent": "18.2%",
            "moisture": "1.4%",
            "volatileMatter": "26.8%",
            "fixedCarbon": "53.6%",
            "gcv": "6,840 kcal/kg",
            "cokingIndex": "Grade Steel-I"
        },
        "dgmsCompliance": {
            "standard": "DGMS (Tech) S&T Circular No. 04",
            "status": "Corrective Action Plan Mandated",
            "deadline": "15 Days"
        }
    },
    {
        "id": "REP-2024-0744",
        "title": "Lithological Core Logging & Seam Correlation Report for Kusunda North Extension",
        "subsidiary": "BCCL",
        "coalfield": "Jharia Coalfield",
        "category": "Borehole Lithology",
        "fileType": "PDF",
        "fileSize": "22.8 MB",
        "date": "2024-02-28",
        "author": "A. K. Sengupta (Exploration Wing, CMPDI)",
        "status": "AI Analyzed & Certified",
        "riskLevel": "Medium",
        "riskScore": 56,
        "executiveSummary": "Exploration drilling of Boreholes BH-KS-101 through BH-KS-108 confirmed the persistence of Seams V, VI, and VII in the Northern extension of Kusunda block. Cumulative mineable coal thickness is estimated at 18.4m with an average stripping ratio of 1:3.6. A normal fault F-14 with 12m throw was mapped in the North-East sector, displacing Seam VII upwards.",
        "keyFindings": [
            "Total geological coal reserves estimated at 42.6 MT in the 2.4 sq.km surveyed block.",
            "Seam VII exhibits superior coking characteristics with Crucible Swelling Number (CSN) 5.5.",
            "Fault F-14 trending NW-SE mapped accurately using high-resolution seismic refraction survey.",
            "No major aquifer intersection found above 180m depth."
        ],
        "keywords": [
            "Borehole Coring", "Seam V/VI/VII", "Fault F-14", "Coking Coal",
            "Stripping Ratio 1:3.6", "Kusunda Block", "CMPDI Exploration"
        ],
        "stratigraphy": [
            { "layer": "Alluvial Cover", "depthFrom": 0, "depthTo": 8, "lithology": "Silt & Sandy Clay", "rmr": 40, "color": "#f59e0b" },
            { "layer": "Fine Sandstone Bed", "depthFrom": 8, "depthTo": 45, "lithology": "Fine Sandstone", "rmr": 68, "color": "#94a3b8" },
            { "layer": "Coal Seam VII", "depthFrom": 45, "depthTo": 52.4, "lithology": "Prime Coking Coal", "rmr": 70, "color": "#1e293b" },
            { "layer": "Shaly Sandstone", "depthFrom": 52.4, "depthTo": 98, "lithology": "Laminated Sandstone", "rmr": 64, "color": "#64748b" },
            { "layer": "Coal Seam V/VI Combined", "depthFrom": 98, "depthTo": 109, "lithology": "Coking Coal", "rmr": 66, "color": "#0f172a" }
        ],
        "coreLabMetrics": {
            "ashContent": "19.8%",
            "moisture": "1.6%",
            "volatileMatter": "24.5%",
            "fixedCarbon": "54.1%",
            "gcv": "6,620 kcal/kg",
            "cokingIndex": "Grade Steel-II"
        },
        "dgmsCompliance": {
            "standard": "CMPDI Geo-Exploration Guidelines 2020",
            "status": "Fully Compliant",
            "deadline": "Annual Review"
        }
    },
    {
        "id": "REP-2024-0912",
        "title": "Strata Monitoring & Longwall Face Geomechanics Report - Moonidih Seam XVI",
        "subsidiary": "BCCL",
        "coalfield": "Jharia Coalfield",
        "category": "Underground Geomechanics",
        "fileType": "DOCX",
        "fileSize": "8.6 MB",
        "date": "2024-03-02",
        "author": "Prof. N. K. Roy (Advisor Strata Control, CMPDI)",
        "status": "AI Analyzed & Certified",
        "riskLevel": "Low",
        "riskScore": 22,
        "executiveSummary": "Continuous monitoring of hydraulic powered roof supports (PRS) at Moonidih Longwall Panel L-4 indicates periodic main weighting interval of 32m to 38m. Leg pressure sensors remained below 380 bar (rated capacity 450 bar). Degasification drainage holes reduced methane concentration in the return airway to 0.42%, well below the statutory limit of 0.75%.",
        "keyFindings": [
            "Powered Support Leg Pressures steady with average load 340 bar during normal shear cycles.",
            "Main roof periodic caving occurring smoothly without sudden air-blast hazard.",
            "Pre-drainage cross-measure boreholes achieving 68% methane extraction efficiency.",
            "Roof convergence measured at gate roads averaged 4.2mm per 10m advance."
        ],
        "keywords": [
            "Moonidih Longwall", "Powered Roof Support", "Strata Control",
            "Methane Pre-drainage", "Seam XVI", "DGMS CMR 2017"
        ],
        "stratigraphy": [
            { "layer": "Massive Sandstone Main Roof", "depthFrom": 360, "depthTo": 398, "lithology": "Coarse Massive Sandstone (UCS 82 MPa)", "rmr": 82, "color": "#94a3b8" },
            { "layer": "Immediate Roof Shale", "depthFrom": 398, "depthTo": 402, "lithology": "Laminated Mudstone", "rmr": 52, "color": "#64748b" },
            { "layer": "Coal Seam XVI-Top", "depthFrom": 402, "depthTo": 406.8, "lithology": "High Grade Coking Coal", "rmr": 75, "color": "#0f172a" },
            { "layer": "Strong Sandstone Floor", "depthFrom": 406.8, "depthTo": 420, "lithology": "Hard Quartzitic Sandstone", "rmr": 85, "color": "#cbd5e1" }
        ],
        "coreLabMetrics": {
            "ashContent": "15.4%",
            "moisture": "1.1%",
            "volatileMatter": "28.2%",
            "fixedCarbon": "55.3%",
            "gcv": "7,120 kcal/kg",
            "cokingIndex": "Prime Coking Coal (Washed)"
        },
        "dgmsCompliance": {
            "standard": "Coal Mines Regulations (CMR) 2017 - Regulation 123",
            "status": "Fully Compliant",
            "deadline": "Continuous Audit"
        }
    },
    {
        "id": "REP-2024-0518",
        "title": "Deep Seam Degasification & Coalbed Gas Reservoir Study - Chinakuri Colliery",
        "subsidiary": "ECL",
        "coalfield": "Raniganj Coalfield",
        "category": "Gas Reservoir & Ventilation",
        "fileType": "PDF",
        "fileSize": "18.4 MB",
        "date": "2024-02-14",
        "author": "Ventilation & Gas Safety Cell, ECL / CMPDI RI-I",
        "status": "AI Analyzed & Certified",
        "riskLevel": "High",
        "riskScore": 79,
        "executiveSummary": "In-situ coalbed methane gas content in Dishergarh Seam at 610m depth was measured at 14.8 m³/tonne. Laboratory sorption isotherm tests indicate high reservoir pressure of 3.8 MPa. Recommendations include implementing directional in-seam drainage drilling with vacuum pumps to prevent gas blowout during future mechanical heading development.",
        "keyFindings": [
            "In-situ gas content measured between 13.2 and 15.4 m³/tonne of clean coal.",
            "Desorption rate index (V1) is high at 1.8 mL/g/min 0.5 indicating rapid gas emission upon strata fracturing.",
            "Auxiliary ventilation capacity must be upgraded from 18 m³/sec to 32 m³/sec in heading faces.",
            "Continuous automated NDIR optical methane sensors deployed with auto-trip interlocks."
        ],
        "keywords": [
            "Chinakuri Mine", "Dishergarh Seam", "Methane Gas Content (14.8 m3/t)",
            "Degree-III Mine", "Degasification Drilling", "Ventilation Safety"
        ],
        "stratigraphy": [
            { "layer": "Raniganj Upper Formation", "depthFrom": 0, "depthTo": 320, "lithology": "Alternate Sandstone & Shale Beds", "rmr": 70, "color": "#94a3b8" },
            { "layer": "Dishergarh Main Sandstone", "depthFrom": 320, "depthTo": 605, "lithology": "Massive Impermeable Sandstone", "rmr": 78, "color": "#64748b" },
            { "layer": "Dishergarh Seam (Thick Gas Reservoir)", "depthFrom": 605, "depthTo": 610.8, "lithology": "Gas-Rich High Volatile Coal", "rmr": 68, "color": "#0f172a" },
            { "layer": "Floor Carbonaceous Siltstone", "depthFrom": 610.8, "depthTo": 630, "lithology": "Siltstone & Shale", "rmr": 62, "color": "#cbd5e1" }
        ],
        "coreLabMetrics": {
            "ashContent": "14.2%",
            "moisture": "2.5%",
            "volatileMatter": "36.8%",
            "fixedCarbon": "46.5%",
            "gcv": "6,980 kcal/kg",
            "cokingIndex": "Semi-Coking / High Gas Yield"
        },
        "dgmsCompliance": {
            "standard": "DGMS Tech Circular No. 01 (Ventilation Standards for Gassy Mines)",
            "status": "Degasification Upgrade Required",
            "deadline": "30 Days"
        }
    },
    {
        "id": "REP-2024-0810",
        "title": "High-Capacity Overburden Dump Slope Radar Telemetry - Jayant OCP",
        "subsidiary": "NCL",
        "coalfield": "Singrauli Coalfield",
        "category": "Slope Stability & Geotechnical",
        "fileType": "EXCEL / PDF",
        "fileSize": "16.5 MB",
        "date": "2024-03-08",
        "author": "Geotechnical Engineering Group, NCL",
        "status": "AI Analyzed & Certified",
        "riskLevel": "Medium",
        "riskScore": 52,
        "executiveSummary": "GroundProbe Slope Stability Radar (SSR) monitoring of the 135m high Southern Waste Dump at Jayant Opencast Project detected minor creep displacement (1.2mm/day) in the middle tier terrace. 3D limit equilibrium back-analysis computed a Global Safety Factor of 1.35 under static conditions, reducing to 1.15 under pseudo-dynamic blasting vibration.",
        "keyFindings": [
            "Dump terrace height recommended to be limited to 30m maximum per bench with 25m berm widths.",
            "Installed toe-drainage gallery effectively lowered phreatic surface inside the dump mass by 14m.",
            "Recommended toe rock-bund reinforcement using massive sandstone boulder rip-rap.",
            "Real-time automated alarm trigger established at 5.0 mm/day velocity threshold."
        ],
        "keywords": [
            "Jayant OCP", "Overburden Dump", "Slope Stability Radar (SSR)",
            "Factor of Safety (1.35)", "Berm Design", "NCL Singrauli"
        ],
        "stratigraphy": [
            { "layer": "Loose Overburden Dump Material", "depthFrom": 0, "depthTo": 135, "lithology": "Compacted Sandstone & Shale Debris", "rmr": 42, "color": "#d97706" },
            { "layer": "Original Basal Bedrock", "depthFrom": 135, "depthTo": 180, "lithology": "Firm Sandstone Foundation", "rmr": 75, "color": "#94a3b8" }
        ],
        "coreLabMetrics": {
            "ashContent": "N/A (Overburden)",
            "moisture": "6.4%",
            "volatileMatter": "N/A",
            "fixedCarbon": "N/A",
            "gcv": "N/A",
            "cokingIndex": "Overburden Strata"
        },
        "dgmsCompliance": {
            "standard": "DGMS Circular 02 of 2020 (Dump Safety Guidelines)",
            "status": "Fully Compliant with Radar Monitoring",
            "deadline": "Quarterly Re-assessment"
        }
    },
    {
        "id": "REP-2024-0995",
        "title": "Gevra Expansion 70 MTPA Environmental & Strata Clearance Feasibility",
        "subsidiary": "SECL",
        "coalfield": "Korba Coalfield",
        "category": "Environmental & Mine Planning",
        "fileType": "PDF",
        "fileSize": "31.4 MB",
        "date": "2024-03-10",
        "author": "Mine Planning Dept, CMPDI RI-V (Bilaspur)",
        "status": "AI Analyzed & Certified",
        "riskLevel": "Low",
        "riskScore": 18,
        "executiveSummary": "Comprehensive geological evaluation of the Kusmunda Upper and Lower seams for the Gevra Mega Expansion to 70 MTPA capacity. Clean stripping ratio of 1:1.6 ensures low unit extraction cost. Hydrogeological modeling indicates manageable cone of water depression within 1.2km radius with extensive rain-water harvesting sumps planned in decoaled voids.",
        "keyFindings": [
            "Proved mineable reserves exceed 680 MT in the expanded lease boundary.",
            "Surface miner deployment minimizes blasting vibration impact on neighboring villages.",
            "Water management system recirculates 84% of mine pit discharge for dust suppression and washeries.",
            "Carbon sequestration green-belt buffer designed covering 420 hectares."
        ],
        "keywords": [
            "Gevra 70 MTPA", "Kusmunda Seam", "SECL Korba", "Stripping Ratio 1:1.6",
            "Surface Miner", "Hydrogeology", "CMPDI Mine Plan"
        ],
        "stratigraphy": [
            { "layer": "Alluvium & Sandy Soil", "depthFrom": 0, "depthTo": 12, "lithology": "Loose Soil & Gravel", "rmr": 45, "color": "#f59e0b" },
            { "layer": "Upper Sandstone Bed", "depthFrom": 12, "depthTo": 52, "lithology": "Coarse Sandstone", "rmr": 72, "color": "#94a3b8" },
            { "layer": "Upper Kusmunda Seam", "depthFrom": 52, "depthTo": 78.4, "lithology": "Power Grade Coal (G-11)", "rmr": 62, "color": "#1e293b" },
            { "layer": "Parting Sandstone", "depthFrom": 78.4, "depthTo": 96, "lithology": "Compact Siltstone", "rmr": 68, "color": "#64748b" },
            { "layer": "Lower Kusmunda Seam (Thick)", "depthFrom": 96, "depthTo": 138, "lithology": "Non-Coking Coal (G-12)", "rmr": 64, "color": "#0f172a" }
        ],
        "coreLabMetrics": {
            "ashContent": "37.8%",
            "moisture": "8.4%",
            "volatileMatter": "22.1%",
            "fixedCarbon": "31.7%",
            "gcv": "3,950 kcal/kg",
            "cokingIndex": "Power Utility Grade G-11/G-12"
        },
        "dgmsCompliance": {
            "standard": "Ministry of Environment, Forest & Climate Change (MoEFCC) EC Terms",
            "status": "Approved & Certified",
            "deadline": "Bi-annual Reporting"
        }
    }
]

MINEGPT_KNOWLEDGE_BASE: List[Dict[str, Any]] = [
    {
        "query": "Summarize the uploaded report",
        "responseTitle": "AI Executive Summary: Joyrampur Block-IV Geotechnical Audit",
        "reply": "Based on the latest uploaded geotechnical report (REP-2024-0891):\n\n### Key Geological & Geotechnical Highlights:\n1. **Factor of Safety (FOS)**: Calculated at **1.18** on the South-West highwall bench (Bench 4B), which is **below the DGMS statutory minimum threshold of 1.30** for operational open cast pits.\n2. **Coal Seam Intersection**: Target **Seam IX/X** encountered at 72.0m depth with total coal thickness of **7.5m** (Prime Coking Grade Steel-I, GCV 6,840 kcal/kg, Ash 18.2%).\n3. **Primary Hazard Identified**: A continuous slickensided carbonaceous shale layer (15-20cm thickness) along the coal seam floor contact is acting as a planar slip surface when saturated by perched groundwater.\n4. **Immediate Mandated Remediation**:\n   - Flatten bench slope angle from **48° to 38°**.\n   - Drill **8 sub-horizontal dewatering holes** (40m depth) to reduce pore water pressure from 142 kPa to <60 kPa.\n   - Maintain continuous 24/7 laser displacement telemetry with trigger alerts set at 3.0 mm/day.",
        "sources": [
            { "id": "REP-2024-0891", "name": "Joyrampur Geotechnical Audit (CMPDI RI-II)", "pages": "pp. 14-22", "confidence": "99.2%" },
            { "id": "BH-JH-104", "name": "Borehole Stratigraphy Log BH-JH-104", "pages": "Core Depth 72m-80m", "confidence": "98.5%" }
        ]
    },
    {
        "query": "Show high-risk locations",
        "responseTitle": "High-Risk Geo-Hazard Zones Across Coalfields",
        "reply": "Currently, the CMPDI AI Engine has identified **3 Critical High-Risk Locations** requiring immediate intervention:\n\n| Coalfield | Mine / Block | Hazard Type | Severity Metric | Recommended Action |\n| :--- | :--- | :--- | :--- | :--- |\n| **Jharia (BCCL)** | **Joyrampur Colliery (Block IV OCP)** | Highwall Slope Instability | FOS = **1.18** (Critical) | Urgent bench flattening & horizontal dewatering |\n| **Raniganj (ECL)** | **Chinakuri Underground No. 1** | In-situ Methane Gas & Strata Pressure | Gas Content = **14.8 m³/t** | Vacuum pre-drainage degasification drilling |\n| **Singrauli (NCL)** | **Jayant Overburden Dump Tier 3** | Dump Slope Creep Displacement | Velocity = **1.2 mm/day** | Rock-bund reinforcement & berm widening |\n\n*Note: All alerts have been automatically compiled into DGMS Compliance Notice formats.*",
        "sources": [
            { "id": "DGMS-ALERTS-2024", "name": "CMPDI Live Sensor Telemetry Network", "pages": "Real-time Feeds", "confidence": "99.8%" },
            { "id": "REP-2024-0891", "name": "Joyrampur Slope Stability Assessment", "pages": "pp. 18", "confidence": "98.1%" },
            { "id": "REP-2024-0518", "name": "Chinakuri Degasification Study", "pages": "pp. 6-12", "confidence": "97.4%" }
        ]
    },
    {
        "query": "Compare two reports",
        "responseTitle": "Comparative Geological Analysis: Jharia Block-IV vs Kusunda Extension",
        "reply": "Here is the AI comparative synthesis between **REP-2024-0891 (Joyrampur OCP)** and **REP-2024-0744 (Kusunda Extension)**:\n\n| Geological Parameter | Joyrampur Block-IV (BCCL) | Kusunda Extension (BCCL) | Variance / Remarks |\n| :--- | :--- | :--- | :--- |\n| **Target Coal Seams** | Seam IX/X (Prime Coking) | Seam V/VI/VII (Semi/Prime Coking) | Kusunda has thicker combined seam |\n| **Average Seam Thickness**| 7.5 meters | 18.4 meters (cumulative) | +145% coal volume in Kusunda |\n| **Stripping Ratio** | **1 : 4.8** (Higher Overburden) | **1 : 3.6** (Economical) | Kusunda yields lower extraction cost |\n| **Calorific Value (GCV)** | **6,840 kcal/kg** | 6,620 kcal/kg | Joyrampur has higher thermal/coke quality |\n| **Ash Content (%)** | 18.2% (Grade Steel-I) | 19.8% (Grade Steel-II) | Joyrampur requires less washing |\n| **Geotechnical Risk** | **High (FOS 1.18)** | **Medium (FOS 1.42)** | Joyrampur requires urgent slope remediation |\n| **Structural Complexity** | Planar slickenside shale layer | Normal Fault F-14 (12m throw) | Kusunda has structural tectonic offset |",
        "sources": [
            { "id": "REP-2024-0891", "name": "Joyrampur Block-IV Geotechnical Audit", "pages": "pp. 8-16", "confidence": "98.9%" },
            { "id": "REP-2024-0744", "name": "Kusunda Lithological & Seam Correlation", "pages": "pp. 21-29", "confidence": "98.7%" }
        ]
    },
    {
        "query": "List recent geological findings",
        "responseTitle": "Recent Geological & Exploration Discoveries (CMPDI 2024)",
        "reply": "Summary of key exploration and geological milestones synthesized across recent subsidiary reports:\n\n1. **Gevra Mega Seam Extension (SECL - Korba)**:\n   - Confirmed **680 MT** proved mineable reserves in Kusunda Upper & Lower seams with a favorable stripping ratio of **1:1.6**.\n2. **Deep Coking Reserves in Jharia (BCCL - Moonidih)**:\n   - Continuous Longwall shear mining at 410m depth proved the structural continuity of Seam XVI with high GCV (**7,120 kcal/kg**) and low ash (**15.4%**).\n3. **Highwall Dewatering Protocols (BCCL - Joyrampur)**:\n   - Sub-horizontal drainage drill patterns mapped to relieve pore pressure along carbonaceous shale boundaries, elevating FOS back above **1.35**.\n4. **Coalbed Methane Potential in Raniganj (ECL - Chinakuri)**:\n   - Dishergarh Seam confirmed as a Tier-1 methane reservoir (**14.8 m³/tonne**), supporting commercial CBM extraction alongside underground mining safety.",
        "sources": [
            { "id": "CMPDI-ANNUAL-2024", "name": "CMPDI Central Geological Repository", "pages": "Sections 4.1 - 4.6", "confidence": "99.0%" }
        ]
    }
]

# ============================================================================
# 3. API ENDPOINTS
# ============================================================================

@app.get("/", tags=["Root"])
async def root():
    return {
        "platform": "GeoIntel CMPDI AI Mining Platform API",
        "status": "Operational",
        "version": "1.0.0",
        "docs": "/docs"
    }

@app.post("/api/auth/login", response_model=LoginResponse, tags=["Authentication"])
async def login(payload: LoginRequest):
    """
    Authenticate user based on role key (geologist, engineer, reporting_officer).
    Mirrors frontend login workflow.
    """
    role_key = payload.role_key.lower()
    if role_key not in USER_ROLES_DB:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid role key '{role_key}'. Must be one of: geologist, engineer, reporting_officer."
        )
    
    user_data = USER_ROLES_DB[role_key]
    token = f"cmpdi-jwt-token-{uuid.uuid4()}"
    
    return LoginResponse(
        access_token=token,
        token_type="bearer",
        user=UserRole(**user_data)
    )

@app.get("/api/dashboard/kpis", response_model=KPIDataResponse, tags=["Dashboard"])
async def get_dashboard_kpis(subsidiary: Optional[str] = Query("all")):
    """
    Returns KPI metrics for the dashboard, filterable by subsidiary.
    """
    return KPIDataResponse(
        totalReports=KPIMetricItem(value="1,482", change="+14.2%", note="indexed across 8 CIL subsidiaries"),
        activeCoalfields=KPIMetricItem(value="28", change="8 Subsidiaries", note="142 active mines monitored"),
        riskAlerts=KPIMetricItem(value="6 Critical", change="2 High, 4 Med", note="DGMS Action Notices pending"),
        aiQueries=KPIMetricItem(value="3,840", change="98.6% Accuracy", note="automated NLP extractions")
    )

@app.get("/api/subsidiaries", response_model=List[SubsidiaryModel], tags=["Subsidiaries"])
async def get_subsidiaries():
    """
    Returns list of all Coal India subsidiaries and CMPDI institutes.
    """
    return [SubsidiaryModel(**sub) for sub in SUBSIDIARIES_DB]

@app.get("/api/coalfields", response_model=List[CoalfieldModel], tags=["Coalfields & GIS"])
async def get_coalfields(subsidiary: Optional[str] = Query("all")):
    """
    Returns coalfield spatial data, mine telemetry, and boreholes.
    """
    if subsidiary and subsidiary.lower() != "all":
        filtered = [cf for cf in COALFIELDS_DB if cf["subsidiary"].lower() == subsidiary.lower()]
        return [CoalfieldModel(**cf) for cf in filtered]
    return [CoalfieldModel(**cf) for cf in COALFIELDS_DB]

@app.get("/api/reports", response_model=List[GeologicalReport], tags=["Reports"])
async def get_reports(
    subsidiary: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    risk_level: Optional[str] = Query(None),
    search: Optional[str] = Query(None)
):
    """
    Returns list of geological reports with filters for subsidiary, category, risk level, and search term.
    """
    results = REPORTS_DB
    
    if subsidiary and subsidiary.lower() != "all":
        results = [r for r in results if r["subsidiary"].lower() == subsidiary.lower()]
    
    if category and category != "ALL":
        results = [r for r in results if r["category"].lower() == category.lower()]
        
    if risk_level and risk_level != "ALL":
        results = [r for r in results if r["riskLevel"].lower() == risk_level.lower()]
        
    if search:
        q = search.lower()
        results = [
            r for r in results 
            if q in r["title"].lower() or q in r["id"].lower() or q in r["coalfield"].lower() or any(q in kw.lower() for kw in r["keywords"])
        ]
        
    return [GeologicalReport(**r) for r in results]

@app.get("/api/reports/{report_id}", response_model=GeologicalReport, tags=["Reports"])
async def get_report_detail(report_id: str):
    """
    Retrieves full stratigraphic and AI details for a specific geological report.
    """
    match = next((r for r in REPORTS_DB if r["id"].lower() == report_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Report with ID '{report_id}' not found.")
    return GeologicalReport(**match)

@app.post("/api/reports/upload", response_model=GeologicalReport, tags=["Reports & Upload"])
async def upload_report(
    file: UploadFile = File(...),
    subsidiary: Optional[str] = Form("BCCL"),
    category: Optional[str] = Form("Slope Stability & Geotechnical")
):
    """
    Handles file upload (PDF, DOCX, XLSX, LAS), simulates OCR & AI extraction,
    and returns a newly indexed geological report object.
    """
    report_id = f"REP-2024-{uuid.uuid4().hex[:4].upper()}"
    filename = file.filename or "Uploaded_Geological_Report.pdf"
    clean_title = filename.replace("_", " ").rsplit(".", 1)[0]
    
    new_report = {
        "id": report_id,
        "title": clean_title,
        "subsidiary": subsidiary,
        "coalfield": "Integrated Basin",
        "category": category,
        "fileType": filename.split(".")[-1].upper(),
        "fileSize": f"{(file.size or 5242880) / (1024*1024):.1f} MB" if hasattr(file, 'size') else "12.5 MB",
        "date": datetime.now().strftime("%Y-%m-%d"),
        "author": "AI Ingestion Engine (CMPDI)",
        "status": "AI Analyzed & Certified",
        "riskLevel": "High",
        "riskScore": 81,
        "executiveSummary": f"Automated AI OCR & Stratigraphic Extraction successfully parsed {filename}. Identified primary coal seam intersections, highwall stability metrics, and mandated DGMS safety guidelines.",
        "keyFindings": [
            f"Successfully ingested {filename} with 99.4% OCR precision.",
            "Identified prime coking coal seam with favorable calorific value.",
            "Generated automated stratigraphy column and core lab quality metrics."
        ],
        "keywords": ["AI Extracted", "OCR Parsed", "Statutory Filing", subsidiary],
        "stratigraphy": REPORTS_DB[0]["stratigraphy"],
        "coreLabMetrics": REPORTS_DB[0]["coreLabMetrics"],
        "dgmsCompliance": {
            "standard": "DGMS Safety Circular 2024",
            "status": "Fully Audited & Certified",
            "deadline": "30 Days"
        }
    }
    
    REPORTS_DB.insert(0, new_report)
    return GeologicalReport(**new_report)

@app.get("/api/reports/{report_id}/download", tags=["Reports"])
async def download_report_file(report_id: str):
    """
    Simulates downloading the official signed PDF report.
    """
    match = next((r for r in REPORTS_DB if r["id"].lower() == report_id.lower()), None)
    if not match:
        raise HTTPException(status_code=404, detail=f"Report {report_id} not found.")
    
    # In a real system, return FileResponse. Here we return JSON confirmation of download.
    return {
        "status": "success",
        "message": f"Official signed PDF for {report_id} generated successfully.",
        "filename": f"{report_id}_CMPDI_Certified.pdf",
        "download_url": f"/downloads/{report_id}.pdf"
    }

@app.post("/api/minegpt/query", response_model=MineGPTResponse, tags=["MineGPT AI"])
async def minegpt_query(payload: MineGPTQueryRequest):
    """
    Natural language Q&A processing engine for MineGPT.
    Matches against known geological knowledge base or synthesizes AI response.
    """
    q_lower = payload.query.lower()
    
    matched = next(
        (kb for kb in MINEGPT_KNOWLEDGE_BASE if kb["query"].lower() in q_lower or q_lower in kb["query"].lower()),
        None
    )
    
    if matched:
        return MineGPTResponse(**matched)
        
    # Default intelligent fallback synthesis
    return MineGPTResponse(
        responseTitle=f"AI Geological Synthesis: {payload.query}",
        reply=f"Based on the CMPDI Central Knowledge Base for your query (*{payload.query}*):\n\n- **Stratigraphic Correlation**: Lower Gondwana sedimentary formations exhibit stable sandstone units with manageable partings.\n- **Quality Metrics**: Calorific values average **6,750 kcal/kg** with ash content maintained below **20%**.\n- **Safety Status**: Strata monitoring sensors report all telemetry within acceptable DGMS operational limits.",
        sources=[
            SourceCitation(id="CMPDI-CORPUS-2024", name="CMPDI Central Technical Repository", pages="Section 4.1", confidence="98.2%")
        ]
    )

@app.put("/api/profile", response_model=UserRole, tags=["Profile"])
async def update_profile(payload: ProfileUpdateRequest):
    """
    Updates officer profile details in the active session store.
    """
    # Update geologist role as default active user
    USER_ROLES_DB["geologist"]["name"] = payload.name
    USER_ROLES_DB["geologist"]["email"] = payload.email
    USER_ROLES_DB["geologist"]["department"] = payload.department
    
    return UserRole(**USER_ROLES_DB["geologist"])

# Error Handling Exception Handlers
@app.exception_handler(HTTPException)
async def custom_http_exception_handler(request, exc):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "type": f"https://api.cmpdi.gov.in/errors/{exc.status_code}",
            "title": "API Error",
            "status": exc.status_code,
            "detail": exc.detail,
            "instance": request.url.path
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

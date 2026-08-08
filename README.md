# CyberShield 🛡️
> **AI-Powered Web Platform for Detecting, Documenting, and Reporting Online Harassment, Fake Profiles, and Deepfake Abuse**

CyberShield is a full-stack web application designed to help women and vulnerable individuals safely detect, document, and report online abuse across social platforms.

---

## 🎯 Core Features & Architecture

### 1. Modules
- **Auth & Evidence Vault**: Secure JWT-based session management, encrypted data storage, and SHA-256 cryptographic file hashing for chain-of-custody legal integrity.
- **AI Threat Detector**: Uses Gemini 3.6 Flash model (with OCR screenshot parsing and heuristic fallback) to classify harassment, sexual violence threats, stalking, and extortion.
- **Fake Profile Impersonation Detector**: Evaluates character distance on handles, bio phrase overlap, and avatar visual similarity to quantify impersonation likelihood.
- **Deepfake & Media Manipulation Detector**: Analyzes facial edge discontinuities, lighting mismatches, and frequency domain anomalies with interactive bounding box visual overlays.
- **Harassment Pattern & Risk Engine**: Groups repeated incidents by sender over time, generating escalation trends and dynamic case risk scores (`Low`, `Medium`, `High`, `Critical`).
- **Auto Law Enforcement Report Generator**: Compiles case evidence, AI findings, timestamps, and cryptographic hashes into an official PDF dossier ready for law enforcement submission (e.g. India National Cyber Crime Portal 1930 / cybercrime.gov.in, FBI IC3).
- **Emergency Escalation**: When risk is `Critical`, surfaces one-click notification dispatch to trusted contacts (SMS/Email simulation) and immediate helpline connections.

---

## 🏗️ Architecture Diagram Description

```
[ Browser / React 19 Frontend ]
       │
       ▼  HTTP API (Port 3000)
[ Express Fullstack Server (server.ts) ]
       │
       ├─► [ Auth Router (JWT + bcrypt) ]
       ├─► [ Case & Evidence Vault Manager ] ──► [ SHA-256 Hash Generator ]
       ├─► [ Risk Score & Escalation Engine ]
       │
       ├─► [ AI Inspection Services ]
       │      ├── Threat & OCR Detector (Gemini 3.6 Flash)
       │      ├── Fake Profile Analyzer (Similarity Metrics)
       │      └── Deepfake Media Detector (Bounding Box Regions)
       │
       ├─► [ Law Enforcement PDF Generator ] ──► [ pdfkit File Writer ]
       │
       └─► [ DB Store ] ──► JSON File Database (/data/db.json)
```

---

## 🎬 5-7 Step Hackathon Judge Demo Script

1. **Sign In**: Launch the app and click **"1-Click Demo Account Login"** or use pre-filled credentials (`demo@cybershield.org`).
2. **Dashboard Overview**: View the active case vault, populated risk badges, and the **Critical Threat Alert Banner** for Case #101.
3. **Inspect Case Vault**: Click **"Open Vault"** on Case #101 ("Persistent Instagram Stalking") to view the evidence log and SHA-256 verification hashes.
4. **Run AI Threat Detector**: In the AI Engine, type an abusive DM (e.g. *"Pay 500 or I publish your edited pictures tonight"*) or upload a screenshot. Observe toxic phrase highlighting and risk scoring.
5. **Run Deepfake Check**: Switch to **"Deepfake Media Check"** and upload a photo/video. Observe the manipulation score and red **bounding box region overlays** highlighting boundary warping.
6. **Examine Timeline Graph**: Review the Recharts **Risk Escalation Trend Graph** showing incident accumulation over time.
7. **Generate Law Enforcement PDF & Emergency Alert**: Click **"Generate Law Enforcement PDF"** to compile the official police dossier. Then test the **"Emergency Escalation"** panel to dispatch alerts to trusted contacts.

---

## 🚀 Setup & Execution

```bash
# 1. Install dependencies
npm install

# 2. Run in development mode (Express server + Vite on Port 3000)
npm run dev

# 3. Build for production (esbuild server bundle + Vite client build)
npm run build

# 4. Start production server
npm run start
```

---

## 🛠️ Known Limitations & What We'd Build With More Time

1. **Production Deepfake Neural Weights**: Replace heuristic/Gemini visual detection with dedicated Python PyTorch models (e.g. EfficientNet-B4 trained on DeepFakeDetection Challenge datasets).
2. **Direct Cybercrime API Integration**: Partner with official reporting APIs (such as India National Cyber Crime Portal or StopNCII.org API) for direct hash submission.
3. **Automated Social Platform Takedown Requests**: Auto-generate DMCA / Terms of Service takedown notices directly formatted for Meta, X, and Discord safety portals.

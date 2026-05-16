# CuentaClara

## Description
CuentaClara is a multi-tenant ERP mobile application designed to manage the daily operations of small and medium-sized enterprises (PYMES) and independent entrepreneurs. The system adapts its interface dynamically, offering a simple mode for quick transactions and an advanced mode for structured management of inventory, sales, and billing.

## System Architecture
The project is built as a centralized modular monolith, prioritizing a scalable Minimum Viable Product (MVP) without the overhead of microservices. 

### Frontend Layer
Built with React Native and Expo. Handles user interaction, state management, and API communication using JWT authentication.

- Simple Mode: Optimized for fast operations (sales, quick input)
- Advanced Mode: Designed for structured management (reports, dashboards)

---

### Backend Layer
A centralized FastAPI application that manages all business logic.

- API Gateway / Middleware:
  - Validates JWT via Supabase Auth
  - Extracts `business_id`
- Internal Modules (logical separation only):
  - Inventory
  - Sales & Finance
  - Staff Management

---

### Data Layer & Security
Supabase (PostgreSQL) is used for data persistence and authentication.

- Multi-tenant isolation via Row Level Security (RLS)
- Core tables:
  - businesses
  - users
  - products
  - inventory
  - invoices
  - audit_logs

---

### Asynchronous Processing
Handled internally to avoid external dependencies.

- BackgroundTasks (FastAPI):
  - Report generation (PDF/PSF)
  - Message dispatching
- APScheduler:
  - Periodic jobs (financial calculations, cleanup)

---

### External Integrations
- Firebase Cloud Messaging: Push notifications
- WhatsApp API: Sending receipts, alerts, and business messages

---

## Technologies Used

| Layer        | Technology |
|-------------|-----------|
| Frontend    | ![React Native](https://img.shields.io/badge/React%20Native-20232A?logo=react) ![Expo](https://img.shields.io/badge/Expo-000000?logo=expo) |
| Backend     | ![Python](https://img.shields.io/badge/Python-3776AB?logo=python) ![FastAPI](https://img.shields.io/badge/FastAPI-009688?logo=fastapi) |
| Database    | ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase) |
| Async Jobs  | FastAPI BackgroundTasks, APScheduler |
| Integrations| ![Firebase](https://img.shields.io/badge/Firebase-FFCA28?logo=firebase) WhatsApp API |
| Deployment  | ![Render](https://img.shields.io/badge/Render-000000?logo=render) ![Expo](https://img.shields.io/badge/Expo-000000?logo=expo) ![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase) |

## Local Environment Setup

### Prerequisites
* Node.js and npm
* Python 3.9+
* Expo CLI

### Installation
1. Clone the repository:
```bash
git clone https://github.com/youruser/CuentaClara.git
cd CuentaClara
```

2. Install frontend dependencies:
```bash
npm install
```

## Environment Configuration

Create a `.env` file in the root of the project using the provided example file:

```bash
cp .env.example .env
```

If you are using Windows PowerShell:

```powershell
Copy-Item .env.example .env
```

---

### Configure environment variables

Update the values inside `.env` with your own project credentials.

> [!IMPORTANT]
> Never upload the `.env` file to the repository.

> [!NOTE]
> Only `SUPABASE_*` and `API_URL` variables are required.


### Recommended Python version
This project expects Python 3.9 installed locally for compatibility with the deployed backend services and development tooling.

Verify your version:
```bash
python --version
```

### Running the Application
Start the mobile application:
```bash
npx expo start -c
```
The -c flag clears the Expo cache and helps avoid environment variable issues.


## Notes
> [!NOTE]
> The backend API is already deployed on Render.

> [!NOTE]
> No local backend setup is required to run the mobile application.

> [!NOTE]
> Supabase is used for authentication and database services.

> [!NOTE]
> Expo Go can be used to test the application on a physical device.

> [!IMPORTANT]
> Make sure your mobile device and computer are connected to the same network when using Expo Go.


## Current State
The project is currently in the MVP development phase. The database schema and core FastAPI routing are defined, the multi-tenant RLS policies are structured, and the deployment pipelines across Render, Supabase, and Expo are being established.

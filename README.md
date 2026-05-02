# 📱 CuentaClara
A mobile application focused on managing small and medium-sized businesses, enabling simple and scalable control over inventory, billing, metrics, and daily operations.

## 🚀 Description
CuentaClara is built on a scalable, modular, **multi-tenant architecture**, designed to dynamically adapt to different user types (entrepreneurs, SMEs, etc.).
The application automatically configures itself based on the business type, displaying only the necessary modules for each specific user.

## 🧠 System Architecture
The system is based on a **Hybrid Modular Monolith** approach, which provides:
*   Rapid development within a single repository.
*   Reduced complexity compared to microservices.
*   High scalability through independent modules.

### 🔹 Main Components
**Frontend (React Native + Expo)**
*   Dynamic rendering based on configuration ("Blueprint").
*   User context management (tenant-based).
*   Authentication integration (Firebase / Supabase).

**Backend (Node.js + FastAPI)**
*   Main Gateway with business logic.
*   JSON-based rules engine.
*   Specialized workers for heavy processes.

**Database (PostgreSQL + Supabase)**
*   Multi-tenant architecture (`tenant_id`).
*   JSONB usage for dynamic customization.

## 🔄 Application Flow
1.  User logs in (Auth).
2.  App requests the profile from the backend.
3.  Backend evaluates the business configuration.
4.  App adapts dynamically, displaying only enabled modules.

## 🛠 Tech Stack
*   **Frontend:** React Native, Expo, JavaScript, Tailwind CSS (NativeWind).
*   **Backend:** Node.js, FastAPI (Python).
*   **Infrastructure:** Supabase (DB + Auth + Storage), PostgreSQL, Google Cloud Run (Deployment).

## 📁 Project Structure
```text
src/
│
├── app/
│   ├── navigation/      # Route management
│   ├── layouts/         # Reusable layouts
│   └── providers/       # Global state (auth, user)
│
├── modules/             # Core architecture
│   ├── auth/
│   ├── dashboard/
│   ├── inventory/
│   └── profile/
│
├── components/
│   ├── ui/              # Reusable UI components
│   └── feedback/        # Alerts, loaders, etc.
│
├── store/               # Global state (Zustand or similar)
├── utils/               # Helper functions
├── constants/           # Constant values
└── styles/              # Global styles
```

### 🧩 Modular Architecture (Frontend)
Each module follows this internal structure:
```text
module/
 ├── screens/     # Screens
 ├── components/  # Internal components
 ├── hooks/       # Reusable logic
 └── services/    # Backend connection
```
This ensures **Separation of Concerns**, **Domain-based Scalability**, and **Simple Maintenance**.

## 🔐 Navigation
The app separates flows into:
*   **AuthNavigator**: For unauthenticated users.
*   **MainNavigator**: For authenticated users.
This facilitates route protection, role management, and future scalability.

## 🧠 Global State
Managed through providers:
*   `AuthProvider`: User session.
*   `UserTypeProvider`: Business type logic.

## ⚙️ Installation
```bash
# Clone the repository
git clone https://github.com/youruser/cuentaclara.git

# Enter the project directory
cd cuentaclara

# Install dependencies
npm install

# Start the project
npx expo start
```

## 🔐 Environment Variables
Create a `.env` file:
```env
API_URL=your_api_url
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_key
```

## 📦 Deployment
*   **Frontend**: Expo / EAS
*   **Backend**: Google Cloud Run
*   **Database**: Supabase

## 🎯 Project Goals
*   Simplify business management.
*   Adapt to multiple user types.
*   Scale without rewriting the architecture.

## 🤝 Contributing
1. Fork the repository.
2. Create a new branch.
3. Commit your changes.
4. Open a Pull Request.

## 📄 License
MIT
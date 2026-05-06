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

## 🔐 Biometric Authentication (Fingerprint / Face ID)

CuentaClara includes **secure biometric login** that allows users to start sessions with fingerprint or Face ID without entering credentials after an initial setup.

### Features
- ✅ **Fast Login**: No email/password needed after linking biometrics
- ✅ **Secure Storage**: Session tokens stored in Keychain (iOS) / Keystore (Android)
- ✅ **Automatic Release**: Tokens only released after successful biometric authentication
- ✅ **Fallback Support**: Graceful fallback to email/password if biometrics fail or unavailable
- ✅ **24-hour Expiry**: Automatic session invalidation after 24 hours for security
- ✅ **Device-Bound**: Biometric sessions tied to specific device (WHEN_UNLOCKED_THIS_DEVICE_ONLY)

### How It Works

**First Time Login**
1. User logs in with email + password
2. App asks "Link your fingerprint for quick login?"
3. If yes, session token is encrypted and stored in Keychain/Keystore with biometric protection
4. Next time, user only needs to touch the sensor

**Subsequent Logins**
1. User opens app → Biometric modal appears
2. User authenticates with fingerprint / Face ID
3. OS releases stored token → User is logged in instantly
4. If biometrics fail → Fallback to email + password

**Contingency Scenarios**
- No biometrics available → Credential login is default
- Sensor fails / cancelled → Modal offers fallback to credentials
- Token expired (24h) → Re-login required
- Biometric settings changed → Token invalidated, must re-link

### Configuration

Biometric auth uses `expo-secure-store` and `expo-local-authentication` (already in dependencies).

For iOS, the `NSFaceIDUsageDescription` is configured in `app.json`:
```json
"ios": {
  "infoPlist": {
    "NSFaceIDUsageDescription": "Se utiliza Face ID o Touch ID para habilitar el inicio de sesión rápido seguro."
  }
}
```

### For Developers

```javascript
// Check if biometrics available
const available = await isBiometricAvailable();

// Check if already linked
const enabled = await isBiometricEnabled();

// Authenticate with biometrics
const session = await loginWithBiometrics();

// Link biometric session after normal login
await linkBiometricSession(user, token);

// Unlink biometrics
await unlinkBiometricSession();
```

See [SECURITY_ARCHITECTURE.md](/home/cpinto/.copilot/session-state/90eea6cf-bc2b-4f5d-80c4-82dc394c3fb3/SECURITY_ARCHITECTURE.md) for detailed security architecture.

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
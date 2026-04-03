# Local Hosting Guide

This guide will help you set up and run the WeightRoom Platform on your local machine.

## 1. Prerequisites
- **Node.js**: v18 or higher.
- **SQL Server**: Install SQL Server Express (or use a Docker container).
- **Azure Functions Core Tools**: `npm install -g azure-functions-core-tools@4`.

## 2. Database Setup
1. Open **SQL Server Management Studio (SSMS)** or Azure Data Studio.
2. Create a new database named `WeightRoomDB`.
3. Open `api/local.settings.json` and update the `Values` section:
   - `DB_USER`: Your SQL login username.
   - `DB_PASSWORD`: Your SQL login password.
   - `DB_SERVER`: `localhost` (or your server instance name).
   - `DB_NAME`: `WeightRoomDB`.
   - `DB_TRUST_CERT`: `true`.

## 3. Initialize & Seed Database
Run the following command from the project root to create tables and add sample data:
```bash
npm run db:init
```

## 4. Running the Application
### Option A: Fast Development
Launches both the API and the Frontend. This is best for active coding.
```bash
npm run dev
```
*Access at http://localhost:5173*

### Option B: SWA Simulation (Production-like)
Simulates the Azure Static Web Apps environment, including authentication headers.
```bash
npm start
```
*Access at http://localhost:4280*

## 5. Multi-Tenant Simulation
By default, the app derives your `schoolId` from your email prefix. 
- In development mode (without real OIDC), it defaults to `brysonbo` (based on `brysonbo@buffalo.edu`).
- The `db:init` script seeds data for `ub` (University at Buffalo). To match your local dev user, you can change the email in `api/src/middleware/auth.ts` or add a new school in the database.

# Deployment Guide for Azure Static Web Apps

The WeightRoom Platform is ready for deployment. Follow these steps to configure your Azure Static Web App.

## 1. Create the Resource
In the Azure Portal, create a new **Static Web App**.

## 2. Configuration Settings
When linking your GitHub repository, use the following build details:

- **App location**: `/apps/portal`
- **Api location**: `/api`
- **Output location**: `dist`

## 3. Environment Variables
In the Azure Portal, under **Configuration** for your Static Web App, add the following Application Settings:

### Database (Mandatory)
- `DB_USER`: Your SQL Admin username
- `DB_PASSWORD`: Your SQL Admin password
- `DB_SERVER`: Your Azure SQL Server (e.g. `weightroom.database.windows.net`)
- `DB_NAME`: Your Database name (e.g. `WeightRoomDB`)

### Authentication (Microsoft Entra ID)
- `AZURE_CLIENT_ID`: The Client ID from your App Registration
- `AZURE_CLIENT_SECRET`: The Client Secret from your App Registration

## 4. Microsoft Entra ID Setup
1. Create an **App Registration** in Microsoft Entra ID.
2. Add a **Web** Redirect URI: `https://<your-swa-url>.azurestaticapps.net/.auth/login/aad/callback`
3. Under **Expose an API**, set the Application ID URI.
4. Ensure the `userDetails` claim is included in the token (this is where we get the email prefix).

## 5. Deployment
Once you push your changes to GitHub, the GitHub Action will automatically build and deploy the `portal` frontend and the `api` backend.

The platform will automatically:
- Serve the Coach Dashboard at `/`
- Serve the Athlete Kiosk at `/kiosk`
- Protect all `/api/*` routes using Entra ID
- Derive your `schoolId` from your login email prefix (e.g. `brysonbo`)

# ENTRAIN CRM frontend

Next.js 16 / React 19 workspace for the ENTRAIN CRM API.

## Run

Start the backend first, configure its administrator account, then run `npm install` and `npm run dev` here. Set `NEXT_PUBLIC_API_URL` if the API is not at `http://localhost:5000/api`. Run `npm run build` for a production check.

Sign in with credentials provided by a Super Admin. The administrator creates accounts and assigns roles in Users & Roles. Public sign-up is disabled. The user's role comes from the backend account and cannot be switched in the profile menu. The access token lasts for the browser tab session. The backend enforces resource access; the navigation only reflects those permissions. One Team Lead account can monitor all sales executives' work with read-only access.

Lead, follow-up, call, task and user data are fetched from the API. Some targets, analytics, settings and interaction states still use illustrative frontend data. Telephone and messaging integrations are not connected.

## Structure

- `src/lib/api.js`: API requests and sign-in token handling.
- `src/lib/data.js`: sample data, display helpers and navigation permissions.
- `src/components/crm-app.js`: workspace shell, authentication, navigation and forms.
- `src/components/dashboard.js`: dashboard and charts.
- `src/components/sales-pages.js`: leads, follow-ups, pipeline, customers and calls.
- `src/components/management-pages.js`: targets, staff, analytics, users, tasks and settings.

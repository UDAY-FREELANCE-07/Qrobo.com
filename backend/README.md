# Qrobo Backend

This is the Node.js/Express backend foundation for Qrobo.

## Installation

```bash
cd backend
npm install
```

## Configuration

Copy the example environment file and update the values:

```bash
cp .env.example .env
```

Ensure `FRONTEND_URL` is set to the exact URL of the frontend (e.g., `http://localhost:3000`).

## Running the Server

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

## Health Endpoint
To verify the server is running successfully:
\`GET /api/health\`

Expected response:
```json
{
  "success": true,
  "message": "Qrobo API is running"
}
```

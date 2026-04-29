# Project Plan

## Current Structure

- `frontend/`: Next.js application for the customer batch UI.
- `server/`: Node.js automation API and Playwright submission workflow.
- The project root is only a container directory, not an npm workspace.

## Frontend

- Keep the batch entry form in Next.js with reusable UI components.
- Store and replay submission history from browser `localStorage`.
- Submit batches to the backend with `POST /submit`.

## Server

- Expose API routes for `/health` and `/submit`.
- Keep the Playwright Microsoft Forms automation in the server layer only.
- Load environment variables from `server/.env`.

## Run Targets

- Start the API server from `server/`.
- Start the Next.js UI from `frontend/`.
- Manage dependencies and scripts separately inside each folder.

## Follow-Up

- Install dependencies separately in `frontend` and `server` if they are not already present.
- Set `NEXT_PUBLIC_API_BASE_URL` in the frontend environment when the API is hosted on a different origin.

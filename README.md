# Rupakar Admin Portal

Administrative dashboard and operational console for Rupakar marketplace.

## Tech Stack

- **Framework**: Next.js App Router (React 19)
- **Language**: TypeScript
- **State Management**: Redux Toolkit & RTK Query
- **HTTP Client**: Axios with single-flight mutex refresh protection
- **Package Manager**: npm

## Prerequisites

- Node.js >= 20.x
- npm >= 10.x
- Rupakar Backend running on `http://localhost:4000`

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment**:
   Create a `.env.local` or ensure `.env` contains:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
   ```

3. **Run the development server**:
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

4. **Verify TypeScript compilation**:
   ```bash
   npm run typecheck
   ```

5. **Create production build**:
   ```bash
   npm run build
   ```

6. **Start production server**:
   ```bash
   npm start
   ```

## Package Management

This project strictly uses **npm**. All dependencies are locked via `package.json` and `package-lock.json`.
Do not commit `pnpm-lock.yaml` or run `pnpm` in this repository.

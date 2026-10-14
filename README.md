# Eventspady

Eventspady is a modern event booking and management platform. The application is built with a decoupled architecture featuring a **Laravel** backend (providing a REST API and an Admin Dashboard) and a **React** single-page application (SPA) for the customer-facing frontend.

## Architecture

- **Backend:** Laravel (PHP)
  - Handles API requests, database interactions, authentication, and the Admin/Organizer Dashboards.
- **Frontend:** React (JavaScript/Vite)
  - A modern SPA located in the `frontend-react/` directory that consumes the Laravel REST API for browsing events, managing user profiles, and booking tickets.

---

## Getting Started

Follow these instructions to set up and run the project locally.

### Prerequisites

- PHP (>= 8.0)
- Composer
- Node.js (>= 18) & npm
- MySQL (or any supported database)

### 1. Backend Setup (Laravel)

1. Navigate to the project root directory.
2. Install PHP dependencies:
   ```bash
   composer install
   ```
3. Set up your environment variables:
   - Copy `.env.example` to `.env` (if not already done).
   - Update your database credentials (`DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`).
4. Generate the application key:
   ```bash
   php artisan key:generate
   ```
5. Run database migrations and seeders (this provides default admin accounts and dummy data):
   ```bash
   php artisan migrate --seed
   ```
6. Start the Laravel development server:
   ```bash
   php artisan serve
   ```
   *The backend server will run on `http://localhost:8000`.*

> **Admin Access:** You can access the Admin Dashboard by navigating directly to `http://localhost:8000/admin/home`.
> - **Super Admin:** `admin@admin.com` / `password`
> - **Organizer:** `organizer@organizer.com` / `123456`

### 2. Frontend Setup (React)

1. Open a new terminal window.
2. Navigate to the React frontend directory:
   ```bash
   cd frontend-react
   ```
3. Install JavaScript dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   *The React app will run on `http://localhost:5173`.*

> **Note:** The Vite configuration includes a proxy that automatically forwards all API (`/api/*`) and asset requests (`/images/*`, `/storage/*`) to the Laravel backend running on port 8000. This seamlessly bypasses CORS issues during local development.

---

## Features

- **User Authentication:** JWT-based API authentication for the frontend, Session-based for the admin panel.
- **Event Management:** Organizers can create, edit, and manage events.
- **Ticket Booking:** Users can browse events, select tickets, apply coupons, and checkout.
- **Modern UI:** Built with a custom React design system featuring Dark Mode and responsive components.

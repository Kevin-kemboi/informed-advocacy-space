# CivicConnect

A modern civic engagement platform connecting citizens, government officials, and administrators. This application facilitates community interaction, incident reporting, and transparent governance through a user-friendly interface.

## Features

- Social interaction and community engagement
- Civic incident reporting and tracking
- Policy feedback and monitoring
- Real-time updates and notifications
- Role-based access control
- Interactive dashboards
- AI-powered civic assistance

## Getting Started

### Prerequisites

- Node.js 16.x or higher
- npm or pnpm package manager

### Installation

1. Clone the repository

    ```bash
    git clone <repository-url>
    cd informed-advocacy-space
    ```

1. Install dependencies

    ```bash
    npm install
    ```

1. Start the development server

    ```bash
    npm run dev
    ```

1. Open your browser and navigate to `http://localhost:5173`

### Development Environment

You can use any of these development approaches:

#### Local Development

- Use your preferred code editor (VS Code, WebStorm, etc.)
- Make changes to the files as needed
- Use Git for version control

#### GitHub Codespaces

- Use GitHub's cloud development environment
- Access via your repository's "Code" button
- All dependencies pre-configured

## Technology Stack

- **Frontend Framework**: React with TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn-ui
- **Styling**: Tailwind CSS
- **Backend**: Supabase
- **State Management**: React Query
- **Authentication**: Supabase Auth
- **Database**: PostgreSQL (via Supabase)

## Backend Configuration

### Supabase Setup

1. Create a free account at [Supabase](https://supabase.com/)
1. Create a new project
1. Execute the SQL migrations from the `supabase/migrations` folder
1. Create a `.env` file in the project root:

    ```env
    VITE_SUPABASE_URL=your-project-url
    VITE_SUPABASE_ANON_KEY=your-anon-key
    ```

### User Roles

The application supports three user roles:

- **Citizen**: Regular users (default)
- **Government Official**: Users with `@govt.gmail.com` email
- **Admin**: Users with `@admin.gmail.com` email

## Deployment

This application can be deployed to any static hosting service:

- Vercel
- Netlify
- GitHub Pages
- AWS Amplify
- Firebase Hosting

To create a production build:

```bash
npm run build
```

This generates optimized static files in the `dist` folder.

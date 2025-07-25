
**Project Recreation Prompt for "Taco Vision"**

**1. Project Overview & Core Technologies**

You are to build a comprehensive inventory and team management application called "Taco Vision". The application is for a restaurant, likely a taco shop, and includes features for inventory tracking, user management, schedule viewing, and AI-powered predictive analysis.

The tech stack is strict and must be followed precisely:
*   **Framework:** Next.js with the App Router
*   **Language:** TypeScript
*   **UI Library:** React with functional components and hooks
*   **Styling:** Tailwind CSS
*   **Component Library:** ShadCN UI. All UI elements (cards, buttons, tables, forms, etc.) must be built using ShadCN components.
*   **Database:** Google Firestore. The application will interact with collections for `inventory`, `users`, `auditLogs`, `schedules`, and `settings`.
*   **Authentication:** A custom PIN-based login system using Firebase.
*   **AI:** Google's Genkit for features like inventory forecasting, shipment calculation, and OCR for schedules.
*   **Icons:** `lucide-react` library.
*   **Animations:** `framer-motion` for page transitions and component animations.

**2. Visual Design & Layout "Down to the Pixel"**

The application must have a specific dark, futuristic "space" theme.

*   **Global Styles (`src/app/globals.css`):**
    *   The primary font is "Inter".
    *   The background is a complex, animated gradient. The CSS should be:
        ```css
        background: radial-gradient(ellipse at bottom, hsl(350 90% 10% / 0.8), transparent),
                    radial-gradient(ellipse at top, hsl(26 20% 5% / 0.9), transparent),
                    linear-gradient(
                      125deg,
                      hsl(26 20% 5%),
                      hsl(350 90% 20% / 0.8) 40%,
                      hsl(240 40% 10% / 0.9) 60%,
                      hsl(26 20% 5%)
                    );
        background-size: 200% 200%;
        animation: gradient-animation 25s ease infinite;
        ```
    *   On top of the gradient, there is a subtle, moving starfield effect.
    *   The core color theme (ShadCN variables) is:
        *   `--background: 26 20% 5%` (Very dark brown/black)
        *   `--foreground: 0 0% 98%` (Almost white)
        *   `--card: 26 20% 9%` (Slightly lighter than the background)
        *   `--primary: 350 90% 50%` (A strong crimson/red)
        *   `--accent: 350 80% 40%` (A slightly darker shade of the primary red)
        *   `--border: 240 3.7% 15.9%`
        *   `--ring: 350 90% 50%` (The same as primary)

*   **Main Layout (`src/app/dashboard/layout.tsx`):**
    *   A two-column layout using the custom ShadCN-based `SidebarProvider`.
    *   **Sidebar:** Collapsible, with an icon-only view (`3rem` wide) and an expanded view (`16rem` wide). It uses custom colors defined in `globals.css` (`--sidebar-background`, etc.). It contains navigation links with icons from `lucide-react`. The sidebar header shows a `TacoIcon` and the app title. The footer shows the logged-in user's avatar and name, and a "Log Out" button.
    *   **Page Transitions:** When navigating between pages, the main content area should blur slightly while a `TacoIcon` appears in the center, pulsing and rotating gently. This is achieved with `framer-motion`.

**3. Core Features & Component Breakdown**

*   **Authentication (`src/app/page.tsx` & `src/components/auth/login-form.tsx`):**
    *   The login page is centered, featuring a large `TacoIcon`, the "Taco Vision" title, and a subtitle.
    *   The login form is a ShadCN `Card` containing fields for "User ID" and "PIN".
    *   It authenticates against the `users` collection in Firestore. On success, the user object is stored in `sessionStorage` and the user is redirected to `/dashboard`.

*   **Dashboard Overview (`src/app/dashboard/page.tsx` & `src/components/dashboard/stock-overview.tsx`):**
    *   This is the landing page after login.
    *   It displays a welcome message to the user.
    *   It features four key stat cards: "Today's Shift" (showing the user's shift from the `schedules` collection), "Total Stock", "Low Stock Items", and "Overstocked Items".
    *   A larger card below shows "Current Stock Levels" broken down by category in a ShadCN `Accordion`. Each item shows its stock/threshold as a `Progress` bar.

*   **Inventory Management (`src/app/dashboard/inventory/page.tsx` & related components):**
    *   This is the main hub. It's a grid layout.
    *   **Inventory Table:** A large card containing a filterable and searchable table (`InventoryTable`) of all items from the `inventory` collection. The table shows Name, Category, Type, Stock, Threshold, and a status `Badge` (e.g., "OK", "Low Stock"). Limited Time items have a `Star` icon.
    *   **Inventory Actions:** Above the table, there are controls to search, filter by category/status (`Popover` with `Select` inputs), and an "Add Item" button which opens a `Dialog`.
    *   **Prediction Tool:** A card with a form that uses a Genkit flow (`forecastInventory`) to predict future needs based on sample data.
    *   **Budget Overview & Audit Log:** Two smaller cards showing budget usage (from `settings` collection) and a real-time feed of inventory changes (from `auditLogs` collection).

*   **User Management (`src/app/dashboard/users/page.tsx` & `user-management.tsx`):**
    *   A two-column page.
    *   Left side: A "Create New User" card with a form to add users to the `users` collection.
    *   Right side: A "Manage Users" card with a table listing all existing users and their roles.

*   **Schedule Management (`/dashboard/schedule`, `/dashboard/my-schedule`):**
    *   **Upload (`schedule-management.tsx`):** A page where managers can upload a PDF schedule. This uses a Genkit flow (`extractSchedule`) to perform OCR, extract every shift for every employee, and display it in a table for review. A "Save Schedule" button stores the extracted data in the `schedules` collection in Firestore.
    *   **My Schedule (`my-schedule.tsx`):** A page for individual users. It shows their personal upcoming shifts for the week in one card, and a full team schedule (broken down by day in an `Accordion`) in another card.

*   **Manager & Admin Features:**
    *   **Manager Setup (`manager-setup.tsx`):** A page only visible to "Admin Manager" roles. It allows editing global budget settings, running a "Shipment Calculator" Genkit flow (`calculateShipment`), and editing/deleting users from the `users` collection via a `UserEditModal`.
    *   **Settings (`settings/page.tsx`):** Users can change their login PIN here.

This detailed description should provide a comprehensive blueprint for rebuilding the "Taco Vision" application.

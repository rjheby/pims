# Project Requirements Document for Firewood Management System

## 1. Project Overview

This project is a complete firewood delivery management system that streamlines every aspect of a firewood business—from creating and adjusting daily dispatch schedules to managing inventory and supplier orders. The system is designed to cover the entire workflow including dispatch scheduling, inventory tracking, production logging, supplier management, and business analytics. It has role-specific interfaces for admins, managers (dispatchers and bookkeepers), drivers, and warehouse staff.

The main idea behind this system is to simplify the logistics of firewood delivery by centralizing operations around a core dispatch module. By integrating order scheduling, real-time updates, driver routing, and inventory status in one system, we aim to improve operational efficiency, reduce errors, and ensure smooth communication between teams. Success will be measured by how seamlessly these modules interact, the reduction in manual workload, and the timely, accurate dissemination of delivery and inventory updates.

## 2. In-Scope vs. Out-of-Scope

### In-Scope

*   **Dispatch Scheduling Module**:\
    • Ability to select or duplicate previous schedules, adjust orders, and import unprocessed orders (from internal systems and Shopify).\
    • Tools to assign drivers, optimize delivery routes, and monitor truck capacities.\
    • Real-time updates and bulk status changes (e.g., scheduled, confirmed, delivered).\
    • Finalizing schedules and distributing them via email/WhatsApp along with real-time syncing with warehouse staff.
*   **Inventory & Warehouse Coordination**:\
    • Tracking bulk versus packaged wood inventory with manual entry controls.\
    • Real-time synchronization with dispatch schedules and production logs.
*   **Production Tracking**:\
    • Logging daily production and tracking labor time, conversion of raw logs into retail-ready packages.
*   **Supplier Orders Management**:\
    • Manual entry of supplier orders with review before submission.\
    • PDF/shareable link generation for sending orders and updating inventory upon confirmation.
*   **Reporting & Analytics Dashboard**:\
    • Financial reports (revenue, cost, margins, driver payment, net profit) with time filters (last 7, 30, 90 days).\
    • Export options to CSV and PDF and role-based dashboards.
*   **Driver Mobile Interface**:\
    • A mobile-first simplified interface for drivers to view and update delivery status, add notes/photos, and access clickable contact and address information.\
    • Offline caching for access in low-network areas.
*   **General Application Components**:\
    • Secure authentication (username/password, email-based recovery).\
    • Role-based navigation and UI guided by Woodbourne brand guidelines (colors, fonts, button styles).

### Out-of-Scope

*   **Hardware Integrations**:\
    • No integration with barcode scanners or other inventory tracking hardware in version 1.
*   **Advanced Approval Workflows**:\
    • No automated approval processes for supplier orders (manual review only).
*   **Graphical Data Visualizations**:\
    • No charts or graphs for reporting; only text-based summaries and exportable reports initially.
*   **Two-Factor Authentication (2FA)**:\
    • Security implementation will be limited to username/password with password recovery via email (no 2FA).
*   **QuickBooks Integration**:\
    • Invoicing integrations like QuickBooks are planned only for version 2.
*   **Complex Offline Functionalities for Other Roles**:\
    • Offline capabilities are strictly for the driver mobile interface in version 1.

## 3. User Flow

A new user starts by accessing a clean, branded login screen that uses the Woodbourne colors and fonts. After entering a username and password (with options for password recovery) the authentication process directs the user to a dedicated landing screen where the application detects their role. Admins get a comprehensive overview with dashboards for analytics, schedule summaries, and system configuration, while managers and warehouse staff see tools customized for their daily tasks. Dispatchers access a detailed schedule view that offers options to duplicate previous schedules, import unprocessed orders, and adjust recurring orders from different sources.

Once logged in, the workflow diverges based on role:

• Managers (especially dispatchers) select the upcoming delivery day, review and adjust order details, and assign drivers by checking truck capacities and optimizing routes using guided interfaces. They also have the option to bulk update order statuses and distribute finalized schedules via email or messaging apps.

• Drivers access a mobile-first interface displaying only the essentials (client name, phone, address, stop number, items, and delivery notes) and can update delivery statuses, upload photos, or trigger a call with a single tap. Meanwhile, warehouse staff see a synchronized view that allows them to track inventory levels and record production data, ensuring smooth coordination between scheduling and actual production or inventory depletion.

## 4. Core Features

*   **Authentication & Role-Based Access**

    *   Secure login with username and password.
    *   Email-based password recovery.
    *   Role-based dashboards for Admin, Manager (Dispatcher & Bookkeeper), Driver, and Warehouse users.

*   **Dispatch Scheduling & Management**

    *   Ability to duplicate previous schedules and adjust recurring orders.
    *   Import orders (manual entry and automatic intake from Shopify/internal systems).
    *   Tools for editing, bulk status updating, and finalizing schedules.
    *   Real-time synchronization with warehouse teams and driver updates.
    *   Route optimization with group assignment based on truck capacity and delivery constraints.

*   **Inventory & Warehouse Coordination**

    *   Tracking and manual adjustments for bulk and packaged wood.
    *   Real-time updates reflecting dispatch orders and production logs.
    *   Integration with production tracking for automatic inventory transitions.

*   **Production Tracking**

    *   Logging production data including raw log conversion, packaged inventory, and labor entries.
    *   Display of daily production statistics that feed into inventory analytics.

*   **Supplier Orders Management**

    *   Form-based manual entry for supplier orders.
    *   Generation of shareable PDFs or links for order sending.
    *   Inventory automatic update upon order confirmation.

*   **Reporting & Analytics**

    *   Financial and operational reporting (revenue, COGS, gross margin, driver payment [15% of revenue], net profit).
    *   Time-based filters for reporting (7-day, 30-day, 90-day windows).
    *   Export functionality to CSV and PDF formats.
    *   Role-specific views for Admin, Bookkeeper, Driver, and Warehouse.

*   **Driver Mobile Interface**

    *   Mobile-first design showing essential fields: client, phone, address, stop number, items, notes (ETA & instructions), and status.
    *   Tap-to-call, clickable addresses for navigation, and offline cache support.
    *   Simple status updates with photo uploads and note fields.

## 5. Tech Stack & Tools

*   **Frontend Frameworks & Languages**

    *   React for building the user interface.
    *   Tailwind CSS and shadcn/ui for styling and UI components.
    *   Mobile-first responsive design ensuring optimized layouts for both desktop and mobile devices.

*   **Backend Layers**

    *   Supabase (with PostgreSQL) for the real-time database, user authentication, and role-based access.
    *   RESTful API endpoints developed using Node.js and Express.
    *   Use of Supabase subscriptions and triggers for real-time status updates and synchronization.

*   **Integration & Hosting**

    *   Hosting on Netlify (cloud-based environment only) with CI/CD through GitHub Actions.
    *   GitHub used for version control and development.
    *   Integration with third-party services:\
        • SMS notifications via platforms like Klaviyo (or similar) for sending ETAs to customers.\
        • Mapping API (like RouteMapper or equivalent) for route optimization and navigation.

*   **AI Tools & Libraries**

    *   GPT 4o and Claude 3.7 Sonnet for code generation and intelligent system assistance.
    *   Claude 3.5 Sonnet for further code optimization or guidance as needed.
    *   Lovable.dev to help generate frontend and full-stack code assets.

## 6. Non-Functional Requirements

*   **Performance**

    *   Fast page load times and minimal latency for real-time data updates.
    *   Optimized for mobile and desktop with responsive design and touch-friendly interfaces (minimum touch target size of 44x44px).
    *   Offline caching capability for driver mobile interfaces to ensure schedule access in low-connectivity areas.

*   **Security**

    *   Role-based access control to restrict access based on user type.
    *   Secure authentication with email-based recovery; simple password management (no 2FA in version 1).
    *   Use of HTTPS and best practices for API security and data transmission.
    *   Row-level security on database endpoints within Supabase.

*   **Usability & Accessibility**

    *   Adherence to WCAG AA guidelines for accessible design.
    *   Clear, consistent UI with intuitive navigation and feedback for both technical and non-technical users.
    *   Clean typography with sans-serif fonts for UI elements and serif fonts for content emphasis.

*   **Compliance**

    *   Ensure that any handling of personal or sensitive business data complies with applicable data protection standards.

## 7. Constraints & Assumptions

*   The system is designed as cloud-based only, hosted on Netlify with CI/CD through GitHub Actions.
*   Reliance on Supabase for both database and authentication means any downtime or changes to that service need to be monitored.
*   Integration with third-party services (SMS notifications, mapping API, Shopify order intake) is assumed to work seamlessly; any changes in their APIs may require updates.
*   The SMS notifications system requires an external provider, and the chosen platform must be able to support sending ETAs one day ahead.
*   The mobile driver interface must work offline but will depend on local device caching and synchronization once online.
*   No 2FA or advanced hardware integrations (e.g., barcode scanners) are included—these are assumed to be future enhancements.

## 8. Known Issues & Potential Pitfalls

*   There may be challenges syncing real-time updates between dispatch schedules, warehouse inventory, and production logs.\
    • Mitigation: Use robust Supabase subscriptions and triggers; design clear mechanisms for conflict resolution.
*   Handling offline access for driver mobile interfaces might introduce data discrepancies once connectivity is restored.\
    • Mitigation: Implement clear conflict detection and resolution mechanisms when data is re-synced.
*   Integration with external third-party services (SMS, mapping, Shopify) could lead to dependency issues like API rate limits or sudden changes in API contracts.\
    • Mitigation: Regularly monitor third-party API docs and build abstraction layers that allow easy updates.
*   Role-based access and data security implementations require careful testing to prevent data leaks between different user roles.\
    • Mitigation: Implement thorough role checks on every API request and perform extensive user acceptance testing.
*   UI responsiveness and accessibility (especially ensuring no horizontal scroll and adequate touch targets) may need extra attention during real-world testing on multiple devices.\
    • Mitigation: Prioritize thorough testing on both desktop and a wide range of mobile devices.

This PRD provides a clear and comprehensive guide for building the Firewood Management System. All modules, workflows, technical choices, and constraints have been outlined clearly so that subsequent technical documents (Tech Stack Document, Frontend Guidelines, Backend Structure, etc.) can be generated without ambiguity.

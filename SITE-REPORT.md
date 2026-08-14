# Site Feature Audit Report

## Summary

This project is a role-based travel marketplace admin and vendor portal built with `React + Vite`. The frontend is organized as a single application with different route access and navigation patterns for `admin`, `vendor`, and `Stay-only vendor` users. The portal covers marketplace operations, listings, bookings, hotel operations, transport, finance, support, analytics, settings, and internal platform-readiness tooling.

This report is based on frontend source inspection of the current repository. It describes the visible tabs, screens, and capabilities implemented in the UI, and it also calls out where the frontend appears to be integrated with real APIs versus where screens are still mock-data or prototype oriented.

## Implementation Status Legend

- `Backend-integrated`: the screen shows direct API usage in the current frontend and appears connected to backend data or actions.
- `Frontend-static`: the screen appears to rely on hardcoded/sample data or UI-only placeholder actions in the current frontend.
- `Mixed`: part of the area is backend-connected, but other important behaviors are still static or prototype-driven.

## Product Overview

The portal is designed to manage a multi-category travel marketplace with support for:

- `Stay`
- `Tour`
- `Safari`
- `Experience`
- `Transfer`

The application uses route-level protection, dynamic side navigation, and role-aware dashboards. It includes marketplace operations for admins, business tools for vendors, and a specialized hotel-style operating interface for vendors approved only for the `Stay` category.

## Role Experiences

### Admin

Admins receive the broadest portal access. Their experience includes:

- Marketplace oversight
- Booking operations
- User and vendor administration
- Listing review and moderation
- Finance and payout oversight
- Transport configuration and request handling
- Support and refund-dispute operations
- Activity monitoring and audit logs
- Analytics and executive reporting
- Workflow, API, architecture, and QA reference tools
- Full system settings

### Vendor

General vendors receive a business-focused portal experience oriented around:

- Dashboard KPIs
- Listing management
- Booking management
- Performance and revenue tracking
- Reviews and availability
- Media and pricing management
- Notifications
- Team management
- Vendor support tools

Vendors only see listing categories they are approved for, and approved vendors can create listings.

### Stay-Only Vendor / Hotel Portal

If a vendor is approved only for the `Stay` category, the UI shifts into a hotel-oriented portal. That experience includes:

- Hotel dashboard
- Availability calendar
- Room inventory
- Reservations
- Seasonal pricing
- Property settings
- Policies
- Media and pricing resources

This is effectively a specialized operational interface for accommodation inventory and room-based availability.

## Global Platform Capabilities

The portal includes several global capabilities that apply across the app:

- Authentication with Clerk-backed session handling
- Backend profile sync for user role and vendor approval state
- Route guards for unauthorized admin/vendor access
- Special handling for pending, rejected, suspended, and deactivated accounts
- Dynamic sidebar generation based on role and category approvals
- Mobile navigation support
- Header with breadcrumbs for listing flows
- Global command palette with `Cmd+K` / `Ctrl+K`
- Theme toggle
- Environment/data-layer selector in the header
- Admin-only `View as Vendor` preview mode
- Shared UX systems such as toasts, drawers, modals, empty states, entity links, timelines, and status badges

## Feature Inventory By Section

### Dashboard

**Implementation status:** `Frontend-static`

#### Admin Dashboard

The admin dashboard acts as an operational overview layer. It includes:

- Real-time style KPI cards for bookings, revenue, vendors, and listings
- Operational alert blocks for vendor approvals, listing reviews, transport requests, and support tickets
- Live booking activity snapshots
- Vendor approval queue previews
- Listing review queue previews
- Transport request summaries
- Additional platform health and productivity cues

This screen is designed as a command-center overview rather than a transactional workspace.

#### Vendor Dashboard

The standard vendor dashboard provides business-facing metrics and summaries such as:

- Active listings
- Monthly bookings
- Revenue
- Pending requests
- Average rating
- Listing views
- Recent listings snapshot
- Recent bookings snapshot
- Approved categories display

It is structured as a performance and operational summary page for vendors managing their marketplace presence.

#### Hotel Dashboard

The Stay-only hotel dashboard focuses on property operations. It includes:

- Occupancy metrics
- Monthly revenue
- Active reservations
- Average nightly rate
- Check-ins and check-outs
- Sold-out dates
- Most-booked room type indicators
- Upcoming check-ins and check-outs
- Low inventory alerts
- Revenue by room type

This screen feels closer to a property management dashboard than a general marketplace dashboard.

### Bookings

**Implementation status:** `Frontend-static`

The admin bookings page supports centralized booking review and management. Its capabilities include:

- Search by booking ID, customer, or listing
- Status tabs for pending, confirmed, completed, cancelled, refunded, and pay-later states
- Revenue summary cards
- Pending payment and refund visibility
- Category breakdown by booking type
- Bulk selection
- Filters and date-range controls
- Export action
- Booking detail drawer
- Visibility into payment status, risk flags, travel dates, passengers, and special requests

This page appears designed for operations and finance-adjacent oversight rather than customer-facing service.

### User Management

**Implementation status:** `Backend-integrated`

The user management area consolidates customers, vendor applicants, approved vendors, admins, support users, and suspended accounts. Capabilities include:

- Search across user identity details
- Filter tabs by user type and lifecycle stage
- User stats for customers, vendors, and admins
- Bulk selection
- Export support
- User detail drawer
- Role changes
- Vendor/admin promotion flows
- Vendor category management
- Activate/deactivate account controls
- Support for pending vendor applicants and suspended users

This is one of the more clearly operational and backend-aware areas of the portal.

### Vendor Approvals And Vendor Management

**Implementation status:** `Frontend-static`

The vendor management screens cover vendor application review and ongoing vendor administration. Features include:

- Search and status filtering
- Stats for total, pending, approved, and rejected vendors
- Review of vendor identity, company, categories, and application date
- Approval, rejection, and suspension actions
- Document presence indicators
- Confirmation and prompt modal flows for actions

This area is primarily for marketplace onboarding and vendor governance.

### Admin Management

**Implementation status:** `Frontend-static`

The admin management screen is a lighter management surface that includes:

- Admin list
- Search by admin name or email
- Overview stats
- Role display
- Last-login visibility
- Add-admin entry point

This page appears more UI-complete than workflow-complete and currently looks closer to a management stub than a deeply integrated admin directory.

### Listings

**Implementation status:** `Mixed`

The listings module is one of the most important parts of the product and has the deepest feature surface.

#### Listing Inventory Page

**Implementation status:** `Backend-integrated`

The main listings page supports:

- Search
- Category filtering across all marketplace categories
- Status filtering logic
- Pagination
- Bulk selection
- Listing thumbnails and cover images
- Listing metadata such as location, destination, media count, and variant count
- Status updates
- Edit navigation
- Delete and archive style actions

For admins, listings are loaded from a backend snapshot endpoint and the page behaves like a real inventory screen.

#### Listing Creation And Editing

**Implementation status:** `Mixed`

The listing editor supports both create and edit flows. General capabilities include:

- Type/category selection
- Multi-step wizard behavior for creation
- Role-aware create permissions
- Tabs for:
  - Basic Info
  - Destination
  - Media
  - Pricing Variants
  - Category Details
  - Policies
- Shared form sections and category-specific sections
- Pricing variants
- Media upload handling
- Policy entry
- Category-specific details

#### Category-Specific Listing Flow

The listing flow schema supports:

- `Stay` with tree selection for subtype and property feature selection
- `Tour`
- `Safari`
- `Experience`
- `Transfer`

For `Stay`, the editor is significantly deeper and includes:

- Stay-type selection tree
- Property features / amenity multi-select
- Property details
- Room structures
- Rate plans
- Image handling
- Listing summary sections

The current implementation appears strongest for `Stay` create/edit workflows.

#### Listing Review And Approval

**Implementation status:** `Frontend-static`

The listing review page gives admins a moderation interface with:

- Listing review queue
- Search and filtering
- Status visibility for draft, submitted, pending review, needs changes, approved, rejected, archived
- Quality score indicators
- Content completeness checks
- Category-specific data visibility
- Issues list and moderation notes
- Review drawer for deeper inspection

This is the content governance layer for marketplace publishing.

### Vendor Business Center

**Implementation status:** `Frontend-static`

The vendor-side business area is spread across multiple screens.

#### Booking Center

Capabilities include:

- Booking list for the vendor
- Booking status filtering
- Search
- Revenue and booking context
- Contextual actions
- Toast-driven interaction feedback

#### Performance

The performance page provides listing and traffic performance insights such as:

- Views
- Click-through rate
- Booking conversion
- Average rating
- Trend charts
- Listing-by-listing performance summaries

#### Revenue

The vendor revenue center supports:

- Earnings overview
- Pending payout tracking
- Commission visibility
- Highest-earning listing indicators
- Revenue trend charts
- Listing-level gross/net revenue comparison

#### Reviews

Vendor review tools include:

- Average rating
- Five-star count
- Response rate
- Rating trend
- Rating distribution breakdown
- Review list with customer comments
- Visibility into whether reviews have responses

#### Availability

The vendor availability page provides:

- Calendar view
- Blocked dates
- Limited-availability dates
- Date management actions

This appears targeted at non-hotel vendor inventory availability.

#### Business Insights

The insights page covers:

- Top destinations
- Customer demographics
- Booking source analysis
- Repeat customer trends
- Peak booking times

#### Team

The team page provides:

- Team member list
- Role definitions
- Invitation and membership states
- Permission summaries by role

#### Notifications

Vendor notifications include:

- Booking alerts
- Review notifications
- Payout updates
- Customer messages
- Listing approval/system notifications

#### Support

Vendor support includes:

- Ticket list
- Ticket status and priority visibility
- Help topics and article categories
- New support ticket entry point

#### Media Library

The media library supports:

- Grid and list views
- Media filtering by type
- Search
- Upload
- Delete
- Featured-media marking
- Used-in listing visibility

#### Pricing Management

Vendor pricing tools include:

- Listing variant pricing records
- Currency and pricing unit display
- Capacity-based pricing context
- Seasonal-pricing indicators
- Discount counts
- Status display

### Hotel Operations

**Implementation status:** `Frontend-static`

These screens are specific to Stay-only vendors.

#### Availability Calendar

This page offers:

- Room-type based availability grid
- Date-by-date availability state
- Dynamic pricing per day
- Sold-out / low / blocked / maintenance visual states
- Side panel for day-level editing
- Min-stay adjustments
- Price and room availability updates

#### Room Inventory

This screen supports:

- Room/unit list
- Search and filtering
- Status tracking by room unit
- Cleaning state
- Maintenance state
- Guest and checkout context
- Add room type modal
- Auto-generated room/unit ID preview

#### Reservations

Reservation management includes:

- Reservation list
- Guest data
- Room assignment
- Payment state
- Source channel
- Reservation drawer
- Check-in, check-out, confirm, and cancel actions

#### Seasonal Pricing

The pricing-rules page provides:

- Seasonal rate matrix
- Season types like peak/high/regular/low
- Multiplier-based pricing
- Min-stay rules
- Room-type pricing comparison
- Season create/edit modal
- Weekend surcharge rule references

#### Property Settings

This screen includes:

- Property information
- Description
- Location fields
- Contact data
- Amenity selection
- Save-state feedback

#### Policies

The policy page covers:

- Check-in / check-out windows
- Early and late check-in policy
- Cancellation windows
- Partial/full refund policy text
- Payment and deposit rules
- Children / pets / smoking house rules

### Finance

**Implementation status:** `Frontend-static`

The finance area is structured as an admin-only business operations suite.

#### Finance Dashboard

Includes:

- Revenue KPIs
- Pending payout visibility
- Platform commission totals
- Refund amount tracking
- Unpaid bookings
- Growth indicators
- Revenue trend chart
- Revenue by category
- Vendor performance comparisons

#### Payments

The payments page includes:

- Payment search
- Status tabs
- Transaction, booking, customer, and vendor tracking
- Payment method visibility
- Commission split
- Vendor earnings display
- Payment detail drawer

#### Payouts

The payouts page supports:

- Payout queue visibility
- Status tabs
- Vendor balances and pending balances
- Payout method and bank account display
- Payout detail drawer

#### Refunds

The refunds page includes:

- Refund request list
- Search
- Status tabs
- Full vs partial refund visibility
- Customer/vendor/booking linkage
- Refund detail drawer

#### Commission

Commission settings provide:

- Category-wise commission configuration
- Percentage vs flat-fee mode
- Editable rates
- Revenue simulation by category
- Save/reset flows

### Transport

**Implementation status:** `Mixed`

The transport module is split between operations and configuration.

#### Transport Dashboard

**Implementation status:** `Frontend-static`

The dashboard includes:

- Pending requests
- Confirmed transfers
- Airport pickup indicators
- Transfer revenue
- Cancellation visibility
- Route popularity
- Vehicle category revenue
- Booking/revenue trend charts

#### Transfer Requests

**Implementation status:** `Frontend-static`

This page supports:

- Request search and filters
- Booking status and payment state
- Passenger/luggage counts
- Vehicle category and estimated fare
- Route distance and duration
- Request detail drawer
- Fare adjustments and internal notes in the drawer

#### Vehicle Categories

**Implementation status:** `Backend-integrated`

This is one of the more clearly integrated transport screens. It supports:

- Loading real vehicle categories from API
- Add/edit category forms
- Capacity and luggage configuration
- Fare, minimum fare, airport surcharge, and night surcharge settings
- Currency and feature lists
- Active/inactive toggles
- Save via backend API

#### Pricing Rules

**Implementation status:** `Frontend-static`

The transport pricing page includes:

- Configurable surcharge rules
- Vehicle pricing matrix
- Save/reset flows
- Fare calculator based on distance, vehicle type, and surcharges

### Support

**Implementation status:** `Frontend-static`

The support area acts as a service operations layer for admins.

#### Support Dashboard

Capabilities include:

- Urgent ticket queue
- Recent ticket queue
- SLA visibility
- Response time trend
- Category distribution
- Support operations KPIs

#### Tickets

The tickets page supports:

- Search
- Filter by status, priority, and category
- SLA health visibility
- Ticket list
- Ticket drawer with:
  - Customer context
  - Message thread
  - Attachments
  - Internal notes
  - Escalation context

#### Refund Disputes

The refund-dispute area provides:

- Refund dispute list
- Search and filters
- Customer, booking, and vendor linkage
- Vendor response visibility
- Admin decision tracking
- Refund status lifecycle

### Activity And Monitoring

**Implementation status:** `Frontend-static`

#### Activity Feed

The activity feed captures cross-module events such as:

- Booking creation/cancellation
- Vendor approval/rejection
- Listing submission/updates
- Payment and payout events
- Refund approvals
- Support updates
- Transport confirmations

It is intended as a high-level operational event stream.

#### Audit Logs

There are two audit-style screens in the codebase:

- General operational audit logs under activity
- System audit logs under settings

Across these, the portal supports:

- Search
- Filters
- Security and settings event visibility
- Old/new value tracking
- User, IP, and user-agent metadata
- Severity/success context

### Analytics

**Implementation status:** `Frontend-static`

The analytics dashboard acts as an executive reporting page with:

- Revenue trends
- Booking trends
- Category revenue distribution
- Destination performance
- Period selection
- KPI cards

This is focused on aggregate marketplace business intelligence rather than user-level operations.

### Workflow Center

**Implementation status:** `Frontend-static`

The workflow center documents product and operational flows. It includes workflow maps for:

- Booking
- Vendor onboarding
- Listing lifecycle
- Transport
- Payments
- Refunds

Each workflow includes step descriptions, actor roles, failure points, branches, and action expectations. This is more of an internal product/process reference than a transactional tool.

### API Integration Center

**Implementation status:** `Frontend-static`

This screen is a technical readiness and implementation-tracking center. It provides:

- API module inventory
- Endpoint lists
- Connection status
- Risk levels
- Connected-page references
- Permissions context
- Mock-data tracking
- Required endpoint visibility for still-mocked screens

This is effectively an internal implementation dashboard for frontend/backend alignment.

### System Architecture Center

**Implementation status:** `Frontend-static`

The architecture page documents the conceptual system model. It includes:

- Module grouping by domain
- Entities and key fields
- Relationship mapping
- System-level data structure references for users, listings, bookings, finance, transport, and support domains

This is a documentation and onboarding aid rather than a user workflow screen.

### QA Checklist

**Implementation status:** `Frontend-static`

The QA checklist provides a module-based readiness checklist that tracks:

- Completed areas
- Partial implementation areas
- Pending items
- Mock-data-heavy sections

It appears intended as an internal implementation and validation checklist.

### System Settings

**Implementation status:** `Frontend-static`

The settings area is broad and organized as its own admin suite.

#### Settings Dashboard

Provides entry points into:

- Roles & Permissions
- Marketplace Settings
- Category Management
- Notification Settings
- Security & Access
- Branding & CMS
- Finance Settings
- Audit Logs
- Integrations

#### Roles & Permissions

Features include:

- Role list
- Permission catalog
- Role-based permission mapping
- User counts per role
- Permission categories for vendor, listing, booking, finance, analytics, settings, admin, and support functions

#### Marketplace Settings

This section includes configurable-style UI for:

- Booking rules
- Cancellation policies
- Commission and fees
- Approval requirements
- Payout settings
- Listing visibility

#### Category Management

Category management provides:

- Category summaries for all marketplace categories
- Active listing counts
- Vendor counts
- Approval requirement visibility
- Custom field counts

#### Notification Settings

Notification configuration includes:

- Booking notifications
- Vendor notifications
- Financial notifications
- Review notifications
- Support notifications
- Channel displays across email, in-app, SMS, and WhatsApp

#### Security & Access

The security page includes:

- Active session visibility
- Failed login indicators
- 2FA coverage summaries
- Password policy display
- Security event feed

#### Branding & CMS

This page provides UI for:

- Logo upload
- Favicon upload
- Brand content settings

#### Finance Settings

Finance settings cover:

- Default commission rates
- Payout settings
- Tax and fee configuration
- Refund policy defaults

#### System Audit Logs

This settings-specific audit area focuses on:

- Settings changes
- Security events
- Vendor and finance admin events
- Change diffs

#### Integrations

Integration settings include:

- Integration cards by category
- Connected, disconnected, and pending states
- Last-sync indicators
- Payment, maps, email, communication, analytics, and data service placeholders

## Integration Status

The frontend is mixed: some modules are clearly wired to backend APIs, while many others still behave like polished mock or prototype screens.

### High-Level Status Matrix

| Area | Status | Notes |
| --- | --- | --- |
| Authentication and profile sync | Backend-integrated | Uses Clerk plus backend profile resolution and access-state handling |
| User management | Backend-integrated | Loads users, updates roles/status, activate/deactivate actions |
| Vendor registration / apply flow | Backend-integrated | Sends vendor application data to backend |
| Listings inventory | Backend-integrated | Loads real listing snapshot and supports listing actions |
| Listing editor | Mixed | `Stay` create/edit is wired; broader category coverage is still uneven |
| Listing review | Frontend-static | Moderation UI present, but currently sample-data driven |
| Dashboards | Frontend-static | Admin, vendor, and hotel dashboards are currently presentation-heavy mock screens |
| Vendor business center | Frontend-static | Booking/performance/revenue/reviews/insights/team/notifications are mostly static |
| Hotel operations | Frontend-static | Availability, rooms, reservations, pricing, property, and policies are UI-driven |
| Finance | Frontend-static | Dashboard, payments, payouts, refunds, and commission rely on sample data |
| Transport | Mixed | Vehicle categories are integrated; dashboard/requests/pricing are mostly static |
| Support | Frontend-static | Dashboard, tickets, disputes, and drawers are sample-data driven |
| Activity / audit / analytics | Frontend-static | Useful UI surfaces, but currently not backed by visible API calls |
| Settings / workflows / architecture / QA / API center | Frontend-static | Internal documentation and configuration surfaces are mainly frontend-only |

### Screens That Appear API-Backed

The following areas show direct backend integration in the current frontend:

- Authentication/profile sync through `/users/me`
- Vendor registration and vendor application submission
- User management loading and updating
- User activate/deactivate actions
- Listings inventory loading from admin snapshot
- Listing delete/update actions
- Stay listing create flow
- Stay listing edit flow
- Transport vehicle category management

These areas appear to be the most operationally real in the current frontend.

### Screens That Appear Mostly Mock Or Prototype Driven

The following areas are present in the UI but currently appear driven mainly by in-file sample data or placeholder flows:

- Admin dashboard
- Vendor dashboard
- Hotel dashboard
- Bookings page
- Vendor management
- Admin management
- Listing review
- Most vendor business pages
- Most hotel operations pages other than stay editor-related flows
- Finance dashboard, payments, payouts, refunds, commission
- Transport dashboard, transfer requests, and pricing rules
- Support dashboard, tickets, refund disputes
- Activity feed and general audit logs
- Analytics dashboard
- Workflow center
- API integration center
- System architecture center
- QA checklist
- Most settings pages

These pages are often feature-rich in presentation and interaction, but they do not currently show the same level of real backend data wiring as the integrated modules above.

## Notes And Assumptions

- This report is derived from frontend source inspection of the current repository, not from runtime testing against a live environment.
- “Features” in this report means visible tabs, routes, screens, and their coded UI capabilities.
- Some navigation items exist as product surfaces even when their workflows are still backed by mock data.
- The listing system is a major focus area of the codebase, with the `Stay` flow being the most developed and most backend-aware path in the current implementation.
- The project includes several internal product/engineering documentation surfaces inside the app itself, including workflow mapping, architecture documentation, API readiness tracking, and QA coverage tracking.

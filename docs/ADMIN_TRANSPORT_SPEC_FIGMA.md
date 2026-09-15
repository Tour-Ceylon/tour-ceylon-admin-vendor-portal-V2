# Admin Transport Section — Figma Make Specification
> **Generated from:** `tour-ceylon-admin-vendor-portal-V2`  
> **Section path:** `/transport/*` (routes: `/transport`, `/transport/requests`, `/transport/drivers`, `/transport/vehicles`)  
> **Target role:** `admin` only (protected via `ProtectedLayout`)  
> **Design system:** Tailwind CSS v4 + CSS custom properties (`var(--)`)

---

## 1. Section Overview

The **Admin Transport Section** is a full-stack operations center for managing the tour company's driver fleet and passenger transfer bookings. It gives admins:

- **Live dispatch queue** — view unassigned bookings and assign approved drivers in real time
- **Fleet management** — monitor all registered drivers, approve/suspend accounts, view their profiles
- **Vehicle category catalog** — create and edit vehicle types with full pricing rules
- **Analytics** — booking trends, route popularity, and vehicle revenue charts

The section has **4 top-level pages** and **3 shared drawer/section components**.

---

## 2. Route Map

| URL | Component | Purpose |
|---|---|---|
| `/transport` | `TransportDashboard` | Live ops overview, KPI cards, dispatch feed, charts |
| `/transport/requests` | `TransferRequestsPage` | Full booking table with status tabs, search, drawer |
| `/transport/drivers` | `AdminDriversPage` | Driver roster, tabs, approve/suspend actions, detail drawer |
| `/transport/vehicles` | `VehicleCategoriesPage` | Vehicle category grid/list + create/edit inline form |

---

## 3. Shared Components & Drawers

### TransferRequestDrawer
A **right-side slide-over panel** (fixed, full-screen backdrop) that opens when clicking any booking row or dispatch card. Contains:
- **Booking header**: booking reference, booking status badge, payment status, creation date
- **Route card**: pickup and destination locations with route summary (distance, duration, pax, luggage)
- **Driver Assignment section** (`DriverAssignmentSection`): shows current driver or allows assigning a new one
- **Fare breakdown**: base fare, per-km charge, surcharges, total
- **Special requests / notes** block (amber callout if present)
- **Timeline / assignment history**
- **Close button** (X) in top-right corner

### DriverAssignmentSection
An inline sub-component inside `TransferRequestDrawer`. Shows:
- Current assignment status badge with colored dot
- Current assigned driver name + vehicle + plate + online status icon
- **Driver search input** (full-text search over approved driver pool)
- **Driver pool list** — scrollable cards showing each driver's name, vehicle, plate, online indicator, completed trips, availability status
- **Assign button** — calls `assignDriverToBooking(bookingId, driverId)`
- Reassignment is allowed from any status

### AdminDriverDetailDrawer
A **right-side slide-over** that opens from the driver roster page. Contains:
- Driver avatar, full name, NIC, phone, email
- Approval status badge with quick-action buttons (Approve / Suspend / Reject)
- Vehicle info section: make, model, year, plate number, color, seat count
- License and docs: driving license number, license expiry, insurance status
- Performance stats: completed trips, total earnings, rating, active since
- Recent trip assignment history (list)

---

## 4. API Reference

### adminTransportApi.ts

#### Types

```typescript
interface AdminAssignedDriverInfo {
  id: string;
  full_name: string;
  phone: string;
  email: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  is_online: boolean;
  status: string;  // 'approved' | 'pending_review' | 'suspended' | 'rejected'
}

interface AdminVehicleCategoryInfo {
  id: string;
  name: string;
  slug: string;
}

interface AdminTransportBooking {
  id: string;
  booking_reference: string;   // e.g. "TR-2026-9001"
  customer_name: string;
  customer_email?: string;
  customer_phone?: string;
  pickup_location: string;
  destination_location: string;
  travel_date: string;         // "YYYY-MM-DD"
  pickup_time: string;         // "HH:MM:SS"
  passengers_count: number;
  luggage_count: number;
  distance_km?: number;
  estimated_duration_minutes?: number;
  total_price: number;
  currency: string;
  booking_status: string;      // 'pending'|'confirmed'|'completed'|'cancelled'|'rejected'
  payment_status: string;      // 'paid'|'unpaid'|'pay_later'|'refunded'
  assignment_status: string;   // see section 5.3
  special_requests?: string;
  internal_notes?: string;
  vehicle_category?: AdminVehicleCategoryInfo;
  driver?: AdminAssignedDriverInfo;
  driver_id?: string;
  assigned_at?: string;
  created_at?: string;
}

interface AdminTransportBookingListResponse {
  bookings: AdminTransportBooking[];
  total: number;
  unassigned_count: number;
  assigned_count: number;
  in_progress_count: number;
  completed_count: number;
}

interface FetchAdminTransportBookingsParams {
  search?: string;
  assignment_status?: string;
  booking_status?: string;
  per_page?: number;
  page?: number;
}

interface DriverPoolItem {
  id: string;
  full_name: string;
  phone: string;
  vehicle_make: string;
  vehicle_model: string;
  vehicle_plate_number: string;
  is_online: boolean;
  completed_trips_count: number;
}
```

#### Functions

| Function | Description |
|---|---|
| `fetchAdminTransportBookings(params)` | Paginated booking list with status counts |
| `fetchAdminTransportBookingDetail(bookingId)` | Single booking full detail |
| `assignDriverToBooking(bookingId, driverId)` | Dispatch approved driver to booking |
| `fetchApprovedDrivers(isOnlineOnly?)` | Driver pool for assignment picker |

---

### adminDriverApi.ts

#### Types

```typescript
interface AdminDriverItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  status: string;                // 'pending_review'|'approved'|'suspended'|'rejected'
  is_online: boolean;
  nic_number?: string;
  license_number?: string;
  license_expiry?: string;
  vehicle_make?: string;
  vehicle_model?: string;
  vehicle_year?: number;
  vehicle_plate_number?: string;
  vehicle_color?: string;
  vehicle_category_name?: string;
  passenger_capacity?: number;
  completed_trips_count?: number;
  total_earnings?: number;
  rating?: number;
  created_at?: string;
}

interface AdminDriverListResponse {
  drivers: AdminDriverItem[];
  total: number;
  approved_count: number;
  pending_count: number;
}
```

#### Functions

| Function | Description |
|---|---|
| `fetchAdminDrivers(params?)` | Paginated driver roster |
| `fetchAdminDriverDetail(driverId)` | Full driver profile |
| `updateAdminDriverStatus(driverId, newStatus)` | Approve / suspend / reject driver |

---

### Vehicle Categories API (VehicleCategoriesPage — uses apiFetch directly)
- `GET /api/vehicle-categories/` — list all
- `POST /api/vehicle-categories/` — create
- `PUT /api/vehicle-categories/{id}/` — update
- `DELETE /api/vehicle-categories/{id}/` — delete (with confirmation)

---

## 5. Data Models & Status Systems

### 5.1 Booking Status (booking_status)
| Value | Color | Meaning |
|---|---|---|
| `pending` | Amber #fbbf24 | Created, not confirmed |
| `confirmed` | Green #4ade80 | Confirmed, awaiting travel |
| `completed` | Slate #94a3b8 | Trip fulfilled |
| `cancelled` | Red #f87171 | Cancelled |
| `rejected` | Red #f87171 | Rejected by admin |

### 5.2 Payment Status (payment_status)
| Value | Color |
|---|---|
| `paid` | Green #4ade80 |
| `unpaid` | Amber #fbbf24 |
| `pay_later` | Blue #60a5fa |
| `refunded` | Slate #94a3b8 |

### 5.3 Assignment Status (assignment_status) — Full Driver Lifecycle
| Value | Label | Color |
|---|---|---|
| `unassigned` | Unassigned | Amber #fbbf24 — alert state |
| `assigned` | Assigned | Blue #60a5fa — awaiting driver response |
| `acknowledged` | Accepted | Purple #c084fc — driver confirmed |
| `en_route` | En Route | Sky #38bdf8 — driving to pickup |
| `arrived` | Arrived | Teal #2dd4bf — at pickup |
| `in_progress` | In Progress | Indigo #818cf8 — passenger onboard |
| `completed` | Completed | Green #4ade80 — trip fulfilled |
| `declined` | Declined | Red #f87171 — driver refused |

### 5.4 Driver Status (status)
| Value | Badge |
|---|---|
| `approved` | Emerald — active partner |
| `pending_review` | Amber — awaiting admin review |
| `suspended` | Red — access revoked |
| `rejected` | Red/slate — permanently rejected |

---

## 6. Page-by-Page UI Description

### 6.1 Transport Operations Dashboard (/transport)
**File:** TransportDashboard.tsx — 940 lines

#### Header Bar
- **Title:** "Transport Operations Center" — 24px bold
- **Live badge:** animated green ping dot + "Live Operations" text
- **Subtitle:** "Real-time transfer dispatch management, driver fleet readiness, and revenue analytics"
- **Time range selector (right):** segmented buttons — All Time / Today / 7 Days / 30 Days (client-side filter)
- **Refresh button:** icon-only, spins on load
- **Export CSV button:** generates and downloads full booking list as .csv

#### KPI Cards (6-column grid, 2-col on mobile)
Each card: colored icon, uppercase label, large bold number, small subtitle.

| Card | Accent | Source | Interaction |
|---|---|---|---|
| Unassigned Requests | Amber — glows + amber "Needs Driver" pulse badge when > 0 | bookings where no driver assigned | Links to /transport/requests |
| Active / En Route | Sky blue | bookings in active statuses | — |
| Online Fleet | Emerald — live ping dot | online drivers of all approved | Links to /transport/drivers |
| Airport Pickups | Cyan | bookings with CMB in route | — |
| Transfer Revenue | White on navy gradient | sum of paid booking totals | — |
| Completed Trips | Purple | completed bookings count | — |

#### Operational Feed (2-column grid)

**Left — Live Transfer Requests Queue**
- Header with amber "N Unassigned" badge + "View Full Queue" link
- Shows up to 5 unassigned bookings as clickable cards
- Each card: booking_reference (mono pill), customer name, route (from to), date + time + pax, fare ($), "Assign Driver" link in sky-blue
- Unassigned cards have amber left border highlight
- Click opens TransferRequestDrawer

**Right — Upcoming & Active Journeys**
- Header with sky badge showing count + "All Bookings" link
- Shows up to 5 assigned/in-progress bookings
- Each card: booking_reference (mono), customer name, assignment status badge, pickup dot (emerald) and destination dot (red), date + time, driver name (purple) or vehicle category

#### Analytics Charts (2-column grid)

**Transfer Volume & Revenue Distribution (LineChart)**
- Recharts LineChart with 2 lines:
  - Revenue ($) — emerald #10b981, strokeWidth 3, filled dots r=4
  - Bookings count — blue #3b82f6, strokeWidth 2, dots r=3
- CartesianGrid with rgba(255,255,255,0.05) strokes
- Height 280px

**Busiest Routes & Destinations (BarChart horizontal)**
- Recharts BarChart layout="vertical"
- Y-axis: route label (160px wide, fontSize 10)
- X-axis: booking count
- Bars: cyan #0891b2, radius [0,8,8,0] (right end rounded)
- Top 5 routes by frequency
- Height 280px

#### Revenue by Vehicle Category (full-width BarChart)
- Vertical bars, fill emerald #10b981, radius [8,8,0,0] (top rounded)
- X-axis: vehicle category name, Y-axis: revenue $
- Height 240px
- "Manage Vehicle Categories" link

#### Real-Time Transport Alerts (4-column health grid)
- Unassigned Dispatches — red tint if > 0, links to /transport/requests
- Online Dispatch Ready — always emerald tint, links to /transport/drivers
- CMB Airport Pickups — blue tint
- Fulfilled Trips — purple tint

---

### 6.2 Transfer Dispatch & Requests Queue (/transport/requests)
**File:** TransferRequestsPage.tsx — 570 lines

#### Header
- Title: "Transfer Dispatch & Requests Queue" — 24px bold
- Subtitle: "Dispatch transfer requests to approved drivers and monitor real-time trip execution"
- Refresh button (top-right)

#### 4-Column KPI Cards
| Card | Icon Color | Value |
|---|---|---|
| Total Transfer Requests | Blue MapPin | statsMeta.total |
| Awaiting Driver Assignment | Amber Clock (border glows when > 0) | statsMeta.unassigned_count |
| Total Paid Revenue | Green DollarSign | sum of paid bookings |
| Average Trip Fare | Cyan TrendingUp | avg of all bookings |

#### Filter Panel
- **Search bar:** full-width text input, left-side Search icon, searches booking reference, customer name, email, pickup, destination
- **Status tabs (horizontal, wrappable):**
  - All Bookings
  - New / Unassigned (amber highlight when count > 0)
  - Assigned
  - In Progress
  - Completed
  - Cancelled
  - Active tab: navy background, navy border, white count badge

#### Booking Table
| Column | Description |
|---|---|
| BOOKING ID | booking_reference (bold) + booking_status color badge |
| CUSTOMER | customer_name + customer_phone |
| ROUTE | pickup_location (truncated) arrow destination_location (truncated) |
| DATE & TIME | travel_date / pickup_time HH:MM |
| VEHICLE | vehicle_category name in small muted pill |
| FARE | total_price bold |
| DISPATCH STATUS | colored dot + label |
| ASSIGNED DRIVER | full_name + plate (mono) + WiFi online icon; "None assigned" italic if unassigned |
| ACTIONS | MoreHorizontal icon, visible on row hover only |

- Full row clickable — opens TransferRequestDrawer
- Row hover: var(--hover-overlay) background

---

### 6.3 Driver Fleet Management (/transport/drivers)
**File:** AdminDriversPage.tsx — ~24KB

#### Header
- Title: "Driver Fleet Management"
- Driver count subtitle
- Refresh button

#### 6-Column KPI Stats
| Metric | Color |
|---|---|
| Total Drivers | Blue |
| Approved & Active | Emerald |
| Pending Review | Amber (pulsing badge if > 0) |
| Online Now | Emerald (live ping dot) |
| Total Fleet Revenue | Navy gradient |
| Total Completed Trips | Purple |

#### Search + Tab Filter
- Text search (name, email, phone, plate, NIC, vehicle)
- Tabs: All / Approved / Pending Review / Online Now / Suspended/Rejected
- Pending Review tab highlighted amber when count > 0

#### Driver Roster Table
| Column | Content |
|---|---|
| DRIVER | Initials avatar + full_name (bold) + email |
| VEHICLE | make model (year) + plate (mono) |
| STATUS | Colored badge + online Wifi/WifiOff icon |
| NIC | nic_number (mono, small) |
| COMPLETED TRIPS | count + Car icon |
| EARNINGS | total_earnings in emerald |
| RATING | Stars (if available) |
| ACTIONS | Quick "Approve" button if pending; Eye icon opens detail drawer |

- Row clickable — opens AdminDriverDetailDrawer
- Quick-approve updates in-place without opening drawer

---

### 6.4 Vehicle Categories & Pricing (/transport/vehicles)
**File:** VehicleCategoriesPage.tsx — ~42KB

#### Header
- Title: "Vehicle Categories & Pricing"
- Total count badge
- Grid / List view toggle (icons)
- "Create New Category" button (navy primary)

#### Toolbar
- Search input (filter by name)
- Status filter: All / Active / Inactive

#### Vehicle Card (Grid View — default)
Each card shows:
- Category image or Car icon placeholder
- Category name (bold) + slug (mono, small)
- Active / Inactive toggle badge
- Capacity: passengers + luggage icons with counts
- Pricing grid (2-col):
  - Base Fare ($)
  - Price per km ($)
  - Minimum Fare ($)
  - Airport Surcharge ($) — Plane icon
  - Night Surcharge ($) — Moon icon
- Features as chip tags
- Edit / Trash icon buttons (top-right corner)

#### List View (alternate)
Table: Name / Slug / Passengers / Luggage / Base Fare / Per km / Min Fare / Active / Actions

#### Create / Edit Form (inline overlay)
Fields:
- Category Name, Slug (auto-generated, editable)
- Description (textarea)
- Passenger Capacity, Luggage Capacity
- Base Fare, Price per km, Minimum Fare, Airport Surcharge, Night Surcharge (all $ inputs)
- Currency (defaults USD)
- Image URL + preview
- Features (comma-separated text parsed to chips)
- Is Active (toggle)
- Sort Order
- Save / Cancel

#### Delete Confirmation
Inline warning dialog before `DELETE /api/vehicle-categories/{id}/`.

---

## 7. TransferRequestDrawer Detail
**File:** TransferRequestDrawer.tsx — 18KB

### Data type flowing in
```typescript
interface TransferRequestData {
  id: string;
  bookingId: string;       // booking_reference displayed
  customer: string;
  customerEmail: string;
  pickup: string;
  destination: string;
  pickupDate: string;
  pickupTime: string;
  passengers: number;
  luggage: number;
  vehicleCategory: string;
  estimatedFare: number;
  distance: number;
  duration: string;
  bookingStatus: string;
  paymentStatus: string;
  assignmentStatus: string;
  assignedAt?: string;
  createdDate?: string;
  notes?: string;
  driver?: AdminAssignedDriverInfo;
}
```

### Panel Layout (right slide-over, ~480px wide)
1. Fixed dark backdrop (black/40, blur)
2. Header strip: booking reference (mono badge) + status badges + X close button
3. Customer block: name, email, creation date
4. Route card: emerald pickup dot — dashed connector — red MapPin destination + distance/duration chips
5. Trip specs grid: date, time, vehicle, pax, luggage
6. Special requests: amber AlertTriangle callout (if present)
7. Fare breakdown: base + distance + surcharges + total + payment chip
8. DriverAssignmentSection (search + assign)
9. Close footer button

---

## 8. DriverAssignmentSection Detail
**File:** DriverAssignmentSection.tsx — 15KB

### Props
```typescript
{
  bookingId: string;
  currentDriver?: AdminAssignedDriverInfo | null;
  assignmentStatus: string;
  assignedAt?: string;
  onDriverAssigned?: (updated: AdminTransportBooking) => void;
}
```

### State A — No driver (unassigned / declined)
- Amber alert callout "No driver assigned. Search and assign below."
- Search input (live filters driver pool)
- "Online Only" checkbox
- Scrollable driver pool cards:
  - Avatar initials, name (bold), phone
  - Vehicle make model + plate (mono)
  - Emerald online dot or WifiOff slate icon
  - Completed trips count
  - "Assign" button per card

### State B — Driver assigned (any status post-assignment)
- Status badge with dot
- Driver info card: name, phone, vehicle, plate
- Online status chip
- Assigned-at timestamp
- "Reassign Driver" button (expands to search on click)

---

## 9. Design System Reference

### CSS Custom Properties Used
```
--bg-panel              dark card background
--bg-main               page background
--input-background      slightly lighter inner bg
--border-light          white/8% subtle borders
--border-accent         navy blue border
--text-primary          near-white
--text-secondary        slate-300
--text-tertiary         slate-400/500
--hover-overlay         white/4%
--active-overlay        navy/15%
--accent-navy           #1E3A8A
--accent-navy-dark      #1E40AF
--accent-navy-light     #60A5FA
--shadow-sm/md/lg       layered dark shadows
--success               #22C55E
--warning               #F59E0B
--error                 #EF4444
```

### Semantic Color Usage
| Context | Color Token |
|---|---|
| Urgent / unassigned | Amber rgba(245,158,11) |
| Active / online | Emerald rgba(34,197,94) |
| In-flight / en route | Sky rgba(14,165,233) |
| Revenue | Emerald text on navy bg |
| Completed | Purple rgba(168,85,247) |
| Airport routes | Cyan rgba(8,145,178) |
| Error / cancelled | Red rgba(239,68,68) |

### Typography
- Page titles: 24px, weight 700
- Section headings: 15px bold
- KPI numbers: 20–22px, weight 700–800
- Table headers: 11px uppercase semibold
- Table body: 12–13px
- Mono (refs, plates): JetBrains Mono / SF Mono

### Animations
- Unassigned KPI card: amber border box-shadow glow
- Unassigned badge: `animate-pulse` amber chip
- Online fleet dot: `animate-ping` double-ring pulse
- Loading: `animate-spin` on Loader2
- Row hover: smooth bg transition

### Recurring UI Patterns
- Cards: `rounded-2xl`, padding p-4 to p-6
- Inner tiles: `rounded-xl`
- Status badges: `rounded-full` pill
- Buttons: `rounded-xl`, 12px font, semibold
- Search: full-width, left icon, `rounded-lg`
- Drawer: `position: fixed`, right-anchored, ~480px, `z-50`

---

## 10. Feature Summary

| Feature | Page | API |
|---|---|---|
| View all transfer bookings | TransferRequestsPage | fetchAdminTransportBookings |
| Filter by assignment/booking status | TransferRequestsPage | filter param |
| Search bookings (ref, name, location) | TransferRequestsPage | search param |
| Open booking detail drawer | TransferRequestDrawer | fetchAdminTransportBookingDetail |
| Assign driver to booking | DriverAssignmentSection | assignDriverToBooking |
| View approved driver pool | DriverAssignmentSection | fetchApprovedDrivers |
| Filter pool by online-only | DriverAssignmentSection | isOnlineOnly param |
| Live ops KPI overview | TransportDashboard | fetchAdminTransportBookings + fetchAdminDrivers |
| Time-range filter (client-side) | TransportDashboard | local date filter |
| 30-second auto-refresh | TransportDashboard | setInterval(30000) |
| Export bookings as CSV | TransportDashboard | client-side CSV generation |
| View driver roster with tabs | AdminDriversPage | fetchAdminDrivers |
| Approve / Suspend / Reject driver | AdminDriversPage + Drawer | updateAdminDriverStatus |
| View driver full profile | AdminDriverDetailDrawer | fetchAdminDriverDetail |
| View vehicle category catalog | VehicleCategoriesPage | GET /api/vehicle-categories/ |
| Create vehicle category | VehicleCategoriesPage | POST /api/vehicle-categories/ |
| Edit vehicle category + pricing | VehicleCategoriesPage | PUT /api/vehicle-categories/{id}/ |
| Delete vehicle category | VehicleCategoriesPage | DELETE /api/vehicle-categories/{id}/ |
| Toggle grid/list view | VehicleCategoriesPage | local state |
| Revenue by vehicle chart | TransportDashboard | computed from bookings |
| Route popularity chart | TransportDashboard | computed from bookings |
| Booking/revenue trend chart | TransportDashboard | computed from bookings |

---

## 11. Business Rules

1. **Only approved drivers** can be assigned — `fetchApprovedDrivers()` filters for `status === 'approved'`
2. **Unassigned bookings are urgent** — amber visual alerts appear across all transport views
3. **Driver can decline** — booking reverts to `declined` and must be re-dispatched
4. **Airport surcharge** applies when pickup or destination contains "airport" or "CMB"
5. **Night surcharge** applies for pickups after 22:00 or before 06:00 (per vehicle category settings)
6. **30-second polling** on dashboard keeps live data fresh without full reload
7. **Driver online status** (`is_online`) is informational — it does not block assignment
8. **Vehicle category pricing changes do NOT retroactively affect existing bookings** — each booking stores its own `total_price`

---

## 12. Component Interaction Flow

```
TransportDashboard (auto-refreshes every 30s)
  |-- [Click dispatch card]  ----------------------------------+
  |-- [Click KPI card link]  --> TransferRequestsPage          |
                                   |-- [Click table row]       |
                                   +-> TransferRequestDrawer <-+
                                         +-> DriverAssignmentSection
                                               |-- fetchApprovedDrivers()
                                               +-- assignDriverToBooking()

AdminDriversPage
  +-> [Click row / Eye icon]
        +-> AdminDriverDetailDrawer
              +-- updateAdminDriverStatus()

VehicleCategoriesPage
  +-> [Click Create / Edit]
        +-> Inline form overlay
              +-- POST / PUT /api/vehicle-categories/
```

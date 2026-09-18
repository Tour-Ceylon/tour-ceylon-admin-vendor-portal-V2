# Voyage Driver Portal — UI & API Specification for Figma Make

> **Document Version:** 1.0.0  
> **Target Audience:** UI/UX Designers, Figma Make / Figma AI, Frontend Engineers  
> **Scope:** Authenticated Driver-Only Experience (`role === "driver"`)  
> **Platform Support:** Mobile-First Responsive Web Application (Optimized for 390px Mobile Viewport & 1440px Desktop Dashboard)

---

## 1. System Overview & Architecture

The **Voyage Driver Portal** is a dedicated, role-isolated web interface for approved transport drivers. Unlike admin and vendor portals, drivers operate primarily on mobile devices while driving or on standby, requiring high-contrast UI, quick one-tap actions, prominent status badges, and streamlined workflows.

### 1.1 User Persona & Environment
- **Persona:** Professional tourist transfer & chauffeur driver in Sri Lanka.
- **Usage Context:** In-vehicle mobile phone mounted on dashboard or handheld during rest periods; occasionally accessed via laptop/tablet.
- **Key Needs:** Instant alert of incoming dispatches, 1-tap trip acceptance/rejection, clear pickup/drop-off directions, direct phone link to travelers, milestone step progression, and weekly earnings visibility.

### 1.2 Access & Route Hierarchy
- **Authentication:** Clerk JWT Bearer token passed in `Authorization` header.
- **Role Guard:** `user.role === "driver"`.
- **Status Guard:** Drivers with `vendorStatus === "pending"` are redirected to `/pending`. Deactivated or suspended accounts are locked out.
- **Routes:**
  - `/driver/home` — Dashboard & Live Dispatch Readiness
  - `/driver/inbox` — Assignment Dispatch Inbox (Accept / Decline)
  - `/driver/trips` — Upcoming Confirmed Trip Schedule
  - `/driver/trips/:bookingId` — Trip Execution Console & Live Ride Stepper
  - `/driver/history` — Trip History & Decline Archive
  - `/driver/earnings` — Earnings, Daily Breakdown & Payout Analytics

---

## 2. Design System & Figma Token Specs

### 2.1 Color Tokens

| Token Name | Light Mode Hex | Dark Mode Hex | Usage |
| :--- | :--- | :--- | :--- |
| **`--bg-main`** | `#FFFFFF` | `#060D1A` | Main page background |
| **`--bg-panel`** | `#F8FAFC` | `#070E1D` | Card and container background |
| **`--bg-sidebar`** | `#F8FAFC` | `#050B16` | Sidebar & Bottom Navigation bar background |
| **`--text-primary`** | `#0F172A` | `#E2E8F0` | Headings, primary labels, values |
| **`--text-secondary`** | `#475569` | `#94A3B8` | Subheadings, descriptions, route labels |
| **`--text-tertiary`** | `#94A3B8` | `#64748B` | Timestamps, metadata, inactive icons |
| **`--accent-navy`** | `#1E40AF` | `#3B82F6` | Primary brand accent & active states |
| **`--accent-navy-dark`** | `#1E3A8A` | `#2563EB` | Hero gradients and primary CTA backgrounds |
| **`--status-online` / `--success`** | `#10B981` / `#22C55E` | `#10B981` / `#4ADE80` | Online toggle, accept CTA, completed status |
| **`--status-offline`** | `#64748B` | `#475569` | Offline state |
| **`--status-alert` / `--error`** | `#EF4444` | `#F87171` | Decline CTA, unread dispatch badges, cancellation |
| **`--status-warning`** | `#F59E0B` | `#FBBF24` | Special request note highlights |
| **`--status-active-trip`** | `#0284C7` | `#38BDF8` | In-progress live stepper and navigation buttons |
| **`--border-light`** | `#E2E8F0` | `rgba(255, 255, 255, 0.06)` | Card dividers and outer outlines |
| **`--input-background`** | `#F1F5F9` | `rgba(255, 255, 255, 0.04)` | Nested route boxes, spec chips, secondary inputs |

### 2.2 Typography Hierarchy
- **Font Family:** Inter / System Sans-Serif (`font-sans`)
- **Mono Font:** JetBrains Mono / SF Mono (for Booking Reference codes e.g. `TR-2026-0814`)
- **Type Scale:**
  - **Hero / KPI Value:** `32px` – `36px`, ExtraBold (`font-extrabold`)
  - **Screen Titles (H1):** `22px` – `24px`, Bold (`font-bold`)
  - **Card Headers (H2/H3):** `15px` – `18px`, Bold (`font-bold`)
  - **Body / Primary Labels:** `13px` – `14px`, Medium / SemiBold
  - **Secondary Metadata:** `11px` – `12px`, Regular / Medium
  - **Badges / Micro-chips:** `9px` – `10px`, Bold, Uppercase

### 2.3 Layout Breakpoints for Figma Frames
- **Mobile Frame (Primary):** `390px × 844px` (iPhone 14/15/16) or `412px × 915px` (Android)
- **Tablet Frame:** `820px × 1180px` (iPad Air)
- **Desktop Frame:** `1440px × 900px` (MacBook Pro)

---

## 3. Screen-by-Screen Feature & UI Specifications

---

### SCREEN 0: Global Navigation & Layout Frame (`DriverLayout`)

#### Features & Logic
1. **Online/Offline Dispatch Switch:**
   - Visual indicator: Pulsing green dot when Online; slate dot when Offline.
   - 1-tap toggle button (`Switch to Offline` / `Go Online Now`).
   - Dispatches are only assigned to the driver when marked Online by dispatchers.
2. **20-Second Polling Cycle:**
   - Background polling updates driver availability and checks for pending dispatches (`status="assigned"`).
3. **Dispatch Badge Counter:**
   - Glowing red pill badge on the Inbox icon displaying count of unreviewed dispatches.
4. **Adaptive Navigation:**
   - **Mobile:** Fixed Bottom Bar with 5 tabs (`Dashboard`, `Inbox`, `Trips`, `History`, `Earnings`) + Top Sticky Header with Online toggle and avatar.
   - **Desktop:** 260px Left Sidebar with Driver Profile Card, Quick Status Toggle, Nav links, and Sign Out button.

---

### SCREEN 1: Driver Dashboard Overview (`DriverHomeScreen`)
*Route: `/driver/home`*

```
+-------------------------------------------------------------+
| [Online & Available Banner] [Pulsing Green Dot]             |
| Status broadcasted to dispatchers                           |
+-------------------------------------------------------------+
| [Action Required / Inbox Widget]                            |
| 2 New Dispatches Awaiting Confirmation -> [Tap to Inbox]    |
+-------------------------------------------------------------+
| [ACTIVE TRIP IN PROGRESS CARD] (If trip is active)          |
| Status: EN ROUTE • $48.50                                   |
| Passenger: John Doe | Pickup: 08:30 AM                      |
| [A] Colombo Airport -> [B] Kandy City Hotel                 |
| [RESUME ACTIVE TRIP FLOW BUTTON] (Deep Blue Gradient)       |
+-------------------------------------------------------------+
| [Upcoming Schedule Preview (Top 3 Trips)]                   |
| - TR-9021 | Jane Smith | Negombo -> Sigiriya | $75.00       |
| - TR-9034 | David Lee  | Galle -> Mirissa    | $35.00       |
+-------------------------------------------------------------+
| [Today's Performance Card]                                  |
| Earnings: $120.00 | Completed Trips: 3 | Upcoming: 2        |
+-------------------------------------------------------------+
```

#### UI Components & Elements
1. **Availability Status Hero Banner:**
   - Highlights online/offline state with large WiFi / WiFi-Off icon.
   - Informative subtitle explaining dispatch status.
2. **Assignment Inbox Banner Card:**
   - Displays unreviewed trip count.
   - Pulsing red badge if `inboxCount > 0`.
   - 1-tap navigation to `/driver/inbox`.
3. **Active Trip Callout (Conditional):**
   - Renders if any trip is in `en_route`, `arrived`, `in_progress`, or `acknowledged`.
   - Displays booking reference, passenger name, route from/to with visual pin dots, and total fare.
   - Large prominent primary CTA: **"Resume Active Trip Flow"** leading directly to the trip console.
4. **Upcoming Schedule Preview:**
   - Mini list of up to 3 upcoming assigned trips with quick pickup time and fare.
   - "View all (N)" link to `/driver/trips`.
5. **Today's KPI Metric Card:**
   - Displays today's net earnings ($), completed ride count, and upcoming pickups.
6. **Quick Nav Hub:**
   - Direct shortcuts to Inbox, History, and Earnings.

---

### SCREEN 2: Assignment Dispatch Inbox (`DriverInboxScreen`)
*Route: `/driver/inbox`*

```
+-------------------------------------------------------------+
| Assignment Dispatch Inbox                  [Refresh Button] |
| 2 Trips Pending Response                                    |
+-------------------------------------------------------------+
| [DISPATCH CARD]                                             |
| Ref: TR-2026-9041                          Total: $85.00    |
| Date: Oct 14, 2026 at 09:30 AM                              |
| [Pickup]  Bandaranaike International Airport (CMB)          |
| [Dropoff] Heritance Kandalama, Dambulla                     |
| Est. Distance: 135 km  |  Est. Duration: ~190 mins          |
| [2 Passengers]  [3 Luggage]                                 |
| Note: "Child safety seat requested"                         |
|                                                             |
| [ ACCEPT TRIP (Green) ]          [ DECLINE (Red/Outline) ]  |
+-------------------------------------------------------------+
```

#### UI Components & Elements
1. **Trip Card Header:**
   - Booking reference badge (monospace).
   - High-emphasis total fare in emerald green.
   - Travel date and scheduled pickup time.
2. **Route Section:**
   - Pickup address with green dot icon.
   - Dropoff address with red dot icon.
   - Distance (km) and estimated travel duration (minutes) footer chips.
3. **Trip Specifications Chips:**
   - Passenger count (`Users` icon).
   - Luggage piece count (`Luggage` icon).
   - Special customer requests callout box (amber highlighted note).
4. **Action Pair:**
   - **Accept Trip CTA (Primary Green):** Triggers `/acknowledge`, shows success feedback, redirects to the Trip Execution Console.
   - **Decline CTA (Danger Outline):** Triggers the Decline Modal.
5. **Decline Modal / Bottom Sheet:**
   - Modal header: "Decline Assignment - Trip TR-XXXX will be returned to dispatch".
   - Radio/Pill reason selector with pre-set options:
     - *Vehicle mechanical issue*
     - *Distance too far / Location unreachable*
     - *Personal emergency*
     - *Schedule conflict / Shift ending*
     - *Traffic / Extreme road conditions*
     - *Other*
   - Optional context textarea (`Provide brief context for dispatch...`).
   - "Confirm Decline" button (red) & "Cancel" button.
6. **Empty State:**
   - Illustrated "Inbox is Clear" container when no assignments are pending.

---

### SCREEN 3: Upcoming Trip Schedule (`DriverTripsScreen`)
*Route: `/driver/trips`*

#### UI Components & Elements
1. **Schedule Header:**
   - Title and refresh trigger.
2. **Upcoming Trip Card List:**
   - Sorted chronologically by `travel_date` and `pickup_time`.
   - Status badge: `Accepted` (purple), `En Route` (sky blue), `Arrived` (sky blue), `In Progress` (sky blue).
   - Booking Reference, Passenger Name, Pickup/Dropoff addresses, Pickup Date/Time, and Total Fare.
   - Right chevron CTA: **"Manage Trip ->"** navigating to `/driver/trips/:bookingId`.
3. **Empty State:**
   - "No Upcoming Trips Scheduled" with link to Inbox.

---

### SCREEN 4: Trip Execution Console & Live Stepper (`DriverTripDetailScreen`)
*Route: `/driver/trips/:bookingId`*

```
+-------------------------------------------------------------+
| [< Back]                     Booking: TR-2026-9041          |
+-------------------------------------------------------------+
| LIVE TRIP PROGRESSION WORKFLOW              Step 2 of 5     |
| [v] 1. Accepted       (Trip confirmed by you)               |
| [*] 2. En Route       (Driving to pickup point)             |
| [ ] 3. Arrived        (Waiting at pickup location)          |
| [ ] 4. Trip Started   (Passengers onboard, driving)         |
| [ ] 5. Completed      (Dropped off safely)                  |
|                                                             |
| [>>> START HEADING TO PICKUP (EN ROUTE) >>>]                |
+-------------------------------------------------------------+
| ROUTE & NAVIGATION                                          |
| [Pickup]  Bandaranaike Int Airport (CMB)                    |
| [Dropoff] Heritance Kandalama, Dambulla                     |
| Distance: 135 km  |  Duration: ~190 mins                    |
| [ OPEN IN GOOGLE MAPS (External Navigation Button) ]        |
+-------------------------------------------------------------+
| PASSENGER CONTACT                                           |
| Johnathan Doe  |  +94 77 123 4567                           |
| [ CALL PASSENGER (Green Phone Button) ]                     |
+-------------------------------------------------------------+
| VEHICLE & TRAVEL SPECS                                      |
| [Pickup: 09:30 AM]    [Vehicle: Luxury Van]                 |
| [2 Passengers]        [3 Luggage Items]                     |
| Special Note: "Child safety seat requested"                 |
+-------------------------------------------------------------+
| TOTAL TRIP FARE: $85.00            Payment Status: [ PAID ] |
+-------------------------------------------------------------+
```

#### UI Components & Elements
1. **Milestone Progression Stepper (State Machine):**
   - Visual vertical or horizontal step chain (numbered 1 to 5):
     1. `acknowledged` ("Accepted")
     2. `en_route` ("En Route")
     3. `arrived` ("Arrived")
     4. `in_progress` ("Trip Started")
     5. `completed` ("Completed")
   - Current step is highlighted with an animated glow/pulse.
   - Completed steps show green checkmarks.
2. **Dynamic Milestone Advance Button:**
   - Button text changes dynamically based on current state:
     - When `acknowledged` -> **"Start Heading to Pickup (En Route)"**
     - When `en_route` -> **"I Have Arrived at Pickup"**
     - When `arrived` -> **"Start Trip with Passenger"**
     - When `in_progress` -> **"Complete Trip & Record Fare"**
3. **Live Route & Google Maps Deep Link:**
   - Shows pickup and destination pins.
   - "Open in Google Maps" button: Automatically builds the deep-link URL:
     `https://www.google.com/maps/dir/?api=1&destination=<encoded_target_location>`
     *(Points to pickup location when en route; points to destination when trip has started).*
4. **Passenger Quick-Call Card:**
   - Traveler's name and phone number.
   - One-tap native phone dialer CTA: `<a href="tel:+94...">Call Passenger</a>`.
5. **Specs & Fare Card:**
   - Assigned vehicle category name (e.g. Standard Sedan, High-Roof Van).
   - Passenger count and luggage piece count.
   - Payment status badge (`PAID` in green, `PENDING` in amber).
6. **Completion Celebration Banner:**
   - Replaces the stepper once status reaches `completed`.
   - Confirms that fare has been credited to driver's payout balance.

---

### SCREEN 5: Trip History & Archive (`DriverHistoryScreen`)
*Route: `/driver/history`*

#### UI Components & Elements
1. **Filter Segment Tabs:**
   - **All Records** (Total count badge)
   - **Completed** (Count of completed trips)
   - **Declined** (Count of declined assignments)
2. **History Card List:**
   - Card displays: Booking Reference, Status Pill (`Completed` with green check / `Declined` with red cross), Total Fare ($), Passenger Name, From/To route, Travel Date, and "View Record ->" link.
3. **Empty Filter State:**
   - Contextual message when no records match the active filter.

---

### SCREEN 6: Earnings & Payout Analytics (`DriverEarningsScreen`)
*Route: `/driver/earnings`*

```
+-------------------------------------------------------------+
| Earnings & Payout Analytics         [Today | Week | Month]  |
+-------------------------------------------------------------+
| [TOP KPI CARDS (3-Card Grid)]                               |
| [1. Net Earnings]       [2. Completed Trips] [3. Avg / Trip]|
| $465.00                 8 Trips              $58.12         |
+-------------------------------------------------------------+
| DAILY REVENUE DISTRIBUTION (BAR CHART)                      |
|                                                             |
|       $120           $95                                    |
|  $45   ||     $0      ||     $80     $125     $0            |
|  ||    ||     ||      ||     ||       ||      ||            |
|  Mon   Tue    Wed    Thu     Fri     Sat     Sun            |
+-------------------------------------------------------------+
| PAYOUT ACCOUNT (Verified)                                   |
| Direct Bank Transfer (Weekly Every Monday)                  |
| Driver Name: Sunimal Fernando | Status: Active              |
+-------------------------------------------------------------+
```

#### UI Components & Elements
1. **Timeframe Filter Tabs:**
   - `Today`
   - `This Week` (default)
   - `This Month`
2. **Top KPI Summary Cards:**
   - **Total Net Earnings:** High-emphasis currency format (e.g. `$465.00`).
   - **Completed Trips:** Total rides finished in period.
   - **Avg. Fare per Trip:** Auto-calculated average revenue per trip.
3. **Daily Revenue Bar Chart Visualizer:**
   - 7 vertical bars (Mon – Sun for weekly view, or daily series).
   - Relative height proportional to daily earnings.
   - Hover / tap tooltip showing exact fare and trip count.
4. **Payout Details Card:**
   - Verified bank account status badge.
   - Automated payout schedule disclosure (*"Weekly earnings are automatically transferred directly to your bank account every Monday morning"*).
   - Account holder name and status.

---

## 4. Complete API Documentation (Driver-Only Endpoints)

All endpoints below require standard Clerk authentication.  
**Base URL:** `http://localhost:8000/api/v1` (or production environment variable `VITE_API_URL`).  
**Authorization Header:** `Authorization: Bearer <clerk_driver_jwt_token>`

---

### Endpoint 1: Get Driver Dispatch Availability
Fetches the current driver's online/offline dispatch status. Polled every 20 seconds by the driver shell.

- **Method:** `GET`
- **Path:** `/drivers/me/availability`
- **Access:** Authenticated Driver only
- **Response `200 OK`:**
```json
{
  "is_online": true,
  "last_online_at": "2026-10-14T08:30:00Z"
}
```
- **Error Responses:**
  - `401 Unauthorized`: Token missing or invalid.
  - `403 Forbidden`: User is not an approved driver.

---

### Endpoint 2: Update Driver Dispatch Availability
Toggles the driver between Online (ready for dispatch) and Offline (unavailable).

- **Method:** `PATCH`
- **Path:** `/drivers/me/availability`
- **Access:** Authenticated Driver only
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "is_online": true
}
```
- **Response `200 OK`:**
```json
{
  "is_online": true,
  "last_online_at": "2026-10-14T08:30:15Z"
}
```

---

### Endpoint 3: List Driver Trips by Status Filter
Retrieves assigned, upcoming, or past trips assigned to the logged-in driver.

- **Method:** `GET`
- **Path:** `/drivers/me/trips?status={status}`
- **Query Parameters:**
  - `status`: String enum.
    - `assigned` — New dispatches awaiting driver acceptance/rejection (used by **Assignment Inbox** and badge counter).
    - `upcoming` — Confirmed scheduled trips (used by **Upcoming Schedule** and **Home Screen**).
    - `history` — Completed and declined trips (used by **Trip History**).
- **Response `200 OK` (Array of `DriverTripSummary`):**
```json
[
  {
    "id": "b8f41154-1b3a-4a2e-9d21-42cb092a912a",
    "booking_reference": "TR-2026-9041",
    "travel_date": "2026-10-14",
    "pickup_time": "09:30:00",
    "pickup_location": "Bandaranaike International Airport (CMB), Katunayake",
    "destination_location": "Heritance Kandalama, Dambulla",
    "distance_km": 135.5,
    "estimated_duration_minutes": 190,
    "passengers_count": 2,
    "luggage_count": 3,
    "special_requests": "Child safety seat requested",
    "total_price": 85.00,
    "currency": "USD",
    "booking_status": "confirmed",
    "payment_status": "paid",
    "assignment_status": "assigned",
    "assigned_at": "2026-10-14T07:15:00Z",
    "driver_responded_at": null,
    "created_at": "2026-10-14T07:10:00Z",
    "customer_name": "Johnathan Doe",
    "customer_phone": "+94771234567"
  }
]
```

---

### Endpoint 4: Get Detailed Trip Console Information
Fetches complete trip details, including route coordinates, passenger contact, pricing breakdown, and vehicle category.

- **Method:** `GET`
- **Path:** `/drivers/me/trips/{bookingId}`
- **Path Parameters:**
  - `bookingId`: UUID of the transport booking.
- **Response `200 OK` (`DriverTripDetail`):**
```json
{
  "id": "b8f41154-1b3a-4a2e-9d21-42cb092a912a",
  "booking_reference": "TR-2026-9041",
  "travel_date": "2026-10-14",
  "pickup_time": "09:30:00",
  "pickup_location": "Bandaranaike International Airport (CMB), Katunayake",
  "pickup_lat": 7.1804,
  "pickup_lng": 79.8841,
  "destination_location": "Heritance Kandalama, Dambulla",
  "destination_lat": 7.8742,
  "destination_lng": 80.7056,
  "distance_km": 135.5,
  "estimated_duration_minutes": 190,
  "passengers_count": 2,
  "luggage_count": 3,
  "special_requests": "Child safety seat requested",
  "base_fare": 30.00,
  "price_per_km": 0.40,
  "route_price": 54.20,
  "extra_charges": 0.80,
  "total_price": 85.00,
  "currency": "USD",
  "booking_status": "confirmed",
  "payment_status": "paid",
  "assignment_status": "acknowledged",
  "assigned_at": "2026-10-14T07:15:00Z",
  "driver_responded_at": "2026-10-14T07:18:22Z",
  "created_at": "2026-10-14T07:10:00Z",
  "customer": {
    "name": "Johnathan Doe",
    "phone": "+94771234567",
    "email": "johndoe@example.com",
    "country": "United Kingdom"
  },
  "vehicle_category_name": "Comfort Sedan (Toyota Premio / Axio)"
}
```

---

### Endpoint 5: Acknowledge & Accept Trip Assignment
Accepts a pending assignment dispatched to the driver. Transitions status from `assigned` to `acknowledged`.

- **Method:** `POST`
- **Path:** `/drivers/me/trips/{bookingId}/acknowledge`
- **Path Parameters:**
  - `bookingId`: UUID of the booking.
- **Request Body:** None / Empty `{}`
- **Response `200 OK`:** Returns updated `DriverTripDetail` with `assignment_status: "acknowledged"`.

---

### Endpoint 6: Decline Trip Assignment
Declines a dispatch assignment with a mandatory reason code and optional note. Returns the trip back to the dispatcher pool.

- **Method:** `POST`
- **Path:** `/drivers/me/trips/{bookingId}/decline`
- **Path Parameters:**
  - `bookingId`: UUID of the booking.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "reason": "Vehicle mechanical issue",
  "note": "Flat tire on highway, cannot reach airport on time"
}
```
- **Response `200 OK` (`DriverTripDeclineRecord`):**
```json
{
  "id": "c1a93822-0a12-4c22-b511-9a7788112233",
  "transport_booking_id": "b8f41154-1b3a-4a2e-9d21-42cb092a912a",
  "booking_reference": "TR-2026-9041",
  "pickup_location": "Bandaranaike International Airport (CMB), Katunayake",
  "destination_location": "Heritance Kandalama, Dambulla",
  "travel_date": "2026-10-14",
  "total_price": 85.00,
  "currency": "USD",
  "reason": "Vehicle mechanical issue",
  "note": "Flat tire on highway, cannot reach airport on time",
  "created_at": "2026-10-14T07:20:00Z"
}
```

---

### Endpoint 7: Update Live Trip Progress Milestone
Advances the active trip along the milestone progression state machine.

- **Method:** `PATCH`
- **Path:** `/drivers/me/trips/{bookingId}/status`
- **Path Parameters:**
  - `bookingId`: UUID of the booking.
- **Request Headers:** `Content-Type: application/json`
- **Request Body:**
```json
{
  "status": "en_route"
}
```
*(Valid status values: `"en_route"` | `"arrived"` | `"in_progress"` | `"completed"`)*

- **State Progression Rules:**
  1. `acknowledged` -> `en_route` (Driver starts driving to pickup)
  2. `en_route` -> `arrived` (Driver arrives at pickup spot)
  3. `arrived` -> `in_progress` (Passenger boards, trip begins)
  4. `in_progress` -> `completed` (Passenger reaches destination, trip finishes)
- **Response `200 OK`:** Returns updated `DriverTripDetail` with the new `assignment_status`.

---

### Endpoint 8: Get Driver Earnings & Payout Summary
Fetches driver revenue, completed trip counts, and daily earning distributions.

- **Method:** `GET`
- **Path:** `/drivers/me/earnings?period={period}`
- **Query Parameters:**
  - `period`: String enum (`today` | `week` | `month`). Defaults to `today`.
- **Response `200 OK` (`DriverEarningsData`):**
```json
{
  "period": "week",
  "total_earnings": 465.00,
  "trip_count": 8,
  "currency": "USD",
  "start_date": "2026-10-08",
  "end_date": "2026-10-14",
  "daily_breakdown": [
    { "date": "2026-10-08", "day_name": "Wednesday", "earnings": 45.00, "trip_count": 1 },
    { "date": "2026-10-09", "day_name": "Thursday", "earnings": 120.00, "trip_count": 2 },
    { "date": "2026-10-10", "day_name": "Friday", "earnings": 0.00, "trip_count": 0 },
    { "date": "2026-10-11", "day_name": "Saturday", "earnings": 95.00, "trip_count": 2 },
    { "date": "2026-10-12", "day_name": "Sunday", "earnings": 80.00, "trip_count": 1 },
    { "date": "2026-10-13", "day_name": "Monday", "earnings": 125.00, "trip_count": 2 },
    { "date": "2026-10-14", "day_name": "Tuesday", "earnings": 0.00, "trip_count": 0 }
  ]
}
```

---

## 5. Summary Matrix for Figma Screen Design

| Figma Frame Name | Screen Route | Primary API(s) Used | Key Interactive Components |
| :--- | :--- | :--- | :--- |
| **01_Driver_Shell** | Global Layout | `GET /availability`<br>`PATCH /availability`<br>`GET /trips?status=assigned` | Online/Offline toggle switch, 5-tab mobile bottom bar, desktop sidebar, dispatch counter badge |
| **02_Driver_Home** | `/driver/home` | `GET /trips?status=upcoming`<br>`GET /earnings?period=today` | Status readiness hero, inbox notification card, active trip callout banner, KPI card |
| **03_Driver_Inbox** | `/driver/inbox` | `GET /trips?status=assigned`<br>`POST /trips/:id/acknowledge`<br>`POST /trips/:id/decline` | Trip dispatch card, Accept CTA, Decline modal with radio reasons and note input |
| **04_Driver_Trips** | `/driver/trips` | `GET /trips?status=upcoming` | Chronological upcoming schedule list, status badges (`Accepted`, `En Route`, `Arrived`, `In Progress`) |
| **05_Driver_Console** | `/driver/trips/:id` | `GET /trips/:id`<br>`PATCH /trips/:id/status` | 5-step milestone stepper, dynamic action button, Google Maps link, "Call Passenger" phone button |
| **06_Driver_History** | `/driver/history` | `GET /trips?status=history` | Filter pills (`All`, `Completed`, `Declined`), historical trip archive cards |
| **07_Driver_Earnings**| `/driver/earnings` | `GET /earnings?period={period}` | Period toggle (`Today`, `Week`, `Month`), 3 KPI metrics, interactive daily bar chart, bank payout card |

---

## 6. Prompt Recommendation for Figma Make / Figma AI

To import or feed this directly into **Figma Make** or **Figma AI**, copy and paste the following prompt:

```markdown
Design a modern, mobile-first Driver Partner App for "Voyage" (Tourist Transport in Sri Lanka).
Color Palette:
- Dark Mode Background: #060D1A
- Panel/Card Surface: #070E1D
- Brand Blue: #3B82F6 / #2563EB
- Dispatch Green: #10B981 / #22C55E
- Alert / Badge Red: #EF4444
- Typography: Clean Sans-Serif (Inter) with Monospace for Booking References (e.g. TR-2026-9041).

Screens to generate:
1. Shell Navigation: Sticky Top Bar with Online/Offline toggle (pulsing green dot) and Bottom Navigation Bar with 5 tabs: Dashboard, Inbox (with red badge "2"), Upcoming Trips, History, Earnings.
2. Dashboard (/driver/home): "Online & Available" hero banner, "2 Dispatches Pending" action card, "Active Trip" card with route endpoints, passenger name, and "Resume Active Trip" button, plus Today's Earnings KPI ($120.00).
3. Assignment Dispatch Inbox (/driver/inbox): Cards showing booking reference, price ($85.00), travel date/time, pickup and destination addresses, distance (135 km), duration (190 mins), passengers (2), luggage (3), and two big buttons: "Accept Trip" (Green) and "Decline" (Outline Red). Include the Decline Reason bottom sheet modal.
4. Trip Execution Console (/driver/trips/:id): 5-step vertical milestone stepper (Accepted -> En Route -> Arrived -> In Progress -> Completed), dynamic primary action button ("Start Heading to Pickup"), Google Maps button, and "Call Passenger" direct phone button.
5. Trip History (/driver/history): Segmented filter tabs (All, Completed, Declined) with cards showing completed trip fares and declined records.
6. Earnings & Payout Analytics (/driver/earnings): Timeframe selector (Today, This Week, This Month), 3 KPI cards (Net Earnings, Completed Trips, Avg Fare), daily revenue vertical bar chart (Mon-Sun), and verified weekly payout account info card.
```

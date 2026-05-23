Enhance the existing Voyage Admin dark SaaS dashboard with a professional hotel inventory and availability management system focused heavily on Stay vendors.

IMPORTANT:
This platform is no longer just a travel listing CMS.
It should now feel like a premium hotel extranet system similar to:
- Booking.com Extranet
- Agoda Partner Hub
- Airbnb Host Dashboard
- Expedia Partner Central

Keep the existing premium visual style:
- Dark navy blue dashboard
- Midnight blue backgrounds
- Blue glow effects
- Glassmorphism cards
- Enterprise SaaS design
- No purple
- Compact modern layout
- Rounded cards and subtle glowing borders

========================================
MAIN PRODUCT DIRECTION
========================================

Stay vendors are now the PRIMARY focus of the platform.

The UX must prioritize:
- fast availability updates
- room inventory management
- quick access operations
- calendar-first workflows
- daily hotel operations

Avoid making the Stay dashboard feel like a generic form editor.

========================================
NEW STAY VENDOR EXPERIENCE
========================================

Create a dedicated “Hotel Operations Dashboard” for Stay vendors.

This dashboard should become the main landing page for Stay vendors after login.

Sidebar for Stay vendors:
- Dashboard
- Availability Calendar
- Room Inventory
- Reservations
- Pricing & Rates
- Seasonal Pricing
- Media
- Property Settings
- Policies

========================================
AVAILABILITY CALENDAR (MOST IMPORTANT)
========================================

Create a large premium hotel availability calendar UI.

The calendar should feel similar to:
- Booking.com calendar
- Airbnb host calendar
- Agoda extranet inventory calendar

Calendar requirements:
- Monthly calendar grid
- Sticky room type rows
- Scrollable dates horizontally
- Interactive date cells
- Large desktop-first layout

Each date cell should show:
- price per night
- available rooms
- sold rooms
- blocked dates
- inventory alerts

Color states:
- Blue = available
- Red = sold out
- Orange = low inventory
- Gray = blocked
- Green = high occupancy

Example cell:
15 Aug
$120
2 rooms left

========================================
ROOM INVENTORY ARCHITECTURE
========================================

Design the system using a professional inventory hierarchy:

Property
→ Room Types
→ Individual Room Units

IMPORTANT:
Each physical room/apartment/villa should have a unique inventory ID.

Example:
Property:
Yala Jungle Resort

Room Type:
Single Room

Inventory Units:
SR-101
SR-102
SR-103
SR-104
SR-105

Do NOT use only quantity-based inventory.
The system must visually support unit-based inventory management.

========================================
ROOM INVENTORY MANAGEMENT PAGE
========================================

Create a premium inventory management screen.

Main table:
- Room Unit ID
- Room Type
- Status
- Availability
- Occupancy
- Cleaning Status
- Maintenance Status
- Base Price
- Actions

Statuses:
- Available
- Occupied
- Maintenance
- Cleaning
- Blocked

Examples:
DLX-101
DLX-102
VILLA-01
APT-301

Include:
- search
- filters
- bulk actions
- status chips
- quick update actions

========================================
ROOM TYPE MANAGEMENT
========================================

Create a Room Type management section.

Example room types:
- Deluxe Room
- Family Room
- Ocean Villa
- Standard Double

Each room type contains:
- title
- quantity
- occupancy
- amenities
- pricing
- images
- room units

UI should allow:
- Add Room Type
- Add Inventory Units
- Auto-generate room IDs
- Rename room units

Example:
Quantity: 5

Auto-generates:
SR-001
SR-002
SR-003
SR-004
SR-005

========================================
QUICK INVENTORY ACTIONS
========================================

Create floating quick actions for hotel operators.

Quick actions:
- Block dates
- Open dates
- Change room count
- Update pricing
- Weekend pricing
- Seasonal pricing
- Minimum stay rules
- Bulk inventory updates

Example workflow:
Select Aug 10–20
→ Set price = $180
→ Set available rooms = 3
→ Apply

Design this with premium modal or side drawer UX.

========================================
DATE SIDE PANEL
========================================

When clicking a calendar date:
Open a professional right-side drawer.

Show:
- selected date
- available rooms
- booked rooms
- blocked rooms
- room status
- nightly price
- weekend pricing
- minimum stay
- occupancy %

Quick save actions:
- block date
- update inventory
- update price
- mark maintenance

========================================
PROPERTY OPERATIONS DASHBOARD
========================================

Create widgets for:
- Occupancy rate
- Upcoming check-ins
- Upcoming check-outs
- Low inventory alerts
- Sold-out dates
- Revenue estimate
- Most booked room type
- Active reservations

========================================
RESERVATION MANAGEMENT
========================================

Create a hotel reservation dashboard.

Reservation table:
- Guest
- Room Unit ID
- Check-in
- Check-out
- Nights
- Status
- Payment
- Actions

Statuses:
- Confirmed
- Pending
- Checked-in
- Checked-out
- Cancelled

========================================
MULTI-PROPERTY SUPPORT
========================================

Allow vendors to manage:
- hotels
- villas
- apartments
- cabanas
- glamping tents

Inventory architecture must support:
- single-unit villas
- multi-room hotels
- apartment buildings

========================================
PROPERTY EDITOR RESTRUCTURE
========================================

Split the Stay system into TWO separate experiences:

1. Property Editor
Static information:
- property details
- address
- amenities
- policies
- media

2. Operations Dashboard
Dynamic operational data:
- availability
- inventory
- pricing
- room units
- reservations
- blackout dates

This separation is VERY IMPORTANT.

========================================
MOBILE EXPERIENCE
========================================

Create mobile-friendly hotel inventory UX:
- compact availability calendar
- sticky quick action bar
- swipe-friendly calendar
- fast inventory updates

Hotel vendors should be able to update inventory quickly from mobile.

========================================
DESIGN GOAL
========================================

The final product should feel like:
- a professional hotel partner portal
- enterprise-grade hospitality software
- modern SaaS inventory management platform

Avoid:
- generic CRUD admin forms
- basic tables only
- simple calendar widgets
- template-looking dashboards

Focus on:
- operational UX
- speed
- inventory visibility
- room-level control
- premium dark SaaS visuals

Use realistic Sri Lankan hotel examples:
- Jetwing Yala
- Cinnamon Wild
- Wild Coast Tented Lodge
- Sigiriya Village
- Ella Jungle Resort
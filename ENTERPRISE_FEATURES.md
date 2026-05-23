# Voyage Platform - Enterprise Features & Components

This document outlines the enterprise-grade components and features added to the Voyage travel marketplace platform to provide a cohesive, polished SaaS experience.

## Overview

The platform has been enhanced with production-ready enterprise components designed to:
- Provide workflow consistency across all modules
- Enable cross-module entity linking
- Deliver premium UX patterns (Stripe/Linear/Notion-level polish)
- Support operational productivity
- Maintain visual consistency

---

## Core Enterprise Components

### 1. **StatusBadge** (`src/app/components/shared/StatusBadge.tsx`)

Unified status badge system used across all modules for consistent status visualization.

#### Features:
- 30+ predefined status types across all operational areas
- Consistent colors, icons, and visual hierarchy
- Priority-based styling (critical statuses pulse)
- Support for booking, vendor, listing, payment, and support ticket statuses

#### Usage:
```tsx
import { StatusBadge } from './components/shared/StatusBadge';

<StatusBadge status="pending" showIcon={true} size="md" />
<StatusBadge status="confirmed" pulse={true} />
<StatusBadge status="approved" customLabel="Vendor Approved" />
```

#### Available Status Types:
- **Bookings**: pending, confirmed, completed, cancelled, processing
- **Vendors**: approved, rejected, suspended, active, inactive
- **Listings**: draft, pending-review, published
- **Payments**: paid, unpaid, refunded, failed
- **Support**: open, in-progress, resolved, closed
- **Generic**: success, warning, error, info

---

### 2. **Timeline** (`src/app/components/shared/Timeline.tsx`)

Enterprise activity timeline component for tracking changes, events, and workflows.

#### Features:
- Expandable event details with change tracking
- Cross-module entity linking
- Grouped metadata display
- Actor/role attribution
- Status badges integration
- Expandable/collapsible event history

#### Usage:
```tsx
import { Timeline } from './components/shared/Timeline';

const events = [
  {
    id: "1",
    timestamp: "2 minutes ago",
    title: "Booking confirmed",
    actor: "Admin User",
    status: "confirmed",
    linkedEntity: {
      type: "Booking",
      id: "BKG-001",
      label: "Safari Package",
      href: "/bookings/1"
    },
    changes: [
      { field: "Status", before: "Pending", after: "Confirmed" }
    ],
    icon: Calendar,
    iconColor: "#3b82f6"
  }
];

<Timeline events={events} maxVisible={10} compact={false} />
```

---

### 3. **CommandPalette** (`src/app/components/shared/CommandPalette.tsx`)

Global search and quick navigation system with keyboard shortcuts (Cmd+K / Ctrl+K).

#### Features:
- 25+ predefined quick actions across all modules
- Keyboard-first navigation (arrow keys, enter, escape)
- Categorized results
- Icon-based visual hierarchy
- Full-text search across actions and keywords

#### Activation:
- Press `Cmd+K` (Mac) or `Ctrl+K` (Windows/Linux)
- Click search button in header

#### Quick Actions Include:
- Navigation to dashboards
- Booking management
- Vendor operations
- Listing creation
- Finance & payouts
- Support tickets
- Hotel & transport operations
- Analytics & settings

---

### 4. **Modal System** (`src/app/components/shared/Modal.tsx`)

Enhanced modal system for workflows and confirmations.

#### Components:
- **Modal**: Base modal with header, content, footer
- **ConfirmModal**: Pre-configured confirmation dialogs

#### Features:
- Keyboard support (Escape to close)
- Backdrop blur effect
- Icon support with color theming
- 4 size options: sm, md, lg, xl
- Prevent-close mode for critical actions
- Variant-based styling (danger, warning, primary)

#### Usage:
```tsx
import { Modal, ConfirmModal } from './components/shared/Modal';

// Base Modal
<Modal
  isOpen={isOpen}
  onClose={onClose}
  title="Edit Booking"
  description="Update booking details"
  icon={Calendar}
  iconColor="#3b82f6"
  size="lg"
  footer={
    <div>
      <button onClick={onSave}>Save Changes</button>
    </div>
  }
>
  {/* Content */}
</Modal>

// Confirm Modal
<ConfirmModal
  isOpen={isOpen}
  onClose={onClose}
  onConfirm={handleDelete}
  title="Delete Vendor"
  description="Are you sure you want to delete this vendor? This action cannot be undone."
  confirmText="Delete"
  variant="danger"
  isLoading={isDeleting}
/>
```

---

### 5. **Empty States** (`src/app/components/shared/EmptyState.tsx`)

Polished empty states for zero-data scenarios.

#### Components:
- **EmptyState**: Generic empty state with action buttons
- **ErrorState**: Error display with retry option
- **LoadingState**: Loading spinner with message

#### Usage:
```tsx
import { EmptyState, ErrorState, LoadingState } from './components/shared/EmptyState';

<EmptyState
  icon={Package}
  iconColor="#10b981"
  title="No listings yet"
  description="Create your first listing to start accepting bookings."
  action={{
    label: "Create Listing",
    onClick: () => navigate("/listings/create")
  }}
/>

<ErrorState
  title="Failed to load"
  description="Unable to fetch bookings. Please try again."
  action={{
    label: "Retry",
    onClick: handleRetry
  }}
/>

<LoadingState message="Loading bookings..." compact={false} />
```

---

### 6. **Entity Linking** (`src/app/components/shared/EntityLink.tsx`)

Cross-module entity linking for operational productivity.

#### Components:
- **EntityLink**: Inline entity link with icon and type
- **EntityCard**: Card-based entity preview with metadata

#### Supported Entities:
- User, Vendor, Listing, Booking, Payment, Payout, Ticket, Hotel Reservation, Transfer, Audit Log

#### Usage:
```tsx
import { EntityLink, EntityCard } from './components/shared/EntityLink';

// Inline link
<EntityLink
  type="vendor"
  id="V-247"
  label="Safari Adventures Ltd"
  showIcon={true}
  compact={false}
/>

// Entity card
<EntityCard
  type="booking"
  id="BKG-001"
  title="5-Day Masai Mara Safari"
  description="Sarah Johnson · 4 guests"
  status={<StatusBadge status="confirmed" size="sm" />}
  metadata={[
    { label: "Check-in", value: "May 25, 2026" },
    { label: "Amount", value: "$2,400" }
  ]}
  onClick={() => navigate("/bookings/1")}
/>
```

---

### 7. **Toast Notifications** (`src/app/components/shared/Toast.tsx`)

Enterprise toast notification system with auto-dismiss and actions.

#### Features:
- 4 variant types: success, error, warning, info
- Auto-dismiss with configurable duration
- Manual dismiss option
- Slide-in animation
- Stack multiple toasts
- Icon-based visual hierarchy

#### Usage:
```tsx
import { useToast } from './components/shared/Toast';

function MyComponent() {
  const toast = useToast();

  const handleSave = () => {
    // Success notification
    toast.success("Booking confirmed", "The booking has been successfully confirmed.");

    // Error notification
    toast.error("Payment failed", "Unable to process payment. Please try again.");

    // Warning notification
    toast.warning("Low inventory", "Only 2 rooms remaining for this date.");

    // Info notification
    toast.info("New message", "You have a new message from the vendor.");

    // Custom notification
    toast.showToast("success", "Custom message", "Description", 3000);
  };

  return <button onClick={handleSave}>Save</button>;
}
```

---

## Integration Points

### Header Enhancement
The header now includes the CommandPalette trigger with Cmd+K keyboard shortcut support.

### App Root
The App component is wrapped with ToastProvider to enable toast notifications throughout the platform.

```tsx
// src/app/App.tsx
<ToastProvider>
  <RouterProvider router={router} />
</ToastProvider>
```

---

## Design System Consistency

All components follow the existing Voyage platform design system:
- **Dark theme** with glassmorphism effects
- **Navy blue branding** (#1e40af, #3b82f6, #60a5fa)
- **CSS custom properties** for theming
- **Consistent spacing** using Tailwind utilities
- **Premium shadows** and glow effects
- **Smooth transitions** on all interactions

---

## Enterprise UX Patterns

### Keyboard Shortcuts
- `Cmd+K` / `Ctrl+K`: Open command palette
- `Esc`: Close modals and command palette
- Arrow keys: Navigate command palette results
- Enter: Select command palette action

### Visual Hierarchy
1. **Critical/Urgent** (Red, Orange): High priority actions requiring immediate attention
2. **In-Progress** (Blue, Purple): Active operations
3. **Success/Completed** (Green): Successful operations
4. **Neutral/Info** (Gray): Standard informational states

### Operational Linking
All entities support deep linking between modules:
- Booking → Vendor → Listings → Payments
- Support Ticket → Booking → Customer
- Payout → Vendor → Listings
- Audit Log → Entity → Changes

---

## Next Steps for Integration

To maximize the value of these enterprise components:

1. **Replace inline status badges** across existing pages with the unified `StatusBadge` component
2. **Add Timeline components** to booking details, vendor profiles, and support tickets
3. **Use EntityLink components** to create cross-module navigation in tables and cards
4. **Implement toast notifications** for all user actions (save, delete, approve, etc.)
5. **Add EmptyStates** to all list views when no data is available
6. **Use Modal/ConfirmModal** for all critical actions and multi-step workflows

---

## Performance Considerations

All components are:
- **Lightweight**: Minimal DOM nodes and efficient rendering
- **Accessible**: Keyboard navigation and semantic HTML
- **Responsive**: Mobile-optimized with appropriate breakpoints
- **Themeable**: CSS custom properties for easy customization

---

## Support

For questions or issues with these components, refer to the component source code in `src/app/components/shared/`.

Each component includes TypeScript interfaces and comprehensive prop documentation.

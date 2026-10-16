import type { CSSProperties, ReactNode } from "react";
import {
  AlertTriangle,
  Briefcase,
  Calendar,
  Car,
  Clock,
  ExternalLink,
  Globe,
  Mail,
  Navigation,
  Phone,
  User,
  UserX,
  Users,
} from "lucide-react";
import type { AdminTransportBooking } from "../../api/adminTransportApi";
import { RequestNotes } from "./RequestNotes";
import {
  formatClock,
  formatDateTime,
  formatDay,
  formatDistance,
  formatDuration,
  formatMoney,
  hasCoordinates,
  mapsDirectionsUrl,
} from "./transportFormat";

const CARD_STYLE: CSSProperties = {
  background: "var(--bg-panel)",
  border: "1px solid var(--border-light)",
  boxShadow: "var(--shadow-md)",
};

export function DetailCard({ title, children, aside }: { title: string; children: ReactNode; aside?: ReactNode }) {
  return (
    <section className="rounded-xl p-5" style={CARD_STYLE}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <h3 className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
          {title}
        </h3>
        {aside}
      </div>
      {children}
    </section>
  );
}

function Fact({
  icon: Icon,
  label,
  children,
}: {
  icon: typeof User;
  label: string;
  children: ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <Icon size={14} className="shrink-0 mt-0.5" style={{ color: "var(--text-tertiary)" }} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>
          {label}
        </p>
        <div className="text-[13px] break-words" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
          {children}
        </div>
      </div>
    </div>
  );
}

const linkStyle: CSSProperties = { color: "var(--accent-navy-light)", textDecoration: "underline" };

/** Everything we hold about the customer, with one-tap email and call. */
export function CustomerCard({ booking }: { booking: AdminTransportBooking }) {
  return (
    <DetailCard title="Customer">
      <div className="grid grid-cols-2 gap-4">
        <Fact icon={User} label="Name">{booking.customer_name}</Fact>
        <Fact icon={Globe} label="Country">{booking.customer_country || <span style={{ color: "var(--text-tertiary)" }}>Not provided</span>}</Fact>
        <Fact icon={Mail} label="Email">
          <a href={`mailto:${booking.customer_email}`} style={linkStyle}>{booking.customer_email}</a>
        </Fact>
        <Fact icon={Phone} label="Phone">
          <a href={`tel:${booking.customer_phone.replace(/\s+/g, "")}`} style={linkStyle}>{booking.customer_phone}</a>
        </Fact>
      </div>
    </DetailCard>
  );
}

export function RouteCard({ booking }: { booking: AdminTransportBooking }) {
  const pickupMap = hasCoordinates(booking.pickup_lat, booking.pickup_lng);
  const destinationMap = hasCoordinates(booking.destination_lat, booking.destination_lng);

  const stop = (label: string, place: string, dot: string, link?: string) => (
    <div className="flex items-start gap-3">
      <span className="mt-1 w-3 h-3 rounded-full shrink-0" style={{ background: dot }} aria-hidden />
      <div className="flex-1 min-w-0">
        <p className="text-[11px] mb-0.5" style={{ color: "var(--text-tertiary)" }}>{label}</p>
        <p className="text-[13px] break-words" style={{ color: "var(--text-primary)", fontWeight: 500 }}>{place}</p>
        {link && (
          <a href={link} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-[11px] mt-1" style={linkStyle}>
            <ExternalLink size={11} aria-hidden /> Open on map
          </a>
        )}
      </div>
    </div>
  );

  return (
    <DetailCard title="Route">
      <div className="space-y-4">
        {stop("Pickup", booking.pickup_location, "var(--success)", pickupMap ? mapsDirectionsUrl(booking.pickup_lat, booking.pickup_lng) : undefined)}
        {stop("Drop-off", booking.destination_location, "var(--error)", destinationMap ? mapsDirectionsUrl(booking.destination_lat, booking.destination_lng) : undefined)}
        <div className="grid grid-cols-2 gap-3 pt-3" style={{ borderTop: "1px solid var(--border-light)" }}>
          <Fact icon={Navigation} label="Distance">{formatDistance(booking.distance_km)}</Fact>
          <Fact icon={Clock} label="Estimated duration">{formatDuration(booking.estimated_duration_minutes)}</Fact>
        </div>
        {!pickupMap && !destinationMap && (
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            No map coordinates were saved for this booking, so distance was estimated from the place names.
          </p>
        )}
      </div>
    </DetailCard>
  );
}

/** Pickup, party size, vehicle, and the customer's request, with a warning if the party exceeds the vehicle. */
export function TripCard({ booking }: { booking: AdminTransportBooking }) {
  const category = booking.vehicle_category;
  const overPassengers = category && booking.passengers_count > category.passenger_capacity;
  const overLuggage = category && booking.luggage_count > category.luggage_capacity;

  return (
    <DetailCard title="Trip">
      <div className="grid grid-cols-2 gap-4">
        <Fact icon={Calendar} label="Pickup date">{formatDay(booking.travel_date)}</Fact>
        <Fact icon={Clock} label="Pickup time">{formatClock(booking.pickup_time)}</Fact>
        <Fact icon={Users} label="Passengers">
          {booking.passengers_count}
          {category && <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> of {category.passenger_capacity} seats</span>}
        </Fact>
        <Fact icon={Briefcase} label="Bags">
          {booking.luggage_count}
          {category && <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> of {category.luggage_capacity}</span>}
        </Fact>
        <Fact icon={Car} label="Vehicle category">{category?.name || <span style={{ color: "var(--text-tertiary)" }}>Not set</span>}</Fact>
        <Fact icon={Calendar} label="Requested on">{formatDateTime(booking.created_at)}</Fact>
      </div>

      {(overPassengers || overLuggage) && (
        <div
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg px-3 py-2 text-[12px]"
          style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.3)", color: "#fbbf24" }}
        >
          <AlertTriangle size={14} className="shrink-0 mt-0.5" aria-hidden />
          This party is larger than the chosen vehicle holds. Assign a bigger vehicle or contact the customer.
        </div>
      )}

      {booking.special_requests && (
        <div className="mt-4 pt-4 space-y-3" style={{ borderTop: "1px solid var(--border-light)" }}>
          <RequestNotes text={booking.special_requests} />
        </div>
      )}
    </DetailCard>
  );
}

/** The fare exactly as stored: rate card, route price, extras and total, in the booking's own currency. */
export function FareCard({ booking }: { booking: AdminTransportBooking }) {
  const money = (value: number | string) => formatMoney(value, booking.currency);
  const route = Number(booking.route_price);
  const extra = Number(booking.extra_charges);
  const total = Number(booking.total_price);
  const adds = Math.abs(route + extra - total) < 0.01;

  const row = (label: string, value: string, muted = false) => (
    <div className="flex items-center justify-between gap-4">
      <p className="text-[13px]" style={{ color: muted ? "var(--text-tertiary)" : "var(--text-secondary)" }}>{label}</p>
      <p className="text-[13px] tabular-nums" style={{ color: muted ? "var(--text-tertiary)" : "var(--text-primary)" }}>{value}</p>
    </div>
  );

  return (
    <DetailCard title="Fare" aside={<span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{booking.currency}</span>}>
      <div className="space-y-3">
        {row("Rate card: base fare", money(booking.base_fare), true)}
        {row("Rate card: per km", money(booking.price_per_km), true)}
        <div className="pt-3 space-y-3" style={{ borderTop: "1px solid var(--border-light)" }}>
          {row("Route price", money(route))}
          {row("Extra charges", money(extra))}
        </div>
        <div className="pt-3 flex items-center justify-between" style={{ borderTop: "1px solid var(--border-light)" }}>
          <p className="text-[13px]" style={{ color: "var(--text-secondary)" }}>Total</p>
          <p className="text-[18px] tabular-nums" style={{ color: "var(--success)", fontWeight: 700 }}>{money(total)}</p>
        </div>
        {!adds && (
          <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
            Route price plus extras does not equal the total. This is usually a booking created through the older inquiry flow.
          </p>
        )}
      </div>
    </DetailCard>
  );
}

/** Drivers who declined this booking earlier. A declined booking returns to the queue as unassigned, so this is the only trace. */
export function DeclineHistoryCard({ booking }: { booking: AdminTransportBooking }) {
  const history = booking.decline_history || [];
  if (history.length === 0) return null;

  return (
    <DetailCard
      title="Declined by drivers"
      aside={<span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>{history.length}</span>}
    >
      <ul className="space-y-3">
        {history.map((record) => (
          <li key={record.id} className="flex items-start gap-3">
            <UserX size={14} className="shrink-0 mt-0.5" style={{ color: "var(--error)" }} aria-hidden />
            <div className="min-w-0">
              <p className="text-[13px]" style={{ color: "var(--text-primary)", fontWeight: 500 }}>
                {record.driver_name || "A driver"}
                <span style={{ color: "var(--text-tertiary)", fontWeight: 400 }}> · {formatDateTime(record.created_at)}</span>
              </p>
              <p className="text-[12px]" style={{ color: "var(--text-secondary)" }}>{record.reason}</p>
              {record.note && (
                <p className="text-[12px] mt-0.5 whitespace-pre-line" style={{ color: "var(--text-tertiary)" }}>{record.note}</p>
              )}
            </div>
          </li>
        ))}
      </ul>
    </DetailCard>
  );
}

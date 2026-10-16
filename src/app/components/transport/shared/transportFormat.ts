import { format, parseISO } from "date-fns";

/** Format an amount in the booking's own currency. Falls back gracefully if the code is not a real ISO currency. */
export function formatMoney(amount: number | string | null | undefined, currency?: string | null): string {
  const value = Number(amount ?? 0);
  const safe = Number.isFinite(value) ? value : 0;
  const code = (currency || "USD").toUpperCase();
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency: code }).format(safe);
  } catch {
    return `${safe.toFixed(2)} ${code}`;
  }
}

/** yyyy-MM-dd is parsed as a local date; `new Date("2026-10-20")` is UTC midnight and shifts a day in some zones. */
export function formatDay(value?: string | null, pattern = "EEE, d MMM yyyy"): string {
  if (!value) return "—";
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, pattern);
}

export function formatClock(value?: string | null): string {
  if (!value) return "—";
  return value.substring(0, 5);
}

export function formatDateTime(value?: string | null): string {
  if (!value) return "—";
  const parsed = parseISO(value);
  return Number.isNaN(parsed.getTime()) ? value : format(parsed, "d MMM yyyy, HH:mm");
}

export function formatDuration(minutes?: number | null): string {
  if (!minutes || minutes <= 0) return "—";
  const hours = Math.floor(minutes / 60);
  const rest = Math.round(minutes % 60);
  if (hours === 0) return `${rest} min`;
  return rest === 0 ? `${hours} h` : `${hours} h ${rest} min`;
}

export function formatDistance(km?: number | string | null): string {
  const value = Number(km);
  if (!km || !Number.isFinite(value) || value <= 0) return "—";
  return `${value.toFixed(value >= 100 ? 0 : 1)} km`;
}

/** Last four digits only. Never invent digits for an account that was not provided. */
export function maskAccountNumber(value?: string | null): string | null {
  if (!value) return null;
  const digits = value.replace(/\s+/g, "");
  if (digits.length <= 4) return digits;
  return `•••• ${digits.slice(-4)}`;
}

/** A directions link that uses exact coordinates when the booking has them and the place name otherwise. */
export function mapsDirectionsUrl(
  lat?: number | string | null,
  lng?: number | string | null,
  fallbackText?: string
): string {
  const latitude = Number(lat);
  const longitude = Number(lng);
  const hasCoords = lat != null && lng != null && Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
  const destination = hasCoords ? `${latitude},${longitude}` : encodeURIComponent(fallbackText || "");
  return `https://www.google.com/maps/dir/?api=1&destination=${destination}`;
}

export function hasCoordinates(lat?: number | string | null, lng?: number | string | null): boolean {
  const latitude = Number(lat);
  const longitude = Number(lng);
  return lat != null && lng != null && Number.isFinite(latitude) && Number.isFinite(longitude) && (latitude !== 0 || longitude !== 0);
}

export interface ParsedRequestNotes {
  flight?: string;
  returnTrip?: string;
  notes?: string;
  /** True when the text came from the older inquiry flow, which wrote route details into the notes. */
  fromLegacyInquiry: boolean;
}

const NONE_VALUES = new Set(["", "none", "n/a", "-"]);

/**
 * Customer requests are one text column. The transport form writes labelled lines
 * ("Flight:", "Return trip:", "Notes:"); bookings created through the older inquiry flow
 * contain a block of route details instead. Both are turned into the same shape here.
 */
export function parseRequestNotes(raw?: string | null): ParsedRequestNotes | null {
  const text = (raw || "").trim();
  if (!text) return null;

  const isLegacy = /Pickup Location:/i.test(text) && /Destination Location:/i.test(text);

  if (isLegacy) {
    const grab = (label: string) => {
      const match = text.match(new RegExp(`^${label}:\\s*(.+)$`, "im"));
      return match ? match[1].trim() : "";
    };
    const tripType = grab("Trip Type");
    const context = grab("Additional Context") || grab("Surcharge Context");
    return {
      fromLegacyInquiry: true,
      returnTrip: /round-trip/i.test(tripType) ? tripType.replace(/^Round-Trip\s*/i, "").replace(/[()]/g, "").trim() || "Round trip" : undefined,
      notes: NONE_VALUES.has(context.toLowerCase()) ? undefined : context,
    };
  }

  const lines = text.split("\n");
  const result: ParsedRequestNotes = { fromLegacyInquiry: false };
  const loose: string[] = [];
  let inNotes = false;
  const noteLines: string[] = [];

  for (const line of lines) {
    const flight = !inNotes && line.match(/^Flight:\s*(.+)$/i);
    const returnTrip = !inNotes && line.match(/^Return trip:\s*(.+)$/i);
    const notes = !inNotes && line.match(/^Notes:\s*(.*)$/i);
    if (flight) result.flight = flight[1].trim();
    else if (returnTrip) result.returnTrip = returnTrip[1].trim();
    else if (notes) {
      inNotes = true;
      if (notes[1]) noteLines.push(notes[1]);
    } else if (inNotes) noteLines.push(line);
    else if (line.trim()) loose.push(line.trim());
  }

  const combined = [...loose, ...noteLines].join("\n").trim();
  if (combined) result.notes = combined;
  return result;
}

export interface FlightTrackLink {
  /** The flight number as it is looked up, e.g. "UL504". */
  flight: string;
  url: string;
}

// An airline code (2 letters, or letter+digit like "6E", or a 3-letter ICAO code) followed by the flight number,
// with an optional letter suffix: UL504, 6E123, IGO793, IGO793Y.
const FLIGHT_NUMBER = /^(?:[A-Z]{2,3}|[A-Z]\d|\d[A-Z])\d{1,4}[A-Z]?$/;

/**
 * Turns the flight number a customer typed into Flightradar24 links. Several flights ("UL504 / EK650") each get a link.
 * Anything that is not a plausible flight number (for example "will send later") gives no link rather than a broken one.
 *
 * The link is https://www.flightradar24.com/<FLIGHT>/ (for example /IGO793Y/), with the flight number in capitals.
 */
export function flightTrackLinks(raw?: string | null): FlightTrackLink[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const links: FlightTrackLink[] = [];
  for (const part of raw.split(/[\/,;&]|\band\b/i)) {
    const flight = part.replace(/[\s-]+/g, "").toUpperCase();
    if (!FLIGHT_NUMBER.test(flight) || seen.has(flight)) continue;
    seen.add(flight);
    links.push({ flight, url: `https://www.flightradar24.com/${flight}/` });
  }
  return links.slice(0, 3);
}

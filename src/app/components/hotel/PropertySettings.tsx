import { useState, useEffect, useCallback } from "react";
import {
  Settings,
  MapPin,
  Phone,
  Mail,
  Globe,
  Star,
  Building2,
  Save,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Image as ImageIcon,
  Upload,
  Trash2,
  ExternalLink,
  CreditCard,
  UserCheck,
  FileText,
  Clock,
  Compass,
  Sparkles,
  Shield,
  HelpCircle,
  MessageSquare,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import { useStayHotel, StayHotelPropertyGate } from "./StayHotelContext";
import { updateStayProperty } from "../api/stayVendorApi";

// Categorized Amenities
const CATEGORIZED_AMENITIES: Record<string, string[]> = {
  "Essentials & Connectivity": [
    "Free WiFi",
    "Air Conditioning",
    "Free Parking",
    "24h Reception",
    "Daily Housekeeping",
    "Luggage Storage",
    "Elevator",
    "Power Backup / Generator",
  ],
  "Dining & Refreshments": [
    "Restaurant",
    "Bar & Lounge",
    "Room Service",
    "Breakfast Included",
    "Coffee Shop / Cafe",
    "BBQ Facilities",
    "Special Diet Menus",
  ],
  "Wellness & Relaxation": [
    "Swimming Pool",
    "Spa & Wellness Center",
    "Fitness Center / Gym",
    "Hot Tub / Jacuzzi",
    "Sauna & Steam Bath",
    "Yoga Deck",
    "Ayurvedic Treatments",
  ],
  "Outdoors & Experiences": [
    "Beach Access",
    "Nature Walks & Hikes",
    "Safari Packages",
    "Bicycle Rental",
    "Private Garden",
    "Terrace & Sun Deck",
    "Campfire / Fire Pit",
  ],
  "Guest Services": [
    "Airport Transfer",
    "Laundry & Dry Cleaning",
    "Tour & Excursion Desk",
    "Conference Room",
    "Kids Club & Play Area",
    "Currency Exchange",
    "Doctor on Call",
  ],
};

const SPOKEN_LANGUAGES = [
  "English",
  "Sinhala",
  "Tamil",
  "German",
  "French",
  "Russian",
  "Mandarin Chinese",
  "Hindi",
  "Arabic",
];

const PAYMENT_METHODS_LIST = [
  "Cash (LKR / USD / EUR)",
  "Visa",
  "Mastercard",
  "American Express",
  "Bank Transfer",
  "Digital Wallet / QR",
];

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

function PropertySettingsContent() {
  const { selectedProperty, refreshProperties } = useStayHotel();

  // Basic info state
  const [name, setName] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [starRating, setStarRating] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [description, setDescription] = useState("");

  // Media state
  const [coverPhoto, setCoverPhoto] = useState<string>("");
  const [galleryPhotos, setGalleryPhotos] = useState<string[]>([]);

  // Location state
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [province, setProvince] = useState("");
  const [country, setCountry] = useState("Sri Lanka");
  const [postalCode, setPostalCode] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");

  // Contact state
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState("");
  const [whatsapp, setWhatsapp] = useState("");

  // Host & Management Profile
  const [hostName, setHostName] = useState("");
  const [hostTitle, setHostTitle] = useState("");
  const [hostBio, setHostBio] = useState("");
  const [spokenLanguages, setSpokenLanguages] = useState<string[]>(["English"]);

  // Payment Policy & Financials
  const [paymentPolicy, setPaymentPolicy] = useState("pay_at_property");
  const [preferredCurrency, setPreferredCurrency] = useState("LKR");
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<string[]>([
    "Cash (LKR / USD / EUR)",
    "Visa",
    "Mastercard",
  ]);

  // Business & Legal Compliance
  const [sltdaLicense, setSltdaLicense] = useState("");
  const [businessRegistrationNumber, setBusinessRegistrationNumber] = useState("");
  const [taxId, setTaxId] = useState("");

  // Arrival Guidance & Check-In
  const [keyCollectionMethod, setKeyCollectionMethod] = useState("24h Front Desk");
  const [reception24h, setReception24h] = useState(true);
  const [arrivalDirections, setArrivalDirections] = useState("");

  // Amenities
  const [amenities, setAmenities] = useState<string[]>([]);
  const [activeAmenityCategory, setActiveAmenityCategory] = useState<string>("Essentials & Connectivity");

  // UI state
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Sync form with selectedProperty
  useEffect(() => {
    if (!selectedProperty) return;

    setName(selectedProperty.name || "");
    setPropertyType(selectedProperty.propertyType || "Hotel");
    setDescription(selectedProperty.description || "");
    setAddress(selectedProperty.address || "");
    setCity(selectedProperty.city || "");
    setDistrict(selectedProperty.district || "");
    setLatitude(selectedProperty.latitude != null ? String(selectedProperty.latitude) : "");
    setLongitude(selectedProperty.longitude != null ? String(selectedProperty.longitude) : "");

    // Media
    const rawMedia = (selectedProperty.media as Array<{ url: string; role?: string; sortOrder?: number }>) || [];
    const coverItem = rawMedia.find((m) => m.role === "cover") || rawMedia[0];
    setCoverPhoto(coverItem?.url || "");
    const galleryItems = rawMedia.filter((m) => m !== coverItem && m.role !== "cover").map((m) => m.url);
    setGalleryPhotos(galleryItems);

    // Contact
    const contact = (selectedProperty.contact as Record<string, any>) || {};
    setPhone(contact.phone || "");
    setEmail(contact.email || "");
    setWebsite(contact.website || "");
    setWhatsapp(contact.whatsapp || "");
    setHostName(contact.hostName || "");
    setHostTitle(contact.hostTitle || "Property Manager");
    if (Array.isArray(contact.languages)) {
      setSpokenLanguages(contact.languages);
    }

    // Payment Policy
    setPaymentPolicy(selectedProperty.paymentPolicy || "pay_at_property");

    // Metadata
    const metadata = (selectedProperty.metadata as Record<string, any>) || {};
    setStarRating(metadata.starRating || "4 Stars");
    setTotalRooms(metadata.totalRooms ? String(metadata.totalRooms) : "");
    setProvince(metadata.province || "");
    setCountry(metadata.country || "Sri Lanka");
    setPostalCode(metadata.postalCode || "");
    setPreferredCurrency(metadata.preferredCurrency || "LKR");
    setHostBio(metadata.hostBio || "");
    setSltdaLicense(metadata.sltdaLicense || "");
    setBusinessRegistrationNumber(metadata.businessRegistrationNumber || "");
    setTaxId(metadata.taxId || "");
    setKeyCollectionMethod(metadata.keyCollectionMethod || "24h Front Desk");
    setReception24h(metadata.reception24h !== undefined ? Boolean(metadata.reception24h) : true);
    setArrivalDirections(metadata.arrivalDirections || "");

    if (Array.isArray(metadata.acceptedPaymentMethods)) {
      setAcceptedPaymentMethods(metadata.acceptedPaymentMethods);
    }

    // Amenities (pull from metadata or relational amenities)
    const existingAmenities =
      Array.isArray(metadata.amenities) && metadata.amenities.length > 0
        ? metadata.amenities
        : Array.isArray(selectedProperty.amenities)
        ? selectedProperty.amenities.map((a: any) => (typeof a === "string" ? a : a.name))
        : [];
    setAmenities(existingAmenities);
  }, [selectedProperty?.id, selectedProperty?.updatedAt]);

  // Dropzone for Cover Image
  const handleCoverDrop = useCallback(async (acceptedFiles: File[]) => {
    const [file] = acceptedFiles;
    if (!file) return;
    const dataUrl = await readFileAsDataUrl(file);
    setCoverPhoto(dataUrl);
  }, []);

  const coverDropzone = useDropzone({
    onDrop: handleCoverDrop,
    accept: { "image/*": [] },
    multiple: false,
  });

  // Dropzone for Gallery Images
  const handleGalleryDrop = useCallback(async (acceptedFiles: File[]) => {
    if (!acceptedFiles.length) return;
    const dataUrls = await Promise.all(acceptedFiles.map(readFileAsDataUrl));
    setGalleryPhotos((prev) => [...prev, ...dataUrls]);
  }, []);

  const galleryDropzone = useDropzone({
    onDrop: handleGalleryDrop,
    accept: { "image/*": [] },
    multiple: true,
  });

  const toggleAmenity = (a: string) => {
    setAmenities((prev) => (prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]));
  };

  const toggleLanguage = (lang: string) => {
    setSpokenLanguages((prev) => (prev.includes(lang) ? prev.filter((x) => x !== lang) : [...prev, lang]));
  };

  const togglePaymentMethod = (method: string) => {
    setAcceptedPaymentMethods((prev) =>
      prev.includes(method) ? prev.filter((m) => m !== method) : [...prev, method],
    );
  };

  const removeGalleryPhoto = (index: number) => {
    setGalleryPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProperty?.id) return;

    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const structuredAmenities = amenities.map((a) => ({
        name: a,
        value: true,
        category: "property",
        valueType: "boolean",
      }));

      const mediaPayload = [
        ...(coverPhoto ? [{ url: coverPhoto, role: "cover", sortOrder: 0 }] : []),
        ...galleryPhotos.map((url, idx) => ({
          url,
          role: "gallery",
          sortOrder: idx + 1,
        })),
      ];

      const payload = {
        name,
        propertyType,
        description,
        address,
        city,
        district,
        latitude: latitude ? Number(latitude) || latitude : null,
        longitude: longitude ? Number(longitude) || longitude : null,
        paymentPolicy,
        contact: {
          phone,
          email,
          website,
          whatsapp,
          hostName,
          hostTitle,
          languages: spokenLanguages,
        },
        media: mediaPayload,
        amenities: structuredAmenities,
        metadata: {
          ...((selectedProperty.metadata as Record<string, any>) || {}),
          starRating,
          totalRooms: totalRooms ? Number(totalRooms) || totalRooms : null,
          province,
          country,
          postalCode,
          amenities,
          preferredCurrency,
          acceptedPaymentMethods,
          hostBio,
          sltdaLicense,
          businessRegistrationNumber,
          taxId,
          keyCollectionMethod,
          reception24h,
          arrivalDirections,
        },
      };

      await updateStayProperty(selectedProperty.id, payload as any, {
        existingProperty: selectedProperty,
      });
      await refreshProperties();
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      console.error("Failed to update property settings:", err);
      setSaveError(err.message || "Failed to update property settings. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const publicListingUrl = selectedProperty?.listingId
    ? `http://localhost:5173/stays/${selectedProperty.listingId}`
    : selectedProperty?.id
    ? `http://localhost:5173/stays/${selectedProperty.id}`
    : null;

  const currentStatus = (selectedProperty?.status || "draft").toLowerCase();

  return (
    <form onSubmit={handleSave} className="p-6 space-y-6 max-w-[1050px]">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Settings size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[11px] uppercase tracking-widest font-semibold" style={{ color: "var(--accent-navy-light)" }}>
              Property Profile & Identity
            </span>

            {/* Status Badge */}
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold uppercase tracking-wider ml-2"
              style={{
                background:
                  currentStatus === "published"
                    ? "rgba(34, 197, 94, 0.15)"
                    : currentStatus === "approved"
                    ? "rgba(59, 130, 246, 0.15)"
                    : currentStatus === "submitted"
                    ? "rgba(245, 158, 11, 0.15)"
                    : "rgba(148, 163, 184, 0.15)",
                color:
                  currentStatus === "published"
                    ? "#22c55e"
                    : currentStatus === "approved"
                    ? "#3b82f6"
                    : currentStatus === "submitted"
                    ? "#f59e0b"
                    : "#94a3b8",
                border: `1px solid ${
                  currentStatus === "published"
                    ? "rgba(34, 197, 94, 0.3)"
                    : currentStatus === "approved"
                    ? "rgba(59, 130, 246, 0.3)"
                    : currentStatus === "submitted"
                    ? "rgba(245, 158, 11, 0.3)"
                    : "rgba(148, 163, 184, 0.3)"
                }`,
              }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full"
                style={{
                  background:
                    currentStatus === "published"
                      ? "#22c55e"
                      : currentStatus === "approved"
                      ? "#3b82f6"
                      : currentStatus === "submitted"
                      ? "#f59e0b"
                      : "#94a3b8",
                }}
              />
              {currentStatus === "published"
                ? "Live / Published"
                : currentStatus === "approved"
                ? "Approved"
                : currentStatus === "submitted"
                ? "Under Review"
                : "Draft"}
            </span>
          </div>

          <h1 className="text-[22px]" style={{ color: "var(--text-primary)", fontWeight: 700 }}>
            {name || selectedProperty?.name || "Property Profile"}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          {publicListingUrl && (
            <a
              href={publicListingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-[12px] font-semibold transition-all"
              style={{
                background: "var(--bg-panel)",
                color: "var(--text-secondary)",
                border: "1px solid var(--border-light)",
              }}
            >
              <ExternalLink size={14} />
              <span>Preview Guest View</span>
            </a>
          )}

          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-[13px] font-semibold transition-all disabled:opacity-50"
            style={{
              background: saveSuccess ? "rgba(34,197,94,0.18)" : "var(--accent-navy)",
              color: saveSuccess ? "#4ade80" : "white",
              border: saveSuccess ? "1px solid rgba(34,197,94,0.35)" : "1px solid var(--border-accent)",
              boxShadow: saveSuccess ? "none" : "0 4px 14px rgba(59, 130, 246, 0.25)",
            }}
          >
            {saving ? (
              <>
                <Loader2 size={15} className="animate-spin" />
                <span>Saving...</span>
              </>
            ) : saveSuccess ? (
              <>
                <CheckCircle2 size={15} />
                <span>Saved!</span>
              </>
            ) : (
              <>
                <Save size={15} />
                <span>Save Changes</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Admin Review Feedback Banner */}
      {selectedProperty?.applicationNote && (
        <div
          className="p-4 rounded-xl border flex items-start gap-3.5"
          style={{
            background: "rgba(245, 158, 11, 0.08)",
            borderColor: "rgba(245, 158, 11, 0.25)",
            color: "#f59e0b",
          }}
        >
          <MessageSquare size={18} className="shrink-0 mt-0.5" />
          <div>
            <div className="text-[13px] font-bold mb-1">Admin Audit Feedback / Action Items</div>
            <p className="text-[12px] leading-relaxed text-slate-300">{selectedProperty.applicationNote}</p>
          </div>
        </div>
      )}

      {saveError && (
        <div className="p-3.5 rounded-xl border flex items-center gap-2.5 bg-red-500/10 border-red-500/25 text-red-400 text-[13px]">
          <AlertCircle size={16} className="shrink-0" />
          <span>{saveError}</span>
        </div>
      )}

      {/* 1. Photos & Media Gallery */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <ImageIcon size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Property Photos & Media
            </span>
          </div>
          <span className="text-[12px]" style={{ color: "var(--text-tertiary)" }}>
            {galleryPhotos.length + (coverPhoto ? 1 : 0)} photos uploaded
          </span>
        </div>
        <div className="p-5 space-y-6">
          {/* Cover Photo */}
          <div>
            <label className="text-[11px] font-semibold block mb-2" style={{ color: "var(--text-secondary)" }}>
              Cover Photo (Hero Banner & Search Thumbnail)
            </label>
            {coverPhoto ? (
              <div className="relative inline-block group">
                <img
                  src={coverPhoto}
                  alt="Cover preview"
                  className="w-full max-w-[420px] h-[210px] object-cover rounded-xl border"
                  style={{ borderColor: "var(--border-light)" }}
                />
                <button
                  type="button"
                  onClick={() => setCoverPhoto("")}
                  className="absolute top-2.5 right-2.5 p-2 rounded-lg bg-black/70 hover:bg-red-600 text-white transition-colors"
                  title="Remove cover photo"
                >
                  <Trash2 size={14} />
                </button>
                <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-md bg-black/70 text-[11px] font-medium text-white flex items-center gap-1.5">
                  <Star size={12} className="text-amber-400 fill-amber-400" />
                  <span>Primary Cover</span>
                </div>
              </div>
            ) : (
              <div
                {...coverDropzone.getRootProps()}
                className="w-full max-w-[420px] h-[160px] rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-4 text-center cursor-pointer transition-colors"
                style={{
                  background: coverDropzone.isDragActive ? "var(--active-overlay)" : "var(--bg-panel)",
                  borderColor: coverDropzone.isDragActive ? "var(--border-accent)" : "var(--border-light)",
                }}
              >
                <input {...coverDropzone.getInputProps()} />
                <Upload size={22} className="mb-2" style={{ color: "var(--accent-navy-light)" }} />
                <p className="text-[13px] font-medium" style={{ color: "var(--text-primary)" }}>
                  Upload Cover Photo
                </p>
                <p className="text-[11px] mt-1" style={{ color: "var(--text-tertiary)" }}>
                  Drag & drop or click to browse (PNG, JPG, WebP)
                </p>
              </div>
            )}
          </div>

          {/* Gallery Photos */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-[11px] font-semibold block" style={{ color: "var(--text-secondary)" }}>
                Property Photo Gallery
              </label>
              <span className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>
                High-resolution photos increase bookings by up to 40%
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-3">
              {galleryPhotos.map((url, idx) => (
                <div key={idx} className="relative group rounded-xl overflow-hidden aspect-[4/3] border" style={{ borderColor: "var(--border-light)" }}>
                  <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => removeGalleryPhoto(idx)}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Delete image"
                  >
                    <Trash2 size={13} />
                  </button>
                  <div className="absolute bottom-1.5 left-2 text-[10px] text-white/80 font-mono bg-black/60 px-1.5 py-0.5 rounded">
                    #{idx + 1}
                  </div>
                </div>
              ))}

              <div
                {...galleryDropzone.getRootProps()}
                className="rounded-xl border-2 border-dashed flex flex-col items-center justify-center p-3 text-center cursor-pointer transition-colors aspect-[4/3]"
                style={{
                  background: galleryDropzone.isDragActive ? "var(--active-overlay)" : "var(--bg-panel)",
                  borderColor: galleryDropzone.isDragActive ? "var(--border-accent)" : "var(--border-light)",
                }}
              >
                <input {...galleryDropzone.getInputProps()} />
                <Upload size={18} className="mb-1" style={{ color: "var(--accent-navy-light)" }} />
                <span className="text-[12px] font-semibold" style={{ color: "var(--text-primary)" }}>
                  Add Photos
                </span>
                <span className="text-[10px] mt-0.5" style={{ color: "var(--text-tertiary)" }}>
                  Drop files here
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Basic Info */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Building2 size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Property Information
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Property Name *
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Jetwing Yala, Ella Nature Villa"
              required
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Property Type
            </label>
            <select
              value={propertyType}
              onChange={(e) => setPropertyType(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="Hotel">Hotel</option>
              <option value="Resort">Resort</option>
              <option value="Villa">Villa / Boutique Villa</option>
              <option value="Homestay">Homestay / Guesthouse</option>
              <option value="Eco Lodge">Eco Lodge</option>
              <option value="Apartment">Serviced Apartment</option>
              <option value="Safari Camp">Safari Camp / Glamping</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Star Rating / Category
            </label>
            <select
              value={starRating}
              onChange={(e) => setStarRating(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            >
              <option value="5 Stars">5 Stars ★★★★★</option>
              <option value="4 Stars">4 Stars ★★★★</option>
              <option value="3 Stars">3 Stars ★★★</option>
              <option value="Boutique / Luxury">Boutique / Luxury</option>
              <option value="Heritage / Historic">Heritage / Historic</option>
              <option value="Standard">Standard / Budget</option>
            </select>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Total Number of Units / Rooms
            </label>
            <input
              type="number"
              value={totalRooms}
              onChange={(e) => setTotalRooms(e.target.value)}
              placeholder="e.g. 12"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div className="md:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Tell guests about your property, location ambiance, view, architecture, and unique experiences..."
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none transition-colors"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* 3. Location & Geospatial */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <MapPin size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Location & Coordinates
            </span>
          </div>

          {latitude && longitude && (
            <a
              href={`https://www.google.com/maps?q=${latitude},${longitude}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[12px] font-medium flex items-center gap-1 text-blue-400 hover:underline"
            >
              <Compass size={13} />
              <span>Verify on Google Maps</span>
            </a>
          )}
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Street Address
            </label>
            <input
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. 124 Beach Road, Yala"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              City
            </label>
            <input
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Yala, Ella, Galle"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              District
            </label>
            <input
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              placeholder="e.g. Hambantota, Badulla, Galle"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Province
            </label>
            <input
              value={province}
              onChange={(e) => setProvince(e.target.value)}
              placeholder="e.g. Southern Province, Uva Province"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Postal Code
            </label>
            <input
              value={postalCode}
              onChange={(e) => setPostalCode(e.target.value)}
              placeholder="e.g. 82000"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Latitude
            </label>
            <input
              value={latitude}
              onChange={(e) => setLatitude(e.target.value)}
              placeholder="e.g. 6.3829"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Longitude
            </label>
            <input
              value={longitude}
              onChange={(e) => setLongitude(e.target.value)}
              placeholder="e.g. 81.5052"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* 4. Payment Policy & Financials */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <CreditCard size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Payment Policy & Settlement
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Default Payment Policy
              </label>
              <select
                value={paymentPolicy}
                onChange={(e) => setPaymentPolicy(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              >
                <option value="pay_at_property">Pay at Property (Direct Settlement upon arrival)</option>
                <option value="online_payment">Online Prepayment (Full payment via platform)</option>
                <option value="deposit_at_booking">Deposit Required (Advance partial deposit + rest on-site)</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Base Pricing Currency
              </label>
              <select
                value={preferredCurrency}
                onChange={(e) => setPreferredCurrency(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none transition-colors"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              >
                <option value="LKR">LKR — Sri Lankan Rupee</option>
                <option value="USD">USD — United States Dollar</option>
                <option value="EUR">EUR — Euro</option>
                <option value="GBP">GBP — British Pound</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
              Payment Methods Accepted on Property
            </label>
            <div className="flex flex-wrap gap-2">
              {PAYMENT_METHODS_LIST.map((method) => {
                const active = acceptedPaymentMethods.includes(method);
                return (
                  <button
                    type="button"
                    key={method}
                    onClick={() => togglePaymentMethod(method)}
                    className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                    style={{
                      background: active ? "var(--active-overlay)" : "var(--bg-panel)",
                      color: active ? "var(--accent-navy-light)" : "var(--text-secondary)",
                      border: `1px solid ${active ? "var(--border-accent)" : "var(--border-light)"}`,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {method}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 5. Host & Management Profile */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <UserCheck size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Host & Management Profile
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Host / Property Manager Name
              </label>
              <input
                value={hostName}
                onChange={(e) => setHostName(e.target.value)}
                placeholder="e.g. Rohan Senanayake"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>

            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Host Role / Designation
              </label>
              <input
                value={hostTitle}
                onChange={(e) => setHostTitle(e.target.value)}
                placeholder="e.g. General Manager, Resident Host"
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Host Welcome Bio & Philosophy
              </label>
              <textarea
                value={hostBio}
                onChange={(e) => setHostBio(e.target.value)}
                rows={2}
                placeholder="Share a short welcome message or the history of this family/boutique property with your guests..."
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-2" style={{ color: "var(--text-secondary)" }}>
              Languages Spoken by Staff
            </label>
            <div className="flex flex-wrap gap-2">
              {SPOKEN_LANGUAGES.map((lang) => {
                const active = spokenLanguages.includes(lang);
                return (
                  <button
                    type="button"
                    key={lang}
                    onClick={() => toggleLanguage(lang)}
                    className="px-3 py-1.5 rounded-lg text-[12px] transition-all"
                    style={{
                      background: active ? "var(--active-overlay)" : "var(--bg-panel)",
                      color: active ? "var(--accent-navy-light)" : "var(--text-secondary)",
                      border: `1px solid ${active ? "var(--border-accent)" : "var(--border-light)"}`,
                      fontWeight: active ? 600 : 400,
                    }}
                  >
                    {lang}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* 6. Contact Details */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Phone size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Contact & Reservation Desk
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Phone Number
            </label>
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. +94 47 223 9000"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. reservations@hotel.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Official Website
            </label>
            <input
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
              placeholder="e.g. https://www.yourhotel.com"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              WhatsApp Contact
            </label>
            <input
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              placeholder="e.g. +94 77 123 4567"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* 7. Categorized Amenities */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <Sparkles size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Property Amenities & Facilities
            </span>
          </div>
          <span className="text-[12px] font-semibold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-500/20">
            {amenities.length} selected
          </span>
        </div>

        {/* Category Selector Tabs */}
        <div className="p-4 border-b flex gap-2 overflow-x-auto" style={{ borderColor: "var(--border-light)", background: "rgba(0,0,0,0.1)" }}>
          {Object.keys(CATEGORIZED_AMENITIES).map((cat) => {
            const countInCat = CATEGORIZED_AMENITIES[cat].filter((item) => amenities.includes(item)).length;
            const isSelected = activeAmenityCategory === cat;
            return (
              <button
                type="button"
                key={cat}
                onClick={() => setActiveAmenityCategory(cat)}
                className="px-3.5 py-1.5 rounded-lg text-[12px] font-medium transition-all whitespace-nowrap flex items-center gap-1.5"
                style={{
                  background: isSelected ? "var(--accent-navy)" : "transparent",
                  color: isSelected ? "white" : "var(--text-secondary)",
                  border: isSelected ? "1px solid var(--border-accent)" : "1px solid transparent",
                }}
              >
                <span>{cat}</span>
                {countInCat > 0 && (
                  <span
                    className="text-[10px] px-1.5 py-0.2 rounded-full"
                    style={{
                      background: isSelected ? "rgba(255,255,255,0.25)" : "var(--bg-panel)",
                      color: isSelected ? "white" : "var(--text-primary)",
                    }}
                  >
                    {countInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Amenity Pills for Selected Category */}
        <div className="p-5 flex flex-wrap gap-2.5">
          {CATEGORIZED_AMENITIES[activeAmenityCategory]?.map((a) => {
            const active = amenities.includes(a);
            return (
              <button
                type="button"
                key={a}
                onClick={() => toggleAmenity(a)}
                className="px-3.5 py-2 rounded-xl text-[12px] transition-all flex items-center gap-2"
                style={{
                  background: active ? "var(--active-overlay)" : "var(--bg-panel)",
                  color: active ? "var(--accent-navy-light)" : "var(--text-secondary)",
                  border: `1px solid ${active ? "var(--border-accent)" : "var(--border-light)"}`,
                  fontWeight: active ? 600 : 400,
                  boxShadow: active ? "inset 0 0 0 1px var(--border-accent)" : "none",
                }}
              >
                <div
                  className="w-3.5 h-3.5 rounded flex items-center justify-center text-[10px]"
                  style={{
                    background: active ? "var(--accent-navy)" : "rgba(255,255,255,0.08)",
                    color: "white",
                  }}
                >
                  {active ? "✓" : "+"}
                </div>
                <span>{a}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 8. Business & Legal Compliance */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center justify-between" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <div className="flex items-center gap-2">
            <Shield size={15} style={{ color: "var(--accent-navy-light)" }} />
            <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              Business Registration & Legal Compliance
            </span>
          </div>
          <span className="text-[11px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Direct Payouts Ready
          </span>
        </div>
        <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              SLTDA License Number
            </label>
            <input
              value={sltdaLicense}
              onChange={(e) => setSltdaLicense(e.target.value)}
              placeholder="e.g. SLTDA/SQA/PRO/0129"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Business Registration (BRN)
            </label>
            <input
              value={businessRegistrationNumber}
              onChange={(e) => setBusinessRegistrationNumber(e.target.value)}
              placeholder="e.g. PV/104928"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>

          <div>
            <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
              Tax / VAT Identification
            </label>
            <input
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              placeholder="e.g. 109283746-7000"
              className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
              style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
            />
          </div>
        </div>
      </div>

      {/* 9. Arrival Guidance & Check-In */}
      <div className="rounded-xl overflow-hidden" style={{ background: "var(--bg-card)", border: "1px solid var(--border-light)" }}>
        <div className="px-5 py-4 flex items-center gap-2" style={{ borderBottom: "1px solid var(--border-light)", background: "var(--bg-panel)" }}>
          <Clock size={15} style={{ color: "var(--accent-navy-light)" }} />
          <span className="text-[14px]" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
            Arrival Guidance & Key Handover
          </span>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Key Handover / Check-In Method
              </label>
              <select
                value={keyCollectionMethod}
                onChange={(e) => setKeyCollectionMethod(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              >
                <option value="24h Front Desk">24h Front Desk / Receptionist</option>
                <option value="Host Greeting">Host In-Person Greeting</option>
                <option value="Lockbox">Key Safe / Lockbox (Code sent before arrival)</option>
                <option value="Digital Smart Lock">Smart Lock / Keyless Entry</option>
              </select>
            </div>

            <div className="flex items-center gap-3 pt-6">
              <input
                type="checkbox"
                id="reception24h"
                checked={reception24h}
                onChange={(e) => setReception24h(e.target.checked)}
                className="w-4 h-4 rounded cursor-pointer accent-blue-600"
              />
              <label htmlFor="reception24h" className="text-[13px] font-medium cursor-pointer" style={{ color: "var(--text-primary)" }}>
                24-Hour Reception Desk Available
              </label>
            </div>

            <div className="md:col-span-2">
              <label className="text-[11px] font-medium block mb-1.5" style={{ color: "var(--text-secondary)" }}>
                Directions from Nearest Airport / Station
              </label>
              <textarea
                value={arrivalDirections}
                onChange={(e) => setArrivalDirections(e.target.value)}
                rows={2}
                placeholder="e.g. 15 minutes by tuk-tuk from Ella Railway Station; turn right at the tea factory onto Kithalella road."
                className="w-full px-3.5 py-2.5 rounded-lg text-[13px] outline-none resize-none"
                style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
              />
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}

export function PropertySettings() {
  return (
    <StayHotelPropertyGate>
      <PropertySettingsContent />
    </StayHotelPropertyGate>
  );
}

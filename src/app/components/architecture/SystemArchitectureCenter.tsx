import { useState } from "react";
import {
  Database,
  Users,
  Package,
  CreditCard,
  Building2,
  Car,
  DollarSign,
  MessageSquare,
  BarChart3,
  ChevronDown,
  ChevronRight,
  Key,
  Link2,
  Table,
  ArrowRight,
  Layers,
} from "lucide-react";

// Define system modules
const SYSTEM_MODULES = [
  {
    id: "users",
    name: "Users System",
    icon: Users,
    color: "#3b82f6",
    entities: [
      {
        name: "users",
        fields: ["id (PK)", "email", "name", "role", "status", "created_at"],
        relationships: [
          { type: "1:M", target: "vendors", label: "can become" },
          { type: "1:M", target: "admins", label: "can become" },
        ],
      },
      {
        name: "admins",
        fields: ["id (PK)", "user_id (FK)", "permissions", "created_at"],
        relationships: [{ type: "M:1", target: "users", label: "belongs to" }],
      },
      {
        name: "vendors",
        fields: ["id (PK)", "user_id (FK)", "business_name", "status", "approved_categories"],
        relationships: [
          { type: "M:1", target: "users", label: "belongs to" },
          { type: "1:M", target: "listings", label: "owns" },
        ],
      },
      {
        name: "customers",
        fields: ["id (PK)", "user_id (FK)", "preferences", "created_at"],
        relationships: [
          { type: "M:1", target: "users", label: "extends" },
          { type: "1:M", target: "bookings", label: "creates" },
        ],
      },
    ],
  },
  {
    id: "listings",
    name: "Listings System",
    icon: Package,
    color: "#8b5cf6",
    entities: [
      {
        name: "listings",
        fields: ["id (PK)", "vendor_id (FK)", "title", "category", "status", "created_at"],
        relationships: [
          { type: "M:1", target: "vendors", label: "owned by" },
          { type: "1:M", target: "listing_media", label: "has" },
          { type: "1:M", target: "pricing_variants", label: "has" },
          { type: "1:M", target: "booking_items", label: "referenced in" },
        ],
      },
      {
        name: "stays",
        fields: ["listing_id (PK, FK)", "property_type", "bedrooms", "amenities"],
        relationships: [{ type: "1:1", target: "listings", label: "extends" }],
      },
      {
        name: "tours",
        fields: ["listing_id (PK, FK)", "duration", "difficulty", "max_group_size"],
        relationships: [{ type: "1:1", target: "listings", label: "extends" }],
      },
      {
        name: "safaris",
        fields: ["listing_id (PK, FK)", "wildlife_focus", "vehicle_type", "guide_included"],
        relationships: [{ type: "1:1", target: "listings", label: "extends" }],
      },
      {
        name: "experiences",
        fields: ["listing_id (PK, FK)", "activity_type", "duration", "included_items"],
        relationships: [{ type: "1:1", target: "listings", label: "extends" }],
      },
      {
        name: "transfers",
        fields: ["listing_id (PK, FK)", "vehicle_category", "route", "capacity"],
        relationships: [{ type: "1:1", target: "listings", label: "extends" }],
      },
      {
        name: "listing_media",
        fields: ["id (PK)", "listing_id (FK)", "type", "url", "order"],
        relationships: [{ type: "M:1", target: "listings", label: "belongs to" }],
      },
      {
        name: "pricing_variants",
        fields: ["id (PK)", "listing_id (FK)", "name", "price", "conditions"],
        relationships: [{ type: "M:1", target: "listings", label: "belongs to" }],
      },
    ],
  },
  {
    id: "bookings",
    name: "Booking System",
    icon: Layers,
    color: "#10b981",
    entities: [
      {
        name: "bookings",
        fields: ["id (PK)", "customer_id (FK)", "total_amount", "status", "created_at"],
        relationships: [
          { type: "M:1", target: "customers", label: "created by" },
          { type: "1:M", target: "booking_items", label: "contains" },
          { type: "1:M", target: "booking_payments", label: "has" },
          { type: "1:1", target: "cancellations", label: "may have" },
        ],
      },
      {
        name: "booking_items",
        fields: ["id (PK)", "booking_id (FK)", "listing_id (FK)", "quantity", "price"],
        relationships: [
          { type: "M:1", target: "bookings", label: "part of" },
          { type: "M:1", target: "listings", label: "references" },
        ],
      },
      {
        name: "booking_payments",
        fields: ["id (PK)", "booking_id (FK)", "amount", "status", "payment_method"],
        relationships: [
          { type: "M:1", target: "bookings", label: "for" },
          { type: "1:1", target: "payments", label: "creates" },
        ],
      },
      {
        name: "refunds",
        fields: ["id (PK)", "booking_id (FK)", "amount", "reason", "status"],
        relationships: [{ type: "M:1", target: "bookings", label: "for" }],
      },
      {
        name: "cancellations",
        fields: ["id (PK)", "booking_id (FK)", "reason", "refund_amount", "cancelled_at"],
        relationships: [{ type: "1:1", target: "bookings", label: "cancels" }],
      },
    ],
  },
  {
    id: "vendor",
    name: "Vendor System",
    icon: Building2,
    color: "#f59e0b",
    entities: [
      {
        name: "vendors",
        fields: ["id (PK)", "user_id (FK)", "business_name", "status"],
        relationships: [
          { type: "1:M", target: "vendor_documents", label: "has" },
          { type: "M:M", target: "vendor_categories", label: "approved for" },
          { type: "1:M", target: "vendor_payouts", label: "receives" },
          { type: "1:M", target: "vendor_reviews", label: "receives" },
        ],
      },
      {
        name: "vendor_documents",
        fields: ["id (PK)", "vendor_id (FK)", "document_type", "url", "verified"],
        relationships: [{ type: "M:1", target: "vendors", label: "belongs to" }],
      },
      {
        name: "vendor_categories",
        fields: ["vendor_id (FK)", "category", "approved_at"],
        relationships: [{ type: "M:M", target: "vendors", label: "junction table" }],
      },
      {
        name: "vendor_payouts",
        fields: ["id (PK)", "vendor_id (FK)", "amount", "status", "paid_at"],
        relationships: [{ type: "M:1", target: "vendors", label: "paid to" }],
      },
      {
        name: "vendor_reviews",
        fields: ["id (PK)", "vendor_id (FK)", "rating", "comment", "created_at"],
        relationships: [{ type: "M:1", target: "vendors", label: "for" }],
      },
    ],
  },
  {
    id: "hotel",
    name: "Hotel Operations System",
    icon: Building2,
    color: "#ec4899",
    entities: [
      {
        name: "room_types",
        fields: ["id (PK)", "listing_id (FK)", "name", "capacity", "base_price"],
        relationships: [
          { type: "M:1", target: "stays", label: "for property" },
          { type: "1:M", target: "room_inventory", label: "has" },
        ],
      },
      {
        name: "room_inventory",
        fields: ["id (PK)", "room_type_id (FK)", "room_number", "floor", "status"],
        relationships: [
          { type: "M:1", target: "room_types", label: "of type" },
          { type: "1:M", target: "reservations", label: "booked in" },
        ],
      },
      {
        name: "reservations",
        fields: ["id (PK)", "room_id (FK)", "booking_id (FK)", "check_in", "check_out"],
        relationships: [
          { type: "M:1", target: "room_inventory", label: "for room" },
          { type: "M:1", target: "bookings", label: "linked to" },
        ],
      },
      {
        name: "availability_calendar",
        fields: ["id (PK)", "room_type_id (FK)", "date", "available_count", "price"],
        relationships: [{ type: "M:1", target: "room_types", label: "for" }],
      },
      {
        name: "seasonal_pricing",
        fields: ["id (PK)", "listing_id (FK)", "season", "start_date", "end_date", "multiplier"],
        relationships: [{ type: "M:1", target: "stays", label: "applies to" }],
      },
    ],
  },
  {
    id: "transport",
    name: "Transport System",
    icon: Car,
    color: "#06b6d4",
    entities: [
      {
        name: "vehicle_categories",
        fields: ["id (PK)", "name", "capacity", "features"],
        relationships: [{ type: "1:M", target: "transfers", label: "used in" }],
      },
      {
        name: "transport_routes",
        fields: ["id (PK)", "origin", "destination", "distance", "base_price"],
        relationships: [{ type: "1:M", target: "transport_bookings", label: "available for" }],
      },
      {
        name: "transport_bookings",
        fields: ["id (PK)", "booking_id (FK)", "route_id (FK)", "pickup_time", "passengers"],
        relationships: [
          { type: "M:1", target: "bookings", label: "part of" },
          { type: "M:1", target: "transport_routes", label: "on route" },
        ],
      },
    ],
  },
  {
    id: "finance",
    name: "Finance System",
    icon: DollarSign,
    color: "#eab308",
    entities: [
      {
        name: "payments",
        fields: ["id (PK)", "booking_id (FK)", "amount", "status", "payment_method"],
        relationships: [
          { type: "M:1", target: "bookings", label: "for" },
          { type: "1:1", target: "commissions", label: "generates" },
        ],
      },
      {
        name: "commissions",
        fields: ["id (PK)", "payment_id (FK)", "vendor_id (FK)", "rate", "amount"],
        relationships: [
          { type: "1:1", target: "payments", label: "from" },
          { type: "M:1", target: "vendors", label: "to vendor" },
        ],
      },
      {
        name: "payouts",
        fields: ["id (PK)", "vendor_id (FK)", "amount", "status", "paid_at"],
        relationships: [{ type: "M:1", target: "vendors", label: "to" }],
      },
      {
        name: "invoices",
        fields: ["id (PK)", "booking_id (FK)", "invoice_number", "total", "generated_at"],
        relationships: [{ type: "M:1", target: "bookings", label: "for" }],
      },
      {
        name: "refunds",
        fields: ["id (PK)", "payment_id (FK)", "amount", "reason", "processed_at"],
        relationships: [{ type: "M:1", target: "payments", label: "reverses" }],
      },
    ],
  },
  {
    id: "support",
    name: "Support System",
    icon: MessageSquare,
    color: "#f97316",
    entities: [
      {
        name: "support_tickets",
        fields: ["id (PK)", "user_id (FK)", "subject", "status", "priority", "created_at"],
        relationships: [
          { type: "M:1", target: "users", label: "created by" },
          { type: "1:M", target: "support_messages", label: "contains" },
        ],
      },
      {
        name: "support_messages",
        fields: ["id (PK)", "ticket_id (FK)", "sender_id (FK)", "message", "sent_at"],
        relationships: [
          { type: "M:1", target: "support_tickets", label: "in ticket" },
          { type: "M:1", target: "users", label: "from" },
        ],
      },
      {
        name: "audit_logs",
        fields: ["id (PK)", "user_id (FK)", "action", "entity_type", "entity_id", "timestamp"],
        relationships: [{ type: "M:1", target: "users", label: "performed by" }],
      },
      {
        name: "notifications",
        fields: ["id (PK)", "user_id (FK)", "type", "message", "read", "created_at"],
        relationships: [{ type: "M:1", target: "users", label: "sent to" }],
      },
    ],
  },
  {
    id: "analytics",
    name: "Analytics System",
    icon: BarChart3,
    color: "#a855f7",
    entities: [
      {
        name: "analytics_events",
        fields: ["id (PK)", "event_type", "user_id (FK)", "metadata", "timestamp"],
        relationships: [{ type: "M:1", target: "users", label: "tracked for" }],
      },
      {
        name: "booking_metrics",
        fields: ["id (PK)", "date", "total_bookings", "revenue", "avg_value"],
        relationships: [],
      },
      {
        name: "revenue_metrics",
        fields: ["id (PK)", "vendor_id (FK)", "period", "revenue", "commission"],
        relationships: [{ type: "M:1", target: "vendors", label: "for" }],
      },
      {
        name: "vendor_metrics",
        fields: ["id (PK)", "vendor_id (FK)", "date", "views", "bookings", "conversion_rate"],
        relationships: [{ type: "M:1", target: "vendors", label: "tracks" }],
      },
    ],
  },
];

// Architecture layers
const ARCHITECTURE_LAYERS = [
  {
    name: "Frontend Layer",
    description: "React + Tailwind UI",
    items: ["Customer App", "Vendor Portal", "Admin Dashboard"],
  },
  {
    name: "API Layer",
    description: "REST/GraphQL Endpoints",
    items: ["Authentication", "Bookings API", "Listings API", "Payments API"],
  },
  {
    name: "Business Logic",
    description: "Application Services",
    items: ["Booking Engine", "Payment Processing", "Notification Service", "Analytics Engine"],
  },
  {
    name: "Database Layer",
    description: "PostgreSQL",
    items: ["Entity Tables", "Relationships", "Indexes", "Constraints"],
  },
];

export function SystemArchitectureCenter() {
  const [selectedModule, setSelectedModule] = useState<string | null>(null);
  const [expandedEntities, setExpandedEntities] = useState<Record<string, boolean>>({});

  const toggleEntity = (entityName: string) => {
    setExpandedEntities((prev) => ({
      ...prev,
      [entityName]: !prev[entityName],
    }));
  };

  const selectedModuleData = SYSTEM_MODULES.find((m) => m.id === selectedModule);

  return (
    <div className="min-h-screen p-6" style={{ background: "var(--bg-main)" }}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center"
            style={{
              background: "linear-gradient(135deg, var(--accent-navy-dark), var(--accent-navy))",
              boxShadow: "0 0 24px rgba(59, 130, 246, 0.3)",
            }}
          >
            <Database size={20} className="text-white" />
          </div>
          <div>
            <h1 style={{ color: "var(--text-primary)" }}>System Architecture Center</h1>
            <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
              Complete backend entity architecture & database relationships
            </p>
          </div>
        </div>
      </div>

      {/* Architecture Layers Overview */}
      <div className="mb-8">
        <h3 className="mb-4" style={{ color: "var(--text-primary)" }}>
          Application Architecture Layers
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {ARCHITECTURE_LAYERS.map((layer, index) => (
            <div
              key={layer.name}
              className="p-5 rounded-xl border backdrop-blur-sm"
              style={{
                background: "linear-gradient(135deg, var(--bg-elevated), var(--bg-panel))",
                borderColor: "var(--border-light)",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-6 h-6 rounded-lg flex items-center justify-center text-xs"
                  style={{
                    background: "var(--accent-navy-subtle)",
                    color: "var(--accent-navy)",
                    fontWeight: 600,
                  }}
                >
                  {index + 1}
                </div>
                <h4 className="text-sm" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {layer.name}
                </h4>
              </div>
              <p className="text-xs mb-3" style={{ color: "var(--text-tertiary)" }}>
                {layer.description}
              </p>
              <div className="space-y-1.5">
                {layer.items.map((item) => (
                  <div
                    key={item}
                    className="text-xs px-2.5 py-1.5 rounded-lg"
                    style={{
                      background: "var(--bg-main)",
                      color: "var(--text-secondary)",
                      border: "1px solid var(--border-light)",
                    }}
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* System Modules Grid */}
      <div className="mb-8">
        <h3 className="mb-4" style={{ color: "var(--text-primary)" }}>
          Database System Modules
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SYSTEM_MODULES.map((module) => {
            const Icon = module.icon;
            const isSelected = selectedModule === module.id;
            return (
              <button
                key={module.id}
                onClick={() => setSelectedModule(isSelected ? null : module.id)}
                className="p-5 rounded-xl border backdrop-blur-sm text-left transition-all"
                style={{
                  background: isSelected
                    ? `linear-gradient(135deg, ${module.color}15, ${module.color}08)`
                    : "var(--bg-elevated)",
                  borderColor: isSelected ? module.color : "var(--border-light)",
                  boxShadow: isSelected ? `0 0 20px ${module.color}30` : "var(--shadow-sm)",
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{
                      background: `${module.color}20`,
                      color: module.color,
                    }}
                  >
                    <Icon size={18} />
                  </div>
                  <div
                    className="px-2.5 py-1 rounded-full text-xs"
                    style={{
                      background: `${module.color}15`,
                      color: module.color,
                      fontWeight: 600,
                    }}
                  >
                    {module.entities.length} entities
                  </div>
                </div>
                <h4 className="mb-1" style={{ color: "var(--text-primary)", fontWeight: 600 }}>
                  {module.name}
                </h4>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {module.entities.map((entity) => (
                    <span
                      key={entity.name}
                      className="text-xs px-2 py-0.5 rounded"
                      style={{
                        background: "var(--bg-main)",
                        color: "var(--text-tertiary)",
                        border: "1px solid var(--border-light)",
                      }}
                    >
                      {entity.name}
                    </span>
                  ))}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Detailed Entity View */}
      {selectedModuleData && (
        <div
          className="p-6 rounded-xl border backdrop-blur-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-medium)",
            boxShadow: "var(--shadow-lg)",
          }}
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{
                background: `${selectedModuleData.color}20`,
                color: selectedModuleData.color,
                boxShadow: `0 0 20px ${selectedModuleData.color}30`,
              }}
            >
              <selectedModuleData.icon size={24} />
            </div>
            <div>
              <h2 style={{ color: "var(--text-primary)" }}>{selectedModuleData.name}</h2>
              <p className="text-sm" style={{ color: "var(--text-secondary)" }}>
                Entity Relationship Diagram
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {selectedModuleData.entities.map((entity) => {
              const isExpanded = expandedEntities[entity.name];
              return (
                <div
                  key={entity.name}
                  className="rounded-lg border overflow-hidden"
                  style={{
                    background: "var(--bg-panel)",
                    borderColor: "var(--border-light)",
                  }}
                >
                  {/* Entity Header */}
                  <button
                    onClick={() => toggleEntity(entity.name)}
                    className="w-full px-4 py-3 flex items-center justify-between"
                    style={{
                      background: `${selectedModuleData.color}10`,
                      borderBottom: "1px solid var(--border-light)",
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      <Table size={16} style={{ color: selectedModuleData.color }} />
                      <span
                        className="font-mono text-sm"
                        style={{ color: "var(--text-primary)", fontWeight: 600 }}
                      >
                        {entity.name}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown size={16} style={{ color: "var(--text-tertiary)" }} />
                    ) : (
                      <ChevronRight size={16} style={{ color: "var(--text-tertiary)" }} />
                    )}
                  </button>

                  {/* Entity Fields */}
                  {isExpanded && (
                    <div className="p-4 space-y-3">
                      {/* Fields */}
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Key size={12} style={{ color: "var(--accent-navy)" }} />
                          <span className="text-xs" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                            FIELDS
                          </span>
                        </div>
                        <div className="space-y-1.5">
                          {entity.fields.map((field) => {
                            const isPK = field.includes("PK");
                            const isFK = field.includes("FK");
                            return (
                              <div
                                key={field}
                                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs font-mono"
                                style={{
                                  background: isPK || isFK ? "var(--accent-navy-subtle)" : "var(--bg-main)",
                                  color: isPK || isFK ? "var(--accent-navy)" : "var(--text-secondary)",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                {isPK && (
                                  <div
                                    className="px-1.5 py-0.5 rounded text-[10px]"
                                    style={{
                                      background: "var(--accent-navy)",
                                      color: "white",
                                      fontWeight: 600,
                                    }}
                                  >
                                    PK
                                  </div>
                                )}
                                {isFK && !isPK && (
                                  <div
                                    className="px-1.5 py-0.5 rounded text-[10px]"
                                    style={{
                                      background: selectedModuleData.color,
                                      color: "white",
                                      fontWeight: 600,
                                    }}
                                  >
                                    FK
                                  </div>
                                )}
                                <span>{field.replace(" (PK)", "").replace(" (FK)", "")}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Relationships */}
                      {entity.relationships.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-2">
                            <Link2 size={12} style={{ color: selectedModuleData.color }} />
                            <span className="text-xs" style={{ color: "var(--text-tertiary)", fontWeight: 600 }}>
                              RELATIONSHIPS
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            {entity.relationships.map((rel, idx) => (
                              <div
                                key={idx}
                                className="flex items-center gap-2 px-3 py-1.5 rounded text-xs"
                                style={{
                                  background: "var(--bg-main)",
                                  border: "1px solid var(--border-light)",
                                }}
                              >
                                <div
                                  className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                                  style={{
                                    background: `${selectedModuleData.color}20`,
                                    color: selectedModuleData.color,
                                    fontWeight: 600,
                                  }}
                                >
                                  {rel.type}
                                </div>
                                <ArrowRight size={12} style={{ color: "var(--text-tertiary)" }} />
                                <span className="font-mono" style={{ color: "var(--text-primary)" }}>
                                  {rel.target}
                                </span>
                                <span style={{ color: "var(--text-tertiary)" }}>({rel.label})</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* System Flow Diagram */}
      <div className="mt-8">
        <h3 className="mb-4" style={{ color: "var(--text-primary)" }}>
          Data Flow & System Integration
        </h3>
        <div
          className="p-8 rounded-xl border backdrop-blur-sm"
          style={{
            background: "var(--bg-elevated)",
            borderColor: "var(--border-light)",
            boxShadow: "var(--shadow-md)",
          }}
        >
          <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
            {/* Frontend */}
            <div className="flex-1 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background: "linear-gradient(135deg, #3b82f6, #8b5cf6)",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.4)",
                }}
              >
                <Layers size={32} className="text-white" />
              </div>
              <h4 style={{ color: "var(--text-primary)", fontWeight: 600 }}>Frontend UI</h4>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                React + Tailwind
              </p>
            </div>

            <ArrowRight size={24} style={{ color: "var(--accent-navy)" }} className="hidden lg:block" />

            {/* Backend API */}
            <div className="flex-1 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background: "linear-gradient(135deg, #10b981, #06b6d4)",
                  boxShadow: "0 0 30px rgba(16, 185, 129, 0.4)",
                }}
              >
                <Database size={32} className="text-white" />
              </div>
              <h4 style={{ color: "var(--text-primary)", fontWeight: 600 }}>Backend API</h4>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                REST/GraphQL
              </p>
            </div>

            <ArrowRight size={24} style={{ color: "var(--accent-navy)" }} className="hidden lg:block" />

            {/* Database */}
            <div className="flex-1 text-center">
              <div
                className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-3"
                style={{
                  background: "linear-gradient(135deg, #f59e0b, #f97316)",
                  boxShadow: "0 0 30px rgba(245, 158, 11, 0.4)",
                }}
              >
                <Table size={32} className="text-white" />
              </div>
              <h4 style={{ color: "var(--text-primary)", fontWeight: 600 }}>Database</h4>
              <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>
                PostgreSQL
              </p>
            </div>
          </div>

          {/* Additional Systems */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8 pt-8" style={{ borderTop: "1px solid var(--border-light)" }}>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  background: "var(--accent-navy-subtle)",
                  color: "var(--accent-navy)",
                }}
              >
                <CreditCard size={20} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Payment Gateway
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  background: "var(--accent-navy-subtle)",
                  color: "var(--accent-navy)",
                }}
              >
                <MessageSquare size={20} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Notifications
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  background: "var(--accent-navy-subtle)",
                  color: "var(--accent-navy)",
                }}
              >
                <BarChart3 size={20} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Analytics Engine
              </p>
            </div>
            <div className="text-center">
              <div
                className="w-12 h-12 rounded-lg flex items-center justify-center mx-auto mb-2"
                style={{
                  background: "var(--accent-navy-subtle)",
                  color: "var(--accent-navy)",
                }}
              >
                <Users size={20} />
              </div>
              <p className="text-xs" style={{ color: "var(--text-secondary)", fontWeight: 500 }}>
                Auth/Permissions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

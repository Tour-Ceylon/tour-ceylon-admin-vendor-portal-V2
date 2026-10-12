import re

def main():
    file_path = 'C:\\Users\\ASUS\\Desktop\\TOUR\\tour-ceylon-admin-vendor-portal-V2\\src\\app\\components\\listings\\SingleListingManager.tsx'
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. State changes and Data Fetching
    state_to_replace = """    const [monthDate, setMonthDate] = useState(() => new Date());
    const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");
    const [selectedSlot, setSelectedSlot] = useState<"ALL" | "Morning" | "Afternoon" | "Full Day">("ALL");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [blackoutDates, setBlackoutDates] = useState<Record<string, string>>({
        "2026-09-12": "Park Maintenance Blackout",
        "2026-09-20": "Heavy Monsoon Rain Closure",
    });
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [blockDateStr, setBlockDateStr] = useState("");"""

    new_state = """    const [monthDate, setMonthDate] = useState(() => new Date());
    const [statusFilter, setStatusFilter] = useState<BookingStatusFilter>("ALL");
    const [selectedSlot, setSelectedSlot] = useState<"ALL" | "Morning" | "Afternoon" | "Full Day">("ALL");
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [showBlockModal, setShowBlockModal] = useState(false);
    const [blockReason, setBlockReason] = useState("");
    const [blockStartDateStr, setBlockStartDateStr] = useState("");
    const [blockEndDateStr, setBlockEndDateStr] = useState("");
    const [selectedVariantIds, setSelectedVariantIds] = useState<string[]>([]);
    
    const [safariBookings, setSafariBookings] = useState<any[]>([]);
    const [safariBlocks, setSafariBlocks] = useState<any[]>([]);
    const [loadingData, setLoadingData] = useState(true);
    const [submittingBlock, setSubmittingBlock] = useState(false);

    useEffect(() => {
        if (!listingId) return;
        let cancelled = false;
        setLoadingData(true);
        const startStr = formatIsoDate(startOfMonth(monthDate));
        const endStr = formatIsoDate(endOfMonth(monthDate));
        
        Promise.all([
            apiFetch(`/api/v1/bookings/listing/${listingId}`).catch(() => ({ bookings: [] })),
            listSafariBlocks(listingId, startStr, endStr).catch(() => ({ blocks: [] }))
        ]).then(([bookingsRes, blocksRes]) => {
            if (cancelled) return;
            setSafariBookings(Array.isArray(bookingsRes) ? bookingsRes : (bookingsRes.bookings || []));
            setSafariBlocks(blocksRes.blocks || []);
        }).finally(() => {
            if (!cancelled) setLoadingData(false);
        });
        return () => { cancelled = true; };
    }, [listingId, monthDate]);"""

    content = content.replace(state_to_replace, new_state)

    # 2. Removing mock bookings (safariBookings mock state)
    mock_bookings = """    const [safariBookings, setSafariBookings] = useState([
        {
            id: "BK-SAF-101",
            guestName: "Alexander Wright",
            email: "alex.wright@example.com",
            phone: "+1 555-0192",
            package: "Morning Private 4x4 Jeep",
            slot: "Morning (06:00 AM)",
            date: "2026-09-06",
            passengers: 4,
            price: "$150 USD",
            paymentMethod: "Pay at Property",
            status: "CONFIRMED",
        },
        {
            id: "BK-SAF-102",
            guestName: "Elena Rostova",
            email: "elena.r@example.com",
            phone: "+44 7700 900077",
            package: "VIP Full Day Expedition Jeep",
            slot: "Full Day (06:00 AM)",
            date: "2026-09-08",
            passengers: 2,
            price: "$280 USD",
            paymentMethod: "Full Online Payment",
            status: "PENDING",
        },
        {
            id: "BK-SAF-103",
            guestName: "Marcus Vance",
            email: "marcus.v@example.com",
            phone: "+61 400 123 456",
            package: "Afternoon Private 4x4 Jeep",
            slot: "Afternoon (02:30 PM)",
            date: "2026-09-10",
            passengers: 6,
            price: "$140 USD",
            paymentMethod: "Pay at Property",
            status: "CONFIRMED",
        },
    ]);"""
    
    content = content.replace(mock_bookings, "")

    # 3. Replacing handleAddBlackout and handleRemoveBlackout
    old_handlers = """    const handleAddBlackout = () => {
        if (!blockDateStr) return;
        setBlackoutDates((prev) => ({ ...prev, [blockDateStr]: blockReason || "Vendor Blackout" }));
        setShowBlockModal(false);
        setBlockReason("");
        setBlockDateStr("");
    };

    const handleRemoveBlackout = (dateKey: string) => {
        setBlackoutDates((prev) => {
            const next = { ...prev };
            delete next[dateKey];
            return next;
        });
    };"""

    new_handlers = """    const handleAddBlackout = async () => {
        if (!blockStartDateStr || !blockEndDateStr || !listingId) return;
        setSubmittingBlock(true);
        try {
            await createSafariBlock(listingId, {
                variantIds: selectedVariantIds,
                startDate: blockStartDateStr,
                endDate: blockEndDateStr,
                reason: blockReason || "Vendor Blackout",
                blockType: "vendor_manual"
            });
            setShowBlockModal(false);
            setBlockReason("");
            setBlockStartDateStr("");
            setBlockEndDateStr("");
            setSelectedVariantIds([]);
            
            const startStr = formatIsoDate(startOfMonth(monthDate));
            const endStr = formatIsoDate(endOfMonth(monthDate));
            const blocksRes = await listSafariBlocks(listingId, startStr, endStr).catch(() => ({ blocks: [] }));
            setSafariBlocks(blocksRes.blocks || []);
        } catch (err) {
            console.error(err);
            alert("Failed to create blackout");
        } finally {
            setSubmittingBlock(false);
        }
    };

    const handleRemoveBlackout = async (blockId: string) => {
        if (!listingId) return;
        if (!window.confirm("Are you sure you want to release this blackout?")) return;
        try {
            await releaseSafariBlock(listingId, blockId);
            setSafariBlocks((prev) => prev.filter(b => b.id !== blockId));
        } catch (err) {
            console.error(err);
            alert("Failed to release blackout");
        }
    };"""

    content = content.replace(old_handlers, new_handlers)

    # 4. Map blackoutDates logic
    old_map_logic = """const blackoutReason = blackoutDates[iso];"""
    new_map_logic = """const activeBlock = safariBlocks.find(b => iso >= b.start_date && iso <= b.end_date);
                            const blackoutReason = activeBlock ? (activeBlock.reason || "Blocked") : null;"""
    content = content.replace(old_map_logic, new_map_logic)
    
    # 5. Fix Active Blackouts List rendering
    old_blackout_list = """                    {/* Active Blackouts List */}
                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <h4 className="text-[12px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>Active Date & Slot Blackouts</h4>
                        {Object.keys(blackoutDates).length === 0 ? (
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>No manual blackout dates set.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(blackoutDates).map(([dStr, rNote]) => (
                                    <div
                                        key={dStr}
                                        className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2"
                                        style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#cbd5e1" }}
                                    >
                                        <span className="font-bold">{dStr}:</span>
                                        <span>"{rNote}"</span>
                                        <button
                                            onClick={() => handleRemoveBlackout(dStr)}
                                            className="text-rose-400 hover:text-rose-300 font-bold ml-1"
                                            title="Unblock date"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>"""
    
    new_blackout_list = """                    {/* Active Blackouts List */}
                    <div className="mt-4 pt-4 border-t border-slate-700/30">
                        <h4 className="text-[12px] font-bold mb-2" style={{ color: "var(--text-primary)" }}>Active Date & Slot Blackouts</h4>
                        {safariBlocks.length === 0 ? (
                            <p className="text-[11px]" style={{ color: "var(--text-tertiary)" }}>No manual blackout dates set.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {safariBlocks.map((blk) => {
                                    const variantName = safariPackages.find((p: any) => p.id === blk.variant_id)?.name;
                                    return (
                                    <div
                                        key={blk.id}
                                        className="px-3 py-1.5 rounded-lg text-[11px] flex items-center gap-2"
                                        style={{ background: "rgba(100,116,139,0.15)", border: "1px solid rgba(100,116,139,0.3)", color: "#cbd5e1" }}
                                    >
                                        <span className="font-bold">{blk.start_date}{blk.start_date !== blk.end_date ? ` to ${blk.end_date}` : ''}:</span>
                                        <span>"{blk.reason || "Blocked"}" {variantName ? `(${variantName})` : "(All Packages)"}</span>
                                        <button
                                            onClick={() => handleRemoveBlackout(blk.id)}
                                            className="text-rose-400 hover:text-rose-300 font-bold ml-1"
                                            title="Unblock date"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )})}
                            </div>
                        )}
                    </div>"""
    content = content.replace(old_blackout_list, new_blackout_list)

    # 6. Fix Modal UI
    old_modal = """            {/* Blackout Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-md rounded-2xl p-6 space-y-4"
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>Stop Safari Date / Blackout Slot</h3>
                            <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Select Date</label>
                                <input
                                    type="date"
                                    value={blockDateStr}
                                    onChange={(e) => setBlockDateStr(e.target.value)}
                                    className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                />
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Blackout Reason</label>
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="e.g. Park maintenance, heavy rain..."
                                    className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                className="px-4 py-2 rounded-lg text-[12px]"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBlackout}
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold"
                                style={{ background: "var(--accent-navy)", color: "white" }}
                            >
                                Apply Blackout
                            </button>
                        </div>
                    </div>
                </div>
            )}"""
            
    new_modal = """            {/* Blackout Modal */}
            {showBlockModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div
                        className="w-full max-w-md rounded-2xl p-6 space-y-4"
                        style={{ background: "var(--bg-panel)", border: "1px solid var(--border-light)", boxShadow: "0 10px 30px rgba(0,0,0,0.5)" }}
                    >
                        <div className="flex items-center justify-between">
                            <h3 className="text-[16px] font-bold" style={{ color: "var(--text-primary)" }}>Stop Safari Date / Blackout Slot</h3>
                            <button onClick={() => setShowBlockModal(false)} className="text-slate-400 hover:text-white"><X size={18} /></button>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Packages to Block</label>
                                <div className="max-h-32 overflow-y-auto space-y-1 p-2 rounded-lg" style={{ background: "var(--input-background)", border: "1px solid var(--border-light)" }}>
                                    <label className="flex items-center gap-2 cursor-pointer text-[13px]">
                                        <input 
                                            type="checkbox" 
                                            checked={selectedVariantIds.length === 0}
                                            onChange={() => setSelectedVariantIds([])}
                                        />
                                        All Packages
                                    </label>
                                    {safariPackages.map((pkg: any) => (
                                        <label key={pkg.id} className="flex items-center gap-2 cursor-pointer text-[13px]">
                                            <input 
                                                type="checkbox" 
                                                checked={selectedVariantIds.includes(pkg.id)}
                                                onChange={(e) => {
                                                    if (e.target.checked) {
                                                        setSelectedVariantIds(prev => [...prev, pkg.id]);
                                                    } else {
                                                        setSelectedVariantIds(prev => prev.filter(id => id !== pkg.id));
                                                    }
                                                }}
                                            />
                                            {pkg.name}
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="flex gap-3">
                                <div className="flex-1">
                                    <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Start Date</label>
                                    <input
                                        type="date"
                                        value={blockStartDateStr}
                                        onChange={(e) => setBlockStartDateStr(e.target.value)}
                                        className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                    />
                                </div>
                                <div className="flex-1">
                                    <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>End Date</label>
                                    <input
                                        type="date"
                                        value={blockEndDateStr}
                                        onChange={(e) => setBlockEndDateStr(e.target.value)}
                                        className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                        style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[12px] font-semibold block mb-1" style={{ color: "var(--text-secondary)" }}>Blackout Reason</label>
                                <input
                                    type="text"
                                    value={blockReason}
                                    onChange={(e) => setBlockReason(e.target.value)}
                                    placeholder="e.g. Park maintenance, heavy rain..."
                                    className="w-full p-2.5 rounded-lg text-[13px] outline-none"
                                    style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-primary)" }}
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <button
                                onClick={() => setShowBlockModal(false)}
                                disabled={submittingBlock}
                                className="px-4 py-2 rounded-lg text-[12px]"
                                style={{ background: "var(--input-background)", border: "1px solid var(--border-light)", color: "var(--text-secondary)" }}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddBlackout}
                                disabled={submittingBlock || !blockStartDateStr || !blockEndDateStr}
                                className="px-4 py-2 rounded-lg text-[12px] font-semibold disabled:opacity-50"
                                style={{ background: "var(--accent-navy)", color: "white" }}
                            >
                                {submittingBlock ? "Applying..." : "Apply Blackout"}
                            </button>
                        </div>
                    </div>
                </div>
            )}"""
    content = content.replace(old_modal, new_modal)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)
        print("Success")
        
if __name__ == '__main__':
    main()

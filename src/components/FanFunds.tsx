"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Heart, FileText, UserCheck, Search, ChevronDown } from "lucide-react";
import STATIC_RECORDS_RAW from "@/data/athletes.json";

// ─── Types ────────────────────────────────────────────────────────────────────

type AthleteRecord = {
  id: string;
  icon_name: string;
  icon_source: string;
  icon_subcategory: string;
  philanthropy_name: string;
  annual_revenue: string;
  mission_statement: string;
  propublica_url: string;
  philanthropy_description: string;
  donation_url: string;
  claimed: string;
  entity_type: string;
  total_expenses: string;
  grant_expense_ratio: string;
  net_assets: string;
  image_url: string;
};

type Page = "directory" | "about" | "claim" | "contact";

type AthleteGroup = {
  icon_name: string;
  icon_subcategory: string;
  claimed: boolean;
  records: AthleteRecord[];
};

const DATA_URL = "/api/athletes";

const STATIC_RECORDS = STATIC_RECORDS_RAW as AthleteRecord[];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isClaimed(record: AthleteRecord) {
  return record.claimed?.toLowerCase() === "yes";
}

function groupRecords(records: AthleteRecord[]): AthleteGroup[] {
  const map = new Map<string, AthleteGroup>();
  for (const r of records) {
    if (!map.has(r.icon_name)) {
      map.set(r.icon_name, { icon_name: r.icon_name, icon_subcategory: r.icon_subcategory, claimed: false, records: [] });
    }
    const g = map.get(r.icon_name)!;
    if (g.records.length < 3) g.records.push(r);
    if (isClaimed(r)) g.claimed = true;
  }
  return Array.from(map.values());
}

function formatRevenue(raw: string) {
  if (!raw || raw.trim() === "") return "—";
  const n = parseFloat(raw.replace(/[^0-9.]/g, ""));
  if (isNaN(n)) return raw;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`;
  return `$${n.toLocaleString()}`;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ClaimedBadge() {
  return (
    <span className="inline-flex items-center gap-1 text-[#4a7c59]" title="Verified">
      <CheckCircle2 className="w-4 h-4 fill-[#4a7c59] text-white" />
    </span>
  );
}

// Card Front
function CardFront({ group }: { group: AthleteGroup }) {
  return (
    <div className="card-face rounded-sm h-full flex flex-col bg-[#e8dfc8] border-2 border-[#3a2e1e]">
      <div className="m-[5px] border border-[#3a2e1e] h-full flex flex-col">
        {/* header band */}
        <div className="bg-[#3a2e1e] px-2 py-1.5 flex items-center justify-between">
          {group.claimed ? (
            <CheckCircle2 className="w-3.5 h-3.5 text-white flex-shrink-0" style={{ fill: "#2e7d32" }} />
          ) : (
            <span className="w-3.5 h-3.5 flex-shrink-0" />
          )}
          <span className="text-[9px] tracking-widest uppercase text-[#c9b98a] font-sans flex-1 text-center mx-1">
            {group.icon_subcategory || "Athlete"}
          </span>
          <span className="w-3.5 h-3.5 flex-shrink-0" />
        </div>

        {/* card body — athlete name always centered, charities listed below */}
        <div className="flex-1 flex flex-col items-center justify-center text-center px-3 py-3 gap-0">
          <h3
            className="text-xl font-bold text-[#2c2c2c] leading-tight"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            {group.icon_name}
          </h3>

          {/* divider */}
          <div className="w-8 border-t border-[#b8a888] my-2.5" />

          {/* philanthropy names — the point of the whole card */}
          <div className="flex flex-col items-center gap-1.5">
            {group.records.map((r) => (
              <p
                key={r.id}
                className="text-[12px] font-semibold text-[#4a3e2e] leading-tight"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic" }}
              >
                {r.philanthropy_name}
              </p>
            ))}
          </div>
        </div>

        {/* footer band — decorative */}
        <div className="bg-[#3a2e1e] px-2 py-1.5" />
      </div>
    </div>
  );
}

// Card Back
function CardBack({ group, onDonate }: { group: AthleteGroup; onDonate: (e: React.MouseEvent) => void }) {
  return (
    <div className="card-face card-back rounded-sm h-full flex flex-col bg-[#e8dfc8] border-2 border-[#3a2e1e]">
      <div className="m-[5px] border border-[#3a2e1e] h-full flex flex-col">
        {/* header band */}
        <div className="bg-[#3a2e1e] px-2 py-1.5">
          <p className="text-center text-[9px] font-bold tracking-widest uppercase text-[#c9b98a] font-sans leading-tight">
            {group.icon_name}
          </p>
        </div>

        <div className="flex-1 flex flex-col p-3 gap-2 overflow-hidden">
          {/* one stat box per charity */}
          {group.records.map((r) => (
            <div key={r.id} className="border border-[#3a2e1e] p-2 bg-[#d6c9a8]">
              <div className="flex items-baseline justify-between mb-1">
                <p className="text-[9px] font-semibold text-[#3a2e1e] font-sans leading-tight line-clamp-1 flex-1 mr-2"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic" }}>
                  {r.philanthropy_name}
                </p>
                <span className="font-mono text-[10px] font-bold text-[#2c2c2c] flex-shrink-0">
                  {formatRevenue(r.annual_revenue)}
                </span>
              </div>
              {group.records.length === 1 && (
                <>
                  <div className="border-t border-[#b8a888] my-1.5" />
                  <p className="text-[10px] text-[#4a3e2e] font-sans leading-relaxed line-clamp-3">
                    {r.mission_statement}
                  </p>
                </>
              )}
            </div>
          ))}

          <div className="flex-1" />

          {/* donate button — links to primary charity */}
          <button
            onClick={onDonate}
            className="w-full flex items-center justify-center gap-1.5 bg-[#3a2e1e] hover:bg-[#4a7c59] text-[#c9b98a] text-[11px] tracking-widest uppercase font-sans py-2 transition-colors duration-300"
          >
            <Heart className="w-3 h-3" />
            {group.records.length > 1 ? "See All" : "Donate"}
          </button>
        </div>
      </div>
    </div>
  );
}


// Athlete Card (flip wrapper)
function AthleteCard({ group, onClick }: { group: AthleteGroup; onClick: () => void }) {
  const [flipped, setFlipped] = useState(false);

  function handleDonate(e: React.MouseEvent) {
    e.stopPropagation();
    const url = group.records[0]?.donation_url;
    if (url) window.open(url, "_blank", "noopener");
    else onClick();
  }

  return (
    <div
      className="card-wrapper cursor-pointer"
      style={{ aspectRatio: "3/4" }}
      onMouseEnter={() => setFlipped(true)}
      onMouseLeave={() => setFlipped(false)}
      onClick={onClick}
    >
      <motion.div
        className="card-inner"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.55, ease: PAGE_EASE }}
      >
        <CardFront group={group} />
        <CardBack group={group} onDonate={handleDonate} />
      </motion.div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  group,
  onClose,
  onClaim,
}: {
  group: AthleteGroup;
  onClose: () => void;
  onClaim: (name: string) => void;
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
    >
      <motion.div className="absolute inset-0 bg-[#2c2c2c]/50 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className="relative z-10 bg-[#fdfbf7] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: PAGE_EASE }}
      >
        <div className="m-4 border border-[#d4c9b0]">
          <div className="m-[3px] border border-[#d4c9b0]">
            <button
              onClick={onClose}
              className="absolute top-7 right-7 text-[#7a7060] hover:text-[#2c2c2c] transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* header */}
            <div className="border-b border-[#d4c9b0] p-6 text-center">
              <span className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans border border-[#d4c9b0] px-2 py-0.5 rounded-sm">
                {group.icon_subcategory}
              </span>
              <div className="mt-3 flex items-center justify-center gap-2">
                <h2
                  className="text-3xl font-bold text-[#2c2c2c]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {group.icon_name}
                </h2>
                {group.claimed && <ClaimedBadge />}
              </div>
            </div>

            {/* one section per charity */}
            <div className="divide-y divide-[#d4c9b0]">
              {group.records.map((record, i) => (
                <div key={record.id} className="p-6 space-y-4">
                  {/* charity name */}
                  <h3
                    className="text-xl font-semibold text-[#3a2e1e]"
                    style={{ fontFamily: "var(--font-playfair), Georgia, serif", fontStyle: "italic" }}
                  >
                    {record.philanthropy_name}
                    {group.records.length > 1 && (
                      <span className="ml-2 text-[10px] not-italic tracking-widest uppercase text-[#7a7060] font-sans align-middle">
                        #{i + 1}
                      </span>
                    )}
                  </h3>

                  {record.philanthropy_description && (
                    <p className="text-[#2c2c2c] font-sans text-sm leading-relaxed">
                      {record.philanthropy_description}
                    </p>
                  )}

                  <div className="border border-[#d4c9b0] rounded-sm">
                    <div className="flex items-center justify-between px-4 py-3 border-b border-[#d4c9b0]">
                      <span className="text-[10px] uppercase tracking-widest text-[#7a7060] font-sans">Annual Revenue</span>
                      <span className="font-mono text-base font-bold text-[#2c2c2c]">
                        {formatRevenue(record.annual_revenue)}
                      </span>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-[10px] uppercase tracking-widest text-[#7a7060] font-sans mb-1">Mission</p>
                      <p className="text-sm text-[#2c2c2c] font-sans leading-relaxed">{record.mission_statement}</p>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3">
                    {record.propublica_url && (
                      <a href={record.propublica_url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 border border-[#d4c9b0] text-[#7a7060] hover:text-[#2c2c2c] hover:border-[#2c2c2c] text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200">
                        <FileText className="w-3.5 h-3.5" />
                        View 990 Filing
                      </a>
                    )}
                    {record.donation_url && (
                      <a href={record.donation_url} target="_blank" rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#3a6147] text-white text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200">
                        <Heart className="w-3.5 h-3.5" />
                        Donate Now
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {!group.claimed && (
              <div className="px-6 pb-6">
                <button
                  onClick={() => onClaim(group.icon_name)}
                  className="w-full flex items-center justify-center gap-2 border border-[#d4c9b0] hover:border-[#2c2c2c] text-[#7a7060] hover:text-[#2c2c2c] text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  Claim This Profile
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Directory Page ───────────────────────────────────────────────────────────

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.35 } },
};

function DirectoryPage({
  groups,
  loading,
  onCardClick,
  onNavigateClaim,
}: {
  groups: AthleteGroup[];
  loading: boolean;
  onCardClick: (g: AthleteGroup) => void;
  onNavigateClaim: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const subcategories = Array.from(new Set(groups.map((g) => g.icon_subcategory).filter(Boolean))).sort();

  const filtered = groups.filter((g) => {
    const q = search.toLowerCase();
    const matchSearch =
      !search ||
      g.icon_name.toLowerCase().includes(q) ||
      g.records.some((r) => r.philanthropy_name.toLowerCase().includes(q) || r.mission_statement.toLowerCase().includes(q));
    const matchFilter = !activeFilter || g.icon_subcategory === activeFilter;
    return matchSearch && matchFilter;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* search + filters */}
      <div className="mb-10 space-y-5">
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7060]" />
          <input
            type="text"
            placeholder="Search athletes, foundations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-[#d4c9b0] rounded-sm pl-10 pr-4 py-2.5 text-sm text-[#2c2c2c] font-sans placeholder-[#bdb3a0] focus:outline-none focus:border-[#2c2c2c] transition-colors"
          />
        </div>

        {subcategories.length > 0 && (
          <div className="flex flex-wrap gap-2 justify-center">
            <button
              onClick={() => setActiveFilter(null)}
              className={`text-[10px] tracking-widest uppercase font-sans px-3 py-1.5 rounded-sm border transition-colors ${
                activeFilter === null
                  ? "bg-[#2c2c2c] text-[#fdfbf7] border-[#2c2c2c]"
                  : "bg-transparent text-[#7a7060] border-[#d4c9b0] hover:border-[#2c2c2c] hover:text-[#2c2c2c]"
              }`}
            >
              All
            </button>
            {subcategories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveFilter(cat === activeFilter ? null : cat)}
                className={`text-[10px] tracking-widest uppercase font-sans px-3 py-1.5 rounded-sm border transition-colors ${
                  activeFilter === cat
                    ? "bg-[#2c2c2c] text-[#fdfbf7] border-[#2c2c2c]"
                    : "bg-transparent text-[#7a7060] border-[#d4c9b0] hover:border-[#2c2c2c] hover:text-[#2c2c2c]"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* grid */}
      {loading ? (
        <div className="text-center py-24 text-[#7a7060] font-sans text-sm tracking-widest uppercase">
          Loading…
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 text-[#7a7060] font-sans text-sm">
          No results found.
        </div>
      ) : (
        <motion.div
          key={`${search}-${activeFilter}`}
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {filtered.map((group) => (
            <motion.div key={group.icon_name} variants={cardVariants}>
              <AthleteCard group={group} onClick={() => onCardClick(group)} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </div>
  );
}

// ─── About Page ───────────────────────────────────────────────────────────────

function AboutPage({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="border border-[#d4c9b0]">
        <div className="m-[3px] border border-[#d4c9b0] p-10 sm:p-14">
          <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-4">About the Project</p>
          <h2
            className="text-4xl sm:text-5xl font-bold text-[#2c2c2c] leading-tight mb-8"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            We believe impact should be visible.
          </h2>

          <div className="space-y-6 text-[#2c2c2c] font-sans text-base leading-relaxed">
            <p>
              Fan Funds is a curated directory of verified athlete and celebrity philanthropies —
              built to make it easy for fans, journalists, and partners to discover, understand,
              and support the causes that matter to public figures they admire.
            </p>
            <p>
              The landscape of celebrity giving is vast and often opaque. Foundations are formed,
              campaigns are launched, and meaningful work happens — but it&apos;s rarely surfaced in one
              place. Fan Funds changes that. We aggregate publicly available nonprofit data, verify
              organizational claims, and present each philanthropy in a clear, accessible format.
            </p>
            <p>
              Our data is sourced from public IRS filings, ProPublica Nonprofit Explorer, and
              direct outreach to representatives. Verified profiles are marked with a green badge.
              If you represent an athlete or celebrity and would like to claim or update a profile,
              we invite you to do so.
            </p>

            <div className="border-t border-[#d4c9b0] pt-8 mt-8">
              <p className="text-[#7a7060] text-sm italic mb-6">
                {/* Placeholder — edit this section freely in Git */}
                Fan Funds is an independent project. We are not affiliated with any athlete,
                team, league, or charity listed in this directory. All information is provided
                for informational purposes only.
              </p>
              <button
                onClick={() => onNavigate("claim")}
                className="inline-flex items-center gap-2 border border-[#2c2c2c] text-[#2c2c2c] hover:bg-[#2c2c2c] hover:text-[#fdfbf7] text-[11px] tracking-widest uppercase font-sans px-6 py-3 rounded-sm transition-colors duration-200"
              >
                <UserCheck className="w-4 h-4" />
                Claim a Profile
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Claim Page ───────────────────────────────────────────────────────────────

const RELATIONSHIP_OPTIONS = [
  "Self",
  "Manager",
  "Agent",
  "Publicist",
  "Legal Representative",
  "Foundation Staff",
  "Family Member",
  "Business Associate",
  "Other",
];

function ClaimPage({ prefill, onSuccess }: { prefill: string; onSuccess: () => void }) {
  const [form, setForm] = useState({
    icon_name: prefill,
    relationship: "",
    rep_name: "",
    rep_email: "",
    phone: "",
    verification_url: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // update prefill if it changes
  useEffect(() => {
    setForm((f) => ({ ...f, icon_name: prefill }));
  }, [prefill]);

  function validate() {
    const e: Record<string, string> = {};
    if (!form.icon_name.trim()) e.icon_name = "Required";
    if (!form.relationship) e.relationship = "Required";
    if (!form.rep_email.trim()) e.rep_email = "Required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.rep_email)) e.rep_email = "Invalid email";
    return e;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    console.log("Claim submission:", form);
    setSubmitted(true);
  }

  function field(id: keyof typeof form, label: string, required = false, type = "text") {
    return (
      <div>
        <label className="block text-[10px] uppercase tracking-widest text-[#7a7060] font-sans mb-1.5">
          {label}{required && <span className="text-[#c0392b] ml-0.5">*</span>}
        </label>
        <input
          type={type}
          value={form[id]}
          onChange={(e) => { setForm((f) => ({ ...f, [id]: e.target.value })); setErrors((er) => ({ ...er, [id]: "" })); }}
          className={`w-full bg-white border rounded-sm px-3 py-2.5 text-sm text-[#2c2c2c] font-sans placeholder-[#bdb3a0] focus:outline-none transition-colors ${
            errors[id] ? "border-[#c0392b]" : "border-[#d4c9b0] focus:border-[#2c2c2c]"
          }`}
        />
        {errors[id] && <p className="mt-1 text-[10px] text-[#c0392b] font-sans">{errors[id]}</p>}
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-16 sm:py-24">
      <div className="border border-[#d4c9b0]">
        <div className="m-[3px] border border-[#d4c9b0] p-8 sm:p-12">
          <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Claim a Profile</p>
          <h2
            className="text-3xl font-bold text-[#2c2c2c] mb-2"
            style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
          >
            Is this your profile?
          </h2>
          <p className="text-sm text-[#7a7060] font-sans mb-8">
            Verified profiles receive a badge and can be updated directly. We&apos;ll reach out to confirm your identity.
          </p>

          {submitted ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-8"
            >
              <CheckCircle2 className="w-12 h-12 text-[#4a7c59] mx-auto mb-4" />
              <h3
                className="text-xl font-bold text-[#2c2c2c] mb-2"
                style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
              >
                Request Received
              </h3>
              <p className="text-sm text-[#7a7060] font-sans mb-6">
                Thank you. We&apos;ll review your submission and follow up via email.
              </p>
              <button
                onClick={onSuccess}
                className="text-[11px] tracking-widest uppercase font-sans text-[#7a7060] hover:text-[#2c2c2c] border border-[#d4c9b0] hover:border-[#2c2c2c] px-6 py-2.5 rounded-sm transition-colors"
              >
                Back to Directory
              </button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {field("icon_name", "Icon / Athlete Name", true)}

              <div>
                <label className="block text-[10px] uppercase tracking-widest text-[#7a7060] font-sans mb-1.5">
                  Relationship to Icon<span className="text-[#c0392b] ml-0.5">*</span>
                </label>
                <div className="relative">
                  <select
                    value={form.relationship}
                    onChange={(e) => { setForm((f) => ({ ...f, relationship: e.target.value })); setErrors((er) => ({ ...er, relationship: "" })); }}
                    className={`w-full appearance-none bg-white border rounded-sm px-3 py-2.5 text-sm text-[#2c2c2c] font-sans focus:outline-none transition-colors pr-8 ${
                      errors.relationship ? "border-[#c0392b]" : "border-[#d4c9b0] focus:border-[#2c2c2c]"
                    }`}
                  >
                    <option value="">Select relationship…</option>
                    {RELATIONSHIP_OPTIONS.map((o) => (
                      <option key={o} value={o}>{o}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#7a7060] pointer-events-none" />
                </div>
                {errors.relationship && <p className="mt-1 text-[10px] text-[#c0392b] font-sans">{errors.relationship}</p>}
              </div>

              {field("rep_name", "Representative Name")}
              {field("rep_email", "Representative Email", true, "email")}
              {field("phone", "Phone Number", false, "tel")}
              {field("verification_url", "Verification / Agency Link", false, "url")}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full bg-[#2c2c2c] hover:bg-[#4a7c59] text-[#fdfbf7] text-[11px] tracking-widest uppercase font-sans py-3.5 rounded-sm transition-colors duration-300"
                >
                  Submit Claim Request
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({
  currentPage,
  onNavigate,
}: {
  currentPage: Page;
  onNavigate: (page: Page) => void;
}) {
  const pageLabel: Partial<Record<Page, string>> = {
    about: "About Us",
    claim: "Claim a Profile",
    contact: "Contact Us",
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fdfbf7] border-b border-[#d4c9b0]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <button
          onClick={() => onNavigate("directory")}
          className="text-2xl font-bold text-[#2c2c2c] tracking-tight"
          style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
        >
          Fan Funds
        </button>

        {currentPage !== "directory" && (
          <span className="text-[11px] tracking-widest uppercase font-sans text-[#7a7060]">
            {pageLabel[currentPage]}
          </span>
        )}
      </div>
    </header>
  );
}

// ─── Contact Form ─────────────────────────────────────────────────────────────

function ContactForm() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = "Required";
    if (!form.email.trim()) errs.email = "Required";
    if (!form.message.trim()) errs.message = "Required";
    if (Object.keys(errs).length) { setErrors(errs); return; }
    console.log("Contact:", form);
    setSubmitted(true);
  }

  function field(key: keyof typeof form, placeholder: string, type = "text") {
    return (
      <div>
        <input
          type={type}
          placeholder={placeholder}
          value={form[key]}
          onChange={(e) => { setForm((f) => ({ ...f, [key]: e.target.value })); setErrors((er) => ({ ...er, [key]: "" })); }}
          className={`w-full bg-white border rounded-sm px-2.5 py-1.5 text-xs text-[#2c2c2c] font-sans placeholder-[#bdb3a0] focus:outline-none transition-colors ${
            errors[key] ? "border-[#c0392b]" : "border-[#d4c9b0] focus:border-[#2c2c2c]"
          }`}
        />
        {errors[key] && <p className="mt-0.5 text-[9px] text-[#c0392b] font-sans">{errors[key]}</p>}
      </div>
    );
  }

  if (submitted) {
    return (
      <p className="text-[11px] text-[#4a7c59] font-sans">
        Thanks! We&apos;ll be in touch.
      </p>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-2" noValidate>
      {field("name", "Name")}
      {field("email", "Email", "email")}
      <div>
        <textarea
          placeholder="Message"
          value={form.message}
          onChange={(e) => { setForm((f) => ({ ...f, message: e.target.value })); setErrors((er) => ({ ...er, message: "" })); }}
          rows={3}
          className={`w-full bg-white border rounded-sm px-2.5 py-1.5 text-xs text-[#2c2c2c] font-sans placeholder-[#bdb3a0] focus:outline-none transition-colors resize-none ${
            errors.message ? "border-[#c0392b]" : "border-[#d4c9b0] focus:border-[#2c2c2c]"
          }`}
        />
        {errors.message && <p className="mt-0.5 text-[9px] text-[#c0392b] font-sans">{errors.message}</p>}
      </div>
      <button
        type="submit"
        className="w-full bg-[#2c2c2c] hover:bg-[#4a7c59] text-[#fdfbf7] text-[10px] tracking-widest uppercase font-sans py-2 rounded-sm transition-colors duration-300"
      >
        Send
      </button>
    </form>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="border-t border-[#d4c9b0] bg-[#fdfbf7] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <p
              className="text-lg font-bold text-[#2c2c2c] mb-2"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Fan Funds
            </p>
            <p className="text-[11px] text-[#7a7060] font-sans leading-relaxed">
              A curated directory of verified athlete and celebrity philanthropies. Making
              impact visible, one profile at a time.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Quick Links</p>
            <div className="space-y-2">
              {([
                { label: "Directory", page: "directory" },
                { label: "About Us", page: "about" },
                { label: "Claim a Profile", page: "claim" },
              ] as { label: string; page: Page }[]).map(({ label, page }) => (
                <button
                  key={page}
                  onClick={() => onNavigate(page)}
                  className="block text-[11px] text-[#7a7060] hover:text-[#2c2c2c] font-sans transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Data Sources */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Data Sources</p>
            <p className="text-[11px] text-[#7a7060] font-sans leading-relaxed">
              IRS public filings · ProPublica Nonprofit Explorer · Direct representative outreach
            </p>
          </div>

          {/* Contact Us */}
          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Contact Us</p>
            <ContactForm />
          </div>
        </div>

        <div className="border-t border-[#d4c9b0] mt-10 pt-6 text-center">
          <p className="text-[10px] text-[#bdb3a0] font-sans tracking-wide">
            Fan Funds · Independent project · Not affiliated with any athlete, team, or organization listed.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ─── Page transition wrapper ──────────────────────────────────────────────────

const PAGE_EASE: [number, number, number, number] = [0.4, 0, 0.2, 1];

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: PAGE_EASE } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.2 } },
};

// ─── Root Component ───────────────────────────────────────────────────────────

export default function FanFunds() {
  const [currentPage, setCurrentPage] = useState<Page>("directory");
  const [groups, setGroups] = useState<AthleteGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedGroup, setSelectedGroup] = useState<AthleteGroup | null>(null);
  const [claimPrefill, setClaimPrefill] = useState("");

  // fetch data, fall back to static records if API unavailable
  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        const result = Papa.parse<AthleteRecord>(text, { header: true, skipEmptyLines: true });
        const records = result.data.length > 0 ? result.data : STATIC_RECORDS;
        setGroups(groupRecords(records));
      })
      .catch(() => setGroups(groupRecords(STATIC_RECORDS)))
      .finally(() => setLoading(false));
  }, []);

  function navigate(page: Page) {
    setCurrentPage(page);
    setSelectedGroup(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleClaim(name: string) {
    setClaimPrefill(name);
    setSelectedGroup(null);
    navigate("claim");
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#fdfbf7]">
      <Navbar currentPage={currentPage} onNavigate={navigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {currentPage === "directory" && (
            <motion.div key="directory" {...pageVariants}>
              {/* hero */}
              <div className="border-b border-[#d4c9b0] py-12 text-center px-4">
                <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">
                  The Athlete Philanthropy Directory
                </p>
                <h1
                  className="text-4xl sm:text-5xl font-bold text-[#2c2c2c] max-w-2xl mx-auto leading-tight"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  Where champions give back.
                </h1>
                <p className="mt-4 text-sm text-[#7a7060] font-sans max-w-md mx-auto leading-relaxed">
                  Discover and support the foundations behind the names you know.
                </p>
              </div>

              <DirectoryPage
                groups={groups}
                loading={loading}
                onCardClick={setSelectedGroup}
                onNavigateClaim={handleClaim}
              />
            </motion.div>
          )}

          {currentPage === "about" && (
            <motion.div key="about" {...pageVariants}>
              <AboutPage onNavigate={navigate} />
            </motion.div>
          )}

          {currentPage === "claim" && (
            <motion.div key="claim" {...pageVariants}>
              <ClaimPage prefill={claimPrefill} onSuccess={() => navigate("directory")} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Footer onNavigate={navigate} />

      {/* Modal */}
      <AnimatePresence>
        {selectedGroup && (
          <Modal
            group={selectedGroup}
            onClose={() => setSelectedGroup(null)}
            onClaim={handleClaim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

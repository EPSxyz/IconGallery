"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Heart, FileText, UserCheck, Search, ChevronDown } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type AthleteRecord = {
  id: string;
  icon_name: string;
  icon_subcategory: string;
  philanthropy_name: string;
  mission_statement: string;
  annual_revenue: string;
  propublica_url: string;
  philanthropy_description: string;
  claimed: string;
  donation_url: string;
};

type Page = "directory" | "about" | "claim";

const DATA_URL =
  "https://script.google.com/macros/s/AKfycbwiBQ1o0WZd0Wtvd_GJShsW1d7V7R31VLY3964KBQIV9f5tYT5JHZ3hk1SiMWTqk7pp/exec";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isClaimed(record: AthleteRecord) {
  return record.claimed?.toLowerCase() === "yes";
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
function CardFront({ record }: { record: AthleteRecord }) {
  return (
    <div className="card-face bg-[#fdfbf7] rounded-sm h-full flex flex-col">
      {/* outer double border */}
      <div className="m-2 border border-[#d4c9b0] rounded-sm h-full flex flex-col">
        <div className="m-[3px] border border-[#d4c9b0] rounded-sm h-full flex flex-col p-3">
          {/* subcategory label */}
          <div className="flex justify-center mb-3">
            <span className="text-[10px] tracking-widest uppercase text-[#7a7060] border border-[#d4c9b0] px-2 py-0.5 rounded-sm font-sans">
              {record.icon_subcategory || "Icon"}
            </span>
          </div>

          {/* decorative rule */}
          <div className="border-t border-[#d4c9b0] mx-2 mb-3" />

          {/* athlete name */}
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2">
            <h3
              className="font-[family-name:var(--font-playfair)] text-xl font-bold text-[#2c2c2c] leading-tight"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {record.icon_name}
            </h3>
            {isClaimed(record) && (
              <div className="mt-1">
                <ClaimedBadge />
              </div>
            )}
          </div>

          {/* decorative rule */}
          <div className="border-t border-[#d4c9b0] mx-2 mt-3 mb-2" />

          {/* philanthropy name */}
          <p className="text-center text-[11px] text-[#7a7060] font-sans tracking-wide px-2 pb-1 leading-tight">
            {record.philanthropy_name}
          </p>
        </div>
      </div>
    </div>
  );
}

// Card Back
function CardBack({ record, onDonate }: { record: AthleteRecord; onDonate: (e: React.MouseEvent) => void }) {
  return (
    <div className="card-face card-back bg-[#f5f0e8] rounded-sm h-full flex flex-col">
      <div className="m-2 border border-[#d4c9b0] rounded-sm h-full flex flex-col">
        <div className="m-[3px] border border-[#d4c9b0] rounded-sm h-full flex flex-col">
          {/* banner header */}
          <div className="bg-[#2c2c2c] text-[#fdfbf7] text-center py-2 px-3">
            <p
              className="text-[11px] font-bold tracking-widest uppercase"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              {record.philanthropy_name}
            </p>
          </div>

          <div className="flex-1 flex flex-col p-3 gap-3">
            {/* stats */}
            <div className="border border-[#d4c9b0] rounded-sm p-2 bg-[#fdfbf7]">
              <div className="flex items-baseline justify-between mb-1">
                <span className="text-[9px] uppercase tracking-widest text-[#7a7060] font-sans">Annual Revenue</span>
                <span className="font-mono text-sm font-bold text-[#2c2c2c]">
                  {formatRevenue(record.annual_revenue)}
                </span>
              </div>
              <div className="border-t border-[#e8e0d0] my-1.5" />
              <p className="text-[10px] text-[#7a7060] font-sans leading-relaxed line-clamp-4">
                {record.mission_statement}
              </p>
            </div>

            <div className="flex-1" />

            {/* donate button */}
            <button
              onClick={onDonate}
              className="w-full flex items-center justify-center gap-1.5 bg-[#2c2c2c] hover:bg-[#4a7c59] text-[#fdfbf7] text-[11px] tracking-widest uppercase font-sans py-2 rounded-sm transition-colors duration-300"
            >
              <Heart className="w-3 h-3" />
              Donate
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Athlete Card (flip wrapper)
function AthleteCard({
  record,
  onClick,
}: {
  record: AthleteRecord;
  onClick: () => void;
}) {
  const [flipped, setFlipped] = useState(false);

  function handleDonate(e: React.MouseEvent) {
    e.stopPropagation();
    if (record.donation_url) window.open(record.donation_url, "_blank", "noopener");
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
        <CardFront record={record} />
        <CardBack record={record} onDonate={handleDonate} />
      </motion.div>
    </div>
  );
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function Modal({
  record,
  onClose,
  onClaim,
}: {
  record: AthleteRecord;
  onClose: () => void;
  onClaim: (name: string) => void;
}) {
  const claimed = isClaimed(record);

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
      {/* backdrop */}
      <motion.div
        className="absolute inset-0 bg-[#2c2c2c]/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* card */}
      <motion.div
        className="relative z-10 bg-[#fdfbf7] w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-sm shadow-2xl"
        initial={{ scale: 0.95, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 12 }}
        transition={{ duration: 0.3, ease: PAGE_EASE }}
      >
        {/* double border frame */}
        <div className="m-4 border border-[#d4c9b0]">
          <div className="m-[3px] border border-[#d4c9b0]">
            {/* close button */}
            <button
              onClick={onClose}
              className="absolute top-7 right-7 text-[#7a7060] hover:text-[#2c2c2c] transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* header */}
            <div className="border-b border-[#d4c9b0] p-6 text-center">
              <span className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans border border-[#d4c9b0] px-2 py-0.5 rounded-sm">
                {record.icon_subcategory}
              </span>
              <div className="mt-3 flex items-center justify-center gap-2">
                <h2
                  className="text-3xl font-bold text-[#2c2c2c]"
                  style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
                >
                  {record.icon_name}
                </h2>
                {claimed && <ClaimedBadge />}
              </div>
              <p className="mt-1 text-sm text-[#7a7060] font-sans">{record.philanthropy_name}</p>
            </div>

            {/* body */}
            <div className="p-6 space-y-6">
              {/* description */}
              {record.philanthropy_description && (
                <p className="text-[#2c2c2c] font-sans text-sm leading-relaxed">
                  {record.philanthropy_description}
                </p>
              )}

              {/* stats */}
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

              {/* action buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {record.propublica_url && (
                  <a
                    href={record.propublica_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 border border-[#d4c9b0] text-[#7a7060] hover:text-[#2c2c2c] hover:border-[#2c2c2c] text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    View 990 Filing
                  </a>
                )}
                {record.donation_url && (
                  <a
                    href={record.donation_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 flex items-center justify-center gap-2 bg-[#4a7c59] hover:bg-[#3a6147] text-white text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200"
                  >
                    <Heart className="w-3.5 h-3.5" />
                    Donate Now
                  </a>
                )}
              </div>

              {!claimed && (
                <div className="border-t border-[#d4c9b0] pt-4">
                  <button
                    onClick={() => onClaim(record.icon_name)}
                    className="w-full flex items-center justify-center gap-2 border border-[#d4c9b0] hover:border-[#2c2c2c] text-[#7a7060] hover:text-[#2c2c2c] text-[11px] tracking-widest uppercase font-sans py-3 rounded-sm transition-colors duration-200"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                    Claim This Profile
                  </button>
                </div>
              )}
            </div>
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
  records,
  loading,
  onCardClick,
  onNavigateClaim,
}: {
  records: AthleteRecord[];
  loading: boolean;
  onCardClick: (r: AthleteRecord) => void;
  onNavigateClaim: (name: string) => void;
}) {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<string | null>(null);

  const subcategories = Array.from(new Set(records.map((r) => r.icon_subcategory).filter(Boolean))).sort();

  const filtered = records.filter((r) => {
    const matchSearch =
      !search ||
      r.icon_name.toLowerCase().includes(search.toLowerCase()) ||
      r.philanthropy_name.toLowerCase().includes(search.toLowerCase()) ||
      r.mission_statement.toLowerCase().includes(search.toLowerCase());
    const matchFilter = !activeFilter || r.icon_subcategory === activeFilter;
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
          {filtered.map((record) => (
            <motion.div key={record.id || record.icon_name} variants={cardVariants}>
              <AthleteCard record={record} onClick={() => onCardClick(record)} />
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
  const links: { label: string; page: Page }[] = [
    { label: "Directory", page: "directory" },
    { label: "About Us", page: "about" },
    { label: "Claim a Profile", page: "claim" },
  ];

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

        <nav className="flex items-center gap-6 sm:gap-8">
          {links.map(({ label, page }) => (
            <button
              key={page}
              onClick={() => onNavigate(page)}
              className={`text-[11px] tracking-widest uppercase font-sans transition-colors relative pb-0.5 ${
                currentPage === page
                  ? "text-[#2c2c2c]"
                  : "text-[#7a7060] hover:text-[#2c2c2c]"
              }`}
            >
              {label}
              {currentPage === page && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute -bottom-[1px] left-0 right-0 h-[1px] bg-[#2c2c2c]"
                />
              )}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

function Footer({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <footer className="border-t border-[#d4c9b0] bg-[#fdfbf7] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10">
          <div>
            <p
              className="text-lg font-bold text-[#2c2c2c] mb-2"
              style={{ fontFamily: "var(--font-playfair), Georgia, serif" }}
            >
              Fan Funds
            </p>
            <p className="text-[11px] text-[#7a7060] font-sans leading-relaxed max-w-xs">
              A curated directory of verified athlete and celebrity philanthropies. Making
              impact visible, one profile at a time.
            </p>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Quick Links</p>
            <div className="space-y-2">
              {(["directory", "about", "claim"] as Page[]).map((p) => (
                <button
                  key={p}
                  onClick={() => onNavigate(p)}
                  className="block text-[11px] text-[#7a7060] hover:text-[#2c2c2c] font-sans capitalize transition-colors"
                >
                  {p === "claim" ? "Claim a Profile" : p === "about" ? "About Us" : "Directory"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-[10px] tracking-widest uppercase text-[#7a7060] font-sans mb-3">Data Sources</p>
            <p className="text-[11px] text-[#7a7060] font-sans leading-relaxed">
              IRS public filings · ProPublica Nonprofit Explorer · Direct representative outreach
            </p>
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
  const [records, setRecords] = useState<AthleteRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCard, setSelectedCard] = useState<AthleteRecord | null>(null);
  const [claimPrefill, setClaimPrefill] = useState("");

  // fetch data
  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => r.text())
      .then((text) => {
        const result = Papa.parse<AthleteRecord>(text, { header: true, skipEmptyLines: true });
        setRecords(result.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  function navigate(page: Page) {
    setCurrentPage(page);
    setSelectedCard(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleClaim(name: string) {
    setClaimPrefill(name);
    setSelectedCard(null);
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
                records={records}
                loading={loading}
                onCardClick={setSelectedCard}
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
        {selectedCard && (
          <Modal
            record={selectedCard}
            onClose={() => setSelectedCard(null)}
            onClaim={handleClaim}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

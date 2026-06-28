"use client";

import { useState, useEffect, useRef } from "react";
import Papa from "papaparse";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, X, Heart, FileText, UserCheck, Search, ChevronDown } from "lucide-react";

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

type Page = "directory" | "about" | "claim";

const DATA_URL = "/api/athletes";

const STATIC_RECORDS: AthleteRecord[] = [
  { id: "990_001", icon_name: "LeBron James", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "LeBron James Family Foundation", annual_revenue: "10214580", mission_statement: "Creating generational change for kids and families in Akron through education and co-curricular educational initiatives.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/20716277", philanthropy_description: "The LeBron James Family Foundation operates with a highly focused geographic mandate, dedicating its resources to creating systemic, generational change in Akron, Ohio. Instead of broad, disparate grantmaking, the organization functions almost as a social enterprise, directly operating robust educational and community support systems like the I PROMISE School, which serves the city's most at-risk students. Quantitatively, the organization's impact is significant, providing wrap-around services to over 1,600 students and their families, including guaranteed college tuition, transitional housing at the I PROMISE Village, and long-term vocational support.", donation_url: "https://www.charitynavigator.org/ein/020716277", claimed: "Yes", entity_type: "Public Charity", total_expenses: "8114352", grant_expense_ratio: "0.654", net_assets: "6211842", image_url: "" },
  { id: "990_002", icon_name: "Stephen Curry", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "Eat. Learn. Play. Foundation", annual_revenue: "21438905", mission_statement: "Fighting to end childhood hunger, ensuring access to quality education, and providing safe places to play.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/831373602", philanthropy_description: "Eat. Learn. Play. Foundation focuses on three vital pillars for healthy childhood development: nutrition, education, and physical activity, primarily serving the Oakland and broader Bay Area communities. The organization leverages significant community partnerships to scale its impact, operating as a sophisticated public charity that drives both direct programming and strategic grantmaking. Since its inception, the foundation has delivered over 25 million meals to food-insecure families, distributed hundreds of thousands of books to combat early childhood illiteracy, and funded the revitalization of numerous community playgrounds.", donation_url: "https://www.eatlearnplay.org/give", claimed: "No", entity_type: "Public Charity", total_expenses: "17112450", grant_expense_ratio: "0.812", net_assets: "4326455", image_url: "" },
  { id: "990_003", icon_name: "Tiger Woods", icon_source: "Athlete", icon_subcategory: "Golf", philanthropy_name: "TGR Foundation", annual_revenue: "14895330", mission_statement: "Empowering students to pursue their passions through education and STEM-based learning.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/200677815", philanthropy_description: "The TGR Foundation has evolved over decades from a youth golf initiative into a highly structured educational organization focused on STEM education and college access. The foundation operates physical learning labs that provide interactive, inquiry-based educational experiences for underrepresented students, equipping them with modern technical skills. With a robust operating budget, the foundation has reached over 2 million students globally through its digital platforms and physical campuses. Its flagship Earl Woods Scholar Program boasts an exceptional graduation rate of nearly 100%.", donation_url: "https://donate.tgrfoundation.org/give/231401/#!/donation/checkout", claimed: "Yes", entity_type: "Public Charity", total_expenses: "13211400", grant_expense_ratio: "0.725", net_assets: "28455190", image_url: "" },
  { id: "990_004", icon_name: "Magic Johnson", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "Magic Johnson Foundation", annual_revenue: "2114600", mission_statement: "Supporting educational, health, and social needs of ethnically diverse, urban communities.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/883208058", philanthropy_description: "The Magic Johnson Foundation is one of the longest-standing athlete-driven philanthropic organizations, originally established to combat the HIV/AIDS epidemic through education and prevention. Over time, the organization has strategically expanded its exempt purpose to address a broader range of educational, health, and social needs within ethnically diverse, urban communities across the United States.", donation_url: "http://magicjohnson.org/", claimed: "No", entity_type: "Public Charity", total_expenses: "1985320", grant_expense_ratio: "0.618", net_assets: "1145200", image_url: "" },
  { id: "990_005", icon_name: "Derek Jeter", icon_source: "Athlete", icon_subcategory: "Baseball", philanthropy_name: "Turn 2 Foundation", annual_revenue: "2455120", mission_statement: "Creating programs that motivate young people to turn away from drugs and alcohol.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/341847687", philanthropy_description: "The Turn 2 Foundation was established with a clear mandate to guide youth away from drugs and alcohol by fostering healthy lifestyles, academic excellence, and leadership skills. The organization operates comprehensive, long-term programs that engage students from middle school through high school. Its signature Jeter's Leaders program has successfully cultivated thousands of high-achieving student ambassadors who drive positive social change in their own communities.", donation_url: "https://www.mlb.com/turn-2-foundation/donate", claimed: "Yes", entity_type: "Public Charity", total_expenses: "2210840", grant_expense_ratio: "0.781", net_assets: "5122940", image_url: "" },
  { id: "990_006", icon_name: "Novak Djokovic", icon_source: "Athlete", icon_subcategory: "Tennis", philanthropy_name: "Novak Djokovic Foundation", annual_revenue: "3120440", mission_statement: "Ensuring all children have access to high-quality preschool education.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/454219615", philanthropy_description: "The Novak Djokovic Foundation is deeply committed to early childhood education, operating with a specific focus on rebuilding and equipping preschools in underserved areas of Serbia. The foundation's quantitative achievements include the reconstruction of over 50 educational facilities, the specialized training of thousands of teachers, and direct support to more than 50,000 children.", donation_url: "https://fundraise.novakdjokovicfoundation.org/give/f5070829/", claimed: "No", entity_type: "Public Charity", total_expenses: "2895110", grant_expense_ratio: "0.843", net_assets: "1845300", image_url: "" },
  { id: "990_007", icon_name: "Kevin Durant", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "Kevin Durant Charity Foundation", annual_revenue: "2045900", mission_statement: "Enriching the lives of at-risk youth from low-income backgrounds through educational, athletic, and social programs.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/462353335", philanthropy_description: "The Kevin Durant Charity Foundation operates with a focus on enriching the lives of at-risk youth from low-income backgrounds, utilizing both educational and athletic programming. A central pillar of its philanthropic strategy is the 'Build It and They Will Ball' initiative, which revitalizes community basketball courts in underserved neighborhoods across the globe.", donation_url: "https://www.charitynavigator.org/ein/462353335", claimed: "Yes", entity_type: "Private Foundation", total_expenses: "1890440", grant_expense_ratio: "0.706", net_assets: "2311500", image_url: "" },
  { id: "990_008", icon_name: "Patrick Mahomes", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "15 and the Mahomies Foundation", annual_revenue: "1544200", mission_statement: "Improving the lives of children through initiatives focused on health, wellness, and resource-deprived communities.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/834134118", philanthropy_description: "The 15 and the Mahomies Foundation focuses on improving the lives of children through strategic initiatives surrounding health, wellness, and educational resources. The organization effectively partners with existing community nonprofits and hospitals, utilizing a grantmaking model to amplify the reach of proven programs that serve resource-deprived communities in the Kansas City area and beyond.", donation_url: "https://www.15andthemahomies.org/donate/", claimed: "No", entity_type: "Public Charity", total_expenses: "1211500", grant_expense_ratio: "0.752", net_assets: "845600", image_url: "" },
  { id: "990_009", icon_name: "Peyton Manning", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "Peyback Foundation", annual_revenue: "662548", mission_statement: "Promoting the future success of disadvantaged youth by assisting programs that provide leadership growth and opportunities.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/341882628", philanthropy_description: "The Peyback Foundation is dedicated to promoting the future success of disadvantaged youth by providing substantial financial assistance to youth-focused organizations across multiple states. Instead of operating its own distinct programs, the foundation functions primarily as a sophisticated grantmaking entity, rigorously identifying and funding highly effective local charities.", donation_url: "https://www.peytonmanning.com/donate", claimed: "Yes", entity_type: "Public Charity", total_expenses: "527641", grant_expense_ratio: "0.738", net_assets: "4925347", image_url: "" },
  { id: "990_010", icon_name: "Travis Kelce", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "Eighty-Seven & Running", annual_revenue: "1120450", mission_statement: "Empowering disadvantaged youth to achieve success by providing resources in education, business, athletics, STEM, and the arts.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/474569777", philanthropy_description: "Eighty-Seven & Running aims to empower disadvantaged youth to achieve success by providing targeted resources and cultivating talent in multiple disciplines. The foundation actively partners with community pillars like the Boys & Girls Clubs to create safe, enriching environments for children who might otherwise lack access to comprehensive after-school support.", donation_url: "https://87running.org/", claimed: "No", entity_type: "Public Charity", total_expenses: "945300", grant_expense_ratio: "0.684", net_assets: "540110", image_url: "" },
  { id: "990_011", icon_name: "J.J. Watt", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "Justin J. Watt Foundation", annual_revenue: "1340600", mission_statement: "Providing after-school opportunities for middle-school-aged children to become involved in athletics.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/273516574", philanthropy_description: "The Justin J. Watt Foundation operates with a highly specific mandate: providing funding for after-school athletic programs for middle-school-aged children in communities that face significant financial barriers. The foundation has distributed millions of dollars in highly targeted grants across the country, primarily to supply essential athletic equipment and uniforms.", donation_url: "https://jjwfoundation.org/donate/", claimed: "Yes", entity_type: "Public Charity", total_expenses: "1185200", grant_expense_ratio: "0.827", net_assets: "1455300", image_url: "" },
  { id: "990_012", icon_name: "Drew Brees", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "Brees Dream Foundation", annual_revenue: "2215800", mission_statement: "Improving the quality of life for cancer patients and providing care, education, and opportunities for children and families in need.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/562380198", philanthropy_description: "The Brees Dream Foundation was initially founded with a mission to improve the quality of life for cancer patients and provide vital care, education, and opportunities for children and families in need. The organization has since expanded its philanthropic scope significantly, particularly in the wake of natural disasters, actively driving major community revitalization and relief efforts across the Gulf Coast and beyond.", donation_url: "https://drewbrees.com/", claimed: "No", entity_type: "Public Charity", total_expenses: "2045100", grant_expense_ratio: "0.794", net_assets: "3845200", image_url: "" },
  { id: "990_013", icon_name: "Russell Wilson", icon_source: "Athlete", icon_subcategory: "Football", philanthropy_name: "Why Not You Foundation", annual_revenue: "1055400", mission_statement: "Eliminating barriers to opportunity in youth education and health.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/464784365", philanthropy_description: "The Why Not You Foundation focuses on empowering youth to lead with a 'why not you' attitude by breaking down systemic barriers to opportunity, particularly in the realms of education, children's health, and food security. Through major fundraising initiatives and direct programming, the foundation has channeled substantial resources into critical areas such as pediatric cancer research and expanding educational access for marginalized students.", donation_url: "https://whynotyoufdn.org/donate", claimed: "Yes", entity_type: "Public Charity", total_expenses: "912400", grant_expense_ratio: "0.621", net_assets: "412800", image_url: "" },
  { id: "990_014", icon_name: "Michael Phelps", icon_source: "Athlete", icon_subcategory: "Swimming", philanthropy_name: "Michael Phelps Foundation", annual_revenue: "1012500", mission_statement: "Promoting water safety, healthy living, and the pursuit of dreams, especially for children.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/611571538", philanthropy_description: "The Michael Phelps Foundation focuses on promoting water safety, healthy living, and the pursuit of dreams, utilizing the sport of swimming as a catalyst for holistic youth development. By partnering with organizations like the Boys & Girls Clubs of America and Special Olympics, the foundation has successfully scaled its curriculum globally, reaching tens of thousands of children.", donation_url: "https://michaelphelpsfoundation.org/donate/", claimed: "No", entity_type: "Public Charity", total_expenses: "895400", grant_expense_ratio: "0.713", net_assets: "745200", image_url: "" },
  { id: "990_015", icon_name: "Tony Hawk", icon_source: "Athlete", icon_subcategory: "Skateboarding", philanthropy_name: "The Skatepark Project", annual_revenue: "3415900", mission_statement: "Helping underserved communities create safe and inclusive public skateparks for youth.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/330965889", philanthropy_description: "The Skatepark Project is dedicated to helping underserved communities create safe, inclusive, and legal public skateparks for youth. With millions of dollars awarded in grants, the organization has facilitated the construction of hundreds of skateparks across the United States. This highly specialized philanthropic model not only provides youth with a safe space for physical activity and creative expression but also empowers local advocates to engage effectively with their local governments.", donation_url: "https://careasy.org/the-skatepark-project", claimed: "Yes", entity_type: "Public Charity", total_expenses: "3110400", grant_expense_ratio: "0.668", net_assets: "2145900", image_url: "" },
  { id: "990_016", icon_name: "Shaquille O'Neal", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "The Shaquille O'Neal Foundation", annual_revenue: "2110400", mission_statement: "Creating pathways for underserved youth by providing resources and opportunities to help them reach their full potential.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/842488384", philanthropy_description: "The Shaquille O'Neal Foundation focuses on creating pathways for underserved youth, helping them achieve their full potential by providing critical resources and opportunities. The organization operates primarily through deep, strategic partnerships with established national nonprofits, most notably the Boys & Girls Clubs of America and Communities in Schools.", donation_url: "https://www.shaqfoundation.org/donate", claimed: "No", entity_type: "Public Charity", total_expenses: "1845300", grant_expense_ratio: "0.745", net_assets: "1320400", image_url: "" },
  { id: "990_017", icon_name: "Clayton Kershaw", icon_source: "Athlete", icon_subcategory: "Baseball", philanthropy_name: "Kershaw's Challenge", annual_revenue: "2045110", mission_statement: "Empowering people to positively impact communities globally and locally through community-focused projects.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/455554866", philanthropy_description: "Kershaw's Challenge is a purpose-driven organization that seeks to empower people to use their spheres of influence to positively impact communities both locally and globally. The organization partners with specific beneficiaries each year, focusing on vulnerable children and communities in Los Angeles, Dallas, Zambia, and the Dominican Republic.", donation_url: "https://www.kershawschallenge.com/donate", claimed: "Yes", entity_type: "Public Charity", total_expenses: "1811300", grant_expense_ratio: "0.801", net_assets: "1114200", image_url: "" },
  { id: "990_018", icon_name: "Albert Pujols", icon_source: "Athlete", icon_subcategory: "Baseball", philanthropy_name: "Pujols Family Foundation", annual_revenue: "1145200", mission_statement: "Promoting awareness, providing hope, and meeting tangible needs for individuals and families living with Down syndrome.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/202272546", philanthropy_description: "The Pujols Family Foundation operates with a dual focus: promoting awareness and meeting tangible needs for individuals living with Down syndrome, and providing extensive humanitarian relief for impoverished populations in the Dominican Republic. Internationally, it conducts comprehensive medical missions, builds essential infrastructure, and provides critical poverty relief.", donation_url: "https://www.pujolsfamilyfoundation.org/donate/other-ways-to-give/", claimed: "No", entity_type: "Public Charity", total_expenses: "1044900", grant_expense_ratio: "0.764", net_assets: "645100", image_url: "" },
  { id: "990_019", icon_name: "Chris Paul", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "Chris Paul Family Foundation", annual_revenue: "1022400", mission_statement: "Positively impacting individuals and families by leveling the playing field in education, sports, and life.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/472373649", philanthropy_description: "The Chris Paul Family Foundation strives to positively impact individuals and families by leveling the playing field in education, sports, and life. Through strategic partnerships and direct grantmaking, the foundation has established numerous technology labs in public schools and community centers. Its extensive support for HBCUs and targeted scholarship programs highlight a deep commitment to fostering long-term educational equity.", donation_url: "https://www.chrispaulfamilyfoundation.org/", claimed: "Yes", entity_type: "Private Foundation", total_expenses: "914200", grant_expense_ratio: "0.695", net_assets: "512300", image_url: "" },
  { id: "990_020", icon_name: "Dikembe Mutombo", icon_source: "Athlete", icon_subcategory: "Basketball", philanthropy_name: "Dikembe Mutombo Foundation", annual_revenue: "1455300", mission_statement: "Improving the health, education, and quality of life for the people in the Democratic Republic of the Congo.", propublica_url: "https://projects.propublica.org/nonprofits/organizations/582359589", philanthropy_description: "The Dikembe Mutombo Foundation is a premier example of international, single-issue athlete philanthropy, dedicated to improving the health, education, and quality of life for the people in the Democratic Republic of the Congo. The organization's crowning achievement is the Biamba Marie Mutombo Hospital, a state-of-the-art medical facility built in Kinshasa that provides critical, life-saving medical care.", donation_url: "https://dmf.org/", claimed: "No", entity_type: "Public Charity", total_expenses: "1320110", grant_expense_ratio: "0.856", net_assets: "2411800", image_url: "" },
];

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

  // fetch data, fall back to static records if API unavailable
  useEffect(() => {
    fetch(DATA_URL)
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.text();
      })
      .then((text) => {
        const result = Papa.parse<AthleteRecord>(text, { header: true, skipEmptyLines: true });
        if (result.data.length > 0) {
          setRecords(result.data);
        } else {
          setRecords(STATIC_RECORDS);
        }
      })
      .catch(() => setRecords(STATIC_RECORDS))
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

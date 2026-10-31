import ApplicationTrace from "@/components/content/visuals/ApplicationTrace";
import ReadingPage from "@/components/content/ReadingPage";
import { EvidenceStatus, UncertaintyNote } from "@/components/content/Science";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata("Target Food Matrices", "Sauces, infused oils, and dry seasonings: target B2B applications for Huner's fermentation-derived truffle aroma ingredient.", "/applications/");
const applications = [
  {
    id: "food",
    title: "Gourmet Sauces & Culinary Preparations",
    line: "Thermal stability in emulsified matrices.",
    intermediate: "A fermentation-derived truffle aroma ingredient formulated for emulsion stability.",
    need: "Pasta sauces, culinary cooking bases, and dairy emulsions demand truffle volatile retention under pasteurization and thermal cooking without aroma breakdown.",
    challenge: "Cultivation kinetics and downstream recovery dictate compound stability. The biological ingredient must maintain aroma intensity across fatty and aqueous phases.",
    boundary: "Early-stage R&D candidate. Formulation stability, sensory panel evaluation, and regulatory qualification are actively being characterized."
  },
  {
    id: "fragrance",
    title: "Infused Oils & Finishing Condiments",
    line: "Authentic multi-compound depth in lipid carriers.",
    intermediate: "A lipid-soluble aroma profile derived from controlled fungal fermentation.",
    need: "Gourmet olive and specialty finishing oils require true lipid solubility and authentic multi-compound complexity, eliminating the harsh chemical sharpness of synthetic 2,4-dithiapentane.",
    challenge: "Volatile release kinetics and antioxidant stability in lipid matrices require precise extraction parameters and carrier matching.",
    boundary: "Research candidate under laboratory development. Commercial aroma specifications await formal panel qualification."
  },
  {
    id: "raw-materials",
    title: "Dry Seasonings & Snack Formulations",
    line: "Homogeneous dispersion and shelf-life stability.",
    intermediate: "Carrier-bound or microencapsulated truffle aroma preparation.",
    need: "Snack coatings, specialty salt blends, and dry culinary seasonings require stable carrier integration, homogeneous particle distribution, and consistent lot-to-lot flavor release.",
    challenge: "Drying conditions and carrier interactions must protect sensitive volatile compounds from oxidation during ambient shelf storage.",
    boundary: "Target application matrix. Pilot formulation trials planned following baseline aroma profile confirmation."
  },
];
export default function Page() {
  return (
    <ReadingPage
      path="/applications/"
      chapter="Applications"
      title="Application Matrices. Industrial Consistency."
      intro="We focus on specific food applications where natural truffle supply creates acute formulation challenges and where controlled fermentation delivers measurable value."
    >
      <nav className="related-links" aria-label="Application directions">
        {applications.map(item => <a key={item.id} href={`#${item.id}`}>{item.title} ↓</a>)}
      </nav>
      {applications.map((item, i) => (
        <section key={item.id} id={item.id} className="reading-section two-column">
          <div>
            <p className="eyebrow">0{i + 1} / TARGET MATRIX</p>
            <EvidenceStatus>Target Application</EvidenceStatus>
          </div>
          <div className="prose">
            <h2>{item.title}</h2>
            <p className="application-line">{item.line}</p>
            <p>{item.intermediate}</p>
            <ApplicationTrace direction={item.id as "food" | "fragrance" | "raw-materials"} />
            <h3>Formulation Requirements</h3>
            <p>{item.need}</p>
            <h3>Bioprocess & Recovery Constraints</h3>
            <p>{item.challenge}</p>
            <UncertaintyNote>{item.boundary}</UncertaintyNote>
          </div>
        </section>
      ))}
      <a href="/collaborate/" className="text-link">Inquire about application co-development ↗</a>
    </ReadingPage>
  );
}

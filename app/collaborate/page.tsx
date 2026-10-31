import ReadingPage from "@/components/content/ReadingPage";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata(
  "Technical Collaboration",
  "Engage with Huner Biofoundry on fermentation-derived truffle aroma R&D, sensory testing, and food matrix evaluation.",
  "/collaborate/"
);
export default function Page() {
  return (
    <ReadingPage
      path="/collaborate/"
      chapter="Collaboration"
      title="Technical dialogue & co-development."
      intro="We engage with food R&D formulators, flavor houses, and bioprocess researchers to align our fermentation-derived truffle aroma candidate with industrial application requirements."
    >
      <div className="collaboration-paths">
        {[
          [
            "Food R&D Formulators",
            "Exploring matrix stability, thermal tolerance, and sensory performance in gourmet sauces, oils, and culinary seasonings.",
            "/applications/",
            "Explore target matrices"
          ],
          [
            "Flavor Houses & Aroma Specialists",
            "Evaluating volatile compound profiles, GC-MS identification, and regulatory compliance under EU Regulation 1334/2008.",
            "/research/",
            "Examine R&D streams"
          ],
          [
            "Accelerators & Deep Tech Partners",
            "Following our step-by-step evidence reduction roadmap from METU laboratory research to pilot bioreactor scale.",
            "/progress/",
            "View milestone roadmap"
          ]
        ].map(([title, copy, href, label]) => (
          <article key={title}>
            <h2>{title}</h2>
            <p>{copy}</p>
            <a className="text-link" href={href}>{label} ↗</a>
          </article>
        ))}
      </div>
      <aside className="uncertainty-note">
        <p>
          Huner is currently in early-stage laboratory R&D at Middle East Technical University (METU). Direct technical conversations are initiated through university innovation networks and accelerator partner channels.
        </p>
      </aside>
    </ReadingPage>
  );
}

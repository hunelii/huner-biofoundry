import FoundryExperience from "@/components/FoundryExperience";
import HomeScience from "@/components/content/HomeScience";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata(
  "Fermentation-Derived Truffle Aroma",
  "Huner Biofoundry develops fermentation-derived truffle aroma ingredients for B2B food manufacturers using controlled submerged liquid fermentation.",
  "/"
);
export default function Home() {
  return <FoundryExperience content={<HomeScience />} />;
}

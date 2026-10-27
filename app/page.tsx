import FoundryExperience from "@/components/FoundryExperience";
import HomeScience, { HomeProcess } from "@/components/content/HomeScience";
import { contentMetadata } from "@/lib/content-metadata";
import { description } from "@/lib/site";
export const metadata = contentMetadata("Fungal bioprocess research", description, "/");
export default function Home() {
  return <FoundryExperience processContent={<HomeProcess />} content={<HomeScience />} />;
}

import type { Metadata } from "next";
import OrganicWorldPage from "@/organic-world/OrganicWorldPage";

export const metadata: Metadata = {
  title: "Huner Biofoundry — Experimental living journey",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <OrganicWorldPage />;
}

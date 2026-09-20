import type { Metadata } from "next";
import OrganicWorldLab from "@/organic-world/OrganicWorldLab";
export const metadata: Metadata = { title: "Organic World — Camera study", robots: { index: false, follow: false } };
export default function Page() { return <OrganicWorldLab />; }

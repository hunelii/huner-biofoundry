import ReadingPage from "@/components/content/ReadingPage";
import JournalSearch from "@/components/content/JournalSearch";
import { visibleArticles } from "@/content/server";
import { readingMinutes } from "@/content/schema";
import { contentMetadata } from "@/lib/content-metadata";
export const metadata = contentMetadata("Research journal", "Educational notes on fungal cultivation, modeling and process development. Research updates are distinguished from explainers.", "/journal/");
export default function Page() { return <ReadingPage path="/journal/" chapter="Journal" title="Notes from the work of understanding." intro="A place for methods, questions and careful explanations. Educational writing is distinct from experimental results; laboratory updates require documented, approved observations."><JournalSearch articles={visibleArticles.map(article => ({ slug: article.slug, title: article.title, summary: article.summary, category: article.category, date: article.publishedAt, minutes: readingMinutes(article), draft: article.publicationStatus === "draft" }))} /></ReadingPage>; }

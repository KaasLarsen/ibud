import type { Metadata } from "next";
import { ResultView } from "@/components/ResultView";

export const metadata: Metadata = {
  title: "Dit bedste tilbud",
  robots: { index: false, follow: false },
};

export default function ResultPage() {
  return <ResultView />;
}

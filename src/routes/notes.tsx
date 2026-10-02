import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { CalendarCheck, Loader2, NotebookPen } from "lucide-react";
import { summarizeNotes } from "@/lib/ai.functions";
import { AiOutput } from "@/components/ai-output";

export const Route = createFileRoute("/notes")({
  head: () => ({
    meta: [
      { title: "Meeting Notes Summarizer — AI EduAssist" },
      {
        name: "description",
        content:
          "Paste meeting notes and get a concise AI summary with key decisions, action items, owners, and deadlines.",
      },
      { property: "og:title", content: "Meeting Notes Summarizer — AI EduAssist" },
      {
        property: "og:description",
        content:
          "Paste meeting notes and get a concise AI summary with key decisions, action items, owners, and deadlines.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: NotesPage,
});

function extractActionItems(markdown: string): string {
  const lines = markdown.split("\n");
  const items: string[] = [];
  let inSection = false;
  for (const line of lines) {
    if (/^#{1,4}\s/.test(line.trim())) {
      inSection = /action items?/i.test(line);
      continue;
    }
    if (inSection && /^[-*]\s+/.test(line.trim())) {
      items.push(line.trim().replace(/^[-*]\s+/, "").replace(/\*\*/g, ""));
    }
  }
  return items.join("\n");
}

function NotesPage() {
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const summarize = async () => {
    if (!notes.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await summarizeNotes({ data: { notes: notes.trim() } });
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const sendToPlanner = () => {
    const items = extractActionItems(output) || output;
    try {
      localStorage.setItem("eduassist-planner-tasks", items);
    } catch {
      // storage unavailable; navigate anyway
    }
    navigate({ to: "/planner" });
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <NotebookPen className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Meeting Notes Summarizer
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Paste your raw meeting notes and get a structured summary with decisions and action
            items.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <label htmlFor="meeting-notes" className="mb-2 block text-sm font-semibold text-foreground">
            Meeting notes
          </label>
          <textarea
            id="meeting-notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={14}
            placeholder="Paste your meeting notes here — rough bullets, transcripts, or scribbles all work."
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={summarize}
            disabled={!notes.trim() || loading}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Summarising…" : "Summarise Notes"}
          </button>
        </div>

        <div className="flex flex-col gap-3">
          <AiOutput
            output={output}
            loading={loading}
            placeholder="Your structured summary — decisions, action items, owners, and deadlines — will appear here."
          />
          {output && !loading && (
            <button
              onClick={sendToPlanner}
              className="flex items-center justify-center gap-2 rounded-lg border border-primary/30 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition-colors hover:bg-accent/70"
            >
              <CalendarCheck className="h-4 w-4" />
              Send action items to Task Planner
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

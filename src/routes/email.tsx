import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Loader2, Mail } from "lucide-react";
import { generateEmail } from "@/lib/ai.functions";
import { AiOutput } from "@/components/ai-output";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/email")({
  head: () => ({
    meta: [
      { title: "Smart Email Generator — AI EduAssist" },
      {
        name: "description",
        content:
          "Generate professional emails for education contexts in formal, friendly, or persuasive tones.",
      },
      { property: "og:title", content: "Smart Email Generator — AI EduAssist" },
      {
        property: "og:description",
        content:
          "Generate professional emails for education contexts in formal, friendly, or persuasive tones.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: EmailPage,
});

const tones = [
  { value: "formal", label: "Formal" },
  { value: "friendly", label: "Friendly" },
  { value: "persuasive", label: "Persuasive" },
] as const;

type Tone = (typeof tones)[number]["value"];

function EmailPage() {
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [context, setContext] = useState("");
  const [tone, setTone] = useState<Tone>("formal");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const generate = async () => {
    if (!context.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await generateEmail({
        data: {
          context: context.trim(),
          recipientName: recipientName.trim(),
          subject: subject.trim(),
          tone,
        },
      });
      setOutput(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-secondary">
          <Mail className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            Smart Email Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Describe what the email should say, pick a tone, and let AI draft it for you.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <div className="mb-4 grid gap-4 sm:grid-cols-2">
            <div>
              <label
                htmlFor="recipient-name"
                className="mb-2 block text-sm font-semibold text-foreground"
              >
                Recipient name
              </label>
              <input
                id="recipient-name"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                placeholder="e.g. Mrs Dlamini"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label htmlFor="email-subject" className="mb-2 block text-sm font-semibold text-foreground">
                Email subject
              </label>
              <input
                id="email-subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Parent-Teacher Evening — Thursday"
                className="w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <label htmlFor="email-context" className="mb-2 block text-sm font-semibold text-foreground">
            What should the email cover?
          </label>
          <textarea
            id="email-context"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            rows={8}
            placeholder="e.g. Write to parents about the parent-teacher evening next Thursday at 18:00. Remind them to book a slot and bring their child's progress report."
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <p className="mb-2 mt-4 block text-sm font-semibold text-foreground">Tone</p>
          <div className="flex flex-wrap gap-2">
            {tones.map((t) => (
              <button
                key={t.value}
                onClick={() => setTone(t.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  tone === t.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={generate}
            disabled={!context.trim() || loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Generating…" : "Generate Email"}
          </button>
        </div>

        <AiOutput
          output={output}
          loading={loading}
          placeholder="Your AI-drafted email will appear here, ready to review and copy."
        />
      </div>
    </div>
  );
}

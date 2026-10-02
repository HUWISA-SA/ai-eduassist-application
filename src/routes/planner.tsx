import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CalendarCheck, Loader2 } from "lucide-react";
import { planTasks } from "@/lib/ai.functions";
import { AiOutput } from "@/components/ai-output";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/planner")({
  head: () => ({
    meta: [
      { title: "AI Task Planner — AI EduAssist" },
      {
        name: "description",
        content:
          "Turn your task list into a prioritised daily or weekly schedule, ranked by urgency and importance.",
      },
      { property: "og:title", content: "AI Task Planner — AI EduAssist" },
      {
        property: "og:description",
        content:
          "Turn your task list into a prioritised daily or weekly schedule, ranked by urgency and importance.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: PlannerPage,
});

const horizons = [
  { value: "daily", label: "Daily plan" },
  { value: "weekly", label: "Weekly plan" },
] as const;

type Horizon = (typeof horizons)[number]["value"];

function PlannerPage() {
  const [tasks, setTasks] = useState("");
  const [horizon, setHorizon] = useState<Horizon>("daily");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [imported, setImported] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem("eduassist-planner-tasks");
      if (saved) {
        setTasks(saved);
        setImported(true);
        localStorage.removeItem("eduassist-planner-tasks");
      }
    } catch {
      // storage unavailable
    }
  }, []);

  const plan = async () => {
    if (!tasks.trim() || loading) return;
    setLoading(true);
    setError("");
    try {
      const result = await planTasks({ data: { tasks: tasks.trim(), horizon } });
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
          <CalendarCheck className="h-5 w-5 text-secondary-foreground" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground md:text-2xl">
            AI Task Planner
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            List your tasks and get a prioritised schedule based on urgency and importance.
          </p>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
          <label htmlFor="task-list" className="mb-2 block text-sm font-semibold text-foreground">
            Your tasks
          </label>
          {imported && (
            <p className="mb-2 rounded-lg bg-accent px-3 py-2 text-xs font-medium text-accent-foreground">
              Action items imported from your meeting summary — edit as needed.
            </p>
          )}
          <textarea
            id="task-list"
            value={tasks}
            onChange={(e) => setTasks(e.target.value)}
            rows={12}
            placeholder={"One task per line, e.g.\nMark Grade 10 essays (due Friday)\nPrepare lesson plan for Monday\nReply to parent emails\nStaff meeting prep"}
            className="w-full resize-y rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          />

          <p className="mb-2 mt-4 block text-sm font-semibold text-foreground">Planning horizon</p>
          <div className="flex flex-wrap gap-2">
            {horizons.map((h) => (
              <button
                key={h.value}
                onClick={() => setHorizon(h.value)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  horizon === h.value
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {h.label}
              </button>
            ))}
          </div>

          {error && (
            <p className="mt-4 rounded-lg bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={plan}
            disabled={!tasks.trim() || loading}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Planning…" : "Generate Plan"}
          </button>
        </div>

        <AiOutput
          output={output}
          loading={loading}
          placeholder="Your prioritised schedule will appear here, with tasks ranked by urgency and importance."
        />
      </div>
    </div>
  );
}

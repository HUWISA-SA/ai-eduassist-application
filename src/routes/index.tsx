import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, CalendarCheck, Mail, NotebookPen } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI EduAssist" },
      {
        name: "description",
        content:
          "Your AI productivity dashboard: draft professional emails, summarise meeting notes, and plan your day.",
      },
      { property: "og:title", content: "Dashboard — AI EduAssist" },
      {
        property: "og:description",
        content:
          "Your AI productivity dashboard: draft professional emails, summarise meeting notes, and plan your day.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Dashboard,
});

const tools = [
  {
    title: "Smart Email Generator",
    description:
      "Draft professional emails in seconds. Choose a formal, friendly, or persuasive tone.",
    url: "/email",
    icon: Mail,
  },
  {
    title: "Meeting Notes Summarizer",
    description:
      "Paste raw meeting notes and get a concise summary with decisions, action items, owners, and deadlines.",
    url: "/notes",
    icon: NotebookPen,
  },
  {
    title: "AI Task Planner",
    description:
      "Turn your task list into a prioritised daily or weekly schedule based on urgency and importance.",
    url: "/planner",
    icon: CalendarCheck,
  },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
          Welcome to AI EduAssist
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground md:text-base">
          Your AI-powered productivity assistant. Pick a tool below to save time on emails,
          meeting follow-ups, and daily planning — so you can focus on education.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {tools.map((tool) => (
          <Link
            key={tool.url}
            to={tool.url}
            className="group flex flex-col rounded-xl border border-border bg-card p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md"
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-secondary">
              <tool.icon className="h-5 w-5 text-secondary-foreground" />
            </div>
            <h2 className="text-base font-semibold text-foreground">{tool.title}</h2>
            <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted-foreground">
              {tool.description}
            </p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
              Open tool
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </span>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-border bg-accent/50 p-5">
        <h2 className="text-sm font-semibold text-foreground">Use AI responsibly</h2>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
          AI-generated content must be reviewed before use — always check accuracy, tone, and
          recipient details. Do not enter confidential or sensitive information such as learner
          records, personal data, or passwords.
        </p>
      </div>
    </div>
  );
}

import { Link, useRouterState } from "@tanstack/react-router";
import { CalendarCheck, GraduationCap, Mail, NotebookPen, Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { title: "Dashboard", url: "/", icon: GraduationCap },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Notes Summarizer", url: "/notes", icon: NotebookPen },
  { title: "Task Planner", url: "/planner", icon: CalendarCheck },
];

export function AppSidebar({ open, onClose }: { open: boolean; onClose: () => void }) {
  const currentPath = useRouterState({ select: (r) => r.location.pathname });

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-30 bg-navy/50 backdrop-blur-sm md:hidden"
          onClick={onClose}
          aria-hidden
        />
      )}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-navy text-navy-foreground transition-transform duration-200 md:static md:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sidebar-primary">
            <GraduationCap className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <p className="text-sm font-semibold leading-tight">AI EduAssist</p>
            <p className="text-xs text-navy-muted">Education productivity</p>
          </div>
          <button
            className="ml-auto rounded-md p-1.5 hover:bg-navy-hover md:hidden"
            onClick={onClose}
            aria-label="Close menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {items.map((item) => {
            const active = currentPath === item.url;
            return (
              <Link
                key={item.url}
                to={item.url}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-navy-active text-navy-foreground"
                    : "text-navy-muted hover:bg-navy-hover hover:text-navy-foreground",
                )}
              >
                <item.icon className="h-4.5 w-4.5 shrink-0" />
                {item.title}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-sidebar-border p-4">
          <p className="text-xs leading-relaxed text-navy-muted">
            AI-generated content must be reviewed before use. Do not enter confidential or
            sensitive information.
          </p>
        </div>
      </aside>
    </>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      className="rounded-md p-2 text-foreground hover:bg-muted md:hidden"
      onClick={onClick}
      aria-label="Open menu"
    >
      <Menu className="h-5 w-5" />
    </button>
  );
}

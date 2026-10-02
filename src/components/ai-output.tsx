import { useState } from "react";
import { Check, Copy, Loader2, Sparkles } from "lucide-react";

function renderMarkdown(md: string) {
  const lines = md.split("\n");
  const out: React.ReactNode[] = [];
  let list: string[] = [];
  let key = 0;

  const flushList = () => {
    if (list.length) {
      out.push(
        <ul key={key++} className="list-disc space-y-1 pl-5">
          {list.map((item, i) => (
            <li key={i}>{inline(item)}</li>
          ))}
        </ul>,
      );
      list = [];
    }
  };

  const inline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*)/g);
    return parts.map((p, i) =>
      p.startsWith("**") && p.endsWith("**") ? (
        <strong key={i} className="font-semibold text-foreground">
          {p.slice(2, -2)}
        </strong>
      ) : (
        p
      ),
    );
  };

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (/^#{1,4}\s/.test(line)) {
      flushList();
      out.push(
        <h3 key={key++} className="mt-4 mb-1.5 text-sm font-semibold text-primary first:mt-0">
          {line.replace(/^#{1,4}\s*/, "")}
        </h3>,
      );
    } else if (/^[-*]\s+/.test(line)) {
      list.push(line.replace(/^[-*]\s+/, ""));
    } else if (/^\d+\.\s+/.test(line)) {
      list.push(line.replace(/^\d+\.\s+/, ""));
    } else if (line.trim()) {
      flushList();
      out.push(
        <p key={key++} className="my-1.5">
          {inline(line)}
        </p>,
      );
    } else {
      flushList();
    }
  }
  flushList();
  return out;
}

export function AiOutput({
  output,
  loading,
  placeholder,
}: {
  output: string;
  loading: boolean;
  placeholder: string;
}) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="flex min-h-64 flex-col rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-foreground">
          <Sparkles className="h-4 w-4 text-primary" />
          AI Result
        </h2>
        {output && !loading && (
          <button
            onClick={copy}
            className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
            {copied ? "Copied" : "Copy"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating with AI…
        </div>
      ) : output ? (
        <div className="text-sm leading-relaxed text-foreground/90">{renderMarkdown(output)}</div>
      ) : (
        <div className="flex flex-1 items-center justify-center">
          <p className="max-w-xs text-center text-sm text-muted-foreground">{placeholder}</p>
        </div>
      )}
    </div>
  );
}

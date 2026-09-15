import React, { useState } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Check, Copy } from "lucide-react";

interface FormattedAgentMessageProps {
  content: string;
  showCopy?: boolean;
}

export const FormattedAgentMessage: React.FC<FormattedAgentMessageProps> = ({
  content,
  showCopy = true,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    if (!content) return;
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (!content) return null;

  return (
    <div className="relative group text-xs text-slate-200">
      {showCopy && (
        <button
          onClick={handleCopy}
          title="Copy response to clipboard"
          className="absolute top-2 right-2 p-1.5 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/80 transition-all opacity-0 group-hover:opacity-100 cursor-pointer z-10"
        >
          {copied ? (
            <Check className="h-3.5 w-3.5 text-emerald-400" />
          ) : (
            <Copy className="h-3.5 w-3.5" />
          )}
        </button>
      )}

      <div className="markdown-body space-y-2.5">
        <Markdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h4 className="text-sm font-bold text-white mt-3 mb-1.5 pb-1 border-b border-slate-700/60 flex items-center gap-1.5">
                {children}
              </h4>
            ),
            h2: ({ children }) => (
              <h5 className="text-xs font-bold text-indigo-300 mt-2.5 mb-1 tracking-wide uppercase">
                {children}
              </h5>
            ),
            h3: ({ children }) => (
              <h6 className="text-xs font-semibold text-cyan-300 mt-2 mb-1 flex items-center gap-1">
                {children}
              </h6>
            ),
            p: ({ children }) => (
              <p className="leading-relaxed text-slate-300 mb-2 last:mb-0 text-xs">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-semibold text-white">
                {children}
              </strong>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 my-1.5 text-slate-300 pl-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 my-1.5 text-slate-300 pl-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-relaxed text-xs">
                {children}
              </li>
            ),
            table: ({ children }) => (
              <div className="overflow-x-auto my-3 rounded-lg border border-slate-700/80 bg-slate-900/90 shadow-sm max-w-full">
                <table className="w-full border-collapse text-left text-[11px]">
                  {children}
                </table>
              </div>
            ),
            thead: ({ children }) => (
              <thead className="bg-slate-800/90 text-slate-200 border-b border-slate-700 font-semibold">
                {children}
              </thead>
            ),
            tbody: ({ children }) => (
              <tbody className="divide-y divide-slate-800/80">
                {children}
              </tbody>
            ),
            tr: ({ children }) => (
              <tr className="hover:bg-slate-800/40 transition-colors even:bg-slate-800/20">
                {children}
              </tr>
            ),
            th: ({ children }) => (
              <th className="px-3 py-2 text-indigo-300 font-semibold tracking-wider text-[11px] whitespace-nowrap">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="px-3 py-1.5 text-slate-300 leading-snug">
                {children}
              </td>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-indigo-500 pl-3 py-1 my-2 bg-indigo-950/20 rounded-r text-slate-400 italic text-xs">
                {children}
              </blockquote>
            ),
            code: ({ children }) => (
              <code className="bg-slate-950 px-1.5 py-0.5 rounded text-indigo-300 font-mono text-[11px] border border-slate-800">
                {children}
              </code>
            ),
            hr: () => <hr className="my-2.5 border-slate-800" />,
          }}
        >
          {content}
        </Markdown>
      </div>
    </div>
  );
};

import { memo } from 'react';
import ReactMarkdown from 'react-markdown';
import { cn } from '../../lib/utils';

/**
 * Component to render markdown content with beautiful styling
 * @param {Object} props - Component props
 * @param {string} props.content - Markdown content to render
 * @param {string} props.className - Additional CSS classes
 */
const MarkdownRenderer = memo(({ content, className = '' }) => {
  return (
    <div className={cn("prose prose-sm max-w-none", className)}>
      <ReactMarkdown
        components={{
          // Custom heading styles
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-gray-900 mb-3 mt-4 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-gray-800 mb-2 mt-3 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-gray-700 mb-2 mt-2 first:mt-0">
              {children}
            </h3>
          ),
          
          // Custom paragraph styles
          p: ({ children }) => (
            <p className="text-gray-700 mb-3 leading-relaxed last:mb-0">
              {children}
            </p>
          ),
          
          // Custom list styles
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-1 mb-3 text-gray-700">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-1 mb-3 text-gray-700">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="text-gray-700 leading-relaxed">
              {children}
            </li>
          ),
          
          // Custom code block styles
          code: ({ node, inline, className, children, ...props }) => {
            if (inline) {
              return (
                <code
                  className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono"
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <div className="relative mb-3">
                <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4 overflow-x-auto">
                  <code className="text-sm font-mono text-gray-800" {...props}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          
          // Custom blockquote styles
          blockquote: ({ children }) => (
            <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-2 mb-3 italic text-gray-700">
              {children}
            </blockquote>
          ),
          
          // Custom table styles
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3">
              <table className="min-w-full border border-gray-200 rounded-lg">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-gray-50">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="border border-gray-200 px-4 py-2 text-left font-semibold text-gray-700">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border border-gray-200 px-4 py-2 text-gray-700">
              {children}
            </td>
          ),
          
          // Custom horizontal rule
          hr: () => (
            <hr className="border-gray-300 my-4" />
          ),
          
          // Custom link styles
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-blue-600 hover:text-blue-800 underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
          
          // Custom strong/bold styles
          strong: ({ children }) => (
            <strong className="font-semibold text-gray-900">
              {children}
            </strong>
          ),
          
          // Custom emphasis/italic styles
          em: ({ children }) => (
            <em className="italic text-gray-700">
              {children}
            </em>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
});

MarkdownRenderer.displayName = "MarkdownRenderer";

export default MarkdownRenderer;

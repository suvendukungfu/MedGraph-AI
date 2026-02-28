import { motion } from 'framer-motion'

import type { BlueprintSection } from '../../types/architecture'

interface BlueprintSectionCardProps {
  section: BlueprintSection
}

export const BlueprintSectionCard = ({ section }: BlueprintSectionCardProps) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      className="glass-card"
      id={`section-${section.id}`}
    >
      <div className="mb-4 flex items-start gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-clinic-600 text-sm font-bold text-white">
          {section.id}
        </div>
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900">{section.title}</h2>
          <p className="mt-1 text-sm text-slate-600">{section.summary}</p>
        </div>
      </div>

      <div className="space-y-4">
        {section.blocks.map((block) => (
          <div key={block.title} className="rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-700">{block.title}</h3>
            <ul className="mt-2 space-y-2 text-sm text-slate-600">
              {block.items.map((item) => (
                <li key={item} className="rounded-md bg-slate-50 px-3 py-2">
                  {item}
                </li>
              ))}
            </ul>
          </div>
        ))}

        {section.tables?.map((table) => (
          <div key={table.title} className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="border-b border-slate-200 bg-slate-50 px-4 py-3 text-sm font-semibold text-slate-700">
              {table.title}
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-100 text-xs uppercase tracking-wide text-slate-600">
                  <tr>
                    {table.columns.map((column) => (
                      <th key={column} className="px-3 py-2 font-semibold">
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {table.rows.map((row, index) => (
                    <tr key={`${table.title}-${index}`} className="border-t border-slate-100">
                      {row.map((cell, cellIndex) => (
                        <td key={`${table.title}-${index}-${cellIndex}`} className="px-3 py-2 text-slate-700">
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {section.codeBlocks?.map((codeBlock) => (
          <div key={codeBlock.title} className="overflow-hidden rounded-xl border border-slate-200 bg-slate-950">
            <div className="border-b border-slate-700 bg-slate-900 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-slate-300">
              {codeBlock.title} · {codeBlock.language}
            </div>
            <pre className="max-h-[420px] overflow-auto p-4 text-xs leading-5 text-slate-100">
              <code>{codeBlock.content}</code>
            </pre>
          </div>
        ))}
      </div>
    </motion.article>
  )
}

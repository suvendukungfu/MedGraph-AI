import { PageHeader } from '../components/common/PageHeader'
import { BlueprintSectionCard } from '../components/architecture/BlueprintSectionCard'
import { architectureBlueprintSections } from '../data/architectureBlueprint'

export const ArchitectureBlueprintPage = () => {
  return (
    <section>
      <PageHeader
        eyebrow="Principal Blueprint"
        title="MediGraph.AI Competition-Grade System Design"
        subtitle="Judge-level architecture plan tailored for hackathon feasibility: modular monolith, SOLID boundaries, role-aware workflows, async intelligence, and HIPAA-lite security posture."
      />

      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <Badge label="Hackathon Realistic" tone="bg-emerald-50 text-emerald-700 border-emerald-200" />
        <Badge label="SOLID + Clean Architecture" tone="bg-blue-50 text-blue-700 border-blue-200" />
        <Badge label="PII-Safe by Design" tone="bg-amber-50 text-amber-700 border-amber-200" />
      </div>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside className="glass-card h-fit lg:sticky lg:top-24">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Section Navigator</p>
          <ul className="mt-3 space-y-2 text-sm">
            {architectureBlueprintSections.map((section) => (
              <li key={section.id}>
                <a
                  href={`#section-${section.id}`}
                  className="block rounded-lg border border-transparent px-3 py-2 font-medium text-slate-700 transition hover:border-slate-200 hover:bg-slate-50"
                >
                  {section.id}. {section.title}
                </a>
              </li>
            ))}
          </ul>
        </aside>

        <div className="space-y-5">
          {architectureBlueprintSections.map((section) => (
            <BlueprintSectionCard key={section.id} section={section} />
          ))}
        </div>
      </div>
    </section>
  )
}

interface BadgeProps {
  label: string
  tone: string
}

const Badge = ({ label, tone }: BadgeProps) => (
  <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${tone}`}>{label}</div>
)

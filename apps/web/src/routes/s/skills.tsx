import { createFileRoute } from '@tanstack/react-router'
import { SkillsPage } from '@/features/skills/components/skills-page'
import { skillsQuery } from '@/features/skills/queries'
import { guard } from '@/lib/guard'

export const Route = createFileRoute('/s/skills')({
  beforeLoad: guard('/s/skills'),
  loader: ({ context }) => context.queryClient.ensureQueryData(skillsQuery()),
  component: SkillsPage,
})

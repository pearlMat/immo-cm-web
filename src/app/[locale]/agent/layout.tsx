import { AgentSidebar } from "@/components/layout/AgentSidebar"
import { getServerUser } from "@/lib/auth-server"

export default async function AgentLayout({ children }: { children: React.ReactNode }) {
  const user = await getServerUser()

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-1">
      <AgentSidebar user={user} />
      <div className="flex-1 px-4 py-6 pb-20 md:px-6 md:pb-6">{children}</div>
    </div>
  )
}

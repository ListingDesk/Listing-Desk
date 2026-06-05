import { createFileRoute, redirect, Outlet } from '@tanstack/react-router'
import { getUser } from '@netlify/identity'

export const Route = createFileRoute('/admin')({
  beforeLoad: async () => {
    const user = await getUser()
    if (!user) {
      throw redirect({ to: '/admin/login' })
    }
  },
  component: AdminLayout,
})

function AdminLayout() {
  return <Outlet />
}

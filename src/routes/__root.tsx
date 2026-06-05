import { HeadContent, Link, Outlet, Scripts, createRootRoute } from '@tanstack/react-router'
import '../styles.css'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { title: 'ListHub – Browse Listings' },
    ],
  }),
  shellComponent: RootDocument,
})

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
            <Link to="/" className="text-xl font-bold text-indigo-600 tracking-tight">
              ListHub
            </Link>
            <div className="flex items-center gap-4">
              <Link to="/" className="text-sm text-gray-600 hover:text-indigo-600 transition-colors">
                Browse
              </Link>
              <Link
                to="/submit"
                className="text-sm text-gray-600 hover:text-indigo-600 transition-colors"
              >
                Submit Item
              </Link>
              <Link
                to="/admin"
                className="text-sm bg-indigo-600 text-white px-3 py-1.5 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Admin
              </Link>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <Scripts />
      </body>
    </html>
  )
}

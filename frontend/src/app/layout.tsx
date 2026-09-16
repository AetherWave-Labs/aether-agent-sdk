import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Aether Agent Dashboard',
  description: 'Operations UI for managing autonomous blockchain agents',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900 min-h-screen">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16 items-center">
              <div className="flex items-center space-x-8">
                <h1 className="text-xl font-bold text-indigo-600">Aether Agent</h1>
                <a href="/" className="text-gray-600 hover:text-gray-900">Dashboard</a>
                <a href="/transactions" className="text-gray-600 hover:text-gray-900">Transactions</a>
                <a href="/policies" className="text-gray-600 hover:text-gray-900">Policies</a>
                <a href="/audit" className="text-gray-600 hover:text-gray-900">Audit Log</a>
              </div>
            </div>
          </div>
        </nav>
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {children}
        </main>
      </body>
    </html>
  );
}

import Header from '../../organisms/Header/Header'

interface MainLayoutProps {
  children: React.ReactNode
  lockLocationSelection?: boolean
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, lockLocationSelection = false }) => {
  return (
    <div className="min-h-screen bg-cinema-dark-900">
      <Header lockLocationSelection={lockLocationSelection} />
      <main className="w-full px-4 sm:px-6 lg:px-8 py-12">
        {children}
      </main>
    </div>
  )
}

export default MainLayout

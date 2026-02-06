import { Button } from '@/components/ui/button'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '@/features/auth/hooks/useAuth'

export default function Navbar() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/')
  }

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <Link to="/" className="flex items-center">
        <img 
          src="/Lcs_logo.png" 
          alt="LCS Logo" 
          className="h-11 w-auto ml-40"
        />
      </Link>

      {/* Right side buttons */}
      <div className="flex items-center space-x-3 mr-44">
        {isAuthenticated && user ? (
          <>
            <span className="text-sm font-medium text-gray-700">
              {user.name}
            </span>
            <Button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 text-lg"
            >
              Logout
            </Button>
          </>
        ) : (
          <>
            <Button 
              asChild 
              variant="outline"
              className="border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              <Link to="/signin">
                Log In
              </Link>
            </Button>
            
            <Button 
              asChild 
              variant="default"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold py-3 text-lg"
            >
              <Link to="/signup">
                Get Started
              </Link>
            </Button>
          </>
        )}
      </div>
    </nav>
  )
}
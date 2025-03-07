import { Link, useLocation } from 'react-router-dom'

const Navbar = () => {
  const location = useLocation()
  
  return (
    <nav className="bg-zinc-900 border-b border-zinc-800 py-3 px-4">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center">
          <Link to="/" className="text-white font-bold text-xl">schedule app</Link>
        </div>
        
        <div className="flex space-x-4">
          <NavLink to="/" current={location.pathname === "/"}>
            home
          </NavLink>
          <NavLink to="/status" current={location.pathname === "/status"}>
            status
          </NavLink>
        </div>
      </div>
    </nav>
  )
}

// NavLink component with active state
const NavLink = ({ to, children, current }: { to: string, children: React.ReactNode, current: boolean }) => {
  return (
    <Link 
      to={to} 
      className={`px-3 py-1 rounded-md transition-colors ${
        current 
          ? "bg-zinc-800 text-white" 
          : "text-zinc-400 hover:text-white hover:bg-zinc-800/50"
      }`}
    >
      {children}
    </Link>
  )
}

export default Navbar 
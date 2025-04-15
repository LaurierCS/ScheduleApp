import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const TwoFactorAuth = () => {
    return (
      <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[80vh] text-center">
        <h1 className="text-4xl font-bold mb-4 text-black">Two-Factor Authentication</h1>
        <p className="text-zinc-800 max-w-lg mb-8">check your email for your two-factor authentication code</p>
  
        <div className="flex space-x-4 mb-8">
          {[...Array(6)].map((_, index) => (
            <input
              key={index}
              type="text"
              maxLength={1}
              className="w-12 h-14 text-center text-lg border border-zinc-500 rounded bg-zinc-300 text-black focus:outline-none focus:ring-4 focus:oklch(0.97 0.001 106.424)"
            />
          ))}
        </div>
  
        <div className="space-y-4 w-full max-w-sm">
          <Button className="w-full bg-gray-300 text-gray-800 hover:bg-gray-400">Confirm</Button>
          <Link to="/" className="underline text-gray-600 hover:text-gray-400 block">
            Back to Login
          </Link>
          </div>
      </div>
    )
  }
  
  export default TwoFactorAuth
import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Home = () => {
  return (
    <div className="container mx-auto p-8 flex flex-col items-center justify-center min-h-[80vh] text-center">
      <h1 className="text-4xl font-bold mb-4 text-white">schedule app</h1>
      <p className="text-zinc-400 max-w-lg mb-8">
        welcome to the schedule app project. this is a demo application for managing schedules and appointments.
      </p>
      
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild className="bg-zinc-800 text-zinc-300 hover:bg-zinc-700 border-zinc-700">
            <Link to="/status">
              view system status
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Home 
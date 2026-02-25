import { Button } from '@/ui/button'
import { Link } from 'react-router-dom'   

const Welcome = () => {
  return (
    <div className="min-h-screen flex flex-col">
      {/* Main Content */}
      <div className="flex-1 flex flex-col lg:flex-row gap-0 items-center w-full">
        {/* Left Side - Marketing */}
        <div className="flex-none flex flex-col justify-center relative pl-6 sm:pl-8 lg:pl-12 pt-12">
          {/* Background Shapes for Left Side */}
          <div className="absolute -top-32 -left-48 w-64 h-64 bg-blue-100 opacity-10 rounded-full blur-3xl hidden lg:block"></div>
          <div className="absolute -bottom-32 -left-64 w-80 h-80 bg-purple-100 opacity-8 rounded-full blur-3xl hidden lg:block"></div>
          
          <div className="max-w-xl relative z-10">
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight mb-6">
              Schedule your
              <span className="text-blue-600 block">interviews smarter.</span>
            </h1>
            
            <p className="text-xl text-gray-600 mb-4 leading-relaxed">
              Beautiful booking pages, automated scheduling, and seamless coordination. All the tools your recruiting team needs in one place.
            </p>
            
            <p className="text-gray-500 mb-8">
              Trusted by leading companies worldwide.
            </p>
            
            {/* Sign-up Options */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                asChild 
                variant="default"
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-8 text-base rounded-lg transition-colors"
              >
                <Link to="/signup">
                  Get Started Free
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 hover:border-gray-400 font-semibold py-2.5 px-8 text-base rounded-lg transition-colors"
              >
                <Link to="/signin">
                  Sign In
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Demo/Preview */}
        <div className="flex-1 flex flex-col items-center justify-center relative pt-12 scale-90 origin-top">
          
          {/* Demo Card */}
          <div className="relative bg-white rounded-xl shadow-lg p-6 w-full max-w-lg border border-gray-200 z-10">
            {/* Card Header */}
            <div className="mb-5">
              <h3 className="text-lg font-bold text-gray-900">Interview Booking</h3>
              <p className="text-sm text-gray-500 mt-1">Pick a time that works best</p>
            </div>
            
            {/* Interviewer Info Card */}
            <div className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg mb-5 border border-blue-100">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-white">
                JM
              </div>
              <div className="min-w-0">
                <div className="font-semibold text-gray-900 truncate">Jessica Martin</div>
                <div className="text-sm text-gray-600">Hiring Manager</div>
              </div>
            </div>
            
            {/* Interview Info */}
            <div className="space-y-3 mb-5 pb-5 border-b border-gray-200">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Position</div>
                <div className="text-sm font-medium text-gray-900">Senior Engineer</div>
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Duration & Format</div>
                <div className="text-sm text-gray-700">60 min • <span className="text-blue-600 font-medium">Google Meet</span></div>
              </div>
            </div>
            
            {/* Time Slots */}
            <div className="mb-5">
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Available Times</div>
              <div className="grid grid-cols-2 gap-2">
                <button className="p-3 text-sm border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left font-medium text-gray-800">
                  Dec 15
                  <div className="text-xs text-gray-600 mt-0.5">2:00 PM</div>
                </button>
                <button className="p-3 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-left font-medium">
                  Dec 16
                  <div className="text-xs opacity-90 mt-0.5">10:00 AM</div>
                </button>
                <button className="p-3 text-sm border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left font-medium text-gray-800">
                  Dec 17
                  <div className="text-xs text-gray-600 mt-0.5">3:30 PM</div>
                </button>
                <button className="p-3 text-sm border border-gray-300 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition text-left font-medium text-gray-800">
                  Dec 20
                  <div className="text-xs text-gray-600 mt-0.5">1:00 PM</div>
                </button>
              </div>
            </div>
            
            {/* CTA */}
            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 text-sm rounded-lg transition-colors">
              Continue
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Welcome

import { Button } from '@/components/ui/button'
import { Link } from 'react-router-dom'

const Landing = () => {
  return (
    <div className="min-h-screen bg-white overflow-x-hidden">
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 z-10 flex items-center justify-between px-6 py-4 bg-white/95 backdrop-blur-sm border-b border-gray-200">
        <img 
          src="/Lcs_logo.png" 
          alt="LCS Logo" 
          className="h-11 w-auto flex items-center space-x-3 ml-40"
        />
        
        {/* Right side buttons */}
        <div className="flex items-center space-x-3 mr-44">
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
        </div>
      </nav>
      
      {/* Main Content */}
      <div className="flex flex-col lg:flex-row h-screen max-w-7xl mx-auto">
        {/* Left Side - Marketing */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 relative">
          {/* Background Shapes for Left Side */}
          <div className="absolute top-1/4 -left-40 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-blue-100 opacity-30 rotate-45" style={{borderRadius: '50%'}}></div>
          <div className="absolute bottom-1/3 -left-60 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-purple-100 rounded-lg opacity-35 rotate-135"></div>
          <div className="absolute top-1/2 -left-28 w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 bg-blue-100 opacity-25 rotate-90" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-3/4 -left-28 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-lg opacity-40 rotate-12"></div>
          
          <div className="max-w-md lg:max-w-lg relative z-10">
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Easy scheduling
              <span className="text-blue-600 block">ahead.</span>
            </h1>
            
            <p className="text-lg text-gray-600 mb-6">
              Easily book and schedule interviews with the #1 scheduling tool.
            </p>
            
            {/* Sign-up Options */}
            <div className="space-y-3">
              <Button 
                asChild 
                variant="default"
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white hover:text-white font-semibold py-3 text-lg"
              >
                <Link to="/signup">
                  Get Started
                </Link>
              </Button>
              
              <Button 
                asChild 
                variant="outline"
                size="lg"
                className="w-full border-gray-300 text-gray-700 hover:bg-gray-50 font-semibold py-3 text-lg"
              >
                <Link to="/signin">
                  Log in
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Right Side - Demo/Preview */}
        <div className="flex-1 relative flex items-center justify-center px-4 sm:px-6 lg:px-8">
          {/* Abstract Background Shapes */}
          <div className="absolute top-4 right-4 w-24 h-24 sm:w-28 sm:h-28 lg:w-32 lg:h-32 bg-blue-100 opacity-50 rotate-90" style={{borderRadius: '50%'}}></div>
          <div className="absolute bottom-4 right-4 w-20 h-20 sm:w-24 sm:h-24 lg:w-28 lg:h-28 bg-purple-100 rounded-lg opacity-50 rotate-135"></div>
          
          {/* Additional Background Shapes */}
          <div className="absolute top-1/4 left-8 w-16 h-16 sm:w-20 sm:h-20 lg:w-24 lg:h-24 bg-blue-100 opacity-30 rotate-45" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-3/4 left-4 w-12 h-12 sm:w-16 sm:h-16 lg:w-20 lg:h-20 bg-purple-100 rounded-lg opacity-40 rotate-12"></div>
          <div className="absolute top-1/2 right-8 w-14 h-14 sm:w-18 sm:h-18 lg:w-22 lg:h-22 bg-blue-100 opacity-35 rotate-180" style={{borderRadius: '50%'}}></div>
          <div className="absolute top-1/3 left-1/4 w-10 h-10 sm:w-14 sm:h-14 lg:w-18 lg:h-18 bg-purple-100 rounded-lg opacity-45 rotate-45"></div>
          <div className="absolute bottom-1/3 right-1/4 w-18 h-18 sm:w-22 sm:h-22 lg:w-26 lg:h-26 bg-blue-100 opacity-25 rotate-270" style={{borderRadius: '50%'}}></div>
          
          {/* Demo Card */}
          <div className="relative bg-white rounded-2xl shadow-2xl p-4 sm:p-6 max-w-xs sm:max-w-sm w-full border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Share your booking page</h3>
            
            <div className="space-y-4">
              {/* Event Details */}
              <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">F</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900 text-sm">Fatima Sy</div>
                  <div className="text-xs text-gray-600">Interview</div>
                  <div className="text-xs text-gray-500">30 min • Zoom</div>
                </div>
              </div>
              
              {/* Calendar Preview */}
              <div className="space-y-3">
                <h4 className="font-medium text-gray-900 text-sm">Select a Date & Time</h4>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={i} className="text-xs text-gray-500 py-1">{day}</div>
                  ))}
                  <div className="py-1"></div>
                  <div className="py-1"></div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">16</div>
                  <div className="py-1"></div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">19</div>
                  <div className="py-1"></div>
                  <div className="py-1 bg-blue-600 text-white rounded-full text-xs">22</div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">23</div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">24</div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">25</div>
                  <div className="py-1"></div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">30</div>
                  <div className="py-1 text-blue-600 bg-blue-50 rounded-full text-xs">31</div>
                </div>
              </div>
              
              {/* Time Slots */}
              <div className="space-y-2">
                <h5 className="font-medium text-gray-900 text-sm">Monday, July 22</h5>
                <div className="grid grid-cols-2 gap-2">
                  <div className="p-2 text-xs border border-gray-200 rounded bg-white">10:00am</div>
                  <div className="p-2 text-xs bg-blue-600 text-white rounded">11:00am</div>
                  <div className="p-2 text-xs border border-gray-200 rounded bg-white">1:00pm</div>
                  <div className="p-2 text-xs border border-gray-200 rounded bg-white">2:30pm</div>
                </div>
                <div className="w-full mt-3 bg-blue-600 text-white text-sm py-2 rounded text-center">
                  Confirm
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Landing

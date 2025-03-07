import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle, XCircle, Clock, Terminal } from "lucide-react"

// types for our status checks
interface StatusCheck {
  name: string
  status: 'success' | 'error' | 'pending'
  message: string
  details?: string
}

// main status dashboard component
const StatusDashboard = () => {
  const [statusChecks, setStatusChecks] = useState<StatusCheck[]>([
    { name: 'frontend', status: 'pending', message: 'checking frontend configuration...' },
    { name: 'backend', status: 'pending', message: 'checking backend connection...' },
    { name: 'mongodb', status: 'pending', message: 'checking database connection...' },
    { name: 'tailwind', status: 'pending', message: 'checking tailwind css...' }
  ])
  const [logs, setLogs] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // add a log message
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString()
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev])
  }

  // update a specific status check
  const updateStatus = (name: string, status: 'success' | 'error' | 'pending', message: string, details?: string) => {
    setStatusChecks(prev => 
      prev.map(check => 
        check.name === name 
          ? { ...check, status, message, details } 
          : check
      )
    )
    
    // add to logs
    addLog(`${name}: ${status === 'success' ? '✅' : status === 'error' ? '❌' : '⏳'} ${message}`)
  }

  // check frontend status (tailwind, react)
  const checkFrontend = () => {
    // check if tailwind is working by testing a tailwind class
    const testElement = document.createElement('div')
    testElement.className = 'hidden'
    document.body.appendChild(testElement)
    
    const styles = window.getComputedStyle(testElement)
    const tailwindWorking = styles.display === 'none'
    document.body.removeChild(testElement)
    
    if (tailwindWorking) {
      updateStatus('tailwind', 'success', 'tailwind css is properly configured')
    } else {
      updateStatus('tailwind', 'error', 'tailwind css is not working properly')
    }
    
    // react is working if we can see this component
    updateStatus('frontend', 'success', 'react frontend is properly configured')
  }

  // check backend status
  const checkBackend = async (): Promise<'success' | 'error'> => {
    try {
      const response = await fetch('http://localhost:5000')
      
      if (response.ok) {
        const data = await response.json()
        updateStatus('backend', 'success', 'connected to backend server', `Server response: ${data.message}`)
        return 'success'
      } else {
        updateStatus('backend', 'error', `backend check failed: ${response.status}`)
        return 'error'
      }
    } catch (error) {
      updateStatus('backend', 'error', 'could not connect to backend server')
      return 'error'
    }
  }

  // check mongodb status through backend
  const checkMongoDB = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/status/db')
      
      if (response.ok) {
        const data = await response.json()
        updateStatus('mongodb', 'success', 'connected to mongodb', `Database: ${data.dbName}`)
      } else {
        updateStatus('mongodb', 'error', `database check failed: ${response.status}`)
      }
    } catch (error) {
      console.error('MongoDB check error:', error)
      updateStatus('mongodb', 'error', 'could not check database connection')
    }
  }

  // run all checks on mount
  useEffect(() => {
    // define the function inside useEffect to avoid dependency issues
    const runInitialChecks = async () => {
      // add initial log
      addLog('starting system checks...')
      
      // run frontend checks immediately
      checkFrontend()
      
      // run backend checks
      const backendResult = await checkBackend()
      
      // run mongodb checks if backend is available
      if (backendResult === 'success') {
        await checkMongoDB()
      }
      
      setIsLoading(false)
      addLog('system checks completed')
    }
    
    // call the function
    runInitialChecks()
  }, []) // empty dependency array means this runs once on mount
  
  // separate function for the refresh button
  const runChecks = async () => {
    setIsLoading(true)
    addLog('manually refreshing status checks...')
    
    // reset statuses to pending
    setStatusChecks(prev => 
      prev.map(check => ({ ...check, status: 'pending', message: `checking ${check.name}...` }))
    )
    
    // run frontend checks immediately
    checkFrontend()
    
    // run backend checks
    const backendResult = await checkBackend()
    
    // run mongodb checks if backend is available
    if (backendResult === 'success') {
      await checkMongoDB()
    }
    
    setIsLoading(false)
    addLog('status checks completed')
  }

  // get status badge
  const getStatusBadge = (status: 'success' | 'error' | 'pending') => {
    switch(status) {
      case 'success': 
        return (
          <Badge variant="outline" className="bg-green-500/10 text-green-500 border-green-500/20">
            <CheckCircle className="h-3.5 w-3.5 mr-1" />
            success
          </Badge>
        )
      case 'error': 
        return (
          <Badge variant="outline" className="bg-red-500/10 text-red-500 border-red-500/20">
            <XCircle className="h-3.5 w-3.5 mr-1" />
            error
          </Badge>
        )
      case 'pending': 
      default: 
        return (
          <Badge variant="outline" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
            <Clock className="h-3.5 w-3.5 mr-1 animate-pulse" />
            pending
          </Badge>
        )
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      {/* header */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">developer status dashboard</h1>
        <p className="text-muted-foreground">check your development environment configuration</p>
      </div>
      
      {/* status cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {statusChecks.map((check) => (
          <Card key={check.name}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-xl capitalize">{check.name}</CardTitle>
                {getStatusBadge(check.status)}
              </div>
              <CardDescription>
                {check.message}
              </CardDescription>
            </CardHeader>
            {check.details && (
              <CardContent className="pt-0 text-sm text-muted-foreground">
                {check.details}
              </CardContent>
            )}
          </Card>
        ))}
      </div>
      
      {/* log console */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal className="h-4 w-4" />
              <CardTitle className="text-sm">logs</CardTitle>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                disabled={isLoading} 
                onClick={runChecks}
                className="h-8 px-2 text-xs"
              >
                refresh status
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setLogs([])}
                className="h-8 px-2 text-xs"
              >
                clear logs
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-muted/50 h-40 rounded-md overflow-y-auto p-2 text-xs font-mono">
            {logs.length > 0 ? (
              logs.map((log, index) => (
                <div key={index} className="pb-1 border-b border-border/40 mb-1 last:border-0 last:mb-0 last:pb-0">
                  {log}
                </div>
              ))
            ) : (
              <div className="text-muted-foreground italic">no logs available</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      {/* alert for errors */}
      {statusChecks.some(check => check.status === 'error') && (
        <Alert variant="destructive" className="mt-6">
          <AlertDescription>
            some checks failed. please check the logs for more details.
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}

export default StatusDashboard 
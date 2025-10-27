import React, { useState, useEffect, useRef } from 'react'
import { 
  Moon, Sun, Mic, MicOff, Wifi, WifiOff, 
  Save, Download, Upload, Volume2, VolumeX,
  Eye, EyeOff, Settings, HelpCircle, Bell
} from 'lucide-react'
import toast from 'react-hot-toast'

const UXEnhancements = ({ onSettingsChange }) => {
  const [isDarkMode, setIsDarkMode] = useState(false)
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false)
  const [isOfflineMode, setIsOfflineMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [showAccessibilityPanel, setShowAccessibilityPanel] = useState(false)
  const [accessibilitySettings, setAccessibilitySettings] = useState({
    highContrast: false,
    largeText: false,
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true
  })
  const [draftData, setDraftData] = useState({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [pendingSync, setPendingSync] = useState([])
  const voiceRecognitionRef = useRef(null)

  useEffect(() => {
    // Load saved settings
    const savedSettings = localStorage.getItem('ats-ux-settings')
    if (savedSettings) {
      const settings = JSON.parse(savedSettings)
      setIsDarkMode(settings.darkMode || false)
      setIsVoiceEnabled(settings.voiceEnabled || false)
      setAccessibilitySettings(settings.accessibility || accessibilitySettings)
    }

    // Load draft data
    const savedDrafts = localStorage.getItem('ats-drafts')
    if (savedDrafts) {
      setDraftData(JSON.parse(savedDrafts))
    }

    // Setup voice recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      voiceRecognitionRef.current = new SpeechRecognition()
      voiceRecognitionRef.current.continuous = false
      voiceRecognitionRef.current.interimResults = false
      voiceRecognitionRef.current.lang = 'en-US'
    }

    // Setup online/offline detection
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Auto-save drafts every 30 seconds
    const autoSaveInterval = setInterval(saveDrafts, 30000)

    // Sync pending data when online
    const syncInterval = setInterval(syncPendingData, 60000)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
      clearInterval(autoSaveInterval)
      clearInterval(syncInterval)
    }
  }, [])

  const toggleDarkMode = () => {
    const newDarkMode = !isDarkMode
    setIsDarkMode(newDarkMode)
    
    // Apply dark mode to document
    if (newDarkMode) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    
    saveSettings({ darkMode: newDarkMode })
    toast.success(`Switched to ${newDarkMode ? 'dark' : 'light'} mode`)
  }

  const toggleVoiceInput = () => {
    if (!voiceRecognitionRef.current) {
      toast.error('Voice recognition not supported in this browser')
      return
    }

    const newVoiceEnabled = !isVoiceEnabled
    setIsVoiceEnabled(newVoiceEnabled)
    
    if (newVoiceEnabled) {
      startVoiceRecognition()
    } else {
      stopVoiceRecognition()
    }
    
    saveSettings({ voiceEnabled: newVoiceEnabled })
  }

  const startVoiceRecognition = () => {
    if (!voiceRecognitionRef.current) return

    voiceRecognitionRef.current.onstart = () => {
      toast.success('Listening... Speak now')
    }

    voiceRecognitionRef.current.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      handleVoiceInput(transcript)
    }

    voiceRecognitionRef.current.onerror = (event) => {
      console.error('Voice recognition error:', event.error)
      toast.error('Voice recognition failed')
    }

    voiceRecognitionRef.current.onend = () => {
      if (isVoiceEnabled) {
        // Restart if still enabled
        setTimeout(() => voiceRecognitionRef.current?.start(), 100)
      }
    }

    voiceRecognitionRef.current.start()
  }

  const stopVoiceRecognition = () => {
    if (voiceRecognitionRef.current) {
      voiceRecognitionRef.current.stop()
    }
  }

  const handleVoiceInput = (transcript) => {
    // This would be passed to parent component to handle voice input
    onSettingsChange?.({ type: 'voiceInput', data: transcript })
    toast.success(`Voice input: "${transcript}"`)
  }

  const saveDrafts = () => {
    try {
      localStorage.setItem('ats-drafts', JSON.stringify(draftData))
      console.log('Drafts saved locally')
    } catch (error) {
      console.error('Failed to save drafts:', error)
    }
  }

  const syncPendingData = async () => {
    if (!isOnline || pendingSync.length === 0) return

    try {
      // Simulate API sync
      for (const item of pendingSync) {
        // Sync logic here
        console.log('Syncing:', item)
      }
      
      setPendingSync([])
      toast.success('Data synced successfully')
    } catch (error) {
      console.error('Sync failed:', error)
    }
  }

  const saveSettings = (newSettings) => {
    const currentSettings = JSON.parse(localStorage.getItem('ats-ux-settings') || '{}')
    const updatedSettings = { ...currentSettings, ...newSettings }
    localStorage.setItem('ats-ux-settings', JSON.stringify(updatedSettings))
  }

  const updateAccessibilitySettings = (newSettings) => {
    const updated = { ...accessibilitySettings, ...newSettings }
    setAccessibilitySettings(updated)
    saveSettings({ accessibility: updated })
    
    // Apply accessibility settings
    applyAccessibilitySettings(updated)
    toast.success('Accessibility settings updated')
  }

  const applyAccessibilitySettings = (settings) => {
    const root = document.documentElement
    
    if (settings.highContrast) {
      root.classList.add('high-contrast')
    } else {
      root.classList.remove('high-contrast')
    }
    
    if (settings.largeText) {
      root.classList.add('large-text')
    } else {
      root.classList.remove('large-text')
    }
    
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion')
    } else {
      root.classList.remove('reduced-motion')
    }
  }

  const exportData = () => {
    try {
      const data = {
        settings: JSON.parse(localStorage.getItem('ats-ux-settings') || '{}'),
        drafts: draftData,
        timestamp: new Date().toISOString()
      }
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `ats-data-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
      
      toast.success('Data exported successfully')
    } catch (error) {
      toast.error('Failed to export data')
    }
  }

  const importData = (event) => {
    const file = event.target.files[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result)
        
        if (data.settings) {
          localStorage.setItem('ats-ux-settings', JSON.stringify(data.settings))
        }
        
        if (data.drafts) {
          setDraftData(data.drafts)
          localStorage.setItem('ats-drafts', JSON.stringify(data.drafts))
        }
        
        toast.success('Data imported successfully')
        window.location.reload() // Reload to apply settings
      } catch (error) {
        toast.error('Invalid data file')
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      {/* UX Controls */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Settings className="h-5 w-5 mr-2 text-blue-600" />
          User Experience Controls
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Dark Mode Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isDarkMode ? <Moon className="h-5 w-5 text-blue-600" /> : <Sun className="h-5 w-5 text-yellow-600" />}
              <span className="text-sm font-medium text-gray-900">Dark Mode</span>
            </div>
            <button
              onClick={toggleDarkMode}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isDarkMode ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Voice Input Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isVoiceEnabled ? <Mic className="h-5 w-5 text-green-600" /> : <MicOff className="h-5 w-5 text-gray-400" />}
              <span className="text-sm font-medium text-gray-900">Voice Input</span>
            </div>
            <button
              onClick={toggleVoiceInput}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isVoiceEnabled ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isVoiceEnabled ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              {isMuted ? <VolumeX className="h-5 w-5 text-red-600" /> : <Volume2 className="h-5 w-5 text-green-600" />}
              <span className="text-sm font-medium text-gray-900">Sound</span>
            </div>
            <button
              onClick={() => setIsMuted(!isMuted)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                !isMuted ? 'bg-green-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  !isMuted ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Accessibility Panel */}
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <HelpCircle className="h-5 w-5 text-purple-600" />
              <span className="text-sm font-medium text-gray-900">Accessibility</span>
            </div>
            <button
              onClick={() => setShowAccessibilityPanel(!showAccessibilityPanel)}
              className="px-3 py-1 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700"
            >
              {showAccessibilityPanel ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Panel */}
      {showAccessibilityPanel && (
        <div className="card">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <Eye className="h-5 w-5 mr-2 text-purple-600" />
            Accessibility Settings
          </h3>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">High Contrast</span>
                <p className="text-xs text-gray-500">Increase contrast for better visibility</p>
              </div>
              <button
                onClick={() => updateAccessibilitySettings({ highContrast: !accessibilitySettings.highContrast })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accessibilitySettings.highContrast ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accessibilitySettings.highContrast ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Large Text</span>
                <p className="text-xs text-gray-500">Increase text size for better readability</p>
              </div>
              <button
                onClick={() => updateAccessibilitySettings({ largeText: !accessibilitySettings.largeText })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accessibilitySettings.largeText ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accessibilitySettings.largeText ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Reduced Motion</span>
                <p className="text-xs text-gray-500">Minimize animations and transitions</p>
              </div>
              <button
                onClick={() => updateAccessibilitySettings({ reducedMotion: !accessibilitySettings.reducedMotion })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accessibilitySettings.reducedMotion ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accessibilitySettings.reducedMotion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div>
                <span className="text-sm font-medium text-gray-900">Keyboard Navigation</span>
                <p className="text-xs text-gray-500">Enhanced keyboard navigation support</p>
              </div>
              <button
                onClick={() => updateAccessibilitySettings({ keyboardNavigation: !accessibilitySettings.keyboardNavigation })}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  accessibilitySettings.keyboardNavigation ? 'bg-purple-600' : 'bg-gray-200'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    accessibilitySettings.keyboardNavigation ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Offline Mode & Sync */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          {isOnline ? <Wifi className="h-5 w-5 mr-2 text-green-600" /> : <WifiOff className="h-5 w-5 mr-2 text-red-600" />}
          Offline Mode & Data Sync
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`} />
              <span className="text-sm font-medium text-gray-900">
                {isOnline ? 'Online' : 'Offline'}
              </span>
            </div>
            <p className="text-xs text-gray-500">
              {isOnline ? 'All features available' : 'Limited offline functionality'}
            </p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Save className="h-4 w-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900">Auto-Save</span>
            </div>
            <p className="text-xs text-gray-500">Drafts saved every 30 seconds</p>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <Upload className="h-4 w-4 text-green-600" />
              <span className="text-sm font-medium text-gray-900">Pending Sync</span>
            </div>
            <p className="text-xs text-gray-500">{pendingSync.length} items pending</p>
          </div>
        </div>

        <div className="mt-4 flex items-center space-x-4">
          <button
            onClick={syncPendingData}
            disabled={!isOnline || pendingSync.length === 0}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="h-4 w-4 mr-2" />
            Sync Now
          </button>

          <button
            onClick={exportData}
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </button>

          <label className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import Data
            <input
              type="file"
              accept=".json"
              onChange={importData}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Keyboard Shortcuts Help */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <HelpCircle className="h-5 w-5 mr-2 text-blue-600" />
          Keyboard Shortcuts
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Toggle Dark Mode</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">Ctrl + D</kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Voice Input</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">Ctrl + V</kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Save Draft</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">Ctrl + S</kbd>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Accessibility Panel</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">Ctrl + A</kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Search Applications</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">Ctrl + F</kbd>
            </div>
            <div className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <span className="text-sm text-gray-700">Help</span>
              <kbd className="px-2 py-1 bg-gray-200 text-xs rounded">F1</kbd>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default UXEnhancements

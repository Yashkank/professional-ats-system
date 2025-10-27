import React, { useState } from 'react'
import { Briefcase, Sparkles, Clock, CheckCircle } from 'lucide-react'

const ApplicationButton = ({ 
  job, 
  onApply, 
  isApplied = false, 
  variant = 'default',
  size = 'md',
  showSmartOption = true 
}) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isApplied) return
    
    setIsLoading(true)
    try {
      await onApply?.(job)
    } finally {
      setIsLoading(false)
    }
  }

  const getButtonStyles = () => {
    const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const sizeStyles = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base'
    }
    
    const variantStyles = {
      default: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      smart: 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700 focus:ring-purple-500',
      applied: 'bg-green-100 text-green-800 border border-green-200 cursor-default',
      outline: 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50 focus:ring-blue-500'
    }
    
    return `${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]}`
  }

  const getIcon = () => {
    if (isApplied) return <CheckCircle className="h-4 w-4" />
    if (isLoading) return <Clock className="h-4 w-4 animate-spin" />
    if (variant === 'smart') return <Sparkles className="h-4 w-4" />
    return <Briefcase className="h-4 w-4" />
  }

  const getText = () => {
    if (isApplied) return 'Applied'
    if (isLoading) return 'Applying...'
    if (variant === 'smart') return 'Smart Apply'
    return 'Apply Now'
  }

  return (
    <button
      onClick={handleClick}
      disabled={isApplied || isLoading}
      className={getButtonStyles()}
      aria-label={isApplied ? 'Already applied' : 'Apply to job'}
    >
      {getIcon()}
      <span className="ml-2">{getText()}</span>
      
      {variant === 'smart' && showSmartOption && (
        <span className="ml-2 px-2 py-0.5 bg-white bg-opacity-20 rounded-full text-xs">
          AI-Powered
        </span>
      )}
    </button>
  )
}

export default ApplicationButton


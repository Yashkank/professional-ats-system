import React, { useState, useEffect } from 'react'
import { 
  Trophy, Star, Target, Award, Zap, TrendingUp, 
  CheckCircle, Clock, Users, BookOpen, Briefcase,
  Crown, Medal, Shield, Flame, Rocket, Diamond
} from 'lucide-react'
import toast from 'react-hot-toast'

const GamificationHub = ({ candidateProfile, applications }) => {
  const [achievements, setAchievements] = useState([])
  const [badges, setBadges] = useState([])
  const [challenges, setChallenges] = useState([])
  const [leaderboard, setLeaderboard] = useState([])
  const [userStats, setUserStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchGamificationData()
  }, [candidateProfile, applications])

  const fetchGamificationData = async () => {
    try {
      setIsLoading(true)
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock achievements data
      setAchievements([
        {
          id: 1,
          title: 'First Application',
          description: 'Submitted your first job application',
          icon: 'Briefcase',
          points: 50,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
          rarity: 'common'
        },
        {
          id: 2,
          title: 'Profile Completer',
          description: 'Completed 100% of your profile',
          icon: 'Target',
          points: 100,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
          rarity: 'uncommon'
        },
        {
          id: 3,
          title: 'Skill Master',
          description: 'Added 10+ skills to your profile',
          icon: 'Star',
          points: 75,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          rarity: 'common'
        },
        {
          id: 4,
          title: 'Interview Ace',
          description: 'Completed 3 interviews',
          icon: 'Users',
          points: 200,
          unlocked: false,
          rarity: 'rare'
        },
        {
          id: 5,
          title: 'Job Hunter',
          description: 'Applied to 25+ jobs',
          icon: 'Rocket',
          points: 150,
          unlocked: false,
          rarity: 'uncommon'
        },
        {
          id: 6,
          title: 'Resume Expert',
          description: 'Uploaded and optimized your resume',
          icon: 'BookOpen',
          points: 100,
          unlocked: true,
          unlockedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
          rarity: 'common'
        }
      ])

      // Mock badges data
      setBadges([
        {
          id: 1,
          name: 'Rising Star',
          description: 'New to the platform',
          icon: 'Star',
          color: 'yellow',
          unlocked: true,
          progress: 100
        },
        {
          id: 2,
          name: 'Profile Builder',
          description: 'Building a strong profile',
          icon: 'Target',
          color: 'blue',
          unlocked: true,
          progress: 100
        },
        {
          id: 3,
          name: 'Application Master',
          description: 'Expert at job applications',
          icon: 'Briefcase',
          color: 'green',
          unlocked: false,
          progress: 60
        },
        {
          id: 4,
          name: 'Networker',
          description: 'Building professional connections',
          icon: 'Users',
          color: 'purple',
          unlocked: false,
          progress: 30
        },
        {
          id: 5,
          name: 'Skill Collector',
          description: 'Continuously learning new skills',
          icon: 'BookOpen',
          color: 'orange',
          unlocked: true,
          progress: 100
        }
      ])

      // Mock challenges data
      setChallenges([
        {
          id: 1,
          title: 'Complete Your Profile',
          description: 'Fill out all profile sections to 100%',
          type: 'profile',
          reward: 100,
          progress: 85,
          target: 100,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          status: 'active',
          icon: 'Target'
        },
        {
          id: 2,
          title: 'Apply to 5 Jobs This Week',
          description: 'Submit applications to 5 different positions',
          type: 'application',
          reward: 150,
          progress: 3,
          target: 5,
          deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'active',
          icon: 'Briefcase'
        },
        {
          id: 3,
          title: 'Add 3 New Skills',
          description: 'Learn and add 3 new technical skills',
          type: 'skill',
          reward: 75,
          progress: 1,
          target: 3,
          deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: 'active',
          icon: 'BookOpen'
        },
        {
          id: 4,
          title: 'Network with 10 Professionals',
          description: 'Connect with 10 industry professionals',
          type: 'networking',
          reward: 200,
          progress: 0,
          target: 10,
          deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          status: 'upcoming',
          icon: 'Users'
        }
      ])

      // Mock leaderboard data
      setLeaderboard([
        {
          rank: 1,
          name: 'Alex Chen',
          points: 2450,
          badge: 'Crown',
          applications: 15,
          profile: 100
        },
        {
          rank: 2,
          name: 'Sarah Johnson',
          points: 2200,
          badge: 'Medal',
          applications: 12,
          profile: 95
        },
        {
          rank: 3,
          name: 'Mike Rodriguez',
          points: 1980,
          badge: 'Trophy',
          applications: 10,
          profile: 90
        },
        {
          rank: 4,
          name: 'You',
          points: 1250,
          badge: 'Star',
          applications: 8,
          profile: 85
        },
        {
          rank: 5,
          name: 'Emma Wilson',
          points: 1100,
          badge: 'Shield',
          applications: 7,
          profile: 80
        }
      ])

      // Mock user stats
      setUserStats({
        totalPoints: 1250,
        level: 3,
        levelProgress: 60,
        nextLevelPoints: 500,
        achievementsUnlocked: 4,
        totalAchievements: 6,
        currentStreak: 7,
        longestStreak: 12,
        applicationsThisWeek: 3,
        profileCompleteness: 85
      })

    } catch (error) {
      console.error('Gamification data fetch error:', error)
      toast.error('Failed to load gamification data')
    } finally {
      setIsLoading(false)
    }
  }

  const getRarityColor = (rarity) => {
    switch (rarity) {
      case 'common': return 'text-gray-600 bg-gray-100'
      case 'uncommon': return 'text-green-600 bg-green-100'
      case 'rare': return 'text-blue-600 bg-blue-100'
      case 'epic': return 'text-purple-600 bg-purple-100'
      case 'legendary': return 'text-yellow-600 bg-yellow-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getBadgeColor = (color) => {
    switch (color) {
      case 'yellow': return 'text-yellow-600 bg-yellow-100'
      case 'blue': return 'text-blue-600 bg-blue-100'
      case 'green': return 'text-green-600 bg-green-100'
      case 'purple': return 'text-purple-600 bg-purple-100'
      case 'orange': return 'text-orange-600 bg-orange-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getChallengeStatusColor = (status) => {
    switch (status) {
      case 'active': return 'text-blue-600 bg-blue-100'
      case 'completed': return 'text-green-600 bg-green-100'
      case 'upcoming': return 'text-gray-600 bg-gray-100'
      case 'expired': return 'text-red-600 bg-red-100'
      default: return 'text-gray-600 bg-gray-100'
    }
  }

  const getIconComponent = (iconName) => {
    const icons = {
      Trophy, Star, Target, Award, Zap, TrendingUp, CheckCircle, Clock, 
      Users, BookOpen, Briefcase, Crown, Medal, Shield, Flame, Rocket, Diamond
    }
    return icons[iconName] || Star
  }

  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Loading achievements...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Stats Overview */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Trophy className="h-5 w-5 mr-2 text-yellow-600" />
            Your Progress
          </h3>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">{userStats.totalPoints}</div>
            <div className="text-sm text-gray-500">Total Points</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-2">
              {userStats.level}
            </div>
            <p className="text-sm font-medium text-gray-900">Level {userStats.level}</p>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                style={{ width: `${userStats.levelProgress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              {userStats.nextLevelPoints} points to next level
            </p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{userStats.achievementsUnlocked}</p>
            <p className="text-xs text-gray-500">Achievements</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Flame className="h-8 w-8 text-orange-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{userStats.currentStreak}</p>
            <p className="text-xs text-gray-500">Day Streak</p>
          </div>

          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <p className="text-sm font-medium text-gray-900">{userStats.profileCompleteness}%</p>
            <p className="text-xs text-gray-500">Profile Complete</p>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Target className="h-5 w-5 mr-2 text-blue-600" />
          Active Challenges
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {challenges.map((challenge) => {
            const IconComponent = getIconComponent(challenge.icon)
            const progressPercentage = (challenge.progress / challenge.target) * 100
            
            return (
              <div key={challenge.id} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-white rounded-lg">
                      <IconComponent className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="font-medium text-gray-900">{challenge.title}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${getChallengeStatusColor(challenge.status)}`}>
                    {challenge.status}
                  </span>
                </div>

                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-1">
                    <span>Progress</span>
                    <span>{challenge.progress}/{challenge.target}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center text-sm text-gray-500">
                    <Clock className="h-4 w-4 mr-1" />
                    {challenge.deadline.toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm font-medium text-green-600">
                    <Zap className="h-4 w-4 mr-1" />
                    {challenge.reward} pts
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Achievements */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Award className="h-5 w-5 mr-2 text-purple-600" />
          Achievements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {achievements.map((achievement) => {
            const IconComponent = getIconComponent(achievement.icon)
            
            return (
              <div
                key={achievement.id}
                className={`p-4 rounded-lg border-2 ${
                  achievement.unlocked
                    ? 'bg-white border-green-200 shadow-sm'
                    : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
              >
                <div className="flex items-start space-x-3">
                  <div className={`p-2 rounded-lg ${
                    achievement.unlocked ? 'bg-green-100' : 'bg-gray-100'
                  }`}>
                    <IconComponent className={`h-6 w-6 ${
                      achievement.unlocked ? 'text-green-600' : 'text-gray-400'
                    }`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className={`font-medium ${
                        achievement.unlocked ? 'text-gray-900' : 'text-gray-500'
                      }`}>
                        {achievement.title}
                      </h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getRarityColor(achievement.rarity)}`}>
                        {achievement.points} pts
                      </span>
                    </div>
                    <p className={`text-sm ${
                      achievement.unlocked ? 'text-gray-600' : 'text-gray-400'
                    }`}>
                      {achievement.description}
                    </p>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <p className="text-xs text-gray-500 mt-1">
                        Unlocked {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Badges */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Medal className="h-5 w-5 mr-2 text-yellow-600" />
          Badges
        </h3>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {badges.map((badge) => {
            const IconComponent = getIconComponent(badge.icon)
            
            return (
              <div
                key={badge.id}
                className={`text-center p-4 rounded-lg ${
                  badge.unlocked ? 'bg-white border-2 border-green-200' : 'bg-gray-50 border-2 border-gray-200'
                }`}
              >
                <div className={`w-16 h-16 mx-auto mb-3 rounded-full flex items-center justify-center ${
                  badge.unlocked ? getBadgeColor(badge.color) : 'bg-gray-100'
                }`}>
                  <IconComponent className={`h-8 w-8 ${
                    badge.unlocked ? 'text-current' : 'text-gray-400'
                  }`} />
                </div>
                <h4 className={`text-sm font-medium mb-1 ${
                  badge.unlocked ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {badge.name}
                </h4>
                <p className={`text-xs ${
                  badge.unlocked ? 'text-gray-600' : 'text-gray-400'
                }`}>
                  {badge.description}
                </p>
                {!badge.unlocked && (
                  <div className="mt-2">
                    <div className="w-full bg-gray-200 rounded-full h-1">
                      <div
                        className="bg-blue-500 h-1 rounded-full"
                        style={{ width: `${badge.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{badge.progress}%</p>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="card">
        <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
          <Crown className="h-5 w-5 mr-2 text-yellow-600" />
          Leaderboard
        </h3>

        <div className="space-y-3">
          {leaderboard.map((user, index) => {
            const BadgeComponent = getIconComponent(user.badge)
            
            return (
              <div
                key={index}
                className={`flex items-center space-x-4 p-3 rounded-lg ${
                  user.name === 'You' ? 'bg-blue-50 border-2 border-blue-200' : 'bg-gray-50'
                }`}
              >
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 text-sm font-bold text-gray-600">
                  {user.rank}
                </div>
                
                <div className="flex items-center space-x-3">
                  <BadgeComponent className={`h-5 w-5 ${
                    user.rank === 1 ? 'text-yellow-600' :
                    user.rank === 2 ? 'text-gray-600' :
                    user.rank === 3 ? 'text-orange-600' : 'text-gray-400'
                  }`} />
                  <div>
                    <p className={`font-medium ${
                      user.name === 'You' ? 'text-blue-900' : 'text-gray-900'
                    }`}>
                      {user.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {user.applications} applications • {user.profile}% profile
                    </p>
                  </div>
                </div>

                <div className="ml-auto text-right">
                  <p className="text-lg font-bold text-gray-900">{user.points}</p>
                  <p className="text-xs text-gray-500">points</p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export default GamificationHub

"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { User } from "lucide-react"
import { useRouter } from "next/navigation"

interface ProfileCompletionAlertProps {
  profileCompleteness: number
  profileData?: any
}

export function ProfileCompletionAlert({ 
  profileCompleteness, 
  profileData 
}: ProfileCompletionAlertProps) {
  const router = useRouter()

  // Don't show if profile is sufficiently complete
  if (profileCompleteness >= 80) {
    return (
      <Card className="border-l-4 border-l-green-500 bg-green-50/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <User className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <p className="font-medium text-green-800">Profile Complete!</p>
              <p className="text-sm text-green-700">
                Your profile is {profileCompleteness}% complete. You can now submit articles.
              </p>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => router.push('/submit')}
              className="ml-auto border-green-300 text-green-700 hover:bg-green-100"
            >
              Submit Article
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Show completion prompt for incomplete profiles
  return (
    <Card className="border-l-4 border-l-orange-500 bg-orange-50/30">
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-orange-100 rounded-full">
            <User className="h-6 w-6 text-orange-600" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-orange-800 mb-2">
              Complete Your Author Profile ({profileCompleteness}%)
            </h3>
            <p className="text-orange-800 mb-3">
              Your profile is {profileCompleteness}% complete. Complete your profile to improve visibility and enable article submissions.
            </p>
            
            <div className="w-full bg-orange-200 rounded-full h-2 mb-4">
              <div 
                className="bg-orange-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${profileCompleteness}%` }}
              ></div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {!profileData?.affiliation && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-300">
                  Missing: Affiliation
                </span>
              )}
              {(!profileData?.bio || profileData.bio.length < 50) && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-300">
                  Missing: Biography
                </span>
              )}
              {(!profileData?.expertise || profileData.expertise.length === 0) && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-300">
                  Missing: Expertise
                </span>
              )}
              {(!profileData?.specializations || profileData.specializations.length === 0) && (
                <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs rounded-full border border-orange-300">
                  Missing: Specializations
                </span>
              )}
            </div>
            
            <Button 
              onClick={() => router.push('/dashboard/profile')}
              className="bg-orange-600 hover:bg-orange-700"
            >
              <User className="h-4 w-4 mr-2" />
              Complete Profile Now
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
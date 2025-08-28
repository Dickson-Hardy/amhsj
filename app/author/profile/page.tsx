"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import AuthorLayout from "@/components/layouts/author-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import {
  User,
  Mail,
  Phone,
  Building,
  Globe,
  BookOpen,
  Award,
  Save,
  Edit,
  AlertCircle,
  CheckCircle,
  Upload,
  ExternalLink
} from "lucide-react"

interface ProfileData {
  name: string
  email: string
  affiliation: string
  position: string
  phone: string
  website: string
  orcidId: string
  bio: string
  expertise: string[]
  specializations: string[]
  profileCompleteness: number
}

export default function AuthorProfilePage() {
  const { data: session } = useSession()
  const router = useRouter()
  
  const [profileData, setProfileData] = useState<ProfileData>({
    name: "",
    email: "",
    affiliation: "",
    position: "",
    phone: "",
    website: "",
    orcidId: "",
    bio: "",
    expertise: [],
    specializations: [],
    profileCompleteness: 0
  })
  
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
    }
  }, [session?.user?.id])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile')
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setProfileData({
            name: data.profile.name || "",
            email: data.profile.email || "",
            affiliation: data.profile.affiliation || "",
            position: data.profile.position || "",
            phone: data.profile.phone || "",
            website: data.profile.website || "",
            orcidId: data.profile.orcidId || "",
            bio: data.profile.bio || "",
            expertise: data.profile.expertise || [],
            specializations: data.profile.specializations || [],
            profileCompleteness: data.profile.profileCompleteness || 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast({
        title: "Error",
        description: "Failed to load profile data.",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    try {
      setSaving(true)
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(profileData)
      })

      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setIsEditing(false)
          await fetchProfile() // Refresh to get updated completion percentage
          toast({
            title: "Success",
            description: "Profile updated successfully!",
          })
        }
      } else {
        throw new Error('Failed to update profile')
      }
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ProfileData, value: string | string[]) => {
    setProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const addExpertise = () => {
    const input = document.getElementById('new-expertise') as HTMLInputElement
    if (input?.value.trim()) {
      setProfileData(prev => ({
        ...prev,
        expertise: [...prev.expertise, input.value.trim()]
      }))
      input.value = ''
    }
  }

  const removeExpertise = (index: number) => {
    setProfileData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  if (loading) {
    return (
      <RouteGuard allowedRoles={["author"]}>
        <AuthorLayout>
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </AuthorLayout>
      </RouteGuard>
    )
  }

  return (
    <RouteGuard allowedRoles={["author"]}>
      <AuthorLayout>
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Author Profile</h1>
            <p className="text-slate-600">Manage your professional information and research profile</p>
          </div>
          <div className="flex items-center gap-3">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
              </Button>
            ) : (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Profile Completion Alert */}
        {profileData.profileCompleteness < 80 && (
          <Alert className="mb-6 border-amber-200 bg-amber-50">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              <div className="flex items-center justify-between">
                <span>Your profile is {profileData.profileCompleteness}% complete. Complete your profile to improve submission success.</span>
                <div className="flex items-center gap-2">
                  <Progress value={profileData.profileCompleteness} className="w-24 h-2" />
                  <span className="text-sm font-medium">{profileData.profileCompleteness}%</span>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <Tabs defaultValue="basic" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic Information</TabsTrigger>
            <TabsTrigger value="professional">Professional</TabsTrigger>
            <TabsTrigger value="research">Research Areas</TabsTrigger>
            <TabsTrigger value="publications">Publications</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <User className="h-5 w-5 mr-2" />
                  Personal Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={profileData.name}
                      onChange={(e) => handleInputChange('name', e.target.value)}
                      disabled={!isEditing}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email Address</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      disabled={true} // Email should not be editable
                      className="bg-slate-50"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input
                      id="phone"
                      value={profileData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      disabled={!isEditing}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>
                  <div>
                    <Label htmlFor="website">Personal Website</Label>
                    <Input
                      id="website"
                      value={profileData.website}
                      onChange={(e) => handleInputChange('website', e.target.value)}
                      disabled={!isEditing}
                      placeholder="https://yourwebsite.com"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="bio">Biography</Label>
                  <Textarea
                    id="bio"
                    value={profileData.bio}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about your research background and interests..."
                    rows={4}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="professional" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Building className="h-5 w-5 mr-2" />
                  Professional Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="affiliation">Institution/Affiliation</Label>
                    <Input
                      id="affiliation"
                      value={profileData.affiliation}
                      onChange={(e) => handleInputChange('affiliation', e.target.value)}
                      disabled={!isEditing}
                      placeholder="University of Medicine"
                    />
                  </div>
                  <div>
                    <Label htmlFor="position">Position/Title</Label>
                    <Input
                      id="position"
                      value={profileData.position}
                      onChange={(e) => handleInputChange('position', e.target.value)}
                      disabled={!isEditing}
                      placeholder="Professor, Assistant Professor, etc."
                    />
                  </div>
                  <div>
                    <Label htmlFor="orcidId">ORCID ID</Label>
                    <div className="flex gap-2">
                      <Input
                        id="orcidId"
                        value={profileData.orcidId}
                        onChange={(e) => handleInputChange('orcidId', e.target.value)}
                        disabled={!isEditing}
                        placeholder="0000-0000-0000-0000"
                      />
                      {profileData.orcidId && (
                        <Button variant="outline" size="sm" asChild>
                          <a 
                            href={`https://orcid.org/${profileData.orcidId}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="research" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BookOpen className="h-5 w-5 mr-2" />
                  Research Areas & Expertise
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label>Areas of Expertise</Label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileData.expertise.map((item, index) => (
                      <Badge key={index} variant="secondary" className="px-3 py-1">
                        {item}
                        {isEditing && (
                          <button
                            onClick={() => removeExpertise(index)}
                            className="ml-2 text-slate-500 hover:text-red-500"
                          >
                            ×
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>
                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        id="new-expertise"
                        placeholder="Add expertise area..."
                        onKeyPress={(e) => e.key === 'Enter' && addExpertise()}
                      />
                      <Button type="button" onClick={addExpertise}>Add</Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="publications" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Publications & Achievements
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-slate-500">
                  <BookOpen className="h-12 w-12 mx-auto mb-4 text-slate-400" />
                  <p>Publication management coming soon...</p>
                  <p className="text-sm">Link your ORCID ID to automatically import publications</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </AuthorLayout>
    </RouteGuard>
  )
}
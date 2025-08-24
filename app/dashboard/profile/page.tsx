"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { RouteGuard } from "@/components/route-guard"
import AuthorLayout from "@/components/layouts/author-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { SectionLoading } from "@/components/modern-loading"
import { handleError, handleApiError } from "@/lib/modern-error-handler"
import { toast } from "@/hooks/use-toast"
import {
  User,
  GraduationCap,
  FileText,
  Upload,
  Download,
  Eye,
  Edit,
  Save,
  X,
  Plus,
  Trash2,
  Award,
  Globe,
  Mail,
  Phone,
  MapPin,
  Calendar,
  CheckCircle,
  AlertCircle,
  Building,
  BookOpen,
  Target,
  Languages,
  Link,
  Camera,
  Settings,
  Shield
} from "lucide-react"

interface UserProfile {
  id: string
  name: string
  email: string
  role: string
  affiliation?: string
  bio?: string
  orcid?: string
  orcidVerified: boolean
  expertise: string[]
  specializations: string[]
  researchInterests: string[]
  languagesSpoken: string[]
  profileCompleteness: number
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface ProfileFormData {
  name: string
  affiliation: string
  bio: string
  orcid: string
  expertise: string[]
  specializations: string[]
  researchInterests: string[]
  languagesSpoken: string[]
}

interface CVFile {
  id: string
  fileName: string
  originalName: string
  fileSize: number
  mimeType: string
  uploadedAt: string
  isActive: boolean
}

const MEDICAL_SPECIALIZATIONS = [
  "Cardiology", "Dermatology", "Emergency Medicine", "Endocrinology", 
  "Gastroenterology", "Geriatrics", "Hematology", "Infectious Disease",
  "Internal Medicine", "Nephrology", "Neurology", "Oncology", 
  "Ophthalmology", "Orthopedics", "Otolaryngology", "Pathology",
  "Pediatrics", "Psychiatry", "Pulmonology", "Radiology", 
  "Rheumatology", "Surgery", "Urology", "Anesthesiology",
  "Critical Care", "Family Medicine", "Physical Medicine", "Preventive Medicine"
]

const EXPERTISE_AREAS = [
  "Clinical Research", "Basic Science Research", "Epidemiology", "Public Health",
  "Medical Education", "Healthcare Management", "Biostatistics", "Bioinformatics",
  "Medical Ethics", "Health Policy", "Global Health", "Telemedicine",
  "Artificial Intelligence in Medicine", "Precision Medicine", "Genomics",
  "Medical Imaging", "Drug Development", "Clinical Trials", "Meta-Analysis",
  "Systematic Reviews", "Case Studies", "Quality Improvement"
]

const LANGUAGES = [
  "English", "Spanish", "French", "German", "Italian", "Portuguese", 
  "Dutch", "Russian", "Chinese", "Japanese", "Korean", "Arabic",
  "Hindi", "Bengali", "Swedish", "Norwegian", "Danish", "Finnish"
]

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    affiliation: "",
    bio: "",
    orcid: "",
    expertise: [],
    specializations: [],
    researchInterests: [],
    languagesSpoken: []
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)
  const [profilePicture, setProfilePicture] = useState<string | null>(null)
  const [cvFiles, setCvFiles] = useState<CVFile[]>([])
  const [loadingCVFiles, setLoadingCVFiles] = useState(false)
  const [deletingFileId, setDeletingFileId] = useState<string | null>(null)
  
  // Form field states for dynamic additions
  const [newExpertise, setNewExpertise] = useState("")
  const [newSpecialization, setNewSpecialization] = useState("")
  const [newResearchInterest, setNewResearchInterest] = useState("")

  useEffect(() => {
    if (session?.user?.id) {
      fetchProfile()
      fetchCVFiles()
    }
  }, [session])

  const fetchCVFiles = async () => {
    try {
      setLoadingCVFiles(true)
      const response = await fetch('/api/user/profile/cv')
      
      if (response.ok) {
        const data = await response.json()
        if (data.success) {
          setCvFiles(data.files || [])
        }
      }
    } catch (error) {
      console.error('Failed to fetch CV files:', error)
    } finally {
      setLoadingCVFiles(false)
    }
  }

  const fetchProfile = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/user/profile')
      
      if (!response.ok) {
        handleApiError(response, { component: 'profile', action: 'fetch' })
        return
      }

      const data = await response.json()
      if (data.success) {
        const profileData = data.profile
        setProfile(profileData)
        setFormData({
          name: profileData.name || "",
          affiliation: profileData.affiliation || "",
          bio: profileData.bio || "",
          orcid: profileData.orcid || "",
          expertise: profileData.expertise || [],
          specializations: profileData.specializations || [],
          researchInterests: profileData.researchInterests || [],
          languagesSpoken: profileData.languagesSpoken || []
        })
      }
    } catch (error) {
      handleError(error, { component: 'profile', action: 'fetch' })
    } finally {
      setLoading(false)
    }
  }

  const calculateProfileCompleteness = (profileData: ProfileFormData): number => {
    let completed = 0
    const total = 8

    if (profileData.name.trim()) completed++
    if (profileData.affiliation.trim()) completed++
    if (profileData.bio.trim() && profileData.bio.length >= 50) completed++
    if (profileData.orcid.trim()) completed++
    if (profileData.expertise.length > 0) completed++
    if (profileData.specializations.length > 0) completed++
    if (profileData.researchInterests.length > 0) completed++
    if (profileData.languagesSpoken.length > 0) completed++

    return Math.round((completed / total) * 100)
  }

  // Update profile completeness when form data changes
  useEffect(() => {
    if (formData.name || formData.affiliation || formData.bio || formData.orcid || 
        formData.expertise.length > 0 || formData.specializations.length > 0 || 
        formData.researchInterests.length > 0 || formData.languagesSpoken.length > 0) {
      const newCompleteness = calculateProfileCompleteness(formData)
      // Update the profile completeness in real-time
      if (profile && newCompleteness !== profile.profileCompleteness) {
        setProfile(prev => prev ? { ...prev, profileCompleteness: newCompleteness } : null)
      }
    }
  }, [formData, profile])

  const handleSaveProfile = async () => {
    try {
      setSaving(true)
      
      const completeness = calculateProfileCompleteness(formData)
      console.log('Saving profile with completeness:', completeness)
      console.log('Form data:', formData)
      
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          profileCompleteness: completeness
        })
      })

      if (!response.ok) {
        handleApiError(response, { component: 'profile', action: 'save' })
        return
      }

      const data = await response.json()
      console.log('Profile save response:', data)
      
      if (data.success) {
        setProfile(data.profile)
        setIsEditing(false)
        toast({
          title: "Profile Updated",
          description: `Your profile has been successfully updated. Profile completion: ${data.profile.profileCompleteness}%`,
        })
        
        // Refresh the profile to get updated completeness
        fetchProfile()
      }
    } catch (error) {
      console.error('Profile save error:', error)
      handleError(error, { component: 'profile', action: 'save' })
    } finally {
      setSaving(false)
    }
  }

  const handleCVUpload = async (file: File) => {
    try {
      setUploadingCV(true)
      
      const formData = new FormData()
      formData.append('cv', file)
      
      const response = await fetch('/api/user/profile/cv', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        handleApiError(response, { component: 'profile', action: 'cv_upload' })
        return
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "CV Uploaded",
          description: "Your CV has been successfully uploaded.",
        })
        fetchCVFiles() // Refresh CV files list
      }
    } catch (error) {
      handleError(error, { component: 'profile', action: 'cv_upload' })
    } finally {
      setUploadingCV(false)
    }
  }

  const handleDeleteCV = async (fileId: string) => {
    try {
      setDeletingFileId(fileId)
      
      const response = await fetch(`/api/user/profile/cv?id=${fileId}`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        handleApiError(response, { component: 'profile', action: 'cv_delete' })
        return
      }

      const data = await response.json()
      if (data.success) {
        toast({
          title: "CV Deleted",
          description: "Your CV has been successfully deleted.",
        })
        fetchCVFiles() // Refresh CV files list
      }
    } catch (error) {
      handleError(error, { component: 'profile', action: 'cv_delete' })
    } finally {
      setDeletingFileId(null)
    }
  }

  const handleDownloadCV = async (fileName: string) => {
    try {
      const response = await fetch(`/api/user/profile/cv?fileName=${encodeURIComponent(fileName)}`, {
        method: 'GET'
      })

      if (!response.ok) {
        handleApiError(response, { component: 'profile', action: 'cv_download' })
        return
      }

      // Create blob and download
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.style.display = 'none'
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      toast({
        title: "Download Started",
        description: "Your CV download has started.",
      })
    } catch (error) {
      handleError(error, { component: 'profile', action: 'cv_download' })
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const addExpertise = () => {
    if (newExpertise.trim() && !formData.expertise.includes(newExpertise.trim())) {
      setFormData(prev => ({
        ...prev,
        expertise: [...prev.expertise, newExpertise.trim()]
      }))
      setNewExpertise("")
    }
  }

  const removeExpertise = (index: number) => {
    setFormData(prev => ({
      ...prev,
      expertise: prev.expertise.filter((_, i) => i !== index)
    }))
  }

  const addSpecialization = () => {
    if (newSpecialization.trim() && !formData.specializations.includes(newSpecialization.trim())) {
      setFormData(prev => ({
        ...prev,
        specializations: [...prev.specializations, newSpecialization.trim()]
      }))
      setNewSpecialization("")
    }
  }

  const removeSpecialization = (index: number) => {
    setFormData(prev => ({
      ...prev,
      specializations: prev.specializations.filter((_, i) => i !== index)
    }))
  }

  const addResearchInterest = () => {
    if (newResearchInterest.trim() && !formData.researchInterests.includes(newResearchInterest.trim())) {
      setFormData(prev => ({
        ...prev,
        researchInterests: [...prev.researchInterests, newResearchInterest.trim()]
      }))
      setNewResearchInterest("")
    }
  }

  const removeResearchInterest = (index: number) => {
    setFormData(prev => ({
      ...prev,
      researchInterests: prev.researchInterests.filter((_, i) => i !== index)
    }))
  }

  const toggleLanguage = (language: string) => {
    setFormData(prev => ({
      ...prev,
      languagesSpoken: prev.languagesSpoken.includes(language)
        ? prev.languagesSpoken.filter(l => l !== language)
        : [...prev.languagesSpoken, language]
    }))
  }

  if (loading) {
    return <SectionLoading text="Loading your profile..." />
  }

  if (!profile) {
    return (
      <RouteGuard allowedRoles={["author", "reviewer", "editor", "admin"]}>
        <AuthorLayout>
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Unable to load profile data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        </AuthorLayout>
      </RouteGuard>
    )
  }

  const profileCompleteness = calculateProfileCompleteness(formData)
  const isProfileComplete = profileCompleteness >= 80
  
  // Show real-time completeness or stored completeness
  const displayCompleteness = profile?.profileCompleteness || profileCompleteness

  return (
    <RouteGuard allowedRoles={["author", "reviewer", "editor", "admin"]}>
      <AuthorLayout>
        <div className="space-y-6">
          {/* Profile Header */}
          <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-8">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                    {profile.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0"
                    onClick={() => {
                      // Create file input element
                      const input = document.createElement('input')
                      input.type = 'file'
                      input.accept = 'image/*'
                      input.onchange = async (e) => {
                        const file = (e.target as HTMLInputElement).files?.[0]
                        if (file) {
                          // Upload profile picture to server
                          console.log('Profile picture selected:', file.name)
                          
                          // Implement actual upload to server
                          const formData = new FormData()
                          formData.append('file', file)
                          formData.append('type', 'profile-picture')
                          
                          try {
                            const response = await fetch('/api/upload', {
                              method: 'POST',
                              body: formData
                            })
                            
                            if (response.ok) {
                              const result = await response.json()
                              // Update user's profile picture URL
                              console.log('Profile picture uploaded:', result.url)
                            } else {
                              console.error('Upload failed')
                            }
                          } catch (error) {
                            console.error('Upload error:', error)
                          }
                        }
                      }
                      input.click()
                    }}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold text-slate-900">{profile.name}</h1>
                    {profile.orcidVerified && (
                      <Badge className="bg-green-100 text-green-800">
                        <Award className="h-3 w-3 mr-1" />
                        ORCID Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                    {profile.affiliation && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <Building className="h-4 w-4" />
                        <span>{profile.affiliation}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-slate-600">
                      <Shield className="h-4 w-4" />
                      <span className="capitalize">{profile.role}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {/* Profile Completeness */}
                  <div className="text-center">
                    <div className="text-sm font-medium text-slate-700 mb-2">Profile Completion</div>
                    <div className="relative w-20 h-20">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          className="text-slate-200"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="transparent"
                          strokeDasharray={`${2 * Math.PI * 40}`}
                          strokeDashoffset={`${2 * Math.PI * 40 * (1 - displayCompleteness / 100)}`}
                          className={displayCompleteness >= 80 ? "text-green-500" : displayCompleteness >= 50 ? "text-yellow-500" : "text-red-500"}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className={`text-lg font-bold ${displayCompleteness >= 80 ? "text-green-600" : displayCompleteness >= 50 ? "text-yellow-600" : "text-red-600"}`}>
                          {displayCompleteness}%
                        </span>
                      </div>
                    </div>
                    
                    {/* Progress Bar */}
                    <div className="mt-3">
                      <div className="w-full bg-slate-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            displayCompleteness >= 80 ? 'bg-green-500' : 
                            displayCompleteness >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${displayCompleteness}%` }}
                        ></div>
                      </div>
                      <div className="text-xs text-slate-600 mt-1">
                        {displayCompleteness < 80 ? `${80 - displayCompleteness}% more needed` : 'Ready for submission!'}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Button
                      variant={isEditing ? "outline" : "default"}
                      onClick={() => setIsEditing(!isEditing)}
                      className="min-w-32"
                    >
                      {isEditing ? (
                        <>
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </>
                      ) : (
                        <>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit Profile
                        </>
                      )}
                    </Button>
                    
                    {isProfileComplete && (
                      <Button
                        onClick={() => router.push('/submit')}
                        className="min-w-32 bg-green-600 hover:bg-green-700"
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        Submit Article
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {/* Profile Completion Alert */}
              {!isProfileComplete ? (
                <Alert className="mt-6 border-orange-200 bg-orange-50">
                  <AlertCircle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    <div className="space-y-2">
                      <p>Complete your profile to improve your visibility and enable article submissions. 
                      You need at least 80% completion to submit articles.</p>
                      
                      <div className="bg-orange-100 p-3 rounded-lg border border-orange-200">
                        <h4 className="font-semibold mb-2">Missing fields:</h4>
                        <div className="grid md:grid-cols-2 gap-2 text-sm">
                          {!formData.name.trim() && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Full name</span>
                            </div>
                          )}
                          {!formData.affiliation.trim() && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Institutional affiliation</span>
                            </div>
                          )}
                          {(!formData.bio.trim() || formData.bio.length < 50) && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Professional biography (50+ chars)</span>
                            </div>
                          )}
                          {!formData.orcid.trim() && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>ORCID identifier</span>
                            </div>
                          )}
                          {formData.expertise.length === 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Areas of expertise</span>
                            </div>
                          )}
                          {formData.specializations.length === 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Medical specializations</span>
                            </div>
                          )}
                          {formData.researchInterests.length === 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Research interests</span>
                            </div>
                          )}
                          {formData.languagesSpoken.length === 0 && (
                            <div className="flex items-center gap-2">
                              <AlertCircle className="h-3 w-3 text-orange-600" />
                              <span>Languages spoken</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert className="mt-6 border-green-200 bg-green-50">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-800">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">🎉 Profile Complete!</span>
                      <span>You can now submit articles to the journal.</span>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>

          {/* Profile Content Tabs */}
          <Tabs defaultValue="basic" className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Information</TabsTrigger>
              <TabsTrigger value="academic">Academic Profile</TabsTrigger>
              <TabsTrigger value="documents">Documents & CV</TabsTrigger>
              <TabsTrigger value="settings">Account Settings</TabsTrigger>
            </TabsList>

            {/* Basic Information Tab */}
            <TabsContent value="basic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>
                    Update your basic profile information and contact details.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                                       <div className="space-y-2">
                     <Label htmlFor="name">Full Name</Label>
                     <Input
                       id="name"
                       value={formData.name}
                       onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                       disabled={!isEditing}
                       placeholder="Enter your full name"
                     />
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="affiliation">Institutional Affiliation</Label>
                     <Input
                       id="affiliation"
                       value={formData.affiliation}
                       onChange={(e) => setFormData(prev => ({ ...prev, affiliation: e.target.value }))}
                       disabled={!isEditing}
                       placeholder="University, Hospital, or Organization"
                     />
                   </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Professional Biography</Label>
                    <Textarea
                      id="bio"
                      value={formData.bio}
                      onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                      disabled={!isEditing}
                      placeholder="Describe your professional background, research focus, and achievements (minimum 50 characters)"
                      rows={4}
                      className="resize-none"
                    />
                    <div className="text-xs text-slate-500">
                      {formData.bio.length}/50 characters minimum
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="orcid">ORCID iD</Label>
                    <div className="flex gap-2">
                      <Input
                        id="orcid"
                        value={formData.orcid}
                        onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                        disabled={!isEditing}
                        placeholder="0000-0000-0000-0000"
                      />
                      {profile.orcidVerified ? (
                        <Badge className="bg-green-100 text-green-800 px-3">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Verified
                        </Badge>
                      ) : formData.orcid ? (
                        <Button size="sm" variant="outline">
                          <Link className="h-3 w-3 mr-1" />
                          Verify
                        </Button>
                      ) : null}
                    </div>
                    <div className="text-xs text-slate-500">
                      ORCID provides a persistent digital identifier for researchers
                    </div>
                                     </div>

                   <div className="space-y-2">
                     <Label htmlFor="bio">Professional Biography</Label>
                     <Textarea
                       id="bio"
                       value={formData.bio}
                       onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
                       disabled={!isEditing}
                       placeholder="Describe your professional background, research focus, and achievements (minimum 50 characters)"
                       rows={4}
                       className="resize-none"
                     />
                     <div className="text-xs text-slate-500">
                       {formData.bio.length}/50 characters minimum
                     </div>
                   </div>

                   <div className="space-y-2">
                     <Label htmlFor="orcid">ORCID iD</Label>
                     <div className="flex gap-2">
                       <Input
                         id="orcid"
                         value={formData.orcid}
                         onChange={(e) => setFormData(prev => ({ ...prev, orcid: e.target.value }))}
                         disabled={!isEditing}
                         placeholder="0000-0000-0000-0000"
                       />
                       {profile.orcidVerified ? (
                         <Badge className="bg-green-100 text-green-800 px-3">
                           <CheckCircle className="h-3 w-4 mr-1" />
                           Verified
                         </Badge>
                       ) : formData.orcid ? (
                         <Button size="sm" variant="outline">
                           <Link className="h-3 w-4 mr-1" />
                           Verify
                         </Button>
                       ) : null}
                     </div>
                     <div className="text-xs text-slate-500">
                       ORCID provides a persistent digital identifier for researchers
                     </div>
                   </div>

                   {isEditing && (
                     <div className="flex justify-end gap-2">
                       <Button variant="outline" onClick={() => setIsEditing(false)}>
                         Cancel
                       </Button>
                       <Button onClick={handleSaveProfile} disabled={saving}>
                         {saving ? (
                           <>
                             <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                             Saving...
                           </>
                         ) : (
                           <>
                             <Save className="h-4 w-4 mr-2" />
                             Save Changes
                           </>
                         )}
                       </Button>
                     </div>
                   )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Academic Profile Tab */}
            <TabsContent value="academic" className="space-y-6">
              {/* Expertise Areas */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Target className="h-5 w-5 mr-2" />
                    Areas of Expertise
                  </CardTitle>
                  <CardDescription>
                    Select your areas of expertise in medical research and healthcare.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.expertise.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {item}
                        {isEditing && (
                          <button
                            onClick={() => removeExpertise(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Select value={newExpertise} onValueChange={setNewExpertise}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select an expertise area" />
                          </SelectTrigger>
                          <SelectContent>
                            {EXPERTISE_AREAS.filter(area => !formData.expertise.includes(area)).map(area => (
                              <SelectItem key={area} value={area}>
                                {area}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={addExpertise} disabled={!newExpertise}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Or type a custom expertise area"
                        value={newExpertise}
                        onChange={(e) => setNewExpertise(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addExpertise()}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medical Specializations */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <GraduationCap className="h-5 w-5 mr-2" />
                    Medical Specializations
                  </CardTitle>
                  <CardDescription>
                    Select your medical specializations and subspecialties.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.specializations.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-sm bg-blue-100 text-blue-800">
                        {item}
                        {isEditing && (
                          <button
                            onClick={() => removeSpecialization(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="space-y-4">
                      <div className="flex gap-2">
                        <Select value={newSpecialization} onValueChange={setNewSpecialization}>
                          <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Select a medical specialization" />
                          </SelectTrigger>
                          <SelectContent>
                            {MEDICAL_SPECIALIZATIONS.filter(spec => !formData.specializations.includes(spec)).map(spec => (
                              <SelectItem key={spec} value={spec}>
                                {spec}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button onClick={addSpecialization} disabled={!newSpecialization}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <Input
                        placeholder="Or type a custom specialization"
                        value={newSpecialization}
                        onChange={(e) => setNewSpecialization(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addSpecialization()}
                      />
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Research Interests */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <BookOpen className="h-5 w-5 mr-2" />
                    Research Interests
                  </CardTitle>
                  <CardDescription>
                    Describe your specific research interests and focus areas.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {formData.researchInterests.map((item, index) => (
                      <Badge key={index} variant="secondary" className="text-sm bg-purple-100 text-purple-800">
                        {item}
                        {isEditing && (
                          <button
                            onClick={() => removeResearchInterest(index)}
                            className="ml-2 text-red-500 hover:text-red-700"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </Badge>
                    ))}
                  </div>

                  {isEditing && (
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a research interest"
                        value={newResearchInterest}
                        onChange={(e) => setNewResearchInterest(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addResearchInterest()}
                        className="flex-1"
                      />
                      <Button onClick={addResearchInterest} disabled={!newResearchInterest.trim()}>
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Languages */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Languages className="h-5 w-5 mr-2" />
                    Languages Spoken
                  </CardTitle>
                  <CardDescription>
                    Select the languages you can speak for international collaboration.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isEditing ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {LANGUAGES.map(language => (
                        <div key={language} className="flex items-center space-x-2">
                          <Checkbox
                            id={language}
                            checked={formData.languagesSpoken.includes(language)}
                            onCheckedChange={() => toggleLanguage(language)}
                          />
                          <Label htmlFor={language} className="text-sm">
                            {language}
                          </Label>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.languagesSpoken.map((language, index) => (
                        <Badge key={index} variant="secondary" className="text-sm bg-green-100 text-green-800">
                          {language}
                        </Badge>
                      ))}
                      {formData.languagesSpoken.length === 0 && (
                        <p className="text-slate-500">No languages specified</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {isEditing && (
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsEditing(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveProfile} disabled={saving}>
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-2" />
                        Save Academic Profile
                      </>
                    )}
                  </Button>
                </div>
              )}
            </TabsContent>

            {/* Documents & CV Tab */}
            <TabsContent value="documents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="h-5 w-5 mr-2" />
                    Curriculum Vitae (CV)
                  </CardTitle>
                  <CardDescription>
                    Upload your CV to provide a comprehensive overview of your academic and professional background.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* CV Upload Area */}
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setCvFile(file)
                          handleCVUpload(file)
                        }
                      }}
                      className="hidden"
                      id="cv-upload"
                    />
                    
                    {uploadingCV ? (
                      <div className="space-y-2">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-slate-600">Uploading your CV...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-12 w-12 text-slate-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-slate-900 mb-2">Upload your CV</p>
                          <p className="text-slate-600 mb-4">
                            Supported formats: PDF, DOC, DOCX (Max 10MB)
                          </p>
                          <Label htmlFor="cv-upload">
                            <Button variant="outline" className="cursor-pointer">
                              <Upload className="h-4 w-4 mr-2" />
                              Choose File
                            </Button>
                          </Label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Current CV Display */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Current CV</h4>
                    {loadingCVFiles ? (
                      <div className="bg-slate-50 p-4 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="h-5 w-5 bg-slate-200 rounded animate-pulse" />
                          <div>
                            <div className="h-4 w-32 bg-slate-200 rounded animate-pulse mb-2" />
                            <div className="h-3 w-24 bg-slate-200 rounded animate-pulse" />
                          </div>
                        </div>
                      </div>
                    ) : cvFiles.length > 0 ? (
                      <div className="space-y-3">
                        {cvFiles.map((file) => (
                          <div key={file.id} className="bg-slate-50 p-4 rounded-lg">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <FileText className="h-5 w-5 text-slate-400" />
                                <div>
                                  <p className="font-medium text-slate-900">{file.originalName}</p>
                                  <p className="text-sm text-slate-600">
                                    Uploaded {new Date(file.uploadedAt).toLocaleDateString()} • {(file.fileSize / (1024 * 1024)).toFixed(1)} MB
                                  </p>
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDownloadCV(file.fileName)}
                                >
                                  <Download className="h-4 w-4 mr-1" />
                                  Download
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleDeleteCV(file.id)}
                                  disabled={deletingFileId === file.id}
                                >
                                  {deletingFileId === file.id ? (
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-600" />
                                  ) : (
                                    <Trash2 className="h-4 w-4 mr-1" />
                                  )}
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-slate-50 p-6 rounded-lg text-center">
                        <FileText className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-slate-600">No CV uploaded yet</p>
                        <p className="text-sm text-slate-500 mt-1">
                          Upload your CV to complete your profile
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Additional Documents */}
                  <div className="space-y-4">
                    <h4 className="font-medium text-slate-900">Additional Documents</h4>
                    <p className="text-sm text-slate-600">
                      You can upload additional documents such as licenses, certifications, or publications.
                    </p>
                    <Button variant="outline" className="w-full">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Document
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Account Settings Tab */}
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="h-5 w-5 mr-2" />
                    Account Settings
                  </CardTitle>
                  <CardDescription>
                    Manage your account preferences and security settings.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Email Notifications</h4>
                        <p className="text-sm text-slate-600">Receive updates about your submissions and reviews</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Profile Visibility</h4>
                        <p className="text-sm text-slate-600">Make your profile visible to other researchers</p>
                      </div>
                      <Checkbox defaultChecked />
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-slate-900">Two-Factor Authentication</h4>
                        <p className="text-sm text-slate-600">Add an extra layer of security to your account</p>
                      </div>
                      <Button size="sm" variant="outline">
                        Enable 2FA
                      </Button>
                    </div>

                    <div className="flex items-center justify-between p-4 border rounded-lg border-red-200 bg-red-50">
                      <div>
                        <h4 className="font-medium text-red-900">Delete Account</h4>
                        <p className="text-sm text-red-600">Permanently delete your account and all data</p>
                      </div>
                      <Button size="sm" variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </AuthorLayout>
    </RouteGuard>
  )
}

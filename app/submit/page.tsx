"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Upload, FileText, AlertCircle, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"

export default function SubmitPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [uploadProgress, setUploadProgress] = useState(0)

  const handleAddAuthor = () => {
    // Add functionality to add another author
    alert('Add author functionality would be implemented here')
  }

  const handleChooseFiles = () => {
    // Create file input and trigger click
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.pdf,.doc,.docx'
    input.multiple = true
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        handleFileUpload(files)
      }
    }
    input.click()
  }

  const handleFileUpload = (files: FileList) => {
    // Simulate file upload progress
    setUploadProgress(0)
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 200)
  }

  const handlePreviousStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleNextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handleSubmitManuscript = () => {
    // Handle final submission
    alert('Manuscript submission functionality would be implemented here')
    // In a real implementation, this would submit to API
  }

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (status === 'loading') return // Still loading
    
    if (!session) {
      // Redirect to signup with return URL
      router.push('/auth/signup?returnUrl=' + encodeURIComponent('/submit'))
    }
  }, [session, status, router])

  // Show loading state while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show login prompt if not authenticated
  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="h-16 w-16 text-blue-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-800 mb-4">Authentication Required</h1>
          <p className="text-gray-600 mb-6">
            You need to be logged in to submit an article. Please create an account or sign in to continue.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button asChild>
              <Link href="/auth/signup">Create Account</Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const steps = [
    { number: 1, title: "Article Information", description: "Basic details about your submission" },
    { number: 2, title: "Authors & Affiliations", description: "Author information and institutional details" },
    { number: 3, title: "Files & Documents", description: "Upload your manuscript and supporting files" },
    { number: 4, title: "Review & Submit", description: "Final review before submission" },
  ]

  const categories = [
    "Clinical Medicine",
    "Public Health",
    "Biomedical Sciences",
    "Healthcare Technology",
    "Medical Education",
    "Global Health",
    "Preventive Medicine",
    "Medical Ethics",
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Submit Your Article</h1>
          <p className="text-gray-600">Share your research with the global academic community</p>
        </div>

        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center">
                <div
                  className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
                    currentStep >= step.number
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-gray-300 text-gray-400"
                  }`}
                >
                  {currentStep > step.number ? <CheckCircle className="h-5 w-5" /> : step.number}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-full h-0.5 mx-4 ${currentStep > step.number ? "bg-blue-600" : "bg-gray-300"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2">
            {steps.map((step) => (
              <div key={step.number} className="text-center max-w-[200px]">
                <div className="font-medium text-sm text-gray-800">{step.title}</div>
                <div className="text-xs text-gray-500">{step.description}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1].title}</CardTitle>
            <CardDescription>{steps[currentStep - 1].description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {currentStep === 1 && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Manuscript Title *</Label>
                    <Input id="title" placeholder="Enter your manuscript title" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Medical Specialization *</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category.toLowerCase().replace(/\s+/g, "-")}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="abstract">Abstract *</Label>
                  <Textarea
                    id="abstract"
                    placeholder="Provide a structured abstract (250-300 words)"
                    className="min-h-[120px]"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="keywords">Keywords *</Label>
                  <Input id="keywords" placeholder="Enter 5-7 keywords related to your research" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="funding">Grant Information</Label>
                    <Input id="funding" placeholder="Grant numbers, sponsoring organizations" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="conflicts">Conflicts of Interest</Label>
                    <Select>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">No conflicts to declare</SelectItem>
                        <SelectItem value="financial">Financial conflicts</SelectItem>
                        <SelectItem value="other">Other conflicts</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}

            {currentStep === 2 && (
              <>
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please provide information for all authors. The corresponding author will receive all
                    communications.
                  </AlertDescription>
                </Alert>

                <div className="space-y-6">
                  <div className="border rounded-lg p-4">
                    <h3 className="font-semibold mb-4">Author 1 (Corresponding Author)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="author1-first">First Name *</Label>
                        <Input id="author1-first" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author1-last">Last Name *</Label>
                        <Input id="author1-last" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author1-email">Email *</Label>
                        <Input id="author1-email" type="email" />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="author1-orcid">ORCID ID</Label>
                        <Input id="author1-orcid" placeholder="0000-0000-0000-0000" />
                      </div>
                      <div className="md:col-span-2 space-y-2">
                        <Label htmlFor="author1-affiliation">Institutional Affiliation *</Label>
                        <Input id="author1-affiliation" />
                      </div>
                    </div>
                  </div>

                  <Button variant="outline" className="w-full" onClick={handleAddAuthor}>
                    + Add Another Author
                  </Button>
                </div>
              </>
            )}

            {currentStep === 3 && (
              <>
                <div className="space-y-6">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="font-semibold text-lg mb-2">Upload Manuscript</h3>
                    <p className="text-gray-600 mb-4">Drag and drop your files here, or click to browse</p>
                    <Button onClick={handleChooseFiles}>Choose Files</Button>
                    <p className="text-sm text-gray-500 mt-2">Supported formats: PDF, DOC, DOCX (Max size: 25MB)</p>
                  </div>

                  {uploadProgress > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Uploading manuscript.pdf</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <Progress value={uploadProgress} />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Supporting Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="figures" />
                            <Label htmlFor="figures" className="text-sm">
                              Figures/Images
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="tables" />
                            <Label htmlFor="tables" className="text-sm">
                              Tables
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="supplementary" />
                            <Label htmlFor="supplementary" className="text-sm">
                              Supplementary Materials
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Required Documents</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2">
                            <Checkbox id="copyright" />
                            <Label htmlFor="copyright" className="text-sm">
                              Copyright Transfer Form
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="ethics" />
                            <Label htmlFor="ethics" className="text-sm">
                              Ethics Approval (if applicable)
                            </Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox id="cover-letter" />
                            <Label htmlFor="cover-letter" className="text-sm">
                              Cover Letter
                            </Label>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </>
            )}

            {currentStep === 4 && (
              <>
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Please review all information before submitting. You will receive a confirmation email once your
                    submission is processed.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Submission Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Title:</span>
                        <span className="font-medium">Advanced Machine Learning Techniques...</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Category:</span>
                        <span className="font-medium">Healthcare Technology</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Authors:</span>
                        <span className="font-medium">2 authors</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Files:</span>
                        <span className="font-medium">3 files uploaded</span>
                      </div>
                    </CardContent>
                  </Card>

                  <div className="flex items-center space-x-2">
                    <Checkbox id="terms" />
                    <Label htmlFor="terms" className="text-sm">
                      I agree to the{" "}
                      <Link href="/terms" className="text-blue-600 hover:underline">
                        Terms of Service
                      </Link>{" "}
                      and{" "}
                      <Link href="/ethics" className="text-blue-600 hover:underline">
                        Publication Ethics
                      </Link>
                    </Label>
                  </div>
                </div>
              </>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between pt-6 border-t">
              <Button
                variant="outline"
                onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                disabled={currentStep === 1}
              >
                Previous
              </Button>

              {currentStep < 4 ? (
                <Button
                  onClick={() => setCurrentStep(Math.min(4, currentStep + 1))}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  Next Step
                </Button>
              ) : (
                <Button className="bg-green-600 hover:bg-green-700" onClick={handleSubmitManuscript}>
                  <FileText className="h-4 w-4 mr-2" />
                  Submit Article
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

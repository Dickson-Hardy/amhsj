"use client"

import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { FileText, Upload, CheckCircle, AlertCircle, Download, Clock, Users, Award, BookOpen, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function SubmissionGuidelinesPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleStartSubmission = () => {
    router.push('/submit')
  }

  const handleDownloadResource = (resourceName: string) => {
    // In a real implementation, these would link to actual downloadable files
    const downloadLinks = {
      'Author Checklist': '/downloads/author-checklist.pdf',
      'Manuscript Template': '/downloads/manuscript-template.docx',
      'Figure Guidelines': '/downloads/figure-guidelines.pdf',
      'Reference Style Guide': '/downloads/reference-style-guide.pdf'
    }
    
    const link = downloadLinks[resourceName as keyof typeof downloadLinks]
    if (link) {
      toast({
        title: "Download Starting",
        description: `Download would start for: ${resourceName}`,
      })
      // In production: window.open(link, '_blank')
    }
  }

  const handleContactEditorial = () => {
    router.push('/contact')
  }
  const articleTypes = [
    {
      type: "Original Research",
      description: "Novel research findings with significant clinical or scientific impact",
      wordLimit: "4000-6000 words",
      abstractLimit: "250 words",
      references: "Up to 50",
    },
    {
      type: "Review Articles",
      description: "Comprehensive reviews of current knowledge in specific areas",
      wordLimit: "6000-8000 words",
      abstractLimit: "300 words",
      references: "Up to 100",
    },
    {
      type: "Case Reports",
      description: "Unique clinical cases with educational value",
      wordLimit: "1500-2500 words",
      abstractLimit: "150 words",
      references: "Up to 20",
    },
    {
      type: "Short Communications",
      description: "Brief reports of preliminary findings or novel techniques",
      wordLimit: "1500-2000 words",
      abstractLimit: "150 words",
      references: "Up to 15",
    },
  ]

  const submissionSteps = [
    {
      step: 1,
      title: "Prepare Your Manuscript",
      description: "Format according to guidelines and prepare all required files",
      icon: FileText,
    },
    {
      step: 2,
      title: "Create Account",
      description: "Register on our submission platform with ORCID integration",
      icon: Users,
    },
    {
      step: 3,
      title: "Upload Files",
      description: "Submit manuscript, figures, and supplementary materials",
      icon: Upload,
    },
    {
      step: 4,
      title: "Review & Submit",
      description: "Review all information and complete submission",
      icon: CheckCircle,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Submission Guidelines</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive guidelines for authors submitting to AMHSJ. Please read carefully before submission.
          </p>
        </div>

        {/* Quick Start */}
        <Alert className="mb-8 border-indigo-200 bg-indigo-50">
          <AlertCircle className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <strong>Quick Start:</strong> New to AMHSJ? Download our{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-indigo-600 underline"
              onClick={() => handleDownloadResource('Author Checklist')}
            >
              Author Checklist
            </Button>{" "}
            and{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto text-indigo-600 underline"
              onClick={() => handleDownloadResource('Manuscript Template')}
            >
              Manuscript Template
            </Button>{" "}
            to get started quickly.
          </AlertDescription>
        </Alert>

        {/* Article Types */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Article Types</CardTitle>
            <CardDescription>AMHSJ accepts the following types of submissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              {articleTypes.map((article, index) => (
                <div key={index} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-lg text-gray-800 mb-2">{article.type}</h3>
                  <p className="text-gray-600 mb-4">{article.description}</p>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-500">Word Limit:</span>
                      <span className="font-medium">{article.wordLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Abstract:</span>
                      <span className="font-medium">{article.abstractLimit}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">References:</span>
                      <span className="font-medium">{article.references}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Submission Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Submission Process</CardTitle>
            <CardDescription>Follow these steps to submit your manuscript</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {submissionSteps.map((step, index) => (
                <div key={index} className="text-center">
                  <div className="bg-indigo-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <step.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <div className="bg-indigo-600 text-white rounded-full w-8 h-8 mx-auto mb-2 flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                  <h3 className="font-semibold text-gray-800 mb-2">{step.title}</h3>
                  <p className="text-sm text-gray-600">{step.description}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Button 
                size="lg" 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleStartSubmission}
              >
                <Upload className="mr-2 h-5 w-5" />
                Start Submission
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Manuscript Preparation */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Manuscript Preparation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">General Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Double-spaced, 12-point Times New Roman font
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    1-inch margins on all sides
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Line numbers throughout the manuscript
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Pages numbered consecutively
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    References in Vancouver style
                  </li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">File Requirements</h3>
                <ul className="space-y-2 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Main manuscript: DOC, DOCX, or PDF
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Figures: TIFF, EPS, or high-res JPEG
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Tables: Editable format (Word/Excel)
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Maximum file size: 50MB per file
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5 flex-shrink-0" />
                    Supplementary materials: Any format
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Manuscript Structure */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Manuscript Structure</CardTitle>
            <CardDescription>Required sections for original research articles</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                {
                  section: "Title Page",
                  description: "Title, authors, affiliations, corresponding author details, word count",
                },
                {
                  section: "Abstract",
                  description: "Structured abstract with Background, Methods, Results, Conclusions",
                },
                { section: "Keywords", description: "3-8 keywords using MeSH terms where possible" },
                { section: "Introduction", description: "Background, rationale, and objectives" },
                { section: "Methods", description: "Study design, participants, procedures, statistical analysis" },
                { section: "Results", description: "Main findings with appropriate statistics" },
                { section: "Discussion", description: "Interpretation, limitations, implications" },
                { section: "Conclusions", description: "Main conclusions and clinical relevance" },
                { section: "References", description: "Vancouver style, numbered consecutively" },
                { section: "Figures & Tables", description: "High-quality figures and properly formatted tables" },
              ].map((item, index) => (
                <div key={index} className="flex items-start p-4 bg-gray-50 rounded-lg">
                  <div className="bg-indigo-600 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold mr-4 mt-1">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-800">{item.section}</h4>
                    <p className="text-gray-600 text-sm">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Ethical Guidelines */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Ethical Guidelines</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Human Studies</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• IRB/Ethics committee approval required</li>
                  <li>• Informed consent from all participants</li>
                  <li>• Declaration of Helsinki compliance</li>
                  <li>• Patient privacy and confidentiality</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Animal Studies</h3>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li>• IACUC approval required</li>
                  <li>• ARRIVE guidelines compliance</li>
                  <li>• Minimize animal use and suffering</li>
                  <li>• Appropriate anesthesia and euthanasia</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Review Process */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Review Process</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-3 gap-6">
              <div className="text-center">
                <Clock className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Initial Review</h3>
                <p className="text-sm text-gray-600">Editorial screening within 5-7 days</p>
              </div>
              <div className="text-center">
                <Users className="h-12 w-12 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Peer Review</h3>
                <p className="text-sm text-gray-600">Double-blind review by 2-3 experts</p>
              </div>
              <div className="text-center">
                <Award className="h-12 w-12 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold text-gray-800 mb-2">Final Decision</h3>
                <p className="text-sm text-gray-600">Editorial decision within 8-12 weeks</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Downloads */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl">Downloads & Resources</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { name: "Author Checklist", icon: CheckCircle },
                { name: "Manuscript Template", icon: FileText },
                { name: "Figure Guidelines", icon: BookOpen },
                { name: "Reference Style Guide", icon: Download },
              ].map((resource, index) => (
                <Button 
                  key={index} 
                  variant="outline" 
                  className="h-auto p-4 flex flex-col items-center hover:bg-indigo-50"
                  onClick={() => handleDownloadResource(resource.name)}
                >
                  <resource.icon className="h-8 w-8 mb-2 text-indigo-600" />
                  <span className="text-sm">{resource.name}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Contact */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Need Help?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-gray-600 mb-4">
                Have questions about the submission process? Our editorial team is here to help.
              </p>
              <Button 
                className="bg-indigo-600 hover:bg-indigo-700"
                onClick={handleContactEditorial}
              >
                <Mail className="mr-2 h-4 w-4" />
                Contact Editorial Office
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

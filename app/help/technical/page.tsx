import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Settings, 
  Monitor, 
  Smartphone, 
  Wifi, 
  Download, 
  Upload, 
  Lock, 
  AlertCircle,
  CheckCircle,
  HelpCircle
} from "lucide-react"

export const metadata: Metadata = {
  title: "Technical Support - AMHSJ Help Center",
  description: "Get technical assistance with account issues, file uploads, and system requirements",
}

export default function TechnicalSupportPage() {
  const systemRequirements = [
    {
      category: "Web Browsers",
      items: [
        "Chrome 90+ (Recommended)",
        "Firefox 88+",
        "Safari 14+",
        "Edge 90+"
      ]
    },
    {
      category: "File Formats",
      items: [
        "PDF (for manuscripts)",
        "DOC/DOCX (for manuscripts)",
        "PNG/JPG (for figures)",
        "SVG (for vector graphics)"
      ]
    },
    {
      category: "File Size Limits",
      items: [
        "Manuscript: 50MB max",
        "Figures: 10MB per file",
        "Supplementary: 100MB max",
        "Total submission: 200MB max"
      ]
    }
  ]

  const troubleshootingSteps = [
    {
      issue: "Cannot Login",
      steps: [
        "Check your email and password",
        "Clear browser cache and cookies",
        "Try incognito/private browsing mode",
        "Reset your password if needed",
        "Contact support if issue persists"
      ]
    },
    {
      issue: "File Upload Failed",
      steps: [
        "Check file size (must be under limits)",
        "Verify file format is supported",
        "Check your internet connection",
        "Try uploading one file at a time",
        "Use a different browser"
      ]
    },
    {
      issue: "Slow Performance",
      steps: [
        "Check your internet speed",
        "Close other browser tabs",
        "Disable browser extensions",
        "Clear browser cache",
        "Try a different browser"
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Settings className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Technical Support</h1>
          <p className="text-xl text-gray-600">
            Resolve technical issues and get help with system requirements
          </p>
        </div>

        {/* Quick Status Check */}
        <Alert className="mb-8 border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>System Status:</strong> All systems are operational. Last updated: {new Date().toLocaleString()}
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="requirements" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="requirements">System Requirements</TabsTrigger>
            <TabsTrigger value="troubleshooting">Troubleshooting</TabsTrigger>
            <TabsTrigger value="account">Account Issues</TabsTrigger>
            <TabsTrigger value="uploads">File Uploads</TabsTrigger>
          </TabsList>

          {/* System Requirements */}
          <TabsContent value="requirements" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  System Requirements
                </CardTitle>
                <CardDescription>
                  Ensure your system meets these requirements for the best experience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-3 gap-6">
                  {systemRequirements.map((req, index) => (
                    <div key={index} className="space-y-3">
                      <h3 className="font-semibold text-gray-900">{req.category}</h3>
                      <ul className="space-y-2">
                        {req.items.map((item, itemIndex) => (
                          <li key={itemIndex} className="flex items-center text-sm text-gray-600">
                            <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                            {item}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Wifi className="h-5 w-5 mr-2" />
                  Internet Connection
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Minimum Speed:</span>
                    <Badge>5 Mbps</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <span className="font-medium">Recommended Speed:</span>
                    <Badge variant="default">25 Mbps</Badge>
                  </div>
                  <p className="text-sm text-gray-600">
                    A stable internet connection is required for file uploads and system access.
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Troubleshooting */}
          <TabsContent value="troubleshooting" className="space-y-6">
            <div className="space-y-6">
              {troubleshootingSteps.map((trouble, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertCircle className="h-5 w-5 mr-2 text-orange-500" />
                      {trouble.issue}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ol className="space-y-2">
                      {trouble.steps.map((step, stepIndex) => (
                        <li key={stepIndex} className="flex items-start">
                          <span className="bg-indigo-100 text-indigo-600 text-xs font-medium px-2 py-1 rounded-full mr-3 mt-0.5">
                            {stepIndex + 1}
                          </span>
                          <span className="text-gray-700">{step}</span>
                        </li>
                      ))}
                    </ol>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Account Issues */}
          <TabsContent value="account" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Lock className="h-5 w-5 mr-2" />
                  Account & Login Issues
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Forgot Password</h3>
                    <p className="text-gray-600 mt-1">
                      Use the "Forgot Password" link on the login page to reset your password.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Account Locked</h3>
                    <p className="text-gray-600 mt-1">
                      After 5 failed login attempts, your account will be locked for 15 minutes.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Email Verification</h3>
                    <p className="text-gray-600 mt-1">
                      Check your spam folder for verification emails. Contact support if not received.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* File Uploads */}
          <TabsContent value="uploads" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  File Upload Help
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Supported Formats</h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>Manuscripts</span>
                        <Badge>PDF, DOC, DOCX</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>Figures</span>
                        <Badge>PNG, JPG, SVG</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
                        <span>Supplementary</span>
                        <Badge>PDF, ZIP, XLS</Badge>
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900">Upload Tips</h3>
                    <ul className="space-y-2 text-sm text-gray-600">
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Keep file names simple (no special characters)
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Compress large files before uploading
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Use stable internet connection
                      </li>
                      <li className="flex items-start">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        Upload one file at a time for large files
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Contact Support */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle className="flex items-center">
              <HelpCircle className="h-5 w-5 mr-2" />
              Still Need Help?
            </CardTitle>
            <CardDescription>
              If you can't find a solution to your problem, our support team is here to help.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <a
                href="/contact"
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Support
              </a>
              <a
                href="/faq"
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Check FAQ
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

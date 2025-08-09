import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { HelpCircle, FileText, Users, Settings, Mail, Phone } from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Help Center - AMHSJ",
  description: "Get help with submissions, technical issues, and journal processes",
}

export default function HelpCenterPage() {
  const helpSections = [
    {
      icon: FileText,
      title: "Submission Help",
      description: "Get assistance with manuscript submissions",
      items: [
        { title: "How to Submit a Manuscript", href: "/help/submission" },
        { title: "Manuscript Formatting Guide", href: "/help/formatting" },
        { title: "Submission Status Tracking", href: "/help/status" },
        { title: "Revision Guidelines", href: "/help/revisions" },
      ]
    },
    {
      icon: Settings,
      title: "Technical Support",
      description: "Resolve technical issues and account problems",
      items: [
        { title: "Account Setup", href: "/help/technical/account" },
        { title: "Login Issues", href: "/help/technical/login" },
        { title: "File Upload Problems", href: "/help/technical/upload" },
        { title: "System Requirements", href: "/help/technical/requirements" },
      ]
    },
    {
      icon: Users,
      title: "Author Resources",
      description: "Resources and guidelines for authors",
      items: [
        { title: "Writing Guidelines", href: "/help/authors/writing" },
        { title: "Research Ethics", href: "/help/authors/ethics" },
        { title: "Copyright Information", href: "/help/authors/copyright" },
        { title: "Publication Process", href: "/help/authors/process" },
      ]
    },
    {
      icon: HelpCircle,
      title: "General Support",
      description: "General questions and journal information",
      items: [
        { title: "Journal Policies", href: "/help/general/policies" },
        { title: "Peer Review Process", href: "/help/general/review" },
        { title: "Editorial Board", href: "/editorial-board" },
        { title: "Contact Information", href: "/contact" },
      ]
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Help Center</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Find answers to your questions and get the support you need for your academic journey with AMHSJ
          </p>
        </div>

        {/* Quick Contact */}
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-6 mb-12">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Need Immediate Help?</h2>
              <p className="text-gray-600">Our support team is here to assist you</p>
            </div>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link 
                href="/contact" 
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email Support
              </Link>
              <Link 
                href="/faq" 
                className="flex items-center px-4 py-2 bg-white text-indigo-600 border border-indigo-600 rounded-lg hover:bg-indigo-50 transition-colors"
              >
                <HelpCircle className="h-4 w-4 mr-2" />
                FAQ
              </Link>
            </div>
          </div>
        </div>

        {/* Help Sections */}
        <div className="grid md:grid-cols-2 gap-8">
          {helpSections.map((section, index) => {
            const IconComponent = section.icon
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center space-x-3">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                      <IconComponent className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                      <CardTitle className="text-xl">{section.title}</CardTitle>
                      <CardDescription className="mt-1">
                        {section.description}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {section.items.map((item, itemIndex) => (
                      <Link
                        key={itemIndex}
                        href={item.href}
                        className="block p-3 rounded-lg border hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                      >
                        <div className="font-medium text-gray-900">{item.title}</div>
                      </Link>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Additional Resources */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-8">Additional Resources</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Video Tutorials</CardTitle>
                <CardDescription>Step-by-step video guides</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Coming Soon</Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Comprehensive video tutorials for all journal processes
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Live Webinars</CardTitle>
                <CardDescription>Interactive sessions with experts</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Monthly</Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Join our monthly webinars on academic publishing
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Documentation</CardTitle>
                <CardDescription>Comprehensive guides and policies</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="default">Available</Badge>
                <p className="text-sm text-gray-600 mt-2">
                  Detailed documentation for all journal procedures
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

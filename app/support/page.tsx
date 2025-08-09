"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock, 
  HelpCircle,
  Book,
  FileText,
  Video,
  Search,
  Users,
  Settings,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export default function SupportPage() {
  const supportOptions = [
    {
      icon: MessageCircle,
      title: "Live Chat Support",
      description: "Get instant help from our support team",
      action: "Start Chat",
      availability: "24/7 Available",
      color: "bg-green-50 text-green-700 border-green-200"
    },
    {
      icon: Mail,
      title: "Email Support",
      description: "Send us detailed questions via email",
      action: "Send Email",
      availability: "Response within 24 hours",
      color: "bg-blue-50 text-blue-700 border-blue-200"
    },
    {
      icon: Phone,
      title: "Phone Support",
      description: "Speak directly with our team",
      action: "Call Now",
      availability: "Mon-Fri, 9 AM - 6 PM EST",
      color: "bg-purple-50 text-purple-700 border-purple-200"
    }
  ]

  const quickHelp = [
    {
      icon: FileText,
      title: "Submission Guidelines",
      description: "Learn how to submit your research",
      href: "/submission-guidelines"
    },
    {
      icon: Users,
      title: "Peer Review Process",
      description: "Understand our review workflow",
      href: "/peer-review"
    },
    {
      icon: Settings,
      title: "Account Management",
      description: "Manage your profile and preferences",
      href: "/dashboard"
    },
    {
      icon: Book,
      title: "Author Guidelines",
      description: "Formatting and style requirements",
      href: "/author-guidelines"
    }
  ]

  const faqCategories = [
    {
      title: "Submission Process",
      count: 12,
      icon: FileText,
      href: "/help/technical"
    },
    {
      title: "Peer Review",
      count: 8,
      icon: Users,
      href: "/help/authors"
    },
    {
      title: "Technical Issues",
      count: 15,
      icon: AlertCircle,
      href: "/help/technical"
    },
    {
      title: "Account & Billing",
      count: 6,
      icon: Settings,
      href: "/help"
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Support & Help Center
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Get the help you need with our comprehensive support options and self-service resources
          </p>
        </div>

        {/* Support Options */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {supportOptions.map((option, index) => (
            <Card key={index} className={`${option.color} hover:shadow-lg transition-shadow`}>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 p-3 rounded-full bg-white/50">
                  <option.icon className="h-8 w-8" />
                </div>
                <CardTitle className="text-xl">{option.title}</CardTitle>
                <CardDescription className="text-current/80">
                  {option.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center">
                <Button 
                  className="mb-3 bg-white text-gray-800 hover:bg-gray-50"
                  onClick={() => {
                    if (option.title === "Live Chat Support") {
                      // Trigger Tawk.to chat
                      if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                        (window as any).Tawk_API.maximize()
                      }
                    } else if (option.title === "Email Support") {
                      window.location.href = "mailto:support@amhsj.org"
                    } else if (option.title === "Phone Support") {
                      window.location.href = "tel:+1-555-0123"
                    }
                  }}
                >
                  <option.icon className="h-4 w-4 mr-2" />
                  {option.action}
                </Button>
                <div className="flex items-center justify-center text-sm">
                  <Clock className="h-4 w-4 mr-1" />
                  {option.availability}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Help Links */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Quick Help</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickHelp.map((item, index) => (
              <Link key={index} href={item.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="text-center pt-6">
                    <div className="bg-blue-50 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <item.icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{item.title}</h3>
                    <p className="text-sm text-gray-600">{item.description}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ Categories */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Frequently Asked Questions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {faqCategories.map((category, index) => (
              <Link key={index} href={category.href}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="text-center pt-6">
                    <div className="bg-purple-50 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
                      <category.icon className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-800 mb-2">{category.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {category.count} articles
                    </Badge>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Contact Information */}
        <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
          <CardContent className="text-center py-12">
            <h2 className="text-3xl font-bold mb-4">Still Need Help?</h2>
            <p className="text-xl mb-6 opacity-90">
              Our support team is here to assist you with any questions or issues
            </p>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <Mail className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Email</div>
                <div className="opacity-90">support@amhsj.org</div>
              </div>
              <div className="text-center">
                <Phone className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Phone</div>
                <div className="opacity-90">+1 (555) 0123</div>
              </div>
              <div className="text-center">
                <MessageCircle className="h-8 w-8 mx-auto mb-2" />
                <div className="font-semibold">Live Chat</div>
                <div className="opacity-90">Available 24/7</div>
              </div>
            </div>
            <Button 
              className="mt-8 bg-white text-blue-600 hover:bg-gray-50"
              onClick={() => {
                if (typeof window !== 'undefined' && (window as any).Tawk_API) {
                  (window as any).Tawk_API.maximize()
                }
              }}
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Start Live Chat
            </Button>
          </CardContent>
        </Card>

        {/* Knowledge Base Search */}
        <div className="mt-12">
          <Card>
            <CardHeader className="text-center">
              <CardTitle className="text-2xl">Search Knowledge Base</CardTitle>
              <CardDescription>
                Find answers quickly by searching our comprehensive help articles
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl mx-auto">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search for help articles..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        // Implement search functionality
                        console.log('Search:', e.currentTarget.value)
                      }
                    }}
                  />
                </div>
                <div className="mt-4 flex flex-wrap gap-2 justify-center">
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    submission process
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    peer review
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    account issues
                  </Badge>
                  <Badge variant="outline" className="cursor-pointer hover:bg-gray-50">
                    formatting guidelines
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

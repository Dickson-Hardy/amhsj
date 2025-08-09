import { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Users, 
  FileText, 
  BookOpen, 
  Shield, 
  Copyright, 
  Award,
  Download,
  ExternalLink,
  CheckCircle,
  AlertCircle
} from "lucide-react"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Author Resources - AMHSJ Help Center",
  description: "Comprehensive resources and guidelines for authors submitting to AMHSJ",
}

export default function AuthorResourcesPage() {
  const writingGuidelines = [
    {
      title: "Manuscript Structure",
      items: [
        "Abstract (250 words max)",
        "Introduction with clear objectives",
        "Methods section with detailed procedures",
        "Results with statistical analysis",
        "Discussion and conclusions",
        "References in APA format"
      ]
    },
    {
      title: "Writing Style",
      items: [
        "Clear, concise scientific language",
        "Active voice when appropriate",
        "Proper use of medical terminology",
        "Consistent formatting throughout",
        "Avoid unnecessary jargon",
        "Include relevant keywords"
      ]
    },
    {
      title: "Figures and Tables",
      items: [
        "High-resolution images (300 DPI)",
        "Clear, descriptive captions",
        "Proper citation in text",
        "Professional appearance",
        "Color-blind friendly palette",
        "Editable format when possible"
      ]
    }
  ]

  const ethicsGuidelines = [
    {
      category: "Research Ethics",
      description: "Guidelines for ethical research conduct",
      items: [
        "IRB/Ethics committee approval",
        "Informed consent procedures",
        "Data privacy protection",
        "Conflict of interest disclosure",
        "Proper attribution of sources",
        "Honest reporting of results"
      ]
    },
    {
      category: "Publication Ethics",
      description: "Ethical standards for publication",
      items: [
        "No duplicate publication",
        "Proper authorship attribution",
        "Acknowledgment of contributions",
        "Disclosure of funding sources",
        "Correction of errors",
        "Respect for peer review process"
      ]
    }
  ]

  const publicationSteps = [
    {
      step: 1,
      title: "Manuscript Preparation",
      description: "Prepare your manuscript according to journal guidelines",
      timeframe: "2-4 weeks",
      status: "active"
    },
    {
      step: 2,
      title: "Initial Submission",
      description: "Submit through our online system",
      timeframe: "1 day",
      status: "active"
    },
    {
      step: 3,
      title: "Editorial Review",
      description: "Initial review by editorial team",
      timeframe: "1-2 weeks",
      status: "active"
    },
    {
      step: 4,
      title: "Peer Review",
      description: "Expert review by field specialists",
      timeframe: "4-8 weeks",
      status: "active"
    },
    {
      step: 5,
      title: "Author Revision",
      description: "Address reviewer comments",
      timeframe: "2-4 weeks",
      status: "active"
    },
    {
      step: 6,
      title: "Final Decision",
      description: "Accept, reject, or request further revision",
      timeframe: "1-2 weeks",
      status: "active"
    },
    {
      step: 7,
      title: "Production",
      description: "Copyediting and formatting",
      timeframe: "2-3 weeks",
      status: "active"
    },
    {
      step: 8,
      title: "Publication",
      description: "Online publication and indexing",
      timeframe: "1 week",
      status: "active"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-indigo-100 p-3 rounded-full">
              <Users className="h-8 w-8 text-indigo-600" />
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Author Resources</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Comprehensive resources and guidelines to help you successfully submit and publish your research
          </p>
        </div>

        <Tabs defaultValue="writing" className="space-y-8">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="writing">Writing Guidelines</TabsTrigger>
            <TabsTrigger value="ethics">Research Ethics</TabsTrigger>
            <TabsTrigger value="copyright">Copyright</TabsTrigger>
            <TabsTrigger value="process">Publication Process</TabsTrigger>
          </TabsList>

          {/* Writing Guidelines */}
          <TabsContent value="writing" className="space-y-6">
            <div className="grid md:grid-cols-3 gap-6">
              {writingGuidelines.map((section, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <FileText className="h-5 w-5 mr-2" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {section.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start text-sm">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Downloads Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Download className="h-5 w-5 mr-2" />
                  Download Resources
                </CardTitle>
                <CardDescription>
                  Templates and guides to help with your submission
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Manuscript Template</h3>
                      <p className="text-sm text-gray-600">Word template with proper formatting</p>
                    </div>
                    <Badge variant="secondary">DOC</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Style Guide</h3>
                      <p className="text-sm text-gray-600">Comprehensive formatting guidelines</p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Reference Format</h3>
                      <p className="text-sm text-gray-600">APA citation examples</p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                  <div className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h3 className="font-semibold">Figure Guidelines</h3>
                      <p className="text-sm text-gray-600">Image formatting standards</p>
                    </div>
                    <Badge variant="secondary">PDF</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Research Ethics */}
          <TabsContent value="ethics" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {ethicsGuidelines.map((category, index) => (
                <Card key={index}>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Shield className="h-5 w-5 mr-2" />
                      {category.category}
                    </CardTitle>
                    <CardDescription>{category.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-3">
                      {category.items.map((item, itemIndex) => (
                        <li key={itemIndex} className="flex items-start">
                          <AlertCircle className="h-4 w-4 text-orange-500 mr-2 mt-0.5 flex-shrink-0" />
                          <span className="text-sm">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Ethics Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Ethics Resources</CardTitle>
                <CardDescription>
                  Additional resources for ethical research conduct
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">Declaration of Helsinki</h3>
                      <p className="text-sm text-gray-600">Ethical principles for medical research</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">COPE Guidelines</h3>
                      <p className="text-sm text-gray-600">Committee on Publication Ethics</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <h3 className="font-semibold">ICMJE Recommendations</h3>
                      <p className="text-sm text-gray-600">International Committee of Medical Journal Editors</p>
                    </div>
                    <ExternalLink className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Copyright Information */}
          <TabsContent value="copyright" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Copyright className="h-5 w-5 mr-2" />
                  Copyright and Licensing
                </CardTitle>
                <CardDescription>
                  Understanding your rights and responsibilities
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Author Rights</h3>
                    <p className="text-gray-600 mt-1">
                      Authors retain certain rights even after publication, including the right to use their work for teaching and further research.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Open Access</h3>
                    <p className="text-gray-600 mt-1">
                      AMHSJ supports open access publishing. Learn about our open access options and Creative Commons licensing.
                    </p>
                  </div>
                  
                  <div className="border-l-4 border-indigo-500 pl-4">
                    <h3 className="font-semibold text-gray-900">Permissions</h3>
                    <p className="text-gray-600 mt-1">
                      Guidelines for obtaining permissions for previously published material and third-party content.
                    </p>
                  </div>
                </div>

                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start">
                    <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-yellow-800">Important Note</h3>
                      <p className="text-yellow-700 mt-1">
                        Please review our copyright policy carefully before submission. Contact our editorial office if you have questions about copyright or licensing.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Publication Process */}
          <TabsContent value="process" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Award className="h-5 w-5 mr-2" />
                  Publication Timeline
                </CardTitle>
                <CardDescription>
                  Step-by-step guide through the publication process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {publicationSteps.map((step, index) => (
                    <div key={index} className="flex items-start space-x-4">
                      <div className="flex-shrink-0">
                        <div className="flex items-center justify-center w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full font-semibold">
                          {step.step}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-semibold text-gray-900">{step.title}</h3>
                          <Badge variant="outline">{step.timeframe}</Badge>
                        </div>
                        <p className="text-gray-600 mt-1">{step.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>After Publication</CardTitle>
                <CardDescription>
                  What happens after your manuscript is published
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <h3 className="font-semibold">Immediate Actions</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Online publication
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        DOI assignment
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Indexing submission
                      </li>
                    </ul>
                  </div>
                  <div className="space-y-3">
                    <h3 className="font-semibold">Long-term Benefits</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Citation tracking
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Impact metrics
                      </li>
                      <li className="flex items-center">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Global visibility
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Additional Support */}
        <Card className="mt-12">
          <CardHeader>
            <CardTitle>Need Additional Support?</CardTitle>
            <CardDescription>
              Our editorial team is here to help you through the publication process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/contact"
                className="flex items-center justify-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Contact Editorial Office
              </Link>
              <Link
                href="/author-guidelines"
                className="flex items-center justify-center px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                View Author Guidelines
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { 
  FileText, 
  CheckCircle, 
  Clock, 
  Upload, 
  Eye, 
  Download,
  AlertCircle,
  BookOpen,
  Users,
  Mail,
  Globe,
  Shield,
  Award
} from "lucide-react"

export default function AuthorGuidelinesPage() {
  const submissionTypes = [
    {
      type: "Original Research Articles",
      description: "Reports of original medical and health sciences research",
      wordLimit: "3000 words maximum",
      abstractLimit: "300 words",
      references: "Vancouver format",
      figures: "Allow 250 words per table/figure",
      color: "blue"
    },
    {
      type: "Review Articles", 
      description: "Comprehensive reviews of current topics in health sciences",
      wordLimit: "3500 words maximum",
      abstractLimit: "300 words", 
      references: "Vancouver format",
      figures: "Allow 250 words per table/figure",
      color: "green"
    },
    {
      type: "Case/Audit Reports",
      description: "Detailed reports of interesting clinical cases",
      wordLimit: "800 words maximum",
      abstractLimit: "300 words",
      references: "Vancouver format", 
      figures: "Allow 250 words per table/figure",
      color: "purple"
    },
    {
      type: "Letters",
      description: "Brief communications to the editor",
      wordLimit: "As appropriate",
      abstractLimit: "Not required",
      references: "Vancouver format",
      figures: "Minimal", 
      color: "orange"
    }
  ]

  const getColorClass = (color: string) => {
    const colors = {
      blue: "border-blue-200 bg-blue-50",
      green: "border-green-200 bg-green-50", 
      purple: "border-purple-200 bg-purple-50",
      orange: "border-orange-200 bg-orange-50"
    }
    return colors[color as keyof typeof colors] || colors.blue
  }

  const submissionSteps = [
    {
      step: 1,
      title: "Prepare Your Manuscript",
      description: "Follow our formatting guidelines and prepare all required files",
      icon: <FileText className="h-5 w-5" />,
      details: ["Format according to guidelines", "Prepare figures and tables", "Complete all required forms"]
    },
    {
      step: 2, 
      title: "Submit Online",
      description: "Use our online submission system to upload your manuscript",
      icon: <Upload className="h-5 w-5" />,
      details: ["Create account or login", "Upload manuscript files", "Complete submission forms"]
    },
    {
      step: 3,
      title: "Initial Review",
      description: "Editorial team conducts initial screening for scope and quality",
      icon: <Eye className="h-5 w-5" />,
      details: ["Editorial screening", "Technical check", "Plagiarism detection"]
    },
    {
      step: 4,
      title: "Peer Review",
      description: "Expert reviewers evaluate your manuscript",
      icon: <Users className="h-5 w-5" />,
      details: ["Assigned to reviewers", "Detailed evaluation", "Review reports generated"]
    },
    {
      step: 5,
      title: "Editorial Decision",
      description: "Editor makes final decision based on reviews",
      icon: <CheckCircle className="h-5 w-5" />,
      details: ["Editor evaluation", "Decision communicated", "Revision requests if needed"]
    },
    {
      step: 6,
      title: "Publication",
      description: "Accepted manuscripts are prepared for publication",
      icon: <Award className="h-5 w-5" />,
      details: ["Copy editing", "Final proofing", "Online publication"]
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-indigo-50/30">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Author Guidelines
              </h1>
              <p className="text-lg text-gray-700 max-w-3xl mx-auto mb-6">
                Comprehensive submission guidelines for the Advances in Medicine & Health Sciences Journal
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Mail className="h-4 w-4 mr-2" />
                  Submit to: editor@amhsjournal.org
                </Button>
                <Button variant="outline">
                  <Download className="h-4 w-4 mr-2" />
                  Download Guidelines PDF
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Reference */}
        <Alert className="mb-8 border-indigo-200 bg-indigo-50">
          <AlertCircle className="h-4 w-4 text-indigo-600" />
          <AlertDescription className="text-indigo-800">
            <strong>Quick Start:</strong> New to our journal? Start with our submission checklist below, then review the detailed guidelines for your manuscript type.
          </AlertDescription>
        </Alert>

        {/* Submission Types */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Manuscript Types</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {submissionTypes.map((type, index) => (
              <Card key={index} className={`${getColorClass(type.color)} border-l-4`}>
                <CardHeader>
                  <CardTitle className="text-lg">{type.type}</CardTitle>
                  <CardDescription>{type.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <strong>Word Limit:</strong> {type.wordLimit}
                    </div>
                    <div>
                      <strong>Abstract:</strong> {type.abstractLimit}
                    </div>
                    <div>
                      <strong>References:</strong> {type.references}
                    </div>
                    <div>
                      <strong>Figures:</strong> {type.figures}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Submission Process */}
        <div className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6">Submission Process</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {submissionSteps.map((step, index) => (
              <Card key={index} className="relative">
                <CardHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {step.step}
                    </div>
                    <div className="p-2 bg-indigo-100 rounded-lg">
                      {step.icon}
                    </div>
                  </div>
                  <CardTitle className="text-lg">{step.title}</CardTitle>
                  <CardDescription>{step.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {step.details.map((detail, idx) => (
                      <li key={idx} className="flex items-center">
                        <CheckCircle className="h-3 w-3 text-green-600 mr-2 flex-shrink-0" />
                        {detail}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="space-y-8 mb-8">
          
          {/* Submission Instructions */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-indigo-600" />
                Submission Instructions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">General Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Materials must not have been published previously in any printed or electronic media</li>
                  <li>• All papers will be peer-reviewed by at least three independent referees</li>
                  <li>• Allow 250 words for each table, figure, or group of eight references</li>
                  <li>• References must be in Vancouver format</li>
                  <li>• Font: Times New Roman, size 12, double-spaced, single column</li>
                  <li>• Use Microsoft Word compliant application</li>
                  <li>• Pages should be numbered with word count provided</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Title Page Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Full title of the article</li>
                  <li>• Names and up to 2 degrees of all authors</li>
                  <li>• Department(s) and institution(s)</li>
                  <li>• Five keywords</li>
                  <li>• Name, email, and postal address of corresponding author</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Abstract Structure (300 words maximum)</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• <strong>Background:</strong> Study rationale and context</li>
                  <li>• <strong>Objectives:</strong> Study aims and research questions</li>
                  <li>• <strong>Methods:</strong> Study design and methodology</li>
                  <li>• <strong>Results:</strong> Key findings and outcomes</li>
                  <li>• <strong>Conclusion:</strong> Main conclusions and implications</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Covering Letter and Submission */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Covering Letter & Submission
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Covering Letter Requirements</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Must identify the corresponding author</li>
                  <li>• Must be signed by all co-authors</li>
                  <li>• Only those who have contributed significantly should be included as authors</li>
                  <li>• Corresponding author should explain any authors unable to sign</li>
                </ul>
              </div>
              
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4">
                <h4 className="font-semibold mb-2 text-blue-800">Submission Details</h4>
                <p className="text-sm text-blue-700 mb-2">
                  <strong>Email your manuscript to the Editor-in-Chief:</strong>
                </p>
                <p className="text-lg font-semibold text-blue-800">editor@amhsjournal.org</p>
                <div className="mt-3 space-y-1 text-sm text-blue-700">
                  <p>• Peer-review timeframe: <strong>14 days</strong></p>
                  <p>• Manuscripts are anonymized including peer-reviewer comments</p>
                  <p>• Aim to publish online: <strong>4-6 weeks after submission</strong></p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Peer Review Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-5 w-5 mr-2 text-green-600" />
                Peer Review Criteria
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-semibold mb-2">Structure & Content</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Does the title reflect the article contents?</li>
                    <li>• Does abstract reflect all study aspects?</li>
                    <li>• Is study rationale adequately described?</li>
                    <li>• Are objectives clearly stated and defined?</li>
                    <li>• Do results justify the conclusions?</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Methodology</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Is study design appropriate for objectives?</li>
                    <li>• Is sample size appropriate and justified?</li>
                    <li>• Is sampling technique adequately described?</li>
                    <li>• Are data collection methods well described?</li>
                    <li>• Are bias minimization techniques documented?</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Analysis & Results</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Are data analysis methods appropriate?</li>
                    <li>• Do results answer research questions?</li>
                    <li>• Are results credible and well-documented?</li>
                    <li>• Is statistical significance properly documented?</li>
                    <li>• Are findings presented logically?</li>
                  </ul>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Discussion & References</h4>
                  <ul className="space-y-1 text-sm text-gray-600">
                    <li>• Are key findings clearly stated?</li>
                    <li>• Are differences with other studies discussed?</li>
                    <li>• Are implications clearly explained?</li>
                    <li>• Are references appropriate and up-to-date?</li>
                    <li>• Do references follow Vancouver style?</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Authorship & Ethics */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="h-5 w-5 mr-2 text-red-600" />
                Authorship & Ethical Requirements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">ICMJE Authorship Criteria</h4>
                <p className="text-sm text-gray-600 mb-2">All authors must meet ALL four criteria:</p>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Substantial contributions to conception/design OR data acquisition/analysis/interpretation</li>
                  <li>• Drafting the work OR revising it critically for important intellectual content</li>
                  <li>• Final approval of the version to be published</li>
                  <li>• Agreement to be accountable for all aspects of the work</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Ethical Considerations</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Ethical approval must be obtained and documented (for human studies)</li>
                  <li>• Financial conflicts of interest must be declared</li>
                  <li>• Plagiarism and research fraud should be reported to Editor-in-Chief</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ORCID Support</h4>
                <p className="text-sm text-gray-600">
                  AMHSJ is a supporting member of ORCID. We encourage all authors to use ORCID iDs during peer review.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Publication Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-purple-600" />
                Publication Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold mb-2">Open Access Policy</h4>
                <p className="text-sm text-gray-600 mb-2">
                  AMHSJ provides free, unrestricted online access to scholarly articles. All articles are published under Creative Commons Attribution-NonCommercial-NoDerivs (CC BY-NC-ND) license.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Publication Fee</h4>
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4">
                  <p className="text-sm text-yellow-800 mb-2">
                    <strong>Publication Fee:</strong> US $100.00
                  </p>
                  <p className="text-sm text-yellow-700">
                    Payable to Medical & Dental Consultants Association of Nigeria (MDCAN), Niger Delta University Teaching Hospital (NDUTH) Chapter upon acceptance.
                  </p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">Copyright & Citation</h4>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• AMHSJ retains copyright of all published work</li>
                  <li>• Proper attribution required for all materials used</li>
                  <li>• Citation format: Nig Del Med J 2017; 2: 1-5 (Vancouver style)</li>
                </ul>
              </div>

              <div>
                <h4 className="font-semibold mb-2">ISSN Numbers</h4>
                <div className="flex gap-4 text-sm">
                  <span><strong>Print:</strong> 2672-4588</span>
                  <span><strong>Online:</strong> 2672-4596</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Submission Checklist */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
              Pre-Submission Checklist
            </CardTitle>
            <CardDescription>
              Please ensure all items are completed before submission to editor@amhsjournal.org
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold mb-3">Manuscript Requirements</h4>
                <div className="space-y-2">
                  {[
                    "Title page with all author details and 5 keywords",
                    "Structured abstract (Background, Objectives, Methods, Results, Conclusion)", 
                    "Main manuscript in Times New Roman 12pt, double-spaced",
                    "References in Vancouver format",
                    "Word count provided (excluding references, tables, legends)",
                    "Pages numbered consecutively"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-3">Documentation</h4>
                <div className="space-y-2">
                  {[
                    "Covering letter signed by all co-authors",
                    "Declaration and copyright form",
                    "Conflict of interest disclosure",
                    "Ethics approval documentation (if applicable)",
                    "ORCID iDs for all authors (recommended)",
                    "Original submission (not previously published)"
                  ].map((item, index) => (
                    <div key={index} className="flex items-center">
                      <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                      <span className="text-sm text-gray-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact and Support */}
        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-600" />
                Editorial Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>Manuscript Submissions:</strong>
                <p className="text-lg font-semibold text-blue-600">editor@amhsjournal.org</p>
              </div>
              <div>
                <strong>Editor-in-Chief:</strong>
                <p className="text-sm text-gray-600">Prof Tubonye C Harry</p>
              </div>
              <div>
                <strong>Review Timeline:</strong>
                <p className="text-sm text-gray-600">14 days peer review, 4-6 weeks to online publication</p>
              </div>
              <div>
                <strong>Publication Fee:</strong>
                <p className="text-sm text-gray-600">US $100.00 upon acceptance</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="h-5 w-5 mr-2 text-purple-600" />
                Journal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <strong>ISSN:</strong>
                <p className="text-sm text-gray-600">Print: 2672-4588 | Online: 2672-4596</p>
              </div>
              <div>
                <strong>License:</strong>
                <p className="text-sm text-gray-600">CC BY-NC-ND (Open Access)</p>
              </div>
              <div>
                <strong>Reference Style:</strong>
                <p className="text-sm text-gray-600">Vancouver format</p>
              </div>
              <div>
                <strong>Example Citation:</strong>
                <p className="text-sm text-gray-600">Nig Del Med J 2017; 2: 1-5</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

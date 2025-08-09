import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Mail, ExternalLink, Award, BookOpen } from "lucide-react"
import Link from "next/link"

export default function EditorialBoardPage() {
  const editorInChief = {
    name: "Prof. Dr. Elena Rodriguez",
    title: "Editor-in-Chief",
    affiliation: "MIT Computer Science & Artificial Intelligence Laboratory",
    expertise: ["IoT Systems", "Edge Computing", "Distributed Systems"],
    bio: "Prof. Rodriguez is a leading researcher in IoT systems with over 20 years of experience. She has published 150+ papers and holds 12 patents in connected device technologies.",
    email: "editor@amhsj.org",
    orcid: "0000-0002-1234-5678",
    hIndex: 45,
    citations: 8900,
  }

  const associateEditors = [
    {
      name: "Dr. Michael Chen",
      title: "Associate Editor - Industrial IoT",
      affiliation: "Stanford University, Department of Computer Science",
      expertise: ["Industrial IoT", "Manufacturing Systems", "Industry 4.0"],
      bio: "Dr. Chen specializes in industrial IoT applications and has led multiple industry-academia collaborations.",
      email: "m.chen@stanford.edu",
      orcid: "0000-0003-2345-6789",
      hIndex: 32,
      citations: 5600,
    },
    {
      name: "Prof. Sarah Johnson",
      title: "Associate Editor - Smart Cities",
      affiliation: "University of Cambridge, Smart Cities Research Group",
      expertise: ["Smart Cities", "Urban Computing", "Sensor Networks"],
      bio: "Prof. Johnson leads the Smart Cities initiative at Cambridge and has consulted for major metropolitan areas worldwide.",
      email: "s.johnson@cam.ac.uk",
      orcid: "0000-0004-3456-7890",
      hIndex: 38,
      citations: 7200,
    },
    {
      name: "Dr. Raj Patel",
      title: "Associate Editor - IoT Security",
      affiliation: "Carnegie Mellon University, CyLab Security Institute",
      expertise: ["IoT Security", "Cryptography", "Privacy"],
      bio: "Dr. Patel is a cybersecurity expert focusing on IoT device security and privacy-preserving technologies.",
      email: "r.patel@cmu.edu",
      orcid: "0000-0005-4567-8901",
      hIndex: 29,
      citations: 4800,
    },
  ]

  const editorialBoard = [
    {
      name: "Dr. Lisa Zhang",
      affiliation: "University of Toronto",
      expertise: ["Healthcare IoT", "Medical Devices"],
      country: "Canada",
    },
    {
      name: "Prof. Hans Mueller",
      affiliation: "Technical University of Munich",
      expertise: ["Automotive IoT", "Connected Vehicles"],
      country: "Germany",
    },
    {
      name: "Dr. Yuki Tanaka",
      affiliation: "University of Tokyo",
      expertise: ["Robotics", "Human-Robot Interaction"],
      country: "Japan",
    },
    {
      name: "Prof. Maria Silva",
      affiliation: "University of São Paulo",
      expertise: ["Agricultural IoT", "Precision Farming"],
      country: "Brazil",
    },
    {
      name: "Dr. Ahmed Hassan",
      affiliation: "American University of Cairo",
      expertise: ["Wireless Networks", "5G IoT"],
      country: "Egypt",
    },
    {
      name: "Prof. Emma Thompson",
      affiliation: "University of Melbourne",
      expertise: ["Environmental IoT", "Climate Monitoring"],
      country: "Australia",
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">Editorial Board</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Meet the distinguished researchers and experts who guide AMHSJ's editorial direction and maintain our high
            standards of scientific excellence in IoT and connected systems research.
          </p>
        </div>

        {/* Editor-in-Chief */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Editor-in-Chief</h2>
          <Card className="border-2 border-indigo-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl text-indigo-800">{editorInChief.name}</CardTitle>
                  <CardDescription className="text-lg font-medium text-gray-700">{editorInChief.title}</CardDescription>
                  <p className="text-gray-600 mt-1">{editorInChief.affiliation}</p>
                </div>
                <Badge className="bg-indigo-100 text-indigo-800">Editor-in-Chief</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <p className="text-gray-700 mb-4">{editorInChief.bio}</p>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {editorInChief.expertise.map((area, index) => (
                      <Badge key={index} variant="secondary">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex gap-3">
                    <Button size="sm" variant="outline">
                      <Mail className="h-4 w-4 mr-2" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      ORCID
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">H-Index</span>
                      <span className="font-bold text-lg">{editorInChief.hIndex}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Citations</span>
                      <span className="font-bold text-lg">{editorInChief.citations.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Associate Editors */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Associate Editors</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {associateEditors.map((editor, index) => (
              <Card key={index} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <CardTitle className="text-lg">{editor.name}</CardTitle>
                  <CardDescription className="font-medium text-gray-700">{editor.title}</CardDescription>
                  <p className="text-sm text-gray-600">{editor.affiliation}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 text-sm mb-3">{editor.bio}</p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {editor.expertise.map((area, idx) => (
                      <Badge key={idx} variant="secondary" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-sm text-gray-600 mb-3">
                    <span>
                      H-Index: <strong>{editor.hIndex}</strong>
                    </span>
                    <span>
                      Citations: <strong>{editor.citations.toLocaleString()}</strong>
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      <Mail className="h-3 w-3 mr-1" />
                      Contact
                    </Button>
                    <Button size="sm" variant="outline">
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Editorial Board Members */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Editorial Board Members</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {editorialBoard.map((member, index) => (
              <Card key={index} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <h3 className="font-semibold text-gray-800 mb-1">{member.name}</h3>
                  <p className="text-sm text-gray-600 mb-2">{member.affiliation}</p>
                  <p className="text-xs text-gray-500 mb-2">{member.country}</p>
                  <div className="flex flex-wrap gap-1">
                    {member.expertise.map((area, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Join Editorial Board */}
        <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Join Our Editorial Board</CardTitle>
            <CardDescription className="text-lg">
              Are you a leading researcher in IoT or connected systems? We're always looking for distinguished experts
              to join our editorial team.
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center">
            <div className="grid md:grid-cols-3 gap-6 mb-6">
              <div className="flex flex-col items-center">
                <Award className="h-8 w-8 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Expertise Recognition</h3>
                <p className="text-sm text-gray-600">Gain recognition as a field expert</p>
              </div>
              <div className="flex flex-col items-center">
                <BookOpen className="h-8 w-8 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Shape the Field</h3>
                <p className="text-sm text-gray-600">Influence IoT research direction</p>
              </div>
              <div className="flex flex-col items-center">
                <ExternalLink className="h-8 w-8 text-indigo-600 mb-2" />
                <h3 className="font-semibold">Global Network</h3>
                <p className="text-sm text-gray-600">Connect with leading researchers</p>
              </div>
            </div>
            <Button size="lg" className="bg-indigo-600 hover:bg-indigo-700" asChild>
              <Link href="/editorial-board/apply">
                Apply to Join Editorial Board
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

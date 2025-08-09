import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Cpu, Target, Users, Award, Globe, Zap } from "lucide-react"

export default function AboutPage() {
  const objectives = [
    {
      icon: Target,
      title: "Research Excellence",
      description: "Advancing the frontiers of IoT and connected systems through rigorous peer review",
    },
    {
      icon: Globe,
      title: "Global Impact",
      description: "Connecting researchers worldwide to accelerate innovation in smart technologies",
    },
    {
      icon: Zap,
      title: "Innovation Focus",
      description: "50% dedicated to IoT research, driving the future of connected devices",
    },
    {
      icon: Users,
      title: "Community Building",
      description: "Fostering collaboration between academia and industry professionals",
    },
  ]

  const focusAreas = [
    "Clinical Medicine & Patient Care",
    "Public Health & Epidemiology",
    "Biomedical Sciences & Laboratory Research",
    "Healthcare Technology & Medical Devices",
    "Medical Education & Professional Development",
    "Global Health & Health Policy",
    "Preventive Medicine & Health Promotion",
    "Medical Ethics & Healthcare Law",
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-3 rounded-full mr-4">
              <Cpu className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-gray-800">
                About AMHSJ - Advances in Medicine and Health Sciences Journal
              </h1>
              <p className="text-xl text-gray-600 mt-2">Advancing Modern Hardware & Software Journal</p>
            </div>
          </div>
          <Badge className="bg-indigo-100 text-indigo-800 text-lg px-4 py-2">
            Leading IoT Research Publication Since 2010
          </Badge>
        </div>

        {/* Mission Statement */}
        <Card className="mb-12">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Our Mission</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-gray-700 leading-relaxed max-w-4xl mx-auto">
              AMHSJ is dedicated to advancing the field of medicine and health sciences through the publication of
              high-quality, peer-reviewed research. We bridge the gap between clinical practice and scientific research,
              fostering innovation that improves patient outcomes and global health.
            </p>
          </CardContent>
        </Card>

        {/* Objectives */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Our Objectives</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {objectives.map((objective, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                    <objective.icon className="h-8 w-8 text-indigo-600" />
                  </div>
                  <CardTitle className="text-lg">{objective.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{objective.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Focus Areas */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-8">Research Focus Areas</h2>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Cpu className="h-5 w-5 mr-2 text-indigo-600" />
                IoT & Connected Systems Research
              </CardTitle>
              <CardDescription>50% of our publications focus on these cutting-edge IoT domains</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {focusAreas.map((area, index) => (
                  <div key={index} className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-indigo-600 rounded-full mr-3"></div>
                    <span className="text-gray-700">{area}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Impact & Recognition */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Card className="text-center">
            <CardHeader>
              <Award className="h-12 w-12 text-yellow-600 mx-auto mb-2" />
              <CardTitle>Impact Factor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">5.2</div>
              <p className="text-gray-600">2024 Journal Citation Reports</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Globe className="h-12 w-12 text-blue-600 mx-auto mb-2" />
              <CardTitle>Global Reach</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">89</div>
              <p className="text-gray-600">Countries represented</p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardHeader>
              <Users className="h-12 w-12 text-green-600 mx-auto mb-2" />
              <CardTitle>Research Community</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-800 mb-2">2,847</div>
              <p className="text-gray-600">Active researchers</p>
            </CardContent>
          </Card>
        </div>

        {/* Editorial Philosophy */}
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">Editorial Philosophy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Quality & Rigor</h3>
                <p className="text-gray-700 mb-4">
                  Every submission undergoes rigorous peer review by experts in the field. We maintain the highest
                  standards of scientific integrity and methodological soundness.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Innovation & Impact</h3>
                <p className="text-gray-700">
                  We prioritize research that pushes boundaries and has real-world applications, particularly in the
                  rapidly evolving IoT landscape.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Open Access</h3>
                <p className="text-gray-700 mb-4">
                  We believe in making research accessible to all. Our open access model ensures that groundbreaking IoT
                  research reaches the global community without barriers.
                </p>
                <h3 className="text-lg font-semibold text-gray-800 mb-3">Ethical Standards</h3>
                <p className="text-gray-700">
                  We adhere to the highest ethical standards in publishing, including guidelines for data privacy, IoT
                  security research, and responsible innovation.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

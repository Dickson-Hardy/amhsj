"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { 
  Upload, 
  FileText, 
  Image, 
  Table, 
  FileSpreadsheet, 
  Mail, 
  Shield, 
  Award, 
  Plus,
  X 
} from "lucide-react"
import { useState } from "react"

interface FileUploadSectionProps {
  uploadedFiles: {[key: string]: File[]}
  onFileUpload: (files: FileList, category: string) => void
  onFileRemove: (category: string, fileIndex: number) => void
  uploadProgress: number
}

const fileCategories = [
  {
    key: 'manuscript',
    title: 'Manuscript File',
    subtitle: 'Main research document',
    icon: FileText,
    color: 'blue',
    accept: '.doc,.docx',
    multiple: false,
    required: true,
    description: 'DOC, DOCX only (Max 2MB)'
  },
  {
    key: 'figures',
    title: 'Figures & Images',
    subtitle: 'Charts, graphs, photos',
    icon: Image,
    color: 'green',
    accept: '.png,.jpg,.jpeg,.tiff,.eps,.svg',
    multiple: true,
    required: false,
    description: 'PNG, JPG, TIFF, EPS, SVG'
  },
  {
    key: 'tables',
    title: 'Tables & Data',
    subtitle: 'Spreadsheets and data files',
    icon: Table,
    color: 'purple',
    accept: '.xlsx,.csv,.doc,.docx',
    multiple: true,
    required: false,
    description: 'XLSX, CSV, PDF, DOC'
  },
  {
    key: 'supplementary',
    title: 'Supplementary Materials',
    subtitle: 'Additional supporting files',
    icon: FileSpreadsheet,
    color: 'orange',
    accept: '.pdf,.doc,.docx,.xlsx,.csv,.zip,.rar',
    multiple: true,
    required: false,
    description: 'Any supporting files, data, videos'
  },
  {
    key: 'coverLetter',
    title: 'Cover Letter',
    subtitle: 'Letter to editor',
    icon: Mail,
    color: 'blue',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    required: false,
    description: 'Letter to editor (Recommended)'
  },
  {
    key: 'ethicsApproval',
    title: 'Ethics Approval',
    subtitle: 'Ethics committee approval',
    icon: Shield,
    color: 'amber',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    required: false,
    description: 'If study involves human subjects'
  },
  {
    key: 'copyrightForm',
    title: 'Copyright Transfer',
    subtitle: 'Publication rights form',
    icon: Award,
    color: 'amber',
    accept: '.pdf,.doc,.docx',
    multiple: false,
    required: false,
    description: 'Transfer publication rights'
  }
]

export function FileUploadSection({ 
  uploadedFiles, 
  onFileUpload, 
  onFileRemove, 
  uploadProgress 
}: FileUploadSectionProps) {

  const handleChooseFiles = (category: string, accept?: string, multiple = true) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = accept || '.doc,.docx'
    input.multiple = multiple
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files
      if (files) {
        onFileUpload(files, category)
      }
    }
    input.click()
  }

  const getColorClasses = (color: string) => {
    const colorMap = {
      blue: 'text-blue-600 bg-blue-50 border-blue-200',
      green: 'text-green-600 bg-green-50 border-green-200',
      purple: 'text-purple-600 bg-purple-50 border-purple-200',
      orange: 'text-orange-600 bg-orange-50 border-orange-200',
      amber: 'text-amber-600 bg-amber-50 border-amber-200'
    }
    return colorMap[color as keyof typeof colorMap] || colorMap.blue
  }

  // Separate required and optional files
  const requiredFiles = fileCategories.filter(cat => cat.required)
  const optionalFiles = fileCategories.filter(cat => !cat.required)

  return (
    <div className="space-y-6">
      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Uploading files...</span>
            <span>{uploadProgress}%</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Required Files */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Required Files</h3>
        <div className="grid grid-cols-1 gap-4">
          {requiredFiles.map((category) => {
            const Icon = category.icon
            const files = uploadedFiles[category.key] || []
            const colorClasses = getColorClasses(category.color)
            
            return (
              <Card key={category.key} className={`border-2 ${colorClasses.includes('blue') ? 'border-blue-200 bg-blue-50/30' : 'border-gray-200'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Icon className="h-5 w-5" />
                    {category.title}
                    <Badge variant="secondary" className="bg-red-100 text-red-800">Required</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {files.length === 0 ? (
                    <div className="border-2 border-dashed border-blue-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                      <p className="text-sm text-blue-600 mb-3">{category.subtitle}</p>
                      <Button 
                        onClick={() => handleChooseFiles(category.key, category.accept, category.multiple)}
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Choose File
                      </Button>
                      <p className="text-xs text-blue-500 mt-2">{category.description}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white rounded border">
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4 text-blue-600" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-gray-500">({(file.size / 1024 / 1024).toFixed(1)} MB)</span>
                          </div>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => onFileRemove(category.key, index)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Optional Files */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-slate-900">Optional Files</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {optionalFiles.map((category) => {
            const Icon = category.icon
            const files = uploadedFiles[category.key] || []
            
            return (
              <Card key={category.key}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Icon className={`h-4 w-4 text-${category.color}-600`} />
                    {category.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleChooseFiles(category.key, category.accept, category.multiple)}
                      className="w-full"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add {category.title}
                    </Button>
                    {files.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded text-xs">
                        <span className="truncate">{file.name}</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => onFileRemove(category.key, index)}
                          className="h-6 w-6 p-0 text-red-500"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    <p className="text-xs text-gray-500">{category.description}</p>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Upload Summary */}
      <div className="bg-gray-50 p-4 rounded-lg">
        <h4 className="font-medium text-sm mb-2">Upload Summary</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
          {fileCategories.map(category => (
            <div key={category.key}>
              {category.title}: {uploadedFiles[category.key]?.length || 0}
            </div>
          ))}
          <div className="font-medium">
            Total: {Object.values(uploadedFiles).flat().length} files
          </div>
        </div>
      </div>
    </div>
  )
}
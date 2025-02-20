"use client"

import { uploadFile } from "@/lib/uploadFile"
import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { toast } from "sonner"
import { getCookie } from "cookies-next"
import { Input } from "@/components/ui/input"
import { Upload, FileText, Eye } from "lucide-react"

interface AnalysisResult {
  score: string
  strength: string[]
  weakness: string[]
}

const ApplyJobPage = ({ params }: { params: Promise<{ jid: string }> }) => {
  const jobId = React.use(params).jid
  const [resume, setResume] = useState<string>("")
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [fileName, setFileName] = useState<string>("")
  const [coverLetterFileName, setCoverLetterFileName] = useState<string>("")
  const [isUploading, setIsUploading] = useState(false)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult | null>(null)
  const router = useRouter()

  const analyzeResume = async (text: string) => {
    try {
      const response = await fetch("/api/analyze-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text,
          jobProfile: "General ATS Analysis",
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log("Raw API Response:", data)
      console.log("Message Content:", data.choices[0].message.content)

      let analysisResult = data.choices[0].message.content

      analysisResult = analysisResult
        .replace(/^[\s\S]*?```json\s*/, "")
        .replace(/\s*```[\s\S]*$/, "")
        .trim()

      console.log("Cleaned Analysis Result:", analysisResult)

      try {
        const parsedAnalysis = JSON.parse(analysisResult) as AnalysisResult
        console.log("Successfully Parsed Analysis:", parsedAnalysis)
        return parsedAnalysis
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError)
        console.error("Failed JSON string:", analysisResult)
        throw new Error("Failed to parse analysis results")
      }
    } catch (error) {
      console.error("Resume analysis error:", error)
      throw error
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file")
      return
    }

    setIsUploading(true)
    setIsAnalyzing(true)
    setFileName(file.name)

    try {
      console.log("Starting parallel file processing...")

      const [fileUploadPromise, fileAnalysisPromise] = await Promise.all([
        uploadFile({
          file,
          fileExt: "pdf",
          folderPath: "yuktiRes",
        }),

        (async () => {
          const formData = new FormData()
          formData.append("filepond", "")
          formData.append("filepond", file)

          console.log("Uploading file for analysis...")
          const uploadResponse = await fetch("/api/upload", {
            method: "POST",
            body: formData,
          })

          if (!uploadResponse.ok) {
            console.error("Upload Response:", await uploadResponse.json())
            throw new Error("Failed to upload file for analysis")
          }

          const uploadData = await uploadResponse.json()
          console.log("Upload Response:", uploadData)

          if (!uploadData.parsedText) {
            throw new Error("No parsed text received from upload")
          }

          return await analyzeResume(uploadData.parsedText)
        })()
      ])

      if (fileUploadPromise) {
        setResume(fileUploadPromise)
        console.log("AWS Upload Success - URL:", fileUploadPromise)
      }

      if (fileAnalysisPromise) {
        setAnalysisResults(fileAnalysisPromise)
        console.log("Analysis Results:", fileAnalysisPromise)
      }

      toast.success("Resume processed successfully")
    } catch (error) {
      console.error("Error processing resume:", error)
      toast.error("Failed to process resume")
    } finally {
      setIsUploading(false)
      setIsAnalyzing(false)
    }
  }

  const handleCoverLetterUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!file.type.includes("pdf")) {
      toast.error("Please upload a PDF file for cover letter")
      return
    }

    try {
      setCoverLetterFileName(file.name)
      const awsUrl = await uploadFile({
        file,
        fileExt: "pdf",
        folderPath: "coverLetters",
      })
      setCoverLetter(awsUrl)
      toast.success("Cover letter uploaded successfully")
    } catch (error) {
      console.error("Cover letter upload error:", error)
      toast.error("Failed to upload cover letter")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!resume) {
      toast.error("Please upload your resume first")
      return
    }

    const applicantCookie = getCookie("ykapptoken")
    const applicant = applicantCookie ? JSON.parse(applicantCookie as string) : null

    if (!applicant) {
      toast.error("You must be logged in to apply for jobs")
      return
    }

    try {
      const response = await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobId: jobId,
          applicantId: applicant.applicantId,
          status: "PENDING",
          resume: resume,
          cover: coverLetter,
          score: analysisResults?.score || null,
          strength: analysisResults?.strength?.join(", ") || null,
          weakness: analysisResults?.weakness?.join(", ") || null,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to submit application")
      }

      toast.success("Application submitted successfully")
      router.push("/applicant/applied-jobs")
    } catch (error) {
      console.error("Error submitting application:", error)
      toast.error("Failed to submit application")
    }
  }

  const handlePreview = () => {
    if (resume) {
      window.open(resume, "_blank")
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-xl">
        <Card className="overflow-hidden">
          <CardContent className="p-0">
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Submit Job Application</h1>
                <p className="text-sm text-muted-foreground mt-2">
                  {isAnalyzing
                    ? "Analyzing resume..."
                    : "Upload your resume, cover letter (optional), and submit your application"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Resume Upload */}
                <div className="grid gap-2">
                  <Label htmlFor="resume">Resume Upload</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                    {resume ? (
                      <FileText className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                    <Input
                      id="resume"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleFileUpload}
                      disabled={isUploading || isAnalyzing}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      disabled={isUploading || isAnalyzing}
                      onClick={() => {
                        document.getElementById("resume")?.click()
                      }}
                    >
                      {isUploading || isAnalyzing
                        ? "Processing..."
                        : resume
                        ? "Change Resume"
                        : "Select Resume"}
                    </Button>
                    {resume && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{fileName}</p>
                        <Button type="button" variant="ghost" size="sm" onClick={handlePreview}>
                          <Eye className="w-4 h-4 mr-2" />
                          Preview
                        </Button>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {isAnalyzing
                        ? "Analyzing resume..."
                        : resume
                        ? "Resume uploaded successfully"
                        : "Upload your resume (PDF only)"}
                    </p>
                  </div>
                </div>

                {/* Cover Letter Upload */}
                <div className="grid gap-2">
                  <Label htmlFor="coverLetter">Cover Letter Upload (Optional)</Label>
                  <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed rounded-lg">
                    {coverLetter ? (
                      <FileText className="w-8 h-8 text-primary" />
                    ) : (
                      <Upload className="w-8 h-8 text-muted-foreground" />
                    )}
                    <Input
                      id="coverLetter"
                      type="file"
                      accept=".pdf"
                      className="hidden"
                      onChange={handleCoverLetterUpload}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        document.getElementById("coverLetter")?.click()
                      }}
                    >
                      {coverLetter ? "Change Cover Letter" : "Select Cover Letter"}
                    </Button>
                    {coverLetter && (
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{coverLetterFileName}</p>
                      </div>
                    )}
                    <p className="text-sm text-muted-foreground">
                      {coverLetter
                        ? "Cover letter uploaded successfully"
                        : "Upload your cover letter (PDF only)"}
                    </p>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={!resume || isUploading || isAnalyzing}
              >
                Submit Application
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ApplyJobPage
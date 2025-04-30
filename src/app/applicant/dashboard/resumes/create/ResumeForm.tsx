"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, FileText, Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import axios from "axios";

const ResumeForm = ({ applicantId }: { applicantId: string }) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic resume information
  const [title, setTitle] = useState("My Resume");
  const [address, setAddress] = useState("");
  const [summary, setSummary] = useState("");
  const [isDefault, setIsDefault] = useState(false);

  // Arrays
  const [skills, setSkills] = useState<string[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // JSON arrays
  const [education, setEducation] = useState<any[]>([
    {
      institution: "",
      degree: "",
      fieldOfStudy: "",
      startDate: "",
      endDate: "",
      description: "",
    },
  ]);
  const [experience, setExperience] = useState<any[]>([
    {
      company: "",
      position: "",
      startDate: "",
      endDate: "",
      current: false,
      description: "",
    },
  ]);
  const [certifications, setCertifications] = useState<any[]>([
    { name: "", issuer: "", date: "", url: "" },
  ]);
  const [projects, setProjects] = useState<any[]>([
    { name: "", description: "", url: "", technologies: [] },
  ]);
  const [achievements, setAchievements] = useState<any[]>([
    { title: "", date: "", description: "" },
  ]);
  const [publications, setPublications] = useState<any[]>([
    { title: "", publisher: "", date: "", url: "" },
  ]);
  const [references, setReferences] = useState<any[]>([
    { name: "", position: "", company: "", email: "", phone: "" },
  ]);
  const [socialLinks, setSocialLinks] = useState<any[]>([
    { platform: "", url: "" },
  ]);

  // Helper functions for array manipulation
  const addSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill("");
    }
  };

  const removeSkill = (index: number) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const addLanguage = () => {
    if (newLanguage.trim() && !languages.includes(newLanguage.trim())) {
      setLanguages([...languages, newLanguage.trim()]);
      setNewLanguage("");
    }
  };

  const removeLanguage = (index: number) => {
    setLanguages(languages.filter((_, i) => i !== index));
  };

  // Helper functions for JSON array manipulation
  const handleEducationChange = (index: number, field: string, value: any) => {
    const newEducation = [...education];
    newEducation[index][field] = value;
    setEducation(newEducation);
  };

  const addEducation = () => {
    setEducation([
      ...education,
      {
        institution: "",
        degree: "",
        fieldOfStudy: "",
        startDate: "",
        endDate: "",
        description: "",
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const handleExperienceChange = (index: number, field: string, value: any) => {
    const newExperience = [...experience];
    newExperience[index][field] = value;
    setExperience(newExperience);
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      {
        company: "",
        position: "",
        startDate: "",
        endDate: "",
        current: false,
        description: "",
      },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const handleCertificationChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newCertifications = [...certifications];
    newCertifications[index][field] = value;
    setCertifications(newCertifications);
  };

  const addCertification = () => {
    setCertifications([
      ...certifications,
      { name: "", issuer: "", date: "", url: "" },
    ]);
  };

  const removeCertification = (index: number) => {
    setCertifications(certifications.filter((_, i) => i !== index));
  };

  const handleProjectChange = (index: number, field: string, value: any) => {
    const newProjects = [...projects];
    newProjects[index][field] = value;
    setProjects(newProjects);
  };

  const addProject = () => {
    setProjects([
      ...projects,
      { name: "", description: "", url: "", technologies: [] },
    ]);
  };

  const removeProject = (index: number) => {
    setProjects(projects.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.post("/api/applicant/resumes", {
        applicantId,
        title,
        address,
        summary,
        education,
        experience,
        skills,
        languages,
        certifications,
        projects,
        achievements,
        publications,
        references,
        socialLinks,
        isDefault,
      });

      if (response.status === 201) {
        toast.success("Resume created successfully!");
        router.push("/applicant/dashboard/resumes");
      } else {
        toast.error("Failed to create resume");
      }
    } catch (error) {
      toast.error("An error occurred while creating the resume");
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 p-6 md:p-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/applicant/dashboard/resumes">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold">Create New Resume</h1>
        </div>
        <FileText className="h-6 w-6 text-muted-foreground" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Enter the basic details for your resume
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Resume Title</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Software Developer Resume"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Your address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="summary">Professional Summary</Label>
                <Textarea
                  id="summary"
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Write a brief summary of your professional background and goals"
                  rows={4}
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isDefault"
                  checked={isDefault}
                  onChange={(e) => setIsDefault(e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="isDefault">Set as default resume</Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Skills Section */}
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Skills & Languages</CardTitle>
            <CardDescription>
              Add your professional skills and languages you speak
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            <div className="space-y-4">
              <Label>Skills</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {skills.map((skill, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-muted rounded-full px-3 py-1"
                  >
                    <span>{skill}</span>
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  placeholder="Add a skill"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addSkill())
                  }
                />
                <Button type="button" onClick={addSkill} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Separator />

            <div className="space-y-4">
              <Label>Languages</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {languages.map((language, index) => (
                  <div
                    key={index}
                    className="flex items-center bg-muted rounded-full px-3 py-1"
                  >
                    <span>{language}</span>
                    <button
                      type="button"
                      onClick={() => removeLanguage(index)}
                      className="ml-2 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={newLanguage}
                  onChange={(e) => setNewLanguage(e.target.value)}
                  placeholder="Add a language"
                  onKeyPress={(e) =>
                    e.key === "Enter" && (e.preventDefault(), addLanguage())
                  }
                />
                <Button type="button" onClick={addLanguage} size="sm">
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Section */}
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Education</CardTitle>
            <CardDescription>Add your educational background</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {education.map((edu, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border rounded-md relative"
              >
                <button
                  type="button"
                  onClick={() => removeEducation(index)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Institution</Label>
                    <Input
                      value={edu.institution}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      placeholder="University/School name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Degree</Label>
                    <Input
                      value={edu.degree}
                      onChange={(e) =>
                        handleEducationChange(index, "degree", e.target.value)
                      }
                      placeholder="e.g., Bachelor's, Master's"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Field of Study</Label>
                  <Input
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "fieldOfStudy",
                        e.target.value
                      )
                    }
                    placeholder="e.g., Computer Science"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={edu.startDate}
                      onChange={(e) =>
                        handleEducationChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={edu.endDate}
                      onChange={(e) =>
                        handleEducationChange(index, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={edu.description}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Describe your studies, achievements, etc."
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addEducation}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Education
            </Button>
          </CardContent>
        </Card>

        {/* Work Experience Section */}
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Work Experience</CardTitle>
            <CardDescription>Add your professional experience</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {experience.map((exp, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border rounded-md relative"
              >
                <button
                  type="button"
                  onClick={() => removeExperience(index)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company</Label>
                    <Input
                      value={exp.company}
                      onChange={(e) =>
                        handleExperienceChange(index, "company", e.target.value)
                      }
                      placeholder="Company name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Position</Label>
                    <Input
                      value={exp.position}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "position",
                          e.target.value
                        )
                      }
                      placeholder="Your job title"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input
                      type="date"
                      value={exp.startDate}
                      onChange={(e) =>
                        handleExperienceChange(
                          index,
                          "startDate",
                          e.target.value
                        )
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input
                      type="date"
                      value={exp.endDate}
                      onChange={(e) =>
                        handleExperienceChange(index, "endDate", e.target.value)
                      }
                      disabled={exp.current}
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id={`current-${index}`}
                    checked={exp.current}
                    onChange={(e) =>
                      handleExperienceChange(index, "current", e.target.checked)
                    }
                    className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                  />
                  <Label htmlFor={`current-${index}`}>
                    I currently work here
                  </Label>
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={exp.description}
                    onChange={(e) =>
                      handleExperienceChange(
                        index,
                        "description",
                        e.target.value
                      )
                    }
                    placeholder="Describe your responsibilities and achievements"
                    rows={3}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addExperience}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Experience
            </Button>
          </CardContent>
        </Card>

        {/* Certifications Section */}
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Certifications</CardTitle>
            <CardDescription>
              Add your professional certifications
            </CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {certifications.map((cert, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border rounded-md relative"
              >
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Certification Name</Label>
                    <Input
                      value={cert.name}
                      onChange={(e) =>
                        handleCertificationChange(index, "name", e.target.value)
                      }
                      placeholder="e.g., AWS Certified Solutions Architect"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Issuing Organization</Label>
                    <Input
                      value={cert.issuer}
                      onChange={(e) =>
                        handleCertificationChange(
                          index,
                          "issuer",
                          e.target.value
                        )
                      }
                      placeholder="e.g., Amazon Web Services"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Issue Date</Label>
                    <Input
                      type="date"
                      value={cert.date}
                      onChange={(e) =>
                        handleCertificationChange(index, "date", e.target.value)
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label>Credential URL</Label>
                    <Input
                      type="url"
                      value={cert.url}
                      onChange={(e) =>
                        handleCertificationChange(index, "url", e.target.value)
                      }
                      placeholder="Link to your credential"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addCertification}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Certification
            </Button>
          </CardContent>
        </Card>

        {/* Projects Section */}
        <Card className="bg-background shadow-md border-muted">
          <CardHeader className="border-b bg-muted/10 p-6">
            <CardTitle>Projects</CardTitle>
            <CardDescription>Add your notable projects</CardDescription>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {projects.map((project, index) => (
              <div
                key={index}
                className="space-y-4 p-4 border rounded-md relative"
              >
                <button
                  type="button"
                  onClick={() => removeProject(index)}
                  className="absolute top-2 right-2 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                <div className="space-y-2">
                  <Label>Project Name</Label>
                  <Input
                    value={project.name}
                    onChange={(e) =>
                      handleProjectChange(index, "name", e.target.value)
                    }
                    placeholder="e.g., E-commerce Website"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={project.description}
                    onChange={(e) =>
                      handleProjectChange(index, "description", e.target.value)
                    }
                    placeholder="Describe the project, your role, and outcomes"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Project URL</Label>
                  <Input
                    type="url"
                    value={project.url}
                    onChange={(e) =>
                      handleProjectChange(index, "url", e.target.value)
                    }
                    placeholder="Link to your project"
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={addProject}
              className="w-full mt-4"
            >
              <Plus className="h-4 w-4 mr-2" /> Add Project
            </Button>
          </CardContent>
        </Card>

        <div className="flex justify-end space-x-4 pt-4">
          <Button variant="outline" asChild>
            <Link href="/applicant/dashboard/resumes">Cancel</Link>
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Creating..." : "Create Resume"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ResumeForm;

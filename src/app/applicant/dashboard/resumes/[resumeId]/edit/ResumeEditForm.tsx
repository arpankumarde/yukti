"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import axios from "axios";
import { Resume } from "@/generated/prisma";

interface ResumeEditFormProps {
  resume: Resume;
  applicantId: string;
}

const ResumeEditForm = ({ resume, applicantId }: ResumeEditFormProps) => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Basic resume information
  const [title, setTitle] = useState(resume.title);
  const [address, setAddress] = useState(resume.address || "");
  const [summary, setSummary] = useState(resume.summary || "");
  const [isDefault, setIsDefault] = useState(resume.isDefault);

  // Arrays
  const [skills, setSkills] = useState<string[]>(resume.skills);
  const [languages, setLanguages] = useState<string[]>(resume.languages);
  const [newSkill, setNewSkill] = useState("");
  const [newLanguage, setNewLanguage] = useState("");

  // JSON arrays
  const [education, setEducation] = useState<any[]>(resume.education);
  const [experience, setExperience] = useState<any[]>(resume.experience);
  const [certifications, setCertifications] = useState<any[]>(
    resume.certifications
  );
  const [projects, setProjects] = useState<any[]>(resume.projects);
  const [achievements, setAchievements] = useState<any[]>(resume.achievements);
  const [publications, setPublications] = useState<any[]>(resume.publications);
  const [references, setReferences] = useState<any[]>(resume.references);
  const [socialLinks, setSocialLinks] = useState<any[]>(resume.socialLinks);

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

  const handleAchievementChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newAchievements = [...achievements];
    newAchievements[index][field] = value;
    setAchievements(newAchievements);
  };

  const addAchievement = () => {
    setAchievements([
      ...achievements,
      { title: "", date: "", description: "" },
    ]);
  };

  const removeAchievement = (index: number) => {
    setAchievements(achievements.filter((_, i) => i !== index));
  };

  const handlePublicationChange = (
    index: number,
    field: string,
    value: any
  ) => {
    const newPublications = [...publications];
    newPublications[index][field] = value;
    setPublications(newPublications);
  };

  const addPublication = () => {
    setPublications([
      ...publications,
      { title: "", publisher: "", date: "", url: "" },
    ]);
  };

  const removePublication = (index: number) => {
    setPublications(publications.filter((_, i) => i !== index));
  };

  const handleReferenceChange = (index: number, field: string, value: any) => {
    const newReferences = [...references];
    newReferences[index][field] = value;
    setReferences(newReferences);
  };

  const addReference = () => {
    setReferences([
      ...references,
      { name: "", position: "", company: "", email: "", phone: "" },
    ]);
  };

  const removeReference = (index: number) => {
    setReferences(references.filter((_, i) => i !== index));
  };

  const handleSocialLinkChange = (index: number, field: string, value: any) => {
    const newSocialLinks = [...socialLinks];
    newSocialLinks[index][field] = value;
    setSocialLinks(newSocialLinks);
  };

  const addSocialLink = () => {
    setSocialLinks([...socialLinks, { platform: "", url: "" }]);
  };

  const removeSocialLink = (index: number) => {
    setSocialLinks(socialLinks.filter((_, i) => i !== index));
  };

  // Form submission handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await axios.put(
        `/api/applicant/resumes/${resume.resumeId}`,
        {
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
        }
      );

      toast.success("Resume updated successfully!");
      router.push(`/applicant/dashboard/resumes/${resume.resumeId}`);
      router.refresh();
    } catch (error) {
      console.error("Error updating resume:", error);
      toast.error("Failed to update resume. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Basic Information */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Basic Information</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="title">Resume Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="summary">Professional Summary</Label>
          <Textarea
            id="summary"
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Checkbox
            id="isDefault"
            checked={isDefault}
            onCheckedChange={(checked) => setIsDefault(checked as boolean)}
          />
          <Label htmlFor="isDefault">Set as default resume</Label>
        </div>
      </div>

      <Separator />

      {/* Skills Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {skills.map((skill, index) => (
            <div
              key={index}
              className="bg-muted flex items-center gap-2 px-3 py-1 rounded-full"
            >
              <span>{skill}</span>
              <button
                type="button"
                onClick={() => removeSkill(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a skill"
            value={newSkill}
            onChange={(e) => setNewSkill(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addSkill())
            }
          />
          <Button type="button" onClick={addSkill} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Languages Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Languages</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          {languages.map((language, index) => (
            <div
              key={index}
              className="bg-muted flex items-center gap-2 px-3 py-1 rounded-full"
            >
              <span>{language}</span>
              <button
                type="button"
                onClick={() => removeLanguage(index)}
                className="text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add a language"
            value={newLanguage}
            onChange={(e) => setNewLanguage(e.target.value)}
            onKeyDown={(e) =>
              e.key === "Enter" && (e.preventDefault(), addLanguage())
            }
          />
          <Button type="button" onClick={addLanguage} size="sm">
            <Plus className="h-4 w-4 mr-1" /> Add
          </Button>
        </div>
      </div>

      <Separator />

      {/* Education Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Education</h2>
        {education.map((edu, index) => (
          <Card key={index} className="bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {edu.institution || "New Education Entry"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeEducation(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-institution-${index}`}>
                    Institution
                  </Label>
                  <Input
                    id={`edu-institution-${index}`}
                    value={edu.institution}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "institution",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`edu-degree-${index}`}>Degree</Label>
                  <Input
                    id={`edu-degree-${index}`}
                    value={edu.degree}
                    onChange={(e) =>
                      handleEducationChange(index, "degree", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`edu-field-${index}`}>Field of Study</Label>
                  <Input
                    id={`edu-field-${index}`}
                    value={edu.fieldOfStudy}
                    onChange={(e) =>
                      handleEducationChange(
                        index,
                        "fieldOfStudy",
                        e.target.value
                      )
                    }
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="space-y-2">
                    <Label htmlFor={`edu-start-${index}`}>Start Date</Label>
                    <Input
                      id={`edu-start-${index}`}
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
                    <Label htmlFor={`edu-end-${index}`}>End Date</Label>
                    <Input
                      id={`edu-end-${index}`}
                      value={edu.endDate}
                      onChange={(e) =>
                        handleEducationChange(index, "endDate", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`edu-description-${index}`}>Description</Label>
                <Textarea
                  id={`edu-description-${index}`}
                  value={edu.description}
                  onChange={(e) =>
                    handleEducationChange(index, "description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addEducation}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Education
        </Button>
      </div>

      <Separator />

      {/* Experience Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Experience</h2>
        {experience.map((exp, index) => (
          <Card key={index} className="bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {exp.position || "New Experience Entry"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeExperience(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-company-${index}`}>Company</Label>
                  <Input
                    id={`exp-company-${index}`}
                    value={exp.company}
                    onChange={(e) =>
                      handleExperienceChange(index, "company", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-position-${index}`}>Position</Label>
                  <Input
                    id={`exp-position-${index}`}
                    value={exp.position}
                    onChange={(e) =>
                      handleExperienceChange(index, "position", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`exp-start-${index}`}>Start Date</Label>
                  <Input
                    id={`exp-start-${index}`}
                    value={exp.startDate}
                    onChange={(e) =>
                      handleExperienceChange(index, "startDate", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`exp-end-${index}`}>End Date</Label>
                  <Input
                    id={`exp-end-${index}`}
                    value={exp.endDate}
                    onChange={(e) =>
                      handleExperienceChange(index, "endDate", e.target.value)
                    }
                    disabled={exp.current}
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id={`exp-current-${index}`}
                  checked={exp.current}
                  onCheckedChange={(checked) =>
                    handleExperienceChange(index, "current", checked as boolean)
                  }
                />
                <Label htmlFor={`exp-current-${index}`}>Current Position</Label>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`exp-description-${index}`}>Description</Label>
                <Textarea
                  id={`exp-description-${index}`}
                  value={exp.description}
                  onChange={(e) =>
                    handleExperienceChange(index, "description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addExperience}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Experience
        </Button>
      </div>

      <Separator />

      {/* Certifications Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Certifications</h2>
        {certifications.map((cert, index) => (
          <Card key={index} className="bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {cert.name || "New Certification Entry"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-name-${index}`}>
                    Certification Name
                  </Label>
                  <Input
                    id={`cert-name-${index}`}
                    value={cert.name}
                    onChange={(e) =>
                      handleCertificationChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-issuer-${index}`}>Issuer</Label>
                  <Input
                    id={`cert-issuer-${index}`}
                    value={cert.issuer}
                    onChange={(e) =>
                      handleCertificationChange(index, "issuer", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`cert-date-${index}`}>Date</Label>
                  <Input
                    id={`cert-date-${index}`}
                    value={cert.date}
                    onChange={(e) =>
                      handleCertificationChange(index, "date", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`cert-url-${index}`}>URL</Label>
                  <Input
                    id={`cert-url-${index}`}
                    value={cert.url}
                    onChange={(e) =>
                      handleCertificationChange(index, "url", e.target.value)
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addCertification}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Certification
        </Button>
      </div>

      <Separator />

      {/* Projects Section */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Projects</h2>
        {projects.map((project, index) => (
          <Card key={index} className="bg-muted/20">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg">
                  {project.name || "New Project Entry"}
                </CardTitle>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeProject(index)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor={`project-name-${index}`}>Project Name</Label>
                  <Input
                    id={`project-name-${index}`}
                    value={project.name}
                    onChange={(e) =>
                      handleProjectChange(index, "name", e.target.value)
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor={`project-url-${index}`}>URL</Label>
                  <Input
                    id={`project-url-${index}`}
                    value={project.url}
                    onChange={(e) =>
                      handleProjectChange(index, "url", e.target.value)
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor={`project-description-${index}`}>
                  Description
                </Label>
                <Textarea
                  id={`project-description-${index}`}
                  value={project.description}
                  onChange={(e) =>
                    handleProjectChange(index, "description", e.target.value)
                  }
                />
              </div>
            </CardContent>
          </Card>
        ))}
        <Button
          type="button"
          variant="outline"
          onClick={addProject}
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Project
        </Button>
      </div>

      <div className="flex justify-end space-x-4 pt-6">
        <Button variant="outline" type="button" asChild>
          <Link href={`/applicant/dashboard/resumes/${resume.resumeId}`}>
            Cancel
          </Link>
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </form>
  );
};

export default ResumeEditForm;

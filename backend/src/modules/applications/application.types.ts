export interface CreateApplicationDto {
  fullName: string;
  email: string;
  phoneNumber: string;
  position: string;
  yearsOfExperience: string;
  portfolioUrl?: string;
  linkedInProfile?: string;
  githubProfile?: string;
  resumeUrl: string;
  coverLetter?: string;
}
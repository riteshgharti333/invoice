import { z } from "zod";

export const createApplicationSchema = z.object({
  body: z.object({
    fullName: z.string().min(2, "Full name must be at least 2 characters").max(100),
    email: z.string().email("Invalid email address").toLowerCase(),
    phoneNumber: z.string().min(10, "Invalid phone number").max(15),
    position: z.string().min(1, "Position is required"),
    yearsOfExperience: z.string().min(1, "Years of experience is required"),
    portfolioUrl: z.string().optional().nullable(),
    linkedInProfile: z.string().optional().nullable(),
    githubProfile: z.string().optional().nullable(),
    coverLetter: z.string().optional().nullable(),
    resumeUrl: z.string().min(1, "Resume URL is required"),
  }),
});
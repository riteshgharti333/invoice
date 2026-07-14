// import multer from "multer";
// import { v2 as cloudinary } from "cloudinary";
// import { CloudinaryStorage } from "multer-storage-cloudinary";
// import { env } from "../../config/env";

// cloudinary.config({
//   cloud_name: env.CLOUDINARY_CLOUD_NAME,
//   api_key: env.CLOUDINARY_API_KEY,
//   api_secret: env.CLOUDINARY_API_SECRET,
// });

// const storage = new CloudinaryStorage({
//   cloudinary: cloudinary,
//   params: async (_req, file) => {
//     const allowedFormats = ["pdf", "doc", "docx"];
//     const ext = file.originalname.split(".").pop()?.toLowerCase();

//     if (!allowedFormats.includes(ext || "")) {
//       throw new Error("Only PDF, DOC, or DOCX files are allowed");
//     }

//     return {
//       folder: "resumes",
//       format: ext === "pdf" ? "pdf" : "auto",
//       resource_type: "auto",
//       public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
//     };
//   },
// });

// const fileFilter = (_req: any, file: any, cb: any) => {
//   const allowedTypes = [
//     "application/pdf",
//     "application/msword",
//     "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
//   ];

//   if (allowedTypes.includes(file.mimetype)) {
//     cb(null, true);
//   } else {
//     cb(new Error("Only PDF, DOC, or DOCX files are allowed"), false);
//   }
// };

// export const upload = multer({
//   storage,
//   fileFilter,
//   limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
// });

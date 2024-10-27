import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: () => {
    return {
      folder: "PlateMate_Recipes",
      allowedFormats: ["jpeg", "png", "jpg"],
      transformation: [{ width: 1000, crop: "auto" }],
    };
  },
});

export { storage, cloudinary };

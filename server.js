// server.js
import express from "express";
import cors from "cors";
import dotenv from "dotenv";


dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

// Configure Cloudinary
import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.CLOUD_API_KEY,
  api_secret: process.env.CLOUD_API_SECRET,
});


// GET /getImages?zone=Zone1&supervisor=Nandhu&category=Attendence&ward=3&date=2025-08-20
app.get("/getImages", async (req, res) => {
  const { zone, supervisor, category, ward, date } = req.query;

  if (!zone || !supervisor || !category || !ward || !date) {
    return res.status(400).json({ error: "Missing query parameters" });
  }

  try {
    const folderPath = `Zones/${zone}/${supervisor}/${category}/${ward}/${date}`;

    const result = await cloudinary.v2.search
      .expression(`folder:${folderPath}`)
      .sort_by("public_id", "asc")
      .max_results(100)
      .execute();

    const images = result.resources.map(img => ({
      url: img.secure_url,
      name: img.public_id.split("/").pop(),
    }));

    res.json(images);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch images" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

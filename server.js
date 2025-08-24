import express from "express";
import cors from "cors";
import { v2 as cloudinary } from "cloudinary";

// 🔹 Setup
const app = express();
app.use(cors());
app.use(express.json());

// 🔹 Cloudinary Config (use your credentials or env vars)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Helper: List resources under a prefix
async function listResources(prefix) {
  const res = await cloudinary.search
    .expression(`folder:${prefix}`)
    .max_results(500)
    .execute();

  return res.resources.map(r => r.public_id);
}

// 🔹 API Routes

// 1. Get all Zones
app.get("/api/zones", async (req, res) => {
  try {
    const zones = await listResources("Zones");
    // Extract Zone names (Zones/Zone1/... → Zone1)
    const uniqueZones = [...new Set(zones.map(p => p.split("/")[1]))];
    res.json(uniqueZones);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. Get Supervisors in a Zone
app.get("/api/zones/:zone", async (req, res) => {
  try {
    const { zone } = req.params;
    const paths = await listResources(`Zones/${zone}`);
    const supervisors = [...new Set(paths.map(p => p.split("/")[2]))];
    res.json(supervisors);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. Get Categories
app.get("/api/zones/:zone/:supervisor", async (req, res) => {
  try {
    const { zone, supervisor } = req.params;
    const paths = await listResources(`Zones/${zone}/${supervisor}`);
    const categories = [...new Set(paths.map(p => p.split("/")[3]))];
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. Get Wards
app.get("/api/zones/:zone/:supervisor/:category", async (req, res) => {
  try {
    const { zone, supervisor, category } = req.params;
    const paths = await listResources(`Zones/${zone}/${supervisor}/${category}`);
    const wards = [...new Set(paths.map(p => p.split("/")[4]))];
    res.json(wards);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 5. Get Dates
app.get("/api/zones/:zone/:supervisor/:category/:ward", async (req, res) => {
  try {
    const { zone, supervisor, category, ward } = req.params;
    const paths = await listResources(`Zones/${zone}/${supervisor}/${category}/${ward}`);
    const dates = [...new Set(paths.map(p => p.split("/")[5]))];
    res.json(dates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 6. Get Images for Date
app.get("/api/zones/:zone/:supervisor/:category/:ward/:date", async (req, res) => {
  try {
    const { zone, supervisor, category, ward, date } = req.params;
    const prefix = `Zones/${zone}/${supervisor}/${category}/${ward}/${date}`;
    const resData = await cloudinary.search.expression(`folder:${prefix}`).execute();

    const images = resData.resources.map(img => ({
      url: img.secure_url,
      filename: img.public_id.split("/").pop()
    }));

    res.json(images);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start server
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));

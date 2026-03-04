const fs = require("fs");
const path = require("path");

const CMS_PATH = path.join(__dirname, "../config/cms.json");

function ensureCmsFile() {
  try {
    if (!fs.existsSync(CMS_PATH)) {
      const seed = { updatedAt: new Date().toISOString(), data: {} };
      fs.mkdirSync(path.dirname(CMS_PATH), { recursive: true });
      fs.writeFileSync(CMS_PATH, JSON.stringify(seed, null, 2), "utf-8");
    }
  } catch (_) {}
}

ensureCmsFile();

exports.getCms = (req, res) => {
  try {
    ensureCmsFile();
    const raw = fs.readFileSync(CMS_PATH, "utf-8");
    const json = JSON.parse(raw || "{}");
    return res.status(200).json({ success: true, cms: json });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to read CMS", error: error.message });
  }
};

exports.updateCms = (req, res) => {
  try {
    const incoming = req.body && typeof req.body === "object" ? req.body : {};
    const next = { updatedAt: new Date().toISOString(), data: incoming.data ?? incoming };
    fs.writeFileSync(CMS_PATH, JSON.stringify(next, null, 2), "utf-8");
    return res.status(200).json({ success: true, cms: next });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Failed to update CMS", error: error.message });
  }
};



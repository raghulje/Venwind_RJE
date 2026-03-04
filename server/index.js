require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const morgan = require("morgan");
const path = require("path");
const cors = require("cors");
const { sequelize } = require("./models");
const history = require("connect-history-api-fallback");
const status = require("./helpers/response");
const session = require("express-session");
const passport = require("passport");
const { Strategy } = require("passport-openidconnect");

const app = express();

// CORS must be applied before any other middleware
// More permissive CORS for development
app.use((req, res, next) => {
  // Log all incoming requests for debugging
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url} from origin: ${req.headers.origin || 'no-origin'}`);
  
  // Set CORS headers for all requests
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept, Origin, Cache-Control, Pragma');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.header('Access-Control-Max-Age', '86400'); // 24 hours
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    console.log('Handling preflight request for:', req.url);
    return res.status(200).end();
  }
  
  next();
});

// Additional CORS middleware as backup
app.use(cors({
  origin: true, // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept', 'Origin', 'Cache-Control', 'Pragma'],
  optionsSuccessStatus: 200
}));

// Middleware to parse incoming JSON data ==================================
app.use(express.json({  }));
app.use(bodyParser.urlencoded({ limit: "100mb", extended: true }));







// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/users", require("./routes/users"));
app.use("/cms", require("./routes/cms"));
app.use("/api/cms/home", require("./routes/home_cms"));
app.use("/api/cms/about", require("./routes/about_cms"));
app.use("/api/cms/capabilities", require("./routes/capabilities_cms"));
app.use("/api/cms/sustainability", require("./routes/sustainability_cms"));
app.use("/api/cms/products", require("./routes/products_cms"));
app.use("/api/admin/cms", require("./routes/admin_cms"));
app.use("/api/admin/users", require("./routes/cms_users"));
app.use("/api", require("./routes/contact"));
app.use("/api", require("./routes/careers"));



// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running well",
    timestamp: new Date().toISOString()
  });
});

// CORS test endpoint
app.get("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "CORS is working!",
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// Test POST endpoint for CORS
app.post("/api/cors-test", (req, res) => {
  res.json({
    success: true,
    message: "POST CORS is working!",
    body: req.body,
    origin: req.headers.origin,
    timestamp: new Date().toISOString()
  });
});

// // simple route
// app.get("/", (req, res) => {
//   return res.json({
//     success: true,
//     message: "Backend is running well",
//   });
// });

// app.use("/auth", require("./src/routes/auth"));

// app.use(
//   "/api",
//   require("./src/routes/user"),
//   require("./src/routes/dashboard"),
//   require("./src/routes/sales_management/customer"),
//   require("./src/routes/sales_management/lead"),
//   require("./src/routes/sales_management/quotation"),
//   require("./src/routes/sales_management/nsop_quotation"),
//   require("./src/routes/sales_management/proforma_invoice"),
//   require("./src/routes/sales_management/brief_sheet"),
//   require("./src/routes/trip_management/masters/operator"),
//   require("./src/routes/trip_management/masters/airport"),
//   require("./src/routes/trip_management/masters/aircraft"),
//   require("./src/routes/trip_management/masters/aircraft_model"),
//   require("./src/routes/trip_management/masters/country"),
//   require("./src/routes/trip_management/masters/city"),
//     require("./src/routes/trip_management/masters/zone"),
//   require("./src/routes/trip_management/masters/designation"),
//   require("./src/routes/trip_management/masters/crew"),
//   require("./src/routes/sales_management/quotation_download")
// );

// Image upload endpoint - MUST be before the catch-all API route
const uploadImage = require('./middlewares/uploadImage');
app.post('/api/upload/image', uploadImage.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    // Return the file path relative to the server
    const imageUrl = `/uploads/images/${req.file.filename}`;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('Image upload error:', error);
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// File upload endpoint for documents (PDF, DOC, DOCX, XLS, XLSX)
const uploadFile = require('./middlewares/uploadFile');
app.post('/api/upload/file', uploadFile.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file provided' });
    }
    
    // Return the file path relative to the server
    const fileUrl = `/uploads/documents/${req.file.filename}`;
    res.json({ 
      success: true, 
      fileUrl: fileUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({ error: 'Failed to upload file', message: error.message });
  }
});

// Video upload endpoint
const multer = require('multer');
const uploadVideo = require('./middlewares/uploadVideo');
app.post('/api/upload/video', (req, res) => {
  uploadVideo.single('video')(req, res, (err) => {
    if (err) {
      console.error('Video upload error:', err);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            success: false,
            error: 'File size too large. Maximum 100MB allowed.' 
          });
        }
        return res.status(400).json({ 
          success: false,
          error: err.message || 'File upload error' 
        });
      }
      return res.status(400).json({ 
        success: false,
        error: err.message || 'Failed to upload video' 
      });
    }
    
    try {
      if (!req.file) {
        return res.status(400).json({ 
          success: false,
          error: 'No video file provided' 
        });
      }
      
      // Return the file path relative to the server
      const videoUrl = `/uploads/videos/${req.file.filename}`;
      res.json({ 
        success: true, 
        videoUrl: videoUrl,
        fileUrl: videoUrl, // Also provide fileUrl for compatibility
        filename: req.file.filename 
      });
    } catch (error) {
      console.error('Video upload processing error:', error);
      res.status(500).json({ 
        success: false,
        error: 'Failed to upload video', 
        message: error.message 
      });
    }
  });
});

// Delete uploaded file endpoint
app.delete('/api/upload/:category/:filename', (req, res) => {
  try {
    let { category, filename } = req.params;
    
    console.log('Delete request received:', { category, filename, rawParams: req.params });
    
    // Validate category
    const allowedCategories = ['images', 'documents', 'resumes', 'photos'];
    if (!allowedCategories.includes(category)) {
      console.error('Invalid category:', category);
      return res.status(400).json({ success: false, error: 'Invalid category' });
    }

    // Decode the filename in case it's URL encoded (Express automatically decodes, but handle edge cases)
    let decodedFilename = filename;
    try {
      // Try decoding in case of double encoding
      decodedFilename = decodeURIComponent(filename);
      // Try one more time for triple encoding
      decodedFilename = decodeURIComponent(decodedFilename);
    } catch (e) {
      // If decoding fails, use original
      decodedFilename = filename;
    }
    
    // Remove any path components that might have been included
    decodedFilename = decodedFilename.split('/').pop() || decodedFilename;
    
    const filePath = path.join(__dirname, 'uploads', category, decodedFilename);
    
    console.log('Looking for file at:', filePath);
    console.log('Decoded filename:', decodedFilename);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      // List files in directory for debugging
      const uploadsDir = path.join(__dirname, 'uploads', category);
      if (fs.existsSync(uploadsDir)) {
        const files = fs.readdirSync(uploadsDir);
        console.log('Files in directory:', files);
        console.log('Looking for:', decodedFilename);
        // Try case-insensitive match
        const foundFile = files.find(f => f.toLowerCase() === decodedFilename.toLowerCase());
        if (foundFile) {
          console.log('Found file with different case:', foundFile);
          const correctPath = path.join(uploadsDir, foundFile);
          fs.unlinkSync(correctPath);
          return res.json({ success: true, message: 'File deleted successfully', correctedFilename: foundFile });
        }
      }
      console.error('File not found at:', filePath);
      return res.status(404).json({ success: false, error: 'File not found', path: filePath, filename: decodedFilename });
    }

    // Delete the file
    fs.unlinkSync(filePath);
    console.log('File deleted successfully:', filePath);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('File delete error:', error);
    res.status(500).json({ success: false, error: 'Failed to delete file', message: error.message });
  }
});

// Serve uploaded images
// const wpContentPath = path.join(__dirname, "./wp-content");
// app.use(express.static(wpContentPath));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/wp-content', express.static(path.join(__dirname, 'wp-content')));


app.all("/api/*", (req, res) => {
  return status.responseStatus(res, 404, "Endpoint Not Found");
});

// Serve static files from the 'client/dist' directory
const clientPath = path.join(__dirname, "../client/out");
app.use(express.static(clientPath));

app.use(history());
// Handle client-side routing - serve index.html for all non-API routes
app.get("*", (_req, res) => {
  res.sendFile(path.join(clientPath, "index.html"));
});

// set port
const PORT = process.env.APP_PORT || 8080;

// Use sync without alter to avoid MySQL key limit issues
// The username unique constraint should already exist from previous migrations
sequelize
  .sync()
  .then(() => {
    console.log("Database synced successfully");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
    });
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
    // Still start the server even if sync fails (for existing databases)
    console.log("Starting server anyway...");
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}.`);
      console.log("Note: If you need schema changes, consider using migrations instead of sync({ alter: true })");
    });
  });
  
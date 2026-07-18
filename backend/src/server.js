require("dotenv").config();

const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const authRoutes = require("./routes/auth.routes");

const managementRoutes = require("./routes/management.routes");
const setupRoutes = require("./routes/setup.routes");
const academicRoutes = require("./routes/academic.routes");

const app = express();

app.use(
  cors({
    origin: process.env.FRONTEND_URL, // e.g. http://localhost:3000
    credentials: true, // required so the refresh-token cookie is sent/received
  })
);
app.use(express.json());
app.use(cookieParser());

app.use("/api/auth", authRoutes);
app.use("/api", managementRoutes);
app.use("/api/setup", setupRoutes);
app.use("/api", academicRoutes);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

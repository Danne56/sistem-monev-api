const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./src/routes/authRoutes');
const kategoriRoutes = require('./src/routes/kategoriRoutes');
require('dotenv').config();

const app = express();
app.use(bodyParser.json());

// Middleware debug untuk menampilkan metode dan URL request
app.use((req, res, next) => {
    console.log(req.method, req.url);  // Menampilkan metode dan URL dari request
    next();  // Melanjutkan ke middleware selanjutnya
});

// Routes
app.use("/authentication", authRoutes);
app.use("/api", kategoriRoutes);

app.use((req, res, next) => {
    res.status(404).json({
        status: "fail",
        message: "Route not found",
    });
    next();
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        status: "error",
        message: "Internal server error",
    });
    next();
});

const PORT = process.env.PORT || 5000;

process.on("uncaughtException", (err) => {
    console.error("There was an uncaught error", err);
    process.exit(1); // Keluar dengan status error
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
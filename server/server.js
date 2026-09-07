const express = require("express");
const cors = require("cors");
const serverRoutes = require("./routes/serverRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const syntheticTransactionRoutes = require("./routes/syntheticTransactions");
require("dotenv").config();
console.log(process.env.MONGO_URI);

const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const monitorRoutes = require("./routes/monitorRoutes");
const cron = require("node-cron")
const { checkAllMonitors, checkOfflineServers } = require("./services/monitorChecker");
const { checkAllTransactions } = require("./services/transactionChecker");
const logRoutes = require("./routes/logRoutes");
const maintenanceRoutes = require("./routes/maintenanceRoutes");
const teamRoutes = require("./routes/teamRoutes");

const app = express();

const allowedOrigins = [
    "http://localhost:5173",       // local dev (Vite)
    "http://localhost:3000",       // local dev (Create React App, just in case)
    "https://moniterx.vercel.app", // deployed frontend
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/monitors", monitorRoutes);
app.use(
    "/api/synthetic-transactions",
    syntheticTransactionRoutes);
app.use("/api/transactions", transactionRoutes);
app.use("/api/servers", serverRoutes);
app.use("/api/logs", logRoutes);
app.use("/api/maintenance", maintenanceRoutes);
app.use("/api/teams", teamRoutes);

app.get("/", (req, res) => {
    res.send("🚀 Welcome to Monitor X Backend!");
});
connectDB();


const PORT = process.env.PORT || 5000;

console.log("PORT =", PORT);

app.listen(PORT, () => {
    console.log(`✅ Server is running on http://localhost:${PORT}`);
});
// Run monitor checks every minute
// Run monitor checks every minute
cron.schedule("* * * * *", () => {
    checkAllMonitors();
    checkAllTransactions();
    checkOfflineServers();
});
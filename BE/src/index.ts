import express from "express";
import { log } from "console";
import { bootstrap } from "./app.controller";
import { devConfig } from "./config/dev.env";
import { scheduleOfferExpiry } from "./modules/admin/offer.cron";
import { connectDB } from "./DB/connection";

const app = express();

async function startServer() {
    await connectDB();

    bootstrap(app, express);

    // Start background jobs after the database is ready.
    scheduleOfferExpiry();

    const port = devConfig.PORT || 3000;
    app.listen(port, () => {
        log("application is running on port", port);
    });
}

startServer().catch((error) => {
    console.error("failed to start application", error);
    process.exit(1);
});

export default app;

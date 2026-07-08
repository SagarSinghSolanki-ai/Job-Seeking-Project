import http from "http";
import app from "./app.js";
import { initializeSocket } from "./utils/socket.js";
import { connectRedis } from "./utils/redis.js";
import cloudinary from "cloudinary";

cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_KEY,
    api_secret: process.env.CLOUDINARY_CLIENT_SECRET
});

const server = http.createServer(app);
initializeSocket(server);

server.listen(process.env.PORT, async () => {
    console.log(`Server running on port ${process.env.PORT}`);
    await connectRedis(); // Initialize Redis client cache connection
});

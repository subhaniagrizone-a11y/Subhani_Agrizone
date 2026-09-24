const http = require("http");

process.env.NODE_ENV = "production";

const port = Number.parseInt(process.env.PORT || "3000", 10);

if (!Number.isInteger(port) || port < 1 || port > 65535) {
  console.error("Invalid PORT supplied by the hosting environment.");
  process.exit(1);
}

const next = require("next");
const app = next({
  dev: false,
  hostname: "0.0.0.0",
  port,
});
const handle = app.getRequestHandler();

app
  .prepare()
  .then(() => {
    const missingProductionVariables = [
      !process.env.MONGODB_URI && !process.env.DATABASE_URL
        ? "MONGODB_URI"
        : null,
      !process.env.AUTH_SECRET && !process.env.NEXTAUTH_SECRET
        ? "AUTH_SECRET"
        : null,
    ].filter(Boolean);

    if (missingProductionVariables.length > 0) {
      console.error(
        `Missing required production environment variables: ${missingProductionVariables.join(", ")}`,
      );
      process.exit(1);
    }

    const server = http.createServer((request, response) => {
      handle(request, response);
    });

    server.on("error", (error) => {
      console.error("Next.js production server failed:", error.message);
      process.exit(1);
    });

    server.listen(port, "0.0.0.0", () => {
      console.log(`Next.js production server running on port ${port}`);
    });
  })
  .catch((error) => {
    console.error("Failed to start Next.js production server:", error);
    process.exit(1);
  });

import Fastify from "fastify";
import cors from "@fastify/cors";
import { routes } from "./notes.routes.js";

export function buildApp() {
  const app = Fastify({ logger: true });

  app.register(cors, {
    origin: process.env.FRONTEND_ORIGIN || true,
  });

  app.get("/health", async () => {
    return { status: "ok" };
  });

  app.register(routes, { prefix: "/notes" });

  return app;
}

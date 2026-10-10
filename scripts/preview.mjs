import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const directory = fileURLToPath(new URL("../build", import.meta.url));
const prefix = "/marp-demo/";
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".pdf": "application/pdf",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webm": "video/webm",
  ".woff2": "font/woff2",
};

export function createPreviewServer() {
  return createServer(async (request, response) => {
    if (!["GET", "HEAD"].includes(request.method)) {
      response.writeHead(405, { Allow: "GET, HEAD" }).end("Method not allowed");
      return;
    }

    let pathname;
    try {
      pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    } catch (error) {
      if (!(error instanceof URIError || error instanceof TypeError)) throw error;
      response.writeHead(400).end("Invalid URL");
      return;
    }

    if (pathname === "/" || pathname === "/marp-demo") {
      response.writeHead(302, { Location: prefix }).end();
      return;
    }
    if (!pathname.startsWith(prefix) || pathname.includes("\0")) {
      response.writeHead(404).end("Not found");
      return;
    }
    const filename = resolve(directory, pathname.slice(prefix.length) || "index.html");
    if (!filename.startsWith(`${directory}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    try {
      const body = await readFile(filename);
      response.writeHead(200, {
        "Content-Type": types[extname(filename)] || "application/octet-stream",
        "Content-Length": body.length,
        "Cache-Control": "no-store",
        "X-Content-Type-Options": "nosniff",
      });
      response.end(request.method === "HEAD" ? undefined : body);
    } catch (error) {
      if (["ENOENT", "ENOTDIR", "EISDIR"].includes(error.code)) {
        response.writeHead(404).end("Not found. Run npm run build first.");
      } else {
        console.error("Preview request failed:", error);
        response.writeHead(500).end("Preview server error");
      }
    }
  });
}

if (process.argv[1] && pathToFileURL(resolve(process.argv[1])).href === import.meta.url) {
  const port = Number(process.env.PORT || 8080);
  const server = createPreviewServer();
  server.on("error", (error) => {
    console.error("Could not start preview:", error);
    process.exitCode = 1;
  });
  server.listen(port, "127.0.0.1", () => {
    console.log(`Preview: http://127.0.0.1:${server.address().port}${prefix}`);
  });
}

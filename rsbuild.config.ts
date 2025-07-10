import { defineConfig } from "@rsbuild/core";
import fs from "node:fs";

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync("certificates/server.key"),
			cert: fs.readFileSync("certificates/server.crt"),
		},
	},
	html: {
		favicon: "./src/assets/favicon.png",
		title: "Vi.js",
	},
});

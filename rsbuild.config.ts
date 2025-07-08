import { defineConfig } from "@rsbuild/core";
import fs from "node:fs";

export default defineConfig({
	server: {
		https: {
			key: fs.readFileSync(
				"/home/shyman/.local/share/certificates/localhost/server.key",
			),
			cert: fs.readFileSync(
				"/home/shyman/.local/share/certificates/localhost/server.crt",
			),
		},
	},
	html: {
		favicon: "./src/assets/favicon.png",
		title: "Vi.js",
	},
});

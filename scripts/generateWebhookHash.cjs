#!/usr/bin/env node

const crypto = require("node:crypto");

const bytesArg = Number.parseInt(process.argv[2] || "", 10);
const bytes = Number.isFinite(bytesArg) && bytesArg > 0 ? bytesArg : 32;
const hash = crypto.randomBytes(bytes).toString("hex");

console.log(hash);
console.log(`\nFLUTTERWAVE_WEBHOOK_SECRET=${hash}`);

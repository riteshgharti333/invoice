console.log("Step 1: Starting imports...");

import http from "http";
console.log("Step 2: http imported");

import app from "../src/app";
console.log("Step 3: app imported");

import { env } from "../src/config/env";
console.log("Step 4: env imported, PORT:", env.PORT);


console.log("All imports successful!");
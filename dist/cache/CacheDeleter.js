"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
let path;
function deleteAndExit() {
    if (!path)
        return;
    fs_1.rmSync(path, { recursive: true });
    process.exit(0);
}
process.on("message", (msg) => {
    if (msg[0] === 1)
        deleteAndExit();
    else if (msg[0] === 0)
        path = msg[1];
});
process.on("disconnect", () => {
    deleteAndExit();
    process.exit(0);
});

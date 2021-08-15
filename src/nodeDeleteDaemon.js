/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { rmSync } = require("fs")

let pid
let cachePath

process.on("message", (msg) => {
  if (typeof msg === "number") pid = msg
  else if (typeof msg === "string") cachePath = msg
})

setInterval(() => {
  if (pid == undefined) return

  try {
    process.kill(pid, 0)
  } catch {
    rmSync(cachePath, { recursive: true })
    process.exit()
  }
}, 2500)
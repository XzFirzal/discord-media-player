/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */
const { sync: delSync } = require("del")

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
    delSync(cachePath)
    process.exit()
  }
}, 2500)
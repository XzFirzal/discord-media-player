import { rmSync } from "fs"

let path: string

function deleteAndExit(): void {
  if (!path) return

  rmSync(path, { recursive: true })
  process.exit(0)
}

process.on("message", (msg: [0 | 1, unknown]) => {
  if (msg[0] === 1) deleteAndExit()
  else if (msg[0] === 0) path = msg[1] as string
})

process.on("disconnect", () => {
  deleteAndExit()
  process.exit(0)
})
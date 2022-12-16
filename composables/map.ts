export function mapEdit() {
  if (Frame().current % 2 === 0) {
    Map().offsetDelay[0] = Map().offset[0]
    Map().offsetDelay[1] = Map().offset[1]
  }

  // edit
  let x = Math.floor(hero().x / 120)
  let y = Math.floor(hero().y / 120)
  if (Gamepad().buttons.find((key) => key === "A")) {
    Map().collision[y][x] = true
  }
  if (Gamepad().buttons.find((key) => key === "B")) {
    Map().collision[y][x] = false
  }

  if (Frame().current % 60 === 0) {
    updateCollision("start", Map().collision)
  }
}

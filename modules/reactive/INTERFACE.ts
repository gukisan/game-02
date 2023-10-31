const inter = {
  overlay: true,
  inventory: false,
  target: false,
  targetLocked: false,
  targetHealth: 0,
  targetMaxHealth: 0,
  talk: false,
  talkPosition: { x: 0, y: 0 },
  talkEntity: "",
  talkHover: false,
  showKeys: true,
  init() {
    WORLD.loop.add(() => {
      if (GLOBAL.context === "world") {
        if (WORLD.hero.target.id && WORLD.hero.target.entity) {
          INTERFACE.target = true
          INTERFACE.targetHealth = WORLD.hero.target.entity.attributes.health
          INTERFACE.targetMaxHealth =
            MODELS.entities[WORLD.hero.target.entity.name].attributes.health
        } else {
          INTERFACE.target = false
        }
        if (WORLD.hero.target.locked) INTERFACE.targetLocked = true
        else INTERFACE.targetLocked = false
      }
      if (GLOBAL.context === "scene") this.overlay = false
      else this.overlay = true
    }, "INTERFACE")
  },
}
export const INTERFACE = LIB.store(inter)

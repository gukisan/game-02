export default {
  size: {
    width: 70,
    height: 60,
  },
  visual: {
    leaveAnimationConditions: {
      move: (entity, id) => {
        return GPIXI.getSprite(id, "move")?.currentFrame === 0
      },
    },
    firstFrames: { attack: 18 },
  },
  move: {
    speed: 8,
  },
  attack: {
    distance: 40,
    damage: 20,
  },
  attributes: {
    health: 100,
  },
}

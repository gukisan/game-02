type AddName<T> = T & { name: string }
class Entities {
  collection = {
    lira: {
      HERO: true,
      POSITION: { x: 6588, y: 6891 },
      SIZE: {
        width: 60,
        height: 153,
      },
      MOVE: {
        speed: 15,
      },
      SKILLS: {
        modify: {
          attack: {
            firstCastMS: 900,
          },
        },
      },
      SPRITE: {
        startFrames: { idle: 11, walk: 8, run: 4, "attack-sword": 14 },
        effectHeightRatio: 0.45,
        effectWidthRatio: 0.25,
      },
      ATTRIBUTES: {
        health: 2000,
        healthMax: 2000,
        healthRegen: 0.2,
      },
    },
    bunbo: {
      SIZE: {
        width: 70,
        height: 60,
        bottom: 17,
      },
      SPRITE: {
        leaveAnimationConditions: {
          move: (entity, id) => {
            return SPRITE.getAnimation(id, "move")?.currentFrame === 0
          },
        },
        startFrames: { attack: 18 },
      },
      MOVE: {
        speed: 10,
      },
      SKILLS: {
        modify: {
          attack: {
            distance: 40,
            damage: 2,
            castMS: 1600,
            firstCastMS: 1400,
            delayMS: 800,
          },
        },
      },
      ATTRIBUTES: {
        health: 1000,
        healthMax: 1000,
      },
      STATE: {
        deadDelayMS: 1300,
      },
    },
    mousepoint: {
      POSITION: {
        x: -30,
        y: -30,
      },
      SPRITE: {},

      process(entity: { POSITION: any }, id: number) {
        let position = entity.POSITION
        if (!position) return
        if (SH.hero.STATE.active === "dead") {
          SH.resetDestination()
          return
        }

        if (GLOBAL.lastActiveDevice === "gamepad") {
          position.x = -30
          position.y = -30
          return
        }

        const finaldestination = SH.hero.MOVE.finaldestination
        if (!finaldestination) {
          position.x = -30
          position.y = -30
          return
        }
        position.x = finaldestination.x
        position.y = finaldestination.y

        if (!COORD.isWalkable(position.x, position.y)) {
          position.x = -30
          position.y = -30
        }

        const displacement = COORD.vectorFromPoints(position, SH.hero.POSITION)
        const distance = displacement.distance
        const speedPerTick = COORD.speedPerTick(SH.hero)

        // hide
        // 📜 change tracked to track state, implement track state
        if (distance < speedPerTick || SH.hero.STATE.track) {
          position.x = -30
          position.y = -30
          return
        }

        const container = SPRITE.getContainer(id)
        const animation = SPRITE.getLayer(id, "animation")

        if (container && animation) {
          animation.angle += 80 * LOOP.deltaSec
          const scale = 1
          container.scale = { x: 1, y: 0.5 }
          container.scale.x *= scale
          container.scale.y *= scale
          const animationSprite = SPRITE.getAnimation(id, "idle")
          if (!animationSprite) return
          animationSprite.blendMode = PIXI.BLEND_MODES.OVERLAY
          setTimeout(() => {
            animationSprite.alpha = distance / 100
          })
        }
      },
    },
  }
}
export const ENTITIES = new Entities()

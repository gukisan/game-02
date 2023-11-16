// no damage if target go away based on skill distance
class Cast {
  attackSoundIds: any = []
  heroSwordAttackCastStage: 0 | 1 = 0 // animation stage
  private cast(slot = "slot1") {
    EVENTS.emit("cast", {
      entity: SH.hero,
      slot: slot,
    })
  }
  init() {
    EVENTS.onSingle("cast1", () => this.cast("slot1"))
    EVENTS.onSingle("cast2", () => this.cast("slot2"))
    EVENTS.onSingle("cast3", () => this.cast("slot3"))
    EVENTS.onSingle("cast4", () => this.cast("slot4"))
    EVENTS.on("cast", ({ entity, slot }) => {
      const targetEntity = entity.TARGET.entity
      if (!targetEntity || targetEntity.STATE.active === "dead") return
      entity.SKILLS.active = entity.SKILLS[slot]
      entity.STATE.track = true
      entity.TARGET.locked = true
    })
  }
  private targetDiesLogic(entity, id) {
    entity.TARGET.id = undefined
    entity.TARGET.locked = false
    entity.MOVE.finaldestination = _.cloneDeep(entity.POSITION)
    if (entity.HERO) {
      if (!SETTINGS.gameplay.easyFight) entity.STATE.track = false
      MOVE.lastMobKilledMS = LOOP.elapsedMS
    }
  }
  private revengeLogic(entity, id, skill) {
    EVENTS.emit("revenge", {
      entity: entity.TARGET.entity,
      id: entity.TARGET.id,
      offender: entity,
      offenderId: id,
    })
  }
  private playAudioEffect(entity) {
    let soundId: any
    const skill = entity.SKILLS.data[entity.SKILLS.active]
    // 📜 0.8 and "sword-hit" should be taken from item, that hero is using
    let audioDelay
    if (entity.SKILLS.firstCastState) audioDelay = skill.firstCastMS * 0.95
    else audioDelay = skill.castMS * 0.95
    if (entity.HERO) soundId = AUDIO.play("sword-hit", audioDelay)
    else soundId = AUDIO.play("bunbo-bite")
    entity.SKILLS.attackSoundId = soundId
  }
  private createCastEffectSprite(entity, id) {
    const targetEntity = entity.TARGET.entity
    // 📜 "sword-hit" should be taken from item, that hero is using
    if (entity.HERO) SPRITE.effect(entity, "sword-hit", targetEntity)
    else SPRITE.effect(entity, "bunbo-bite", targetEntity)
  }
  private firstCastLogic(entity, id, skill) {
    this.heroSwordAttackCastStage = 0
    this.castLogic(entity, id, skill)
  }
  private castLogic(entity, id, skill) {
    if (!entity.TARGET.id || entity.STATE.active !== "cast") return
    if (TRACK.inRange(entity, skill.distance, 3)) {
      this.createCastEffectSprite(entity, id)
      if (skill.offensive) DAMAGE.deal(entity, id, skill)
    }
    if (skill.revenge) this.revengeLogic(entity, id, skill)
    const targetHealth = entity.TARGET.entity.ATTRIBUTES.health
    if (targetHealth <= 0) this.targetDiesLogic(entity, id)
    if (skill.logic) skill.logic(entity, id)
    entity.SKILLS.castAndDelayMS = LOOP.elapsedMS + skill.delayMS
    entity.SKILLS.delayedLogicDone = false
  }
  private delayedLogic(entity, id, skill) {
    entity.SKILLS.delayedLogicDone = true
    if (!TRACK.inRange(entity, skill.distance)) {
      entity.STATE.cast = false
      entity.SKILLS.castAndDelayMS = Infinity
      return
    }
    this.alignAnimations(entity, id)
  }
  private alignAnimations(entity, id) {
    let sprite
    let spriteName = "attack"
    if (entity.HERO) {
      // "attack-sword"
      spriteName = SPRITE_UPDATE.getHeroCastSprite(SH.hero, SH.heroId)
    }
    sprite = SPRITE.getAnimation(id, spriteName)
    if (!sprite) return
    let frame = entity.SPRITE.startFrames[spriteName] - 1
    if (frame < 0) frame = sprite.totalFrames - 1
    if (entity.HERO) {
      if (!this.heroSwordAttackCastStage) {
        this.heroSwordAttackCastStage = 1
      } else {
        this.heroSwordAttackCastStage = 0
        sprite.gotoAndPlay(frame)
      }
    } else {
      sprite.gotoAndPlay(frame)
    }
  }
  private reset(entity, id) {
    entity.SKILLS.castAndDelayMS = Infinity
    entity.SKILLS.delayedLogicDone = true
  }
  stopAttackSoundsIfNotCast(entity, id) {
    if (entity.SKILLS.attackSoundId && entity.STATE.active !== "cast") {
      AUDIO.stop(entity.SKILLS.attackSoundId, 30)
      entity.SKILLS.audioDone = false
      entity.SKILLS.attackSoundId = undefined
    }
  }
  process() {
    if (GLOBAL.context === "scene") return
    MUSEUM.processEntity(["STATE", "SKILLS"], (entity, id) => {
      this.stopAttackSoundsIfNotCast(entity, id)
      if (!entity.STATE.cast) {
        this.reset(entity, id)
        return
      }
      const skill = entity.SKILLS.data[entity.SKILLS.active]
      const elapsedMS = LOOP.elapsedMS
      const delayMS = entity.SKILLS.delayMS
      // if target is dead
      if (
        !entity.TARGET.id &&
        elapsedMS > entity.SKILLS.castAndDelayMS + delayMS
      ) {
        entity.STATE.cast = false
        return
      }
      const lastEntity = LAST.entities.get(id)
      if (!lastEntity) return
      if (entity.STATE.cast && !lastEntity.STATE.cast) {
        entity.SKILLS.castStartMS = LOOP.elapsedMS
        entity.SKILLS.castAndDelayMS =
          LOOP.elapsedMS - skill.castMS + skill.firstCastMS
      }
      if (elapsedMS > entity.SKILLS.castAndDelayMS + skill.castMS) {
        if (
          LOOP.elapsedMS <
          // 1.5 is just to find time between first and second cast :)
          entity.SKILLS.castStartMS + skill.firstCastMS * 1.5
        ) {
          this.firstCastLogic(entity, id, skill)
        } else {
          this.castLogic(entity, id, skill)
        }
      }
      if (!entity.SKILLS.audioDone) {
        this.playAudioEffect(entity)
        entity.SKILLS.audioDone = true
      }
      if (
        !entity.SKILLS.delayedLogicDone &&
        elapsedMS > entity.SKILLS.castAndDelayMS
      ) {
        this.delayedLogic(entity, id, skill)
        entity.SKILLS.audioDone = false
      }
      this.updateAnimationSpeed(entity, id)
    })
  }
  private updateAnimationSpeed(entity, id) {
    let sprite
    if (entity.HERO) {
      // "attack-sword"
      const spriteName = SPRITE_UPDATE.getHeroCastSprite(SH.hero, SH.heroId)
      sprite = SPRITE.getAnimation(SH.heroId, spriteName)
    } else {
      sprite = SPRITE.getAnimation(id, "attack")
    }
    if (!sprite) return
    sprite.animationSpeed =
      (1 / (CONFIG.maxFPS / 10)) * entity.ATTRIBUTES.attackSpeed
  }
}
export const CAST = new Cast()

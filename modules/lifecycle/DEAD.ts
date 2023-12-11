class Dead {
    init() {
        EVENTS.onSingle("reset", () => {
            if (SH.hero.STATE.active !== "dead" || !GLOBAL.reset) return
            SH.hero.STATE.cast = false
            SH.hero.STATE.track = false
            SH.hero.STATE.idle = true
            SH.hero.STATE.active = "idle"
            SH.hero.ATTRIBUTES.health = SH.hero.ATTRIBUTES.healthMax
            SH.hero.ATTRIBUTES.energy = SH.hero.ATTRIBUTES.energyMax
            SH.hero.POSITION = _.cloneDeep(ENTITIES.collection.lira.POSITION)
            SH.hero.TARGET.id = null
            SH.hero.TARGET.locked = false
            SH.resetDestination()
            GLOBAL.reset = false
            const container = SPRITE.getContainer(SH.heroId)
            if (!container) return
            container.setParent(WORLD.sortable)
            container.alpha = 0
            const fadeInStart = 100 // otherwise there is a dead state flickers
            const fadeInDuration = 500
            const totalDuration = fadeInStart + fadeInDuration
            const updateInterval = 7
            let elapsed = 0
            const intervalId = setInterval(() => {
                elapsed += updateInterval
                if (elapsed > fadeInStart && elapsed < totalDuration) {
                    const fractionComplete =
                        (elapsed - fadeInStart) / fadeInDuration
                    container.alpha = fractionComplete
                } else if (elapsed > totalDuration) {
                    container.alpha = 1
                    clearInterval(intervalId)
                }
            }, 7)
            SPRITE.fillWeaponLayers()
        })
    }
    process() {
        MUSEUM.processEntity("HERO", (entity, id) => {
            if (entity.ATTRIBUTES.health > 0) return
            entity.STATE.active = "dead"
            entity.TARGET.id = null
            entity.TARGET.locked = false
            SPRITE.emptyWeaponLayers()
            const lastEntity = LAST.entities.get(id)
            if (
                entity.STATE.active === "dead" &&
                lastEntity.STATE.active !== "dead"
            ) {
                setTimeout(() => (GLOBAL.reset = true), 2500)
                SAVE.update()
                setTimeout(() => {
                    if (entity.STATE.active !== "dead") return
                    const container = SPRITE.getContainer(id)
                    if (!container) return
                    container.setParent(WORLD.ground)
                }, 1000)
            }
        })
        MUSEUM.processEntity(
            ["ATTRIBUTES", "STATE", "NONHERO"],
            (entity, id) => {
                if (entity.ATTRIBUTES.health > 0) return
                entity.STATE.active = "dead"
                entity.TARGET.id = undefined
                const lastEntity = LAST.entities.get(id)
                if (
                    entity.STATE.active === "dead" &&
                    lastEntity.STATE.active !== "dead"
                ) {
                    AUDIO.stop(entity.SKILLS.attackSoundId, 10)
                    entity.STATE.deadTimeMS = LOOP.elapsed
                    PROGRESS.mobs[entity.name]++
                    SAVE.update()
                }
                const animation = SPRITE.getLayer(id, "animation")
                const shadow = SPRITE.getLayer(id, "shadow")
                if (!animation || !shadow) return
                // fade
                const timeTillRemove =
                    entity.STATE.deadTimeMS +
                    entity.STATE.deadDelayMS -
                    LOOP.elapsed
                animation.alpha = timeTillRemove / 500
                if (timeTillRemove < 500) {
                    entity.POSITION.y += 0.5 * (60 / LOOP.fps)
                }
                shadow.alpha = (timeTillRemove / 500) * CONFIG.shadow_alpha
            }
        )
    }
}
export const DEAD = new Dead()

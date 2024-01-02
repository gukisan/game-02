class EntitiesStatic {
    collection = {
        // green-forest
        nighty: {
            POS: { x: 6353, y: 6682 },
            TALK: { x: -60, y: -180, distance: 270, scene: "n0" },
        },
        bunny: {
            POS: { x: 7880, y: 7408 },
            TALK: { x: -50, y: -220, scene: "a0" },
        },
        "low-tree": { POS: { x: 6450, y: 7620 } },
        "low-forest": { POS: { x: 7500, y: 9400 } },
        bridge: { POS: { x: 7142, y: 7074 } },
        "bridge-fence": { POS: { x: 7047, y: 7578 } },
        "bridge-fence-top": { POS: { x: 7272, y: 7176 } },
        "bunny-tree": { POS: { x: 7772, y: 7338 } },
        "river-low-tree": { POS: { x: 6775, y: 7915 } },
        "tree-low-cave": { POS: { x: 7000, y: 9220 } },
    }
    async init() {
        for (const key in this.collection) {
            await CREATOR.createStatic(key, { SPRITE: {} })
        }
    }
}
export const ENTITIES_STATIC = new EntitiesStatic()

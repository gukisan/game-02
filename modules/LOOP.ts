const hold_frames = 20
const last_frames_fps: number[] = []
class Loop {
    iterations = 0
    // precisely updated each loop, CONFIG.max_fps is assigned just in case
    fps = CONFIG.max_fps
    /** ms */
    elapsed = 0
    get elapsed_sec() {
        return Math.floor(this.elapsed / 1000)
    }
    /** @returns 1/60 for 60 fps, 1/144 for 144 fps with delta correction */
    get delta_sec() {
        if (!WORLD.app) return 1 / 60
        return WORLD.app.ticker.deltaMS / 16.66 / 60
    }
    last_check = ["new_sec"]
    new_sec = false
    init() {
        if (WORLD.app) WORLD.app.ticker.maxFPS = CONFIG.max_fps
    }
    process() {
        if (!WORLD.app) return
        last_frames_fps.push(WORLD.app.ticker.FPS)
        if (last_frames_fps.length > hold_frames) last_frames_fps.shift()
        this.iterations++
        this.fps = _.mean(last_frames_fps)
        this.elapsed += WORLD.app.ticker.deltaMS
        if (LAST.loopSec !== this.elapsed_sec) this.new_sec = true
        else this.new_sec = false
    }
    /** name is used to find priority in CONFIG.process, if exists */
    add = (fn: () => void, name?: string) => {
        if (!WORLD.app) return
        if (name && CONFIG && CONFIG.priority.modulesProcess[name]) {
            WORLD.app.ticker.add(
                fn,
                undefined,
                CONFIG.priority.modulesProcess[name]
            )
            return
        }
        WORLD.app.ticker.add(fn)
    }
}
export const LOOP = new Loop()

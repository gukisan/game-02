//
// redeclare some types for REACTIVE.world accessability
// nuxt issue, otherwise auto-import dont work,
import {
  Graphics as tempGraphics,
  Container as tempContainer,
  Application as tempApplication,
  AnimatedSprite as tempAnimatedSprite,
  Spritesheet as tempSpritesheet,
  Texture as tempTexture,
  Rectangle as tempRectangle,
  Sprite as tempSprite,
  ISpritesheetData as tempISpriteSheetData,
} from "pixi.js"

declare global {
  // convert types back
  type Graphics = tempGraphics
  type Container = tempContainer
  type Application = tempApplication
  type AnimatedSprite = tempAnimatedSprite
  type Spritesheet = tempSpritesheet
  type Texture = tempTexture
  type Rectangle = tempRectangle
  type Sprite = tempSprite
  type ISpritesheetData = tempISpriteSheetData

  interface gContainer extends Container {
    id: number
  }

  // used to turn off lagging cache
  interface gSpritesheet extends Spritesheet {
    _frameKeys: any
    _frames: any
    _callback: any
    _batchIndex: any
    _processAnimations: any
    _parseComplete: any
    _nextBatch: any
    gParse: () => void
    gProcessFrames: (any) => void
  }

  type Entity = { [key: string]: any }
}

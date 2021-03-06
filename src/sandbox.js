import twgl from 'twgl-base.js'

function initTexture (textureData, width, height) {
  for (let i = 0; i < 4 * width * height; i += 4) {
    textureData[i] = 0
    textureData[i + 1] = 0
    textureData[i + 2] = 0
    textureData[i + 3] = 255
  }
}

let hotReload
export function createSandbox (gl, image) {
  if (module.hot && hotReload) return hotReload

  let width = 128
  let height = 128
  let textureData

  if (image) {
    textureData = image
  } else {
    textureData = new Uint8Array(width * height * 4)
    initTexture(textureData, width, height)
  }

  let textureOptions = {
    width,
    height,
    mag: gl.NEAREST,
    min: gl.LINEAR,
    wrap: gl.REPEAT,
    src: textureData
  }
  let textureFront = twgl.createTexture(gl, textureOptions)
  let textureBack = twgl.createTexture(gl, textureOptions)
  let fbFront = twgl.createFramebufferInfo(gl, [{attachment: textureFront}])
  let fbBack = twgl.createFramebufferInfo(gl, [{attachment: textureBack}])

  let sandbox = {
    getTexture () {
      return textureFront
    },
    getNextTexture () {
      return textureBack
    },
    getFramebufferInfo () {
      return fbFront
    },
    getNextFramebufferInfo () {
      return fbBack
    },
    getDimensions () {
      return [width, height]
    },
    swap () {
      [textureFront, textureBack] = [textureBack, textureFront];
      [fbFront, fbBack] = [fbBack, fbFront]
    },
    dispose () {
      gl.deleteTexture(textureFront)
      gl.deleteTexture(textureBack)
      if (module.hot) {
        hotReload = null
      }
    }
  }

  if (module.hot) {
    hotReload = sandbox
    module.hot.dispose(() => sandbox.dispose())
  }

  return sandbox
}

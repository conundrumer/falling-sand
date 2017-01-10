import twgl from 'twgl-base.js'

let gl = document.getElementById('c').getContext('webgl')

let arrays = {
  position: { numComponents: 2, data: [1, 1, 1, -1, -1, 1, -1, -1] }
}
let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

let width = 100
let height = 100

let initTexture = new Uint8Array(width * height * 4)
for (let i = 0; i < 4 * width * height; i += 4) {
  let x = Math.random() > 0.5 ? 255 : 0
  initTexture[i] = x
  initTexture[i + 1] = x
  initTexture[i + 2] = x
  initTexture[i + 3] = 255
}
let textureOptions = {
  width,
  height,
  mag: gl.NEAREST,
  min: gl.LINEAR,
  src: initTexture
}
let textureFront = twgl.createTexture(gl, textureOptions)
let textureBack = twgl.createTexture(gl, textureOptions)
let fbFront = twgl.createFramebufferInfo(gl, [{attachment: textureFront}])
let fbBack = twgl.createFramebufferInfo(gl, [{attachment: textureBack}])

export function step (golProgramInfo) {
  // render to textureFront
  gl.viewport(0, 0, width, height)

  let uniforms = {
    state: textureBack,
    scale: [width, height]
  }

  gl.useProgram(golProgramInfo.program)
  twgl.setBuffersAndAttributes(gl, golProgramInfo, bufferInfo)
  twgl.setUniforms(golProgramInfo, uniforms)
  twgl.bindFramebufferInfo(gl, fbFront)
  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)

  let tex = textureFront

  ;[textureFront, textureBack] = [textureBack, textureFront]
  ;[fbFront, fbBack] = [fbBack, fbFront]

  return tex
}

if (module.hot) {
  module.hot.dispose(() => {
    gl.deleteTexture(textureFront)
    gl.deleteTexture(textureBack)
  })
}

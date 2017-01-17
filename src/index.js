import twgl from 'twgl-base.js'

import vs from './vert.glsl'
import fs from './frag.glsl'
import gol from './gol.glsl'

import time from './time'
import { step } from './texture'

import gl from './gl'

let programInfo = twgl.createProgramInfo(gl, [vs, fs])
let golProgramInfo = twgl.createProgramInfo(gl, [vs, gol])

let arrays = {
  position: { numComponents: 2, data: [1, 1, 1, -1, -1, 1, -1, -1] }
}
let bufferInfo = twgl.createBufferInfoFromArrays(gl, arrays)

let animationFrame
function render () {
  time.inc()
  let tex = step(golProgramInfo)

  let uniforms = {
    state: tex,
    // time: time.get() * 0.01,
    resolution: [gl.canvas.width, gl.canvas.height]
  }

  gl.useProgram(programInfo.program)
  twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
  twgl.setUniforms(programInfo, uniforms)
  twgl.bindFramebufferInfo(gl)
  gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
  twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)

  animationFrame = window.requestAnimationFrame(render)
}
animationFrame = window.requestAnimationFrame(render)

// … the application entry module
// As it doesn’t export it can accept itself. A dispose handler can pass the application state on replacement.
if (module.hot) {
  // this module is hot reloadable
  module.hot.accept()

  module.hot.dispose(() => {
    window.cancelAnimationFrame(animationFrame)
  })
}

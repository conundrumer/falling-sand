import twgl from 'twgl-base.js'

import copyVert from './copy.vert'
import copyFrag from './copy.frag'
import drawVert from './draw.vert'
import drawFrag from './draw.frag'
import ruleFrag from './rule.frag'

import {createSandbox} from './sandbox'

let hotReload
export function createSimulator (gl, image) {
  if (module.hot && hotReload) return hotReload

  let inputProgramInfo = twgl.createProgramInfo(gl, [drawVert, drawFrag])
  let displayProgramInfo = twgl.createProgramInfo(gl, [copyVert, copyFrag])
  let ruleProgramInfo = twgl.createProgramInfo(gl, [copyVert, ruleFrag])

  // quad
  let bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [1, 1, 1, -1, -1, 1, -1, -1] }
  })

  let sandbox = createSandbox(gl, image)

  function render ({programInfo, uniforms, viewport, framebufferInfo = null}) {
    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.bindFramebufferInfo(gl, framebufferInfo)
    gl.viewport(...viewport)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)
  }

  let adjust = true
  let time = 0
  function step (programInfo) {
    render({
      programInfo,
      uniforms: {
        state: sandbox.getTexture(),
        scale: sandbox.getDimensions()
      },
      viewport: [0, 0, ...sandbox.getDimensions()],
      framebufferInfo: sandbox.getNextFramebufferInfo()
    })
    sandbox.swap()
  }
  let simulator = {
    update () {
      step(ruleProgramInfo)
      time++
    },
    input ({cell = [1, 1, 1, 1], center = [0.5, 0.5], diameter = 1}) {
      render({
        programInfo: inputProgramInfo,
        uniforms: {
          cell,
          center,
          diameter,
          scale: sandbox.getDimensions()
        },
        viewport: [0, 0, ...sandbox.getDimensions()],
        framebufferInfo: sandbox.getFramebufferInfo()
      })
    },
    display () {
      twgl.resizeCanvasToDisplaySize(gl.canvas, window.devicePixelRatio)
      render({
        programInfo: displayProgramInfo,
        uniforms: {
          adjustColor: adjust,
          state: sandbox.getTexture(),
          resolution: [gl.canvas.width, gl.canvas.height]
        },
        viewport: [0, 0, gl.canvas.width, gl.canvas.height]
      })
    },
    toggleAdjust () {
      adjust = !adjust
    },
    showRaw () {
      let [width, height] = sandbox.getDimensions()
      gl.canvas.width = width
      gl.canvas.height = height
      render({
        programInfo: displayProgramInfo,
        uniforms: {
          adjustColor: false,
          state: sandbox.getTexture(),
          resolution: [gl.canvas.width, gl.canvas.height]
        },
        viewport: [0, 0, gl.canvas.width, gl.canvas.height]
      })
    },
    dispose () {
      sandbox.dispose()
      hotReload = null
    }
  }

  if (module.hot) {
    hotReload = simulator
  }

  return simulator
}

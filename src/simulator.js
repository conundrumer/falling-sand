import twgl from 'twgl-base.js'

import copyVert from './copy.vert'
import copyFrag from './copy.frag'
import drawVert from './draw.vert'
import drawFrag from './draw.frag'
import ruleFrag from './rule.frag'

import {createSandbox} from './sandbox'

let hotReload
export function createSimulator (gl) {
  if (module.hot && hotReload) return hotReload

  let inputProgramInfo = twgl.createProgramInfo(gl, [drawVert, drawFrag])
  let displayProgramInfo = twgl.createProgramInfo(gl, [copyVert, copyFrag])
  let ruleProgramInfo = twgl.createProgramInfo(gl, [copyVert, ruleFrag])

  // quad
  let bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [1, 1, 1, -1, -1, 1, -1, -1] }
  })

  let sandbox = createSandbox(gl)

  function render ({programInfo, uniforms, viewport, framebufferInfo = null}) {
    gl.useProgram(programInfo.program)
    twgl.setBuffersAndAttributes(gl, programInfo, bufferInfo)
    twgl.setUniforms(programInfo, uniforms)
    twgl.bindFramebufferInfo(gl, framebufferInfo)
    gl.viewport(...viewport)
    twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)
  }

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
      twgl.resizeCanvasToDisplaySize(gl.canvas)
      render({
        programInfo: displayProgramInfo,
        uniforms: {
          state: sandbox.getTexture(),
          resolution: [gl.canvas.width, gl.canvas.height]
        },
        viewport: [0, 0, gl.canvas.width, gl.canvas.height]
      })
    }
  }

  if (module.hot) {
    hotReload = simulator
  }

  return simulator
}

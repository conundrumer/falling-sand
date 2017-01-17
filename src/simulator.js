import twgl from 'twgl-base.js'

import copyVert from './copy.vert.glsl'
import copyFrag from './copy.frag.glsl'
import golFrag from './gol.frag.glsl'

import {createSandbox} from './sandbox'

let hotReload
export function createSimulator (gl) {
  if (module.hot && hotReload) return hotReload

  let renderProgramInfo = twgl.createProgramInfo(gl, [copyVert, copyFrag])
  let golProgramInfo = twgl.createProgramInfo(gl, [copyVert, golFrag])

  // quad
  let bufferInfo = twgl.createBufferInfoFromArrays(gl, {
    position: { numComponents: 2, data: [1, 1, 1, -1, -1, 1, -1, -1] }
  })

  let sandbox = createSandbox(gl, bufferInfo)

  let simulator = {
    step () {
      sandbox.step(golProgramInfo)
    },
    render () {
      let uniforms = {
        state: sandbox.getTexture(),
        resolution: [gl.canvas.width, gl.canvas.height]
      }

      gl.useProgram(renderProgramInfo.program)
      twgl.setBuffersAndAttributes(gl, renderProgramInfo, bufferInfo)
      twgl.setUniforms(renderProgramInfo, uniforms)
      twgl.bindFramebufferInfo(gl)
      gl.viewport(0, 0, gl.canvas.width, gl.canvas.height)
      twgl.drawBufferInfo(gl, bufferInfo, gl.TRIANGLE_STRIP)
    }
  }

  if (module.hot) {
    hotReload = simulator
  }

  return simulator
}

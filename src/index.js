import twgl from 'twgl-base.js'

import {createSimulator} from './simulator'

function init () {
  let gl = document.getElementById('c').getContext('webgl')
  twgl.resizeCanvasToDisplaySize(gl.canvas)

  let simulator = createSimulator(gl)

  let animationFrame
  let timer = {
    start () {
      (function loop () {
        simulator.step()
        simulator.render()
        animationFrame = window.requestAnimationFrame(loop)
      })()
    },
    stop () {
      window.cancelAnimationFrame(animationFrame)
    }
  }

  simulator.render()
  timer.start()

  if (module.hot) {
    module.hot.dispose(() => timer.stop())
  }
}

init()
// … the application entry module
// As it doesn’t export it can accept itself. A dispose handler can pass the application state on replacement.
if (module.hot) {
  // this module is hot reloadable
  module.hot.accept()
}

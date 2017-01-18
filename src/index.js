import {createSimulator} from './simulator'

function init () {
  let canvas = document.getElementById('c')
  let gl = canvas.getContext('webgl')

  let simulator = createSimulator(gl)

  let animationFrame
  let timer = {
    start () {
      (function loop () {
        simulator.update()
        simulator.display()
        animationFrame = window.requestAnimationFrame(loop)
      })()
    },
    stop () {
      window.cancelAnimationFrame(animationFrame)
    }
  }

  simulator.display()
  timer.start()

  let stopped = false
  let down = e => {
    e.preventDefault()
    if (stopped) {
      timer.start()
    } else {
      timer.stop()
    }
    stopped = !stopped
  }

  let click = e => {
    e.preventDefault()
    simulator.input({
      center: [e.clientX / canvas.clientWidth, e.clientY / canvas.clientHeight],
      diameter: 4
    })

    window.requestAnimationFrame(() => simulator.display())
  }
  canvas.addEventListener('mousedown', down)
  canvas.addEventListener('mousemove', click)

  if (module.hot) {
    module.hot.dispose(() => {
      timer.stop()
      canvas.removeEventListener('mousedown', down)
      canvas.removeEventListener('mousemove', click)
    })
  }
}

init()
// … the application entry module
// As it doesn’t export it can accept itself. A dispose handler can pass the application state on replacement.
if (module.hot) {
  // this module is hot reloadable
  module.hot.accept()
}

import {createSimulator} from './simulator'

function init () {
  // dom nodes
  let canvas = document.getElementById('c')
  let gl = canvas.getContext('webgl')

  // simulator
  let simulator = createSimulator(gl)
  simulator.display()

  // state
  let selectedCellType = 0
  let brushSize = 1
  let isMouseDown = false
  let mousePosition = { x: 0, y: 0 }
  let running = false

  // input
  let cellTypes = [[1, 1, 1, 1], [0, 0, 0, 1]]
  let draw = position => {
    simulator.input({
      cell: cellTypes[selectedCellType],
      center: [position.x / canvas.clientWidth, position.y / canvas.clientHeight],
      diameter: brushSize
    })
  }

  // timer
  let animationFrame
  let timer = {
    running: false,
    start () {
      (function loop () {
        simulator.update()
        if (isMouseDown) {
          draw(mousePosition)
        }
        simulator.display()
        animationFrame = window.requestAnimationFrame(loop)
      })()
      running = true
    },
    stop () {
      window.cancelAnimationFrame(animationFrame)
      running = false
    }
  }

  // mouse events
  let mousedown = e => {
    e.preventDefault()
    isMouseDown = true
    mousePosition = { x: e.clientX, y: e.clientY }
    if (!running) {
      draw(mousePosition)
      simulator.display()
    }
  }
  let mousemove = e => {
    e.preventDefault()
    mousePosition = { x: e.clientX, y: e.clientY }
    if (!running && isMouseDown) {
      draw(mousePosition)
      simulator.display()
    }
  }
  let mouseup = e => {
    e.preventDefault()
    isMouseDown = false
  }

  // keyboard events
  console.info(`
    Key Commands:
    - Space bar: Start/stop simulation
    - 1: Select cell type ON
    - 2: Select cell type OFF
    - ArrowUp: Increase brush size
    - ArrowDown: Decrease brush size
  `)
  let keydown = e => {
    // e.preventDefault()
    switch (e.key) {
      case ' ':
        if (running) {
          timer.stop()
          console.info('Stopping')
        } else {
          timer.start()
          console.info('Starting')
        }
        break
      case '1':
        selectedCellType = 0
        console.info('Cell type:', cellTypes[selectedCellType])
        break
      case '2':
        selectedCellType = 1
        console.info('Cell type:', cellTypes[selectedCellType])
        break
      case 'ArrowUp':
        brushSize += 1
        console.info('Brush Size:', brushSize)
        break
      case 'ArrowDown':
        if (brushSize > 1) {
          brushSize -= 1
          console.info('Brush Size:', brushSize)
        }
        break
      case 'ArrowRight':
        if (!running) {
          simulator.update()
          simulator.display()
          console.info('Stepping')
        }
        break
      default:
    }
  }
  canvas.addEventListener('mousedown', mousedown)
  canvas.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', mouseup)
  document.addEventListener('keydown', keydown)

  if (module.hot) {
    module.hot.dispose(() => {
      timer.stop()
      canvas.removeEventListener('mousedown', mousedown)
      canvas.removeEventListener('mousemove', mousemove)
      window.removeEventListener('mouseup', mouseup)
      document.removeEventListener('keydown', keydown)
    })
  }
}

// … the application entry module
// As it doesn’t export it can accept itself. A dispose handler can pass the application state on replacement.
if (module.hot) {
  // this module is hot reloadable
  module.hot.accept()
}

init()

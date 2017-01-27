import GIF from 'gif.js'

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
  let gif

  let addFrameIfRecording = () => {
    if (gif) {
      gif.addFrame(canvas, {delay: 40, copy: true})
    }
  }

  // input
  const FALL_GREY = 1 / 8
  const FALL = 2 / 8
  // const OFF = 4 / 8
  // const ON = 6 / 8
  const RISE_GREY = 7 / 8
  const RISE = 8 / 8
  const EMPTY = 0
  let cellTypes = [
    [RISE, 0, 0, 1],
    [0, RISE, 0, 1],
    [0, 0, RISE, 1],
    [FALL, 0, 0, 1],
    [0, FALL, 0, 1],
    [0, 0, FALL, 1],
    [RISE_GREY, RISE_GREY, RISE_GREY, 1],
    [FALL_GREY, FALL_GREY, FALL_GREY, 1],
    [EMPTY, EMPTY, EMPTY, 1]]
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
        addFrameIfRecording()
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
    if (e.button !== 0) return
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
    - 1: Select cell type RED RISE
    - 2: Select cell type GREEN RISE
    - 3: Select cell type BLUE RISE
    - 4: Select cell type RED FALL
    - 5: Select cell type GREEN FALL
    - 6: Select cell type BLUE FALL
    - 7 or q: Select cell type EMPTY
    - ArrowUp: Increase brush size
    - ArrowDown: Decrease brush size
    - ArrowRight: Step
    - t: toggle color adjustment
    - r: show raw state (for saving)
    - j: start gif recording (records as simulation steps/runs)
    - k: end gif recording (opens result in new window)
  `)
  let keydown = e => {
    e.preventDefault()
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
      case '2':
      case '3':
      case '4':
      case '5':
      case '6':
      case '7':
      case '8':
      case '9':
        selectedCellType = parseInt(e.key, 10) - 1
        console.info('Cell type:', cellTypes[selectedCellType])
        break
      case 'q':
        selectedCellType = 8
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
          addFrameIfRecording()
        }
        break
      case 't':
        simulator.toggleAdjust()
        simulator.display()
        console.info('Toggling color adjustment')
        break
      case 'r':
        simulator.showRaw()
        console.info('showing raw state')
        break
      case 'j':
        gif = new GIF({
          width: canvas.width,
          height: canvas.height,
          quality: 10,
          workerScript: 'gif.worker.js'
        })
        simulator.display()
        addFrameIfRecording()
        console.info('starting gif recording')
        break
      case 'k':
        if (!gif) break
        gif.on('finished', blob => {
          console.info('finished rendering gif')
          let win = window.open(window.URL.createObjectURL(blob))
          win.onbeforeunload = () => {
            window.URL.revokeObjectURL(blob)
          }
        })
        gif.render()
        gif = null
        console.info('ending gif recording')
        break
      default:
    }
  }

  let resize = () => {
    simulator.display()
  }

  let drop = e => {
    e.preventDefault()
    console.info('Loading dropped file')
    let file = e.dataTransfer.files[0]
    timer.stop()
    simulator.dispose()
    simulator = createSimulator(gl, window.URL.createObjectURL(file))
    setTimeout(() => simulator.display(), 100)
  }

  let dragover = e => e.preventDefault()

  canvas.addEventListener('dragover', dragover)
  canvas.addEventListener('drop', drop)
  canvas.addEventListener('mousedown', mousedown)
  canvas.addEventListener('mousemove', mousemove)
  window.addEventListener('mouseup', mouseup)
  document.addEventListener('keydown', keydown)
  window.addEventListener('resize', resize)

  if (module.hot) {
    module.hot.dispose(() => {
      timer.stop()
      canvas.removeEventListener('dragover', dragover)
      canvas.removeEventListener('drop', drop)
      canvas.removeEventListener('mousedown', mousedown)
      canvas.removeEventListener('mousemove', mousemove)
      window.removeEventListener('mouseup', mouseup)
      document.removeEventListener('keydown', keydown)
      window.removeEventListener('resize', resize)
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

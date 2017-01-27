import GIF from 'gif.js'

import gifWorkerScript from 'raw-loader!gif.js/dist/gif.worker.js'

let gifWorkerUrl = window.URL.createObjectURL(new window.Blob([gifWorkerScript], { type: 'application/javascript' }))

if (module.hot) {
  module.hot.dispose(() => {
    window.URL.revokeObjectURL(gifWorkerUrl)
  })
}

export function createRecorder () {
  let gif = null

  return {
    isRecording () {
      return !!gif
    },
    start (canvas) {
      gif = new GIF({
        width: canvas.width,
        height: canvas.height,
        quality: 10,
        workerScript: gifWorkerUrl
      })
    },
    addFrameIfRecording (canvas) {
      if (gif) {
        gif.addFrame(canvas, {delay: 40, copy: true})
      }
    },
    end (onFinish) {
      gif.on('finished', blob => {
        let win = window.open(window.URL.createObjectURL(blob))
        win.onbeforeunload = () => {
          window.URL.revokeObjectURL(blob)
        }
        onFinish()
      })
      gif.render()
      gif = null
    }
  }
}

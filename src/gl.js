import twgl from 'twgl-base.js'

let gl = document.getElementById('c').getContext('webgl')
twgl.resizeCanvasToDisplaySize(gl.canvas)

export default gl

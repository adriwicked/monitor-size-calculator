window.onload = init

let lastFrameId = 0
const animationDuration = 1000
let lastTime = 0
let elapsedtime = 0
let num = 0
let cnv
let ctx

function init() {
  const inputs = getNumInputs()

  document.getElementById('calcButton')
    .addEventListener('click', () => calculateMonitorSize(inputs))

  initCanvasAndContext()
}

function getNumInputs() {
  const ids = ['inches', 'width', 'height']
  let inputs = {}

  ids.map(id => document.getElementById(id))
    .map(setInputNumOnly)
    .forEach(e => inputs[e.id] = e)

  return inputs
}

function setInputNumOnly(input) {
  const events = [
    'input', 'keydown', 'keyup', 'mousedown',
    'mouseup', 'select', 'contextmenu', 'drop'
  ]

  const regex = /^\d*\.?\d*$/

  events.forEach(function (event) {
    input.addEventListener(event, function () {
      if (regex.test(this.value)) {
        this.oldValue = this.value
        this.oldSelectionStart = this.selectionStart
        this.oldSelectionEnd = this.selectionEnd
      } else if (this.hasOwnProperty('oldValue')) {
        this.value = this.oldValue
        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd)
      } else {
        this.value = ''
      }
    })
  })

  return input
}

function initCanvasAndContext() {
  cnv = document.getElementById('cnv')
  cnv.width = 600
  cnv.height = 400
  ctx = cnv.getContext('2d')
}

function calculateMonitorSize(inputs) {
  const inches = parseInt(inputs.inches.value)
  const widthPx = parseInt(inputs.width.value)
  const heightPx = parseInt(inputs.height.value)

  const sizes = calculateSize(inches, widthPx, heightPx)

  window.requestAnimationFrame(time => loop(time, sizes))
}

function calculateSize(inches, widthPx, heightPx) {
  const INCHES_TO_CM = 2.54
  const multiplier = widthPx / heightPx
  const heightCms = (INCHES_TO_CM * inches / Math.sqrt(Math.pow(multiplier, 2) + 1)).toFixed(1)
  const widthCms = (heightCms * multiplier).toFixed(1)

  return { widthCms, heightCms, multiplier }
}

function loop(time, sizes) {
  (!lastTime) && (lastTime = time)
  const deltaTime = time - lastTime
  lastTime = time

  elapsedtime += deltaTime
  let perc = elapsedtime / animationDuration

  paintMonitor(sizes, perc)

  const req = window.requestAnimationFrame(time => loop(time, sizes))

  if (elapsedtime >= animationDuration) {
    window.cancelAnimationFrame(req)
    paintMonitor(sizes, perc)
    elapsedtime = 0
    lastTime = 0
  }
}

function paintMonitor(sizes, perc) {
  ctx.clearRect(0, 0, cnv.width, cnv.height)
  ctx.beginPath()
  ctx.lineWidth = '2'
  ctx.strokeStyle = '#3c3c3c'
  const width = lerp(0, cnv.width * 0.8, perc)
  const height = lerp(0, cnv.width * 0.8 / sizes.multiplier, perc)

  ctx.rect(
    cnv.width / 2 - width / 2,
    2,
    width,
    height
  )
  ctx.stroke()

  ctx.font = '20px Times New Roman'
  ctx.fillStyle = '#3c3c3c'
  ctx.textAlign = 'center'
  const widthCm = lerp(0, sizes.widthCms, perc).toFixed(1)
  const heightCm = lerp(0, sizes.heightCms, perc).toFixed(1)
  ctx.fillText(`${widthCm} cms`, cnv.width / 2, height - 20)
  ctx.textAlign = 'left'
  ctx.fillText(`${heightCm} cms`, cnv.width / 2 - width / 2 + 20, height / 2 + 10)
}

// function clamp(a, min = 0, max = 1) {
//   return Math.min(max, Math.max(min, a))
// }

function lerp(x, y, perc) {
  return x * (1 - perc) + y * perc
}

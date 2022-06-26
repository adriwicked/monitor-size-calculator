window.onload = init

let cnv
let ctx
let lastTime = 0
let elapsedtime = 0
const ANIM_DURATION = 1000

function init() {
  const inputs = getNumInputs()

  document.getElementById('calcButton')
    .addEventListener('click', () => calculateMonitorSize(inputs))  
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
  initCanvasAndContext()

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
  if (lastTime == 0) {
    lastTime = time
  }

  const deltaTime = time - lastTime  
  lastTime = time
  elapsedtime += deltaTime
  const progress = elapsedtime / ANIM_DURATION
  paintMonitor(sizes, progress)
  
  const req = window.requestAnimationFrame(time => loop(time, sizes))
  
  if (elapsedtime >= ANIM_DURATION) {
    window.cancelAnimationFrame(req)
    paintMonitor(sizes, 1)
    elapsedtime = 0
    lastTime = 0
  }
}

function paintMonitor(sizes, progress) {
  ctx.clearRect(0, 0, cnv.width, cnv.height)

  const width = lerp(0, cnv.width * 0.8, progress)
  const height = lerp(0, cnv.width * 0.8 / sizes.multiplier, progress)

  ctx.beginPath()  
  ctx.rect(
    cnv.width / 2 - width / 2,
    2,
    width,
    height
  )
  ctx.lineWidth = '2'
  ctx.strokeStyle = '#3c3c3c'
  ctx.stroke()

  const widthCm = lerp(0, sizes.widthCms, progress).toFixed(1)
  const heightCm = lerp(0, sizes.heightCms, progress).toFixed(1)

  ctx.font = '20px Times New Roman'
  ctx.fillStyle = '#3c3c3c'

  ctx.textAlign = 'center'
  ctx.fillText(`${widthCm} cms`, cnv.width / 2, height - 20)
  
  ctx.textAlign = 'left'
  ctx.fillText(`${heightCm} cms`, cnv.width / 2 - width / 2 + 20, height / 2 + 10)
}

function lerp(x, y, progress) {
  return x * (1 - progress) + y * progress
}

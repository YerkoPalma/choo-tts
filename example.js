var choo = require('choo')
var html = require('choo/html')

var app = choo()
app.use(require('.'))
app.use(speech)
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      <input type="text" id="text" value="Hello world"/>
      <select>
        ${state.tts.voices && state.tts.voices.map((voice, i) => {
          return html`<option value="${i}">${voice.name}</option>`
        })}
      </select>
      <button onclick=${onclick}>Say something</button>
      <button onclick=${oncustomclick}>Say something special</button>
    </body>
  `

  function onclick () {
    // speak with default voice
    // state.tts.selectedVoice = state.tts.voices[document.querySelector('select').value]
    emit('tts:speak', document.getElementById('text').value)
  }
  function oncustomclick () {
    // speak with default voice
    // state.tts.selectedVoice = state.tts.voices[document.querySelector('select').value]
    emit('tts:speak', {
      text: 'This is some special speaking',
      id: 'special'
    })
  }
}

function speech (state, emitter) {
  emitter.on('DOMContentLoaded', function () {
    emitter.emit('render')
  })
  emitter.once('tts:voices-changed', function () {
    emitter.emit('tts:set-voice', 'Google UK English Female')
  })
  emitter.on('tts:speech-end', function ({ event, id }) {
    window.alert(`speech took ${event.elapsedTime} ms`)
    if (id === 'special') window.alert('Tha was special!')
  })
}

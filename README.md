# choo-tts [![stability][0]][1]
[![npm version][2]][3] [![build status][4]][5]
[![downloads][8]][9] [![js-standard-style][10]][11]

Simple text-to-speech in the browser for choo

## Usage
```js
var choo = require('choo')
var html = require('choo/html')

var app = choo()
app.use(require('choo-tts'))
app.route('/', mainView)
app.mount('body')

function mainView (state, emit) {
  return html`
    <body>
      <button onclick=${onclick}>Say something</button>
    </body>
  `

  function onclick () {
    // speak with default voice
    emit('tts:speak', 'Hello world')
  }
}
```

## Events
### `tts:error` | `tts.events.ERROR`
Emitted when there is an error. It will get the error thrown as argument.

### `tts:speak` | `tts.events.SPEAK`
Emit this event to speak some text. Can get a string and speak it with the 
default settings, or can get an object with rate, pitch and volume settings 
(lang is set in the voice, and the voice to speak is set in the 
`state.selectedVoice`). If you pass an object you can add an additional `id` 
property that can be used to identify this speech for the speech events.

### `tts:pause` | `tts.events.PAUSE`
Emit this event to pause an ongoing speak. If there is no speaking taking place, 
it will do nothing.

### `tts:resume` | `tts.events.RESUME`
Emit this event to resume an ongoing speak. If there is no paused speaking, it 
will do nothing.

### `tts:cancel` | `tts.events.CANCEL`
Emit this event to cancel all qeued speechs.

### `tts:voices-changed` | `tts.events.VOICES_CHANGED`
Set this event to handle every change on the availaible voices.

### `tts:set-voice` | `tts.events.SET_VOICE`
Set the voice you want passing a string with the name of the voice. Use this 
event if you are sure of the name of the voice and that the voice is present in 
the client, otherwise it will throw. If you are unsure of the name, directly 
select the voice object from the `state.tts.voices` array.

### `tts:speech-start` | `tts.events.SPEECH_START`
Emitted when a speech starts. The first argument passed is the event itself. 
This event will be fired with every speech, but you can set this for a specific 
speech, if you set an `id` property to the object passed to the speak event. For 
example,

```js
function speech (state, emitter) {
  emitter.on('tts:speech-start', function (e) {
    console.log('Speech started!')
  })
  emitter.on('tts:speech-start', function (e, id) {
    if (id === 'my-speech') console.log('My speech just started!')
  })
}

// later in yout view
function view (state, emit) {
  return html`<body>
    <button onclick="${regularSpeech}">regular speech</button>
    <button onclick="${customSpeech}">custom speech</button>
  </body>`

  function regularSpeech () {
    emit('tts:speak', 'Just some regular speaking')
  }
  function customSpeech () {
    emit('tts:speak', {
      text: 'This speech is really special!',
      id: 'my-speech'
    })
  }
}
```

### `tts:speech-boundary` | `tts.events.SPEECH_BOUNDARY`
Emitted when a word or sentence boundary is reched during a speech. The first 
argument passed is the event itself. This event will be fired with every 
speech, but you can set this for a specific speech, if you set an `id` 
property to the object passed to the speak event.

### `tts:speech-end` | `tts.events.SPEECH_END`
Emitted when a speech finish being spoken. The first 
argument passed is the event itself. This event will be fired with every 
speech, but you can set this for a specific speech, if you set an `id` 
property to the object passed to the speak event.

## API
### `tts = require('choo-tts')`
Load the plugin and populate a `tts` object to the state.

- `tts.state`: Get the state of text-to-speech object. Can be any of the 
following strings: `PAUSED`, `PENDING`, `SPEAKING` or `READY`.
- `tts.voices`: The list of availaible voices. Notice that this object isn't 
allways populated until the dom has loaded, so you should use it there and re 
render your app if you are using it in the body of your html, check the 
[example](/example.js) for more info.
- `tts.selectedVoice`: The actual voice to be used for the next speaking, 
unless you pass an object to the speak event.
- `tts.rate`: The speed of the utterance to be spoken, can be a value 
from 0.1 to 10, defaults to 1.
- `tts.pitch`: The pitch of the utterance to be spoken, can be a value from 0 
to 2, defaults to 1.
- `tts.volume`: The volume of the utterance to be spoken, can be a value from 0 
to 1, defaults to 0.5.

## License
[MIT](/LICENSE)

[0]: https://img.shields.io/badge/stability-experimental-orange.svg?style=flat-square
[1]: https://nodejs.org/api/documentation.html#documentation_stability_index
[2]: https://img.shields.io/npm/v/choo-tts.svg?style=flat-square
[3]: https://npmjs.org/package/choo-tts
[4]: https://img.shields.io/travis/YerkoPalma/choo-tts/master.svg?style=flat-square
[5]: https://travis-ci.org/YerkoPalma/choo-tts
[6]: https://img.shields.io/codecov/c/github/YerkoPalma/choo-tts/master.svg?style=flat-square
[7]: https://codecov.io/github/YerkoPalma/choo-tts
[8]: http://img.shields.io/npm/dm/choo-tts.svg?style=flat-square
[9]: https://npmjs.org/package/choo-tts
[10]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat-square
[11]: https://github.com/feross/standard
[WebSocket]: https://developer.mozilla.org/en-US/docs/Web/API/WebSocket
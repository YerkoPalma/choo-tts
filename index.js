/* global SpeechSynthesisUtterance */
module.exports = tts

var events = tts.events = {
  SPEAK: 'tts:speak',
  CANCEL: 'tts:cancel',
  PAUSE: 'tts:pause',
  RESUME: 'tts:resume',
  VOICES_CHANGED: 'tts:voices-changed',
  SET_VOICE: 'tts:set-voice',
  SPEECH_START: 'tts:speech-start',
  SPEECH_END: 'tts:speech-end',
  SPEECH_BOUNDARY: 'tts:speech-boundary',
  ERROR: 'tts:error'
}

function tts (state, emitter) {
  var synth = window.speechSynthesis
  try {
    if (!synth) throw new Error('tts:error - speechSynthesis not supported')
    // set default values
    state.tts = {}
    state.tts.pitch = 1
    state.tts.rate = 1
    state.tts.volume = 0.5
    // readonly state
    Object.defineProperty(state.tts, 'state', {
      get: function () {
        // check state
        return synth.paused ? 'PAUSED' : synth.pending ? 'PENDING' : synth.speaking ? 'SPEAKING' : 'READY'
      }
    })
    setTimeout(function () {
      state.tts.voices = synth.getVoices()
      state.tts.selectedVoice = state.tts.voices.filter(voice => voice.default)[0]
    }, 0)
    emitter.on(events.SPEAK, speech => {
      var utterance = null
      var speechId
      // if a string is passed, use values from the state
      if (typeof speech === 'string') {
        utterance = new SpeechSynthesisUtterance(speech)
        utterance.voice = state.tts.selectedVoice
        utterance.pitch = state.tts.pitch
        utterance.rate = state.tts.rate
        utterance.volume = state.tts.volume
      } else if (typeof speech === 'object') {
        var opts = Object.assign(state.tts, speech)
        utterance = new SpeechSynthesisUtterance(speech.text)
        utterance.voice = state.tts.selectedVoice
        utterance.pitch = opts.pitch
        utterance.rate = opts.rate
        utterance.volume = opts.volume
        speechId = opts.id
      }
      synth.speak(utterance)
      utterance.onstart = function (event) {
        emitter.emit(events.SPEECH_START, event, speechId)
      }
      utterance.onend = function (event) {
        emitter.emit(events.SPEECH_END, event, speechId)
      }
      utterance.onboundary = function (event) {
        emitter.emit(events.SPEECH_BOUNDARY, event, speechId)
      }
    })
    emitter.on(events.CANCEL, synth.cancel)
    emitter.on(events.PAUSE, synth.pause)
    emitter.on(events.RESUME, synth.resume)
    synth.onvoiceschanged = function () {
      state.tts.voices = synth.getVoices()
      emitter.emit(events.VOICES_CHANGED)
    }
    emitter.on(events.SET_VOICE, voiceName => {
      if (!state.tts.voices) throw new Error('tts: Voices array no set yet, can\'t set voice')
      var voice = state.tts.voices.filter(v => {
        return v.name === voiceName
      })[0]
      if (!voice) throw new Error('tts: Voice ' + voiceName + ' not found')
      state.tts.selectedVoice = voice
    })
  } catch (e) {
    emitter.emit(events.ERROR, e)
  }
}

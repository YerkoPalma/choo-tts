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

function tts (opts) {
  opts = opts || {}
  return function (state, emitter) {
    var synth = window.speechSynthesis
    try {
      if (!synth) throw new Error('tts:error - speechSynthesis not supported')
      // set default values
      state.tts = {}
      state.tts.pitch = opts.pitch || 1
      state.tts.rate = opts.rate || 1
      state.tts.volume = opts.volume || 0.5
      // readonly state
      Object.defineProperty(state.tts, 'state', {
        get: function () {
          // check state
          return synth.paused ? 'PAUSED' : synth.pending ? 'PENDING' : synth.speaking ? 'SPEAKING' : 'READY'
        }
      })
      Object.defineProperty(state.tts, 'voices', {
        get: function () {
          return synth.getVoices()
        }
      })
      state.tts.selectedVoice = state.tts.voices.filter(voice => opts.voice ? voice.name === opts.voice : voice.default)[0]
      // if the voice name defined in options wasn't found
      state.tts.selectedVoice = state.tts.selectedVoice || state.tts.voices.filter(voice => voice.default)[0]

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
          var customOpts = Object.assign(state.tts, speech)
          utterance = new SpeechSynthesisUtterance(speech.text)
          utterance.voice = state.tts.selectedVoice
          utterance.pitch = customOpts.pitch
          utterance.rate = customOpts.rate
          utterance.volume = customOpts.volume
          speechId = customOpts.id
        }
        synth.speak(utterance)
        utterance.onstart = function (event) {
          emitter.emit(events.SPEECH_START, { event, id: speechId })
        }
        utterance.onend = function (event) {
          emitter.emit(events.SPEECH_END, { event, id: speechId })
        }
        utterance.onboundary = function (event) {
          emitter.emit(events.SPEECH_BOUNDARY, { event, id: speechId })
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
}

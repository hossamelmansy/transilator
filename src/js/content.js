import Amplify from 'aws-amplify'
import Predictions, {
  AmazonAIPredictionsProvider,
} from '@aws-amplify/predictions'

import awsmobile from '../aws-exports'

const voices = {
  ar: 'Zeina',
  zh: 'Zhiyu',
  da: 'Naja',
  nl: 'Lotte',
  en: 'Salli',
  fr: 'Chantal',
  hi: 'Aditi',
  it: 'Carla',
  ja: 'Mizuki',
  ko: 'Seoyeon',
  no: 'Liv',
  pl: 'Ewa',
  pt: 'Vitoria',
  ru: 'Tatyana',
  es: 'Penelope',
  sv: 'Astrid',
  tr: 'Filiz',
}

const state = {
  language: 'en',
  getLanguage() {
    return this.language
  },
  setLanguage(language) {
    this.language = language
  },
}

// configure AWS Amplify
Amplify.configure(awsmobile)
Amplify.addPluggable(new AmazonAIPredictionsProvider())

let source = null

// recieve language change from popup.js
chrome.runtime.onMessage.addListener(function (request, sender) {
  if (!sender) return
  state.setLanguage(request.language)
  return true
})

// interpret, translate and synthetize on mouse up
document.addEventListener('mouseup', function translator() {
  let text = ''
  if (window.getSelection) {
    text = window.getSelection().toString()
  } else if (document.selection && document.selection.type != 'Control') {
    text = document.selection.createRange().text
  }
  if (text === '') return
  interpretText(text)
})

// ####################################################################

// interprets the language of the selected text
async function interpretText(text) {
  try {
    const result = await Predictions.interpret({
      text: { source: { text }, type: 'ALL' },
    })

    const language = result.textInterpretation.language // get interpreted text language
    const selectedLanguage = state.getLanguage() // get current selected langauge

    translate(text, language, selectedLanguage)
  } catch (err) {
    console.error('error interpreting language: ', err)
  }
}

// translate selected text into the langauge selected by user
async function translate(text, language, targetLanguage) {
  try {
    const result = await Predictions.convert({
      translateText: {
        source: { text, language },
        targetLanguage,
      },
    })

    convertTextToSpeech(result.text, targetLanguage)
  } catch (err) {
    console.error('error translating text: ', err)
  }
}

// synthesize text into natural speech
async function convertTextToSpeech(text, language) {
  try {
    const voice = voices[language]
    console.log(voice)
    const result = await Predictions.convert({
      textToSpeech: {
        source: { text },
        voiceId: voice,
      },
    })

    // play audio
    await playAudio(result.audioStream)
  } catch (err) {
    console.error('error synthesizing speech: ', err)
  }
}

// play audio from stream
async function playAudio(audioStream) {
  let AudioContext = window.AudioContext || window.webkitAudioContext
  const audioCtx = new AudioContext()
  if (source) source.disconnect()

  source = audioCtx.createBufferSource()
  try {
    const buffer = await audioCtx.decodeAudioData(audioStream)
    source.buffer = buffer
    source.playbackRate.value = 1
    source.connect(audioCtx.destination)
    source.start(0)
  } catch (err) {
    console.error('error playing audio: ', err)
  }
}

export { state }

'use client'
import { useEffect, useRef, useState, useCallback } from 'react'

export type VoiceState = 'idle' | 'listening' | 'processing' | 'error'

export interface UseVoiceInputOptions {
  /** Called with the final committed transcript each time a phrase completes */
  onFinalTranscript?: (text: string) => void
  /** Language tag, e.g. 'en-US'. Defaults to browser locale. */
  lang?: string
}

export interface UseVoiceInputReturn {
  /** Whether SpeechRecognition is available in this browser */
  supported: boolean
  state: VoiceState
  /** Live interim text while the user is still speaking */
  interimText: string
  /** Start listening */
  start: () => void
  /** Stop listening immediately */
  stop: () => void
  /** Toggle between listening and idle */
  toggle: () => void
  errorMessage: string | null
}

export function useVoiceInput(opts: UseVoiceInputOptions = {}): UseVoiceInputReturn {
  const { onFinalTranscript, lang } = opts

  const [state, setState]           = useState<VoiceState>('idle')
  const [interimText, setInterimText] = useState('')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const recogRef = useRef<SpeechRecognition | null>(null)
  const stoppedRef = useRef(false) // true when the user explicitly stopped

  // Detect support (client-side only)
  const [supported, setSupported] = useState(false)
  useEffect(() => {
    const has =
      typeof window !== 'undefined' &&
      ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)
    setSupported(has)
  }, [])

  const buildRecognition = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition
    if (!SpeechRecognitionCtor) return null

    const recog: SpeechRecognition = new SpeechRecognitionCtor()
    recog.continuous      = true   // keep listening until explicitly stopped
    recog.interimResults  = true   // show live text as user speaks
    recog.maxAlternatives = 1
    if (lang) recog.lang  = lang

    recog.onstart = () => {
      stoppedRef.current = false
      setState('listening')
      setInterimText('')
      setErrorMessage(null)
    }

    recog.onresult = (event: SpeechRecognitionEvent) => {
      let interim = ''
      let finalChunk = ''

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript
        } else {
          interim += result[0].transcript
        }
      }

      setInterimText(interim)

      if (finalChunk.trim()) {
        onFinalTranscript?.(finalChunk.trim())
      }
    }

    recog.onerror = (event: SpeechRecognitionErrorEvent) => {
      const msg: Record<string, string> = {
        'not-allowed':   'Microphone access denied. Allow it in your browser settings.',
        'no-speech':     'No speech detected. Try again.',
        'network':       'Network error during recognition.',
        'audio-capture': 'No microphone found.',
        'aborted':       '', // user stopped — silent
      }
      const friendly = msg[event.error] ?? `Voice error: ${event.error}`
      if (friendly) {
        setErrorMessage(friendly)
        setState('error')
      } else {
        setState('idle')
      }
      setInterimText('')
    }

    recog.onend = () => {
      setInterimText('')
      // If the user didn't explicitly stop and recognition just paused
      // (e.g. long silence), restart it so it stays listening.
      if (!stoppedRef.current && state === 'listening') {
        try { recog.start() } catch {}
      } else {
        setState('idle')
      }
    }

    return recog
  }, [lang, onFinalTranscript, state])

  const start = useCallback(() => {
    if (!supported) return
    stoppedRef.current = false
    try {
      recogRef.current?.abort()
      const recog = buildRecognition()
      if (!recog) return
      recogRef.current = recog
      recog.start()
    } catch (e) {
      setState('error')
      setErrorMessage('Could not start microphone.')
    }
  }, [supported, buildRecognition])

  const stop = useCallback(() => {
    stoppedRef.current = true
    setInterimText('')
    setState('idle')
    try { recogRef.current?.stop() } catch {}
  }, [])

  const toggle = useCallback(() => {
    if (state === 'listening') stop()
    else start()
  }, [state, start, stop])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stoppedRef.current = true
      try { recogRef.current?.abort() } catch {}
    }
  }, [])

  return { supported, state, interimText, start, stop, toggle, errorMessage }
}

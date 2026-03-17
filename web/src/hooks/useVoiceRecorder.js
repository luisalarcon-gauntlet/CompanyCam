import { useState, useRef, useCallback, useEffect } from 'react'

const SILENCE_TIMEOUT_MS = 5000   // auto-stop after 5s of silence
const MIN_DURATION_MS = 500       // recordings shorter than this are rejected

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false)
  const [error, setError] = useState(null)      // 'permission' | 'too_short' | 'unavailable' | null

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const silenceTimerRef = useRef(null)
  const startTimeRef = useRef(null)
  const stopRecordingRef = useRef(null)

  const clearSilenceTimer = () => {
    if (silenceTimerRef.current) {
      clearTimeout(silenceTimerRef.current)
      silenceTimerRef.current = null
    }
  }

  const startRecording = useCallback(async () => {
    setError(null)
    chunksRef.current = []

    // Check browser support
    if (!navigator.mediaDevices?.getUserMedia) {
      setError('unavailable')
      return false
    }

    let stream
    try {
      stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    } catch (err) {
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('permission')
      } else {
        setError('unavailable')
      }
      return false
    }

    // Pick the best supported format
    const mimeType = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
    ].find(type => MediaRecorder.isTypeSupported(type)) || ''

    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : {})
    mediaRecorderRef.current = recorder

    recorder.ondataavailable = (e) => {
      if (e.data?.size > 0) chunksRef.current.push(e.data)
    }

    recorder.start(100)   // collect chunks every 100ms
    startTimeRef.current = Date.now()
    setIsRecording(true)

    // Auto-stop after silence timeout (call via ref to avoid use-before-declare)
    silenceTimerRef.current = setTimeout(() => {
      if (mediaRecorderRef.current?.state === 'recording') {
        stopRecordingRef.current?.()
      }
    }, SILENCE_TIMEOUT_MS)

    return true
  }, [])

  const stopRecording = useCallback(() => {
    return new Promise((resolve) => {
      clearSilenceTimer()

      const recorder = mediaRecorderRef.current
      if (!recorder || recorder.state === 'inactive') {
        setIsRecording(false)
        resolve(null)
        return
      }

      recorder.onstop = () => {
        // Stop all tracks
        recorder.stream.getTracks().forEach(t => t.stop())
        setIsRecording(false)

        const duration = Date.now() - (startTimeRef.current || Date.now())
        if (duration < MIN_DURATION_MS || chunksRef.current.length === 0) {
          setError('too_short')
          resolve(null)
          return
        }

        const blob = new Blob(chunksRef.current, {
          type: recorder.mimeType || 'audio/webm',
        })

        // Derive audio format from MIME type
        const format = deriveFormat(recorder.mimeType)
        resolve({ blob, format })
      }

      recorder.stop()
    })
  }, [])

  useEffect(() => {
    stopRecordingRef.current = stopRecording
  }, [stopRecording])

  const cancelRecording = useCallback(() => {
    clearSilenceTimer()
    const recorder = mediaRecorderRef.current
    if (recorder && recorder.state !== 'inactive') {
      recorder.stream.getTracks().forEach(t => t.stop())
      recorder.stop()
    }
    setIsRecording(false)
    setError(null)
    chunksRef.current = []
  }, [])

  const resetError = useCallback(() => setError(null), [])

  return {
    isRecording,
    error,
    startRecording,
    stopRecording,
    cancelRecording,
    resetError,
  }
}

function deriveFormat(mimeType) {
  if (!mimeType) return 'webm'
  if (mimeType.includes('webm')) return 'webm'
  if (mimeType.includes('ogg'))  return 'ogg'
  if (mimeType.includes('mp4'))  return 'mp4'
  return 'webm'
}

/**
 * Converts a Blob to a base64 string (without the data: URI prefix).
 */
export async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const dataUrl = reader.result
      const base64 = dataUrl.split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}

/**
 * Converts a File or Blob to a base64 string for image uploads.
 */
export async function fileToBase64(file) {
  return blobToBase64(file)
}

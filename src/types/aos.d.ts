declare module 'aos' {
  type AOSOptions = {
    duration?: number
    easing?: string
    once?: boolean
    offset?: number
    delay?: number
    disable?: boolean | string | (() => boolean)
  }

  const AOS: {
    init: (options?: AOSOptions) => void
    refresh: () => void
    refreshHard: () => void
  }

  export default AOS
}
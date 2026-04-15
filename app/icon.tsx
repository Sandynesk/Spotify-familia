import { ImageResponse } from 'next/og'

// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'transparent',
        }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="#1DB954"
          width="32"
          height="32"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.5 17.3c-.2.3-.6.4-.9.2-2.8-1.7-6.2-2.1-10.3-1.1-.4.1-.7-.1-.8-.5s.1-.7.5-.8c4.5-1 8.2-.6 11.3 1.3.3.2.4.6.2.9zm1.5-3.3c-.3.4-.8.6-1.2.3-3.2-2-8.1-2.6-11.9-1.4-.5.2-1-.1-1.1-.6-.2-.5.1-1 .6-1.1 4.3-1.3 9.7-.7 13.3 1.5.4.3.5.9.3 1.3zM19.1 10.1C15.2 7.8 8.8 7.6 5.1 8.7c-.6.2-1.2-.2-1.4-.7-.2-.6.2-1.2.7-1.4 4.3-1.3 11.3-1.1 15.8 1.6.5.3.7 1 .4 1.5-.2.5-.9.7-1.5.4z" />
        </svg>
      </div>
    ),
    { ...size }
  )
}

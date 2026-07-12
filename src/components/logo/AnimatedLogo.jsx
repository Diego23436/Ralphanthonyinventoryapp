import React from 'react'
import logo from '../../assets/logo-transparent.png'

export default function AnimatedLogo({ size = 220 }) {
  return (
    <div className="flex items-center justify-center" style={{ width: size }}>
      <img
        src={logo}
        alt="Ralph Anthony"
        className="h-auto w-full select-none"
        draggable={false}
      />
    </div>
  )
}

import React from 'react'
import logo from '../../assets/logo-transparent.png'

export default function BrandMark({ size = 68, label = 'Ralph Anthony', className = '' }) {
  return (
    <div className={`inline-flex items-center ${className}`}>
      <img
        src={logo}
        alt={label}
        className="h-auto select-none object-contain"
        style={{ width: size * 3 }}
        draggable={false}
      />
    </div>
  )
}

import React from 'react'

function CtrlBtn({ label, onClick, title }) {
  return (
    <button
      title={title}
      onClick={onClick}
      style={{
        width: '30px', height: '30px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg-elevated)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-sm)',
        color: 'var(--text-secondary)',
        fontSize: '14px',
        transition: 'all .15s',
      }}
      onMouseOver={e => { e.currentTarget.style.color='var(--text-primary)'; e.currentTarget.style.borderColor='var(--border-bright)'; }}
      onMouseOut={e  => { e.currentTarget.style.color='var(--text-secondary)'; e.currentTarget.style.borderColor='var(--border)'; }}
    >
      {label}
    </button>
  )
}

export default function GraphControls({ onZoomIn, onZoomOut, onReset, onClear, pathStart, pathEnd, onClearPath }) {
  return (
    <div style={{
      position: 'absolute',
      bottom: '20px',
      right: '20px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      zIndex: 10,
    }}>
      <CtrlBtn label="+" onClick={onZoomIn}  title="Zoom in" />
      <CtrlBtn label="−" onClick={onZoomOut} title="Zoom out" />
      <CtrlBtn label="⊙" onClick={onReset}   title="Reset zoom" />
      <div style={{ height: '1px', background: 'var(--border)', margin: '2px 0' }} />
      <CtrlBtn label="✕" onClick={onClear}   title="Clear selection" />
      {(pathStart || pathEnd) && (
        <CtrlBtn label="🛤️" onClick={onClearPath} title="Clear path selection" />
      )}
    </div>
  )
}

import React, { useEffect, useRef, useCallback } from 'react'
import * as d3 from 'd3'
import { TYPE_CONFIG } from '../data/typeConfig'
import GraphControls from './GraphControls'

export default function DependencyGraph({ nodes, links, selected, onSelect, filterType, pathStart, pathEnd, onClearPath }) {
  const svgRef     = useRef()
  const zoomRef    = useRef()
  const zoomGRef   = useRef()
  const simRef     = useRef()

  const handleZoomIn  = useCallback(() => {
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 1.4)
  }, [])
  const handleZoomOut = useCallback(() => {
    d3.select(svgRef.current).transition().duration(300).call(zoomRef.current.scaleBy, 0.7)
  }, [])
  const handleReset   = useCallback(() => {
    d3.select(svgRef.current).transition().duration(400).call(zoomRef.current.transform, d3.zoomIdentity)
  }, [])
  const handleClear   = useCallback(() => onSelect(null), [onSelect])

  useEffect(() => {
    if (!nodes.length) return

    const container = svgRef.current.parentElement
    const W = container.clientWidth
    const H = container.clientHeight

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()
    svg.attr('width', W).attr('height', H)

    // Filter nodes and links
    const filteredNodes = filterType ? nodes.filter(n => n.type === filterType) : nodes
    const filteredLinks = links.filter(l => {
      const sourceId = l.source?.id || l.source
      const targetId = l.target?.id || l.target
      return filteredNodes.some(n => n.id === sourceId) && filteredNodes.some(n => n.id === targetId)
    })

    // Zoom behaviour
    const zoom = d3.zoom().scaleExtent([0.2, 4]).on('zoom', e => {
      zoomG.attr('transform', e.transform)
    })
    zoomRef.current = zoom
    svg.call(zoom)

    const zoomG = svg.append('g')
    zoomGRef.current = zoomG

    // Arrow marker with animation
    const defs = svg.append('defs')
    defs.append('marker')
      .attr('id', 'arrow')
      .attr('viewBox', '0 0 10 10').attr('refX', 28).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M2 2L8 5L2 8')
      .attr('fill', 'none').attr('stroke', '#4a4f68').attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')

    // Animated dash pattern for flow
    defs.append('marker')
      .attr('id', 'arrow-animated')
      .attr('viewBox', '0 0 10 10').attr('refX', 28).attr('refY', 5)
      .attr('markerWidth', 6).attr('markerHeight', 6)
      .attr('orient', 'auto-start-reverse')
      .append('path').attr('d', 'M2 2L8 5L2 8')
      .attr('fill', 'none').attr('stroke', '#4a4f68').attr('stroke-width', 1.5)
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')
      .attr('stroke-dasharray', '3,3')
      .style('animation', 'flow 2s linear infinite')

    // Add CSS animation
    defs.append('style').text(`
      @keyframes flow {
        0% { stroke-dashoffset: 6; }
        100% { stroke-dashoffset: 0; }
      }
    `)

    // Clone data to avoid mutation
    const simNodes = filteredNodes.map(d => ({ ...d }))
    const simLinks = filteredLinks.map(d => ({ ...d }))

    // Simulation
    const sim = d3.forceSimulation(simNodes)
      .force('link',      d3.forceLink(simLinks).id(d => d.id).distance(130))
      .force('charge',    d3.forceManyBody().strength(-500))
      .force('center',    d3.forceCenter(W / 2, H / 2))
      .force('collision', d3.forceCollide(42))
    simRef.current = sim

    // Links
    const linkEls = zoomG.append('g').selectAll('line')
      .data(simLinks).join('line')
      .attr('stroke', '#2a2f48')
      .attr('stroke-width', 1.5)
      .attr('marker-end', 'url(#arrow)')
      .on('mouseover', function(e, d) {
        d3.select(this).attr('stroke-width', 3).attr('stroke', '#5b8df6')
      })
      .on('mouseout', function(e, d) {
        d3.select(this).attr('stroke-width', 1.5).attr('stroke', '#2a2f48')
      })

    // Node groups
    const nodeG = zoomG.append('g').selectAll('g')
      .data(simNodes).join('g')
      .attr('cursor', 'pointer')
      .call(
        d3.drag()
          .on('start', (e, d) => { if (!e.active) sim.alphaTarget(0.3).restart(); d.fx = d.x; d.fy = d.y })
          .on('drag',  (e, d) => { d.fx = e.x; d.fy = e.y })
          .on('end',   (e, d) => { if (!e.active) sim.alphaTarget(0); d.fx = null; d.fy = null })
      )
      .on('click', (e, d) => { e.stopPropagation(); onSelect(d) })
      .on('mouseover', function(e, d) {
        // Highlight related nodes and links
        const relatedIds = new Set([d.id])
        simLinks.forEach(l => {
          const s = l.source?.id || l.source
          const t = l.target?.id || l.target
          if (s === d.id) relatedIds.add(t)
          if (t === d.id) relatedIds.add(s)
        })

        zoomG.selectAll('line')
          .attr('opacity', l => {
            const s = l.source?.id || l.source
            const t = l.target?.id || l.target
            return (s === d.id || t === d.id) ? 1 : 0.1
          })
          .attr('stroke-width', l => {
            const s = l.source?.id || l.source
            const t = l.target?.id || l.target
            return (s === d.id || t === d.id) ? 3 : 1.5
          })

        zoomG.selectAll('.main-circle')
          .attr('opacity', n => relatedIds.has(n.id) ? 1 : 0.15)

        zoomG.selectAll('.glow-ring')
          .attr('opacity', n => n.id === d.id ? 0.5 : 0)
      })
      .on('mouseout', function(e, d) {
        // Reset if not selected
        if (selected?.id !== d.id) {
          zoomG.selectAll('line')
            .attr('opacity', 1)
            .attr('stroke-width', 1.5)
          zoomG.selectAll('.main-circle')
            .attr('opacity', 1)
          zoomG.selectAll('.glow-ring')
            .attr('opacity', 0)
        }
      })

    // Glow rings (invisible by default)
    nodeG.append('circle')
      .attr('class', 'glow-ring')
      .attr('r', d => (TYPE_CONFIG[d.type]?.radius || 16) + 8)
      .attr('fill', 'none')
      .attr('stroke', d => TYPE_CONFIG[d.type]?.color || '#5b8df6')
      .attr('stroke-width', 1)
      .attr('opacity', 0)

    // Main circles
    nodeG.append('circle')
      .attr('class', 'main-circle')
      .attr('r',      d => TYPE_CONFIG[d.type]?.radius || 16)
      .attr('fill',   d => (TYPE_CONFIG[d.type]?.color || '#5b8df6') + '22')
      .attr('stroke', d => TYPE_CONFIG[d.type]?.color || '#5b8df6')
      .attr('stroke-width', 1.5)

    // Icons
    nodeG.append('text')
      .attr('class', 'node-icon')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', d => (TYPE_CONFIG[d.type]?.radius || 16) * 0.6)
      .attr('fill', d => TYPE_CONFIG[d.type]?.color || '#5b8df6')
      .text(d => TYPE_CONFIG[d.type]?.icon || '📄')

    // Labels
    nodeG.append('text')
      .attr('class', 'node-label')
      .attr('text-anchor', 'middle')
      .attr('dy', d => (TYPE_CONFIG[d.type]?.radius || 16) + 16)
      .attr('font-size', '10px')
      .attr('font-family', 'var(--font-mono)')
      .attr('fill', '#6b7094')
      .text(d => d.id.replace('.js', ''))

    // Click on background to deselect
    svg.on('click', () => onSelect(null))

    // Tick
    sim.on('tick', () => {
      linkEls
        .attr('x1', d => d.source.x).attr('y1', d => d.source.y)
        .attr('x2', d => d.target.x).attr('y2', d => d.target.y)
      nodeG.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => sim.stop()
  }, [nodes, links])

  // Highlight effect when selected changes
  useEffect(() => {
    if (!svgRef.current || !zoomGRef.current) return
    const svg    = d3.select(svgRef.current)
    const zoomG  = zoomGRef.current

    if (!selected && !pathStart && !pathEnd) {
      // Reset all
      zoomG.selectAll('line')
        .attr('stroke', '#2a2f48').attr('stroke-width', 1.5).attr('opacity', 1)
      zoomG.selectAll('.main-circle')
        .attr('opacity', 1).attr('stroke-width', 1.5)
      zoomG.selectAll('.glow-ring').attr('opacity', 0)
      zoomG.selectAll('.node-label').attr('fill', '#6b7094').attr('opacity', 1)
      return
    }

    // Path highlighting
    if (pathStart && pathEnd) {
      const pathLinks = links.filter(l => {
        const s = l.source?.id || l.source
        const t = l.target?.id || l.target
        return (s === pathStart.id && t === pathEnd.id) || (s === pathEnd.id && t === pathStart.id)
      })
      const pathNodes = new Set([pathStart.id, pathEnd.id])

      zoomG.selectAll('line')
        .attr('stroke', l => pathLinks.some(pl => (pl.source?.id || pl.source) === (l.source?.id || l.source) && (pl.target?.id || pl.target) === (l.target?.id || l.target)) ? '#ff6b6b' : '#1a1d2e')
        .attr('stroke-width', l => pathLinks.some(pl => (pl.source?.id || pl.source) === (l.source?.id || l.source) && (pl.target?.id || pl.target) === (l.target?.id || l.target)) ? 4 : 1)
        .attr('opacity', l => pathLinks.some(pl => (pl.source?.id || pl.source) === (l.source?.id || l.source) && (pl.target?.id || pl.target) === (l.target?.id || l.target)) ? 1 : 0.1)

      zoomG.selectAll('.main-circle')
        .attr('opacity', d => pathNodes.has(d.id) ? 1 : 0.15)
        .attr('stroke-width', d => pathNodes.has(d.id) ? 3 : 1.5)

      zoomG.selectAll('.glow-ring')
        .attr('opacity', d => pathNodes.has(d.id) ? 0.7 : 0)

      zoomG.selectAll('.node-label')
        .attr('fill', d => pathNodes.has(d.id) ? 'var(--text-primary)' : '#2a2f48')
        .attr('opacity', d => pathNodes.has(d.id) ? 1 : 0.3)
      return
    }

    // Single selection highlighting
    const selId  = selected.id
    const depIds = links.filter(l => (l.source?.id||l.source)===selId).map(l => l.target?.id||l.target)
    const impIds = links.filter(l => (l.target?.id||l.target)===selId).map(l => l.source?.id||l.source)
    const related = new Set([selId, ...depIds, ...impIds])

    // Links
    zoomG.selectAll('line')
      .attr('stroke', l => {
        const s = l.source?.id||l.source, t = l.target?.id||l.target
        if (s===selId) return TYPE_CONFIG[selected.type]?.color || '#5b8df6'
        if (t===selId) return '#4a4f68'
        return '#1a1d2e'
      })
      .attr('stroke-width', l => {
        const s = l.source?.id||l.source, t = l.target?.id||l.target
        return (s===selId||t===selId) ? 2 : 1
      })
      .attr('opacity', l => {
        const s = l.source?.id||l.source, t = l.target?.id||l.target
        return (s===selId||t===selId) ? 1 : 0.1
      })

    // Nodes
    zoomG.selectAll('.main-circle')
      .attr('opacity',      d => related.has(d.id) ? 1 : 0.15)
      .attr('stroke-width', d => d.id === selId ? 2.5 : 1.5)

    zoomG.selectAll('.glow-ring')
      .attr('opacity', d => d.id === selId ? 0.5 : 0)

    zoomG.selectAll('.node-label')
      .attr('fill',    d => d.id === selId ? 'var(--text-primary)' : related.has(d.id) ? '#6b7094' : '#2a2f48')
      .attr('opacity', d => related.has(d.id) ? 1 : 0.3)

  }, [selected, links, pathStart, pathEnd])

  return (
    <div style={{ flex: 1, position: 'relative', background: 'var(--bg-base)', overflow: 'hidden' }}>
      {/* Grid background */}
      <svg style={{ position:'absolute', inset:0, width:'100%', height:'100%', opacity:.35, pointerEvents:'none' }}>
        <defs>
          <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
            <path d="M 32 0 L 0 0 0 32" fill="none" stroke="#1e2235" strokeWidth="0.5"/>
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />
      </svg>

      {/* D3 canvas */}
      <svg ref={svgRef} style={{ position:'absolute', inset:0, width:'100%', height:'100%' }} />

      <GraphControls
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onReset={handleReset}
        onClear={handleClear}
        pathStart={pathStart}
        pathEnd={pathEnd}
        onClearPath={onClearPath}
      />
    </div>
  )
}

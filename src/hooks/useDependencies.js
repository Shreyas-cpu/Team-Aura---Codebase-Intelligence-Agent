import { useState, useEffect } from 'react'
import { mockNodes, mockLinks } from '../data/mockData'

// Set to true to use real API, false to use mock data
const USE_API = false

export function useDependencies() {
  const [nodes, setNodes]   = useState([])
  const [links, setLinks]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState(null)

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true)
        setError(null)

        if (USE_API) {
          const res = await fetch('/api/m3/dependencies')
          if (!res.ok) throw new Error(`Server error: ${res.status}`)
          const { nodes: n, links: l } = await res.json()
          setNodes(n)
          setLinks(l)
        } else {
          // Simulate network delay for realistic feel
          await new Promise(r => setTimeout(r, 800))
          setNodes(mockNodes)
          setLinks(mockLinks)
        }
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const refetch = () => {
    setNodes([])
    setLinks([])
    setLoading(true)
    setError(null)
  }

  return { nodes, links, loading, error, refetch }
}

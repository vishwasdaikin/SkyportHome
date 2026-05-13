import { useMemo } from 'react'
import { useLocation } from 'react-router-dom'
import './Demos.css'

export default function DemosSkyportHomeConcept() {
  const { search } = useLocation()
  const iframeSrc = useMemo(() => {
    const base = '/demos/SkyportHomeConceptDemo.html'
    return search ? `${base}${search}` : base
  }, [search])

  return (
    <iframe
      src={iframeSrc}
      title="SkyportHome"
      className="demos-iframe demos-iframe--skyport-home-app"
    />
  )
}

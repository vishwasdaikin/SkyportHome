import { describe, it, expect } from 'vitest'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import Layout from './Layout'

function renderNav(initialPath = '/') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Layout>
        <div>page</div>
      </Layout>
    </MemoryRouter>
  )
}

describe('Layout top nav', () => {
  it('exposes main navigation landmark', () => {
    renderNav()
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument()
  })

  it('includes primary app links with correct targets', () => {
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('link', { name: 'SkyportHome' })).toHaveAttribute(
      'href',
      '/apps/skyport-home'
    )
    expect(within(nav).getByRole('link', { name: 'SkyportCare' })).toHaveAttribute(
      'href',
      '/apps/skyport-care'
    )
    expect(within(nav).getByRole('link', { name: 'SkyportEnergy' })).toHaveAttribute(
      'href',
      '/apps/skyport-energy'
    )
    expect(within(nav).getByRole('link', { name: 'Demos' })).toHaveAttribute('href', '/demos')
    expect(within(nav).getByRole('link', { name: 'Test' })).toHaveAttribute('href', '/test')
    expect(within(nav).getByRole('link', { name: 'Image' })).toHaveAttribute('href', '/image')
  })

  it('opens Strategy menu and lists section links', async () => {
    const user = userEvent.setup()
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    await user.click(within(nav).getByRole('button', { name: /strategy/i }))

    expect(screen.getByRole('link', { name: 'FY25' })).toHaveAttribute('href', '/strategy/fy25')
    expect(screen.getByRole('link', { name: 'FY26' })).toHaveAttribute('href', '/strategy/fy26')
    expect(screen.getByRole('link', { name: 'Operating Playbook' })).toHaveAttribute(
      'href',
      '/strategy/operating/overview'
    )
  })
})

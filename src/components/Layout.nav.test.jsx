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

  it('includes App Suite menu and main links', () => {
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    expect(within(nav).getByRole('link', { name: 'Home' })).toHaveAttribute('href', '/')
    expect(within(nav).getByRole('button', { name: /app suite/i })).toBeInTheDocument()
  })

  it('opens App Suite menu with Apps Overview and product links', async () => {
    const user = userEvent.setup()
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    await user.click(within(nav).getByRole('button', { name: /app suite/i }))

    expect(screen.getByRole('link', { name: 'Apps Overview' })).toHaveAttribute('href', '/apps')
    expect(screen.getByRole('link', { name: 'SkyportHome' })).toHaveAttribute('href', '/apps/skyport-home')
    expect(screen.getByRole('link', { name: 'SkyportCare' })).toHaveAttribute('href', '/apps/skyport-care')
    expect(screen.getByRole('link', { name: 'SkyportEnergy' })).toHaveAttribute('href', '/apps/skyport-energy')
  })

  it('opens Strategy menu and lists section links', async () => {
    const user = userEvent.setup()
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })

    await user.click(within(nav).getByRole('button', { name: /strategy/i }))

    expect(screen.getByRole('link', { name: 'All strategy' })).toHaveAttribute('href', '/strategy')
    expect(screen.getByRole('link', { name: 'FY26 · Digital Apps & Services' })).toHaveAttribute(
      'href',
      '/strategy/fy26/digital-platform'
    )
    expect(screen.getByRole('link', { name: 'FY26 · HCM' })).toHaveAttribute('href', '/strategy/fy26/hcm')
    expect(screen.getByRole('link', { name: 'FY26 · Digital Tools' })).toHaveAttribute(
      'href',
      '/strategy/fy26/digital-tools-services'
    )
    expect(screen.getByRole('link', { name: 'Digital Strategy Principles' })).toHaveAttribute(
      'href',
      '/strategy/operating/overview'
    )
  })

  it('shows FY26 playbook tabs (Digital Apps, HCM, Digital Tools) when on an FY26 section', () => {
    renderNav('/strategy/fy26/digital-platform')
    const sub = screen.getByRole('navigation', { name: 'FY26 playbook' })
    expect(within(sub).getByRole('link', { name: 'Digital Apps & Services' })).toHaveAttribute(
      'href',
      '/strategy/fy26/digital-platform'
    )
    expect(within(sub).getByRole('link', { name: 'HCM' })).toHaveAttribute('href', '/strategy/fy26/hcm')
    expect(within(sub).getByRole('link', { name: 'Digital Tools' })).toHaveAttribute(
      'href',
      '/strategy/fy26/digital-tools-services'
    )
  })

  it('hides site header and FY26 playbook tabs on FY26 HCM only', () => {
    renderNav('/strategy/fy26/hcm')
    expect(screen.queryByRole('navigation', { name: 'Main' })).not.toBeInTheDocument()
    expect(screen.queryByRole('navigation', { name: 'FY26 playbook' })).not.toBeInTheDocument()
  })

})

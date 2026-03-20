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
    expect(screen.getByRole('link', { name: 'FY26' })).toHaveAttribute('href', '/strategy/fy26')
    expect(screen.getByRole('link', { name: 'Operating Playbook' })).toHaveAttribute(
      'href',
      '/strategy/operating/overview'
    )
  })

  it('includes FY26 playbook section links in Strategy flyout (same as page dropdown)', async () => {
    const user = userEvent.setup()
    renderNav()
    const nav = screen.getByRole('navigation', { name: 'Main' })
    await user.click(within(nav).getByRole('button', { name: /strategy/i }))

    expect(
      screen.getByRole('menuitem', { name: 'Res Solutions', hidden: true })
    ).toHaveAttribute('href', '/strategy/fy26/res-solutions')
    expect(
      screen.getByRole('menuitem', { name: 'Digital Platform', hidden: true })
    ).toHaveAttribute('href', '/strategy/fy26/digital-platform')
    expect(screen.getByRole('menu', { name: 'FY26 playbook sections', hidden: true })).toBeInTheDocument()
  })
})

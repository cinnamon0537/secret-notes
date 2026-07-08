import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import App from '../src/App'

const mockGetFeatureFlag = vi.hoisted(() => vi.fn(() => 'control'))

vi.mock('../src/posthog', () => ({
  getFeatureFlag: mockGetFeatureFlag,
  identifyUser: vi.fn(),
  captureEvent: vi.fn(),
  reloadFlags: vi.fn((cb) => cb()),
  onFeatureFlags: vi.fn(),
  default: {},
}))

describe('App', () => {
  beforeEach(() => {
    mockGetFeatureFlag.mockReturnValue('control')
  })

  it('renders the app with navigation brand', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Secret Notes')).toBeInTheDocument()
  })

  it('renders navigation links', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Create Note')).toBeInTheDocument()
    expect(screen.getByText('Read Note')).toBeInTheDocument()
  })

  it('renders the home page on default route', () => {
    render(
      <MemoryRouter initialEntries={['/']}>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Welcome to Secret Notes')).toBeInTheDocument()
  })

  it('shows Group A (Blue) for control variant', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Group A (Blue)')).toBeInTheDocument()
  })

  it('shows Group B (Green) for test variant', () => {
    mockGetFeatureFlag.mockReturnValue('test')
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Group B (Green)')).toBeInTheDocument()
  })

  it('applies theme-blue class for control group', () => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Secret Notes').closest('.app')).toHaveClass('theme-blue')
  })

  it('applies theme-green class for test group', () => {
    mockGetFeatureFlag.mockReturnValue('test')
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>
    )
    expect(screen.getByText('Secret Notes').closest('.app')).toHaveClass('theme-green')
  })
})

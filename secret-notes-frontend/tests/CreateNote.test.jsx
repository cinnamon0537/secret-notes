import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import CreateNote from '../src/pages/CreateNote'

const mockCreateNote = vi.hoisted(() => vi.fn())

vi.mock('../src/api/notes', () => ({
  createNote: mockCreateNote,
}))

vi.mock('../src/posthog', () => ({
  captureEvent: vi.fn(),
  default: {},
}))

describe('CreateNote', () => {
  beforeEach(() => {
    mockCreateNote.mockReset()
  })

  it('renders the form with all input fields', () => {
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    expect(screen.getByLabelText('Title')).toBeInTheDocument()
    expect(screen.getByLabelText('Content')).toBeInTheDocument()
    expect(screen.getByLabelText('Passphrase')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    expect(screen.getByText('Create Secret Note')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', () => {
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    fireEvent.click(screen.getByText('Create Secret Note'))
    expect(screen.getByText('All fields are required')).toBeInTheDocument()
  })

  it('shows success message after creating a note', async () => {
    mockCreateNote.mockResolvedValue({ id: 'abc-123' })
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    await userEvent.type(screen.getByLabelText('Title'), 'Test Note')
    await userEvent.type(screen.getByLabelText('Content'), 'Secret Content')
    await userEvent.type(screen.getByLabelText('Passphrase'), 'mypass')
    fireEvent.click(screen.getByText('Create Secret Note'))
    expect(await screen.findByText('Note created securely!')).toBeInTheDocument()
  })

  it('displays the returned note ID', async () => {
    mockCreateNote.mockResolvedValue({ id: 'abc-123' })
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    await userEvent.type(screen.getByLabelText('Title'), 'Test')
    await userEvent.type(screen.getByLabelText('Content'), 'Secret')
    await userEvent.type(screen.getByLabelText('Passphrase'), 'pass')
    fireEvent.click(screen.getByText('Create Secret Note'))
    expect(await screen.findByText('abc-123')).toBeInTheDocument()
  })

  it('shows error message on API failure', async () => {
    mockCreateNote.mockRejectedValue(new Error('Bad request'))
    render(
      <MemoryRouter>
        <CreateNote />
      </MemoryRouter>
    )
    await userEvent.type(screen.getByLabelText('Title'), 'Test')
    await userEvent.type(screen.getByLabelText('Content'), 'Secret')
    await userEvent.type(screen.getByLabelText('Passphrase'), 'pass')
    fireEvent.click(screen.getByText('Create Secret Note'))
    expect(await screen.findByText('Bad request')).toBeInTheDocument()
  })
})

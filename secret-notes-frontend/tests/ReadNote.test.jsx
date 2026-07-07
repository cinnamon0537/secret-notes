import { render, screen, fireEvent } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import ReadNote from '../src/pages/ReadNote'

const mockDecryptNote = vi.hoisted(() => vi.fn())

vi.mock('../src/api/notes', () => ({
  decryptNote: mockDecryptNote,
}))

vi.mock('../src/posthog', () => ({
  captureEvent: vi.fn(),
  default: {},
}))

describe('ReadNote', () => {
  beforeEach(() => {
    mockDecryptNote.mockReset()
  })

  it('renders the form with all input fields', () => {
    render(<ReadNote />)
    expect(screen.getByLabelText('Note ID')).toBeInTheDocument()
    expect(screen.getByLabelText('Passphrase')).toBeInTheDocument()
  })

  it('renders the submit button', () => {
    render(<ReadNote />)
    expect(screen.getByText('Decrypt Note')).toBeInTheDocument()
  })

  it('shows validation error when submitting empty form', () => {
    render(<ReadNote />)
    fireEvent.click(screen.getByText('Decrypt Note'))
    expect(screen.getByText('Both Note ID and passphrase are required')).toBeInTheDocument()
  })

  it('shows decrypted content on successful decryption', async () => {
    mockDecryptNote.mockResolvedValue({ id: '1', title: 'My Note', content: 'Hello World' })
    render(<ReadNote />)
    await userEvent.type(screen.getByLabelText('Note ID'), '1')
    await userEvent.type(screen.getByLabelText('Passphrase'), 'correct')
    fireEvent.click(screen.getByText('Decrypt Note'))
    expect(await screen.findByText('Note decrypted successfully!')).toBeInTheDocument()
    expect(screen.getByText('Hello World')).toBeInTheDocument()
  })

  it('shows error on wrong passphrase', async () => {
    mockDecryptNote.mockRejectedValue(new Error('wrong decryption key'))
    render(<ReadNote />)
    await userEvent.type(screen.getByLabelText('Note ID'), '1')
    await userEvent.type(screen.getByLabelText('Passphrase'), 'wrong')
    fireEvent.click(screen.getByText('Decrypt Note'))
    expect(await screen.findByText('wrong decryption key')).toBeInTheDocument()
  })
})

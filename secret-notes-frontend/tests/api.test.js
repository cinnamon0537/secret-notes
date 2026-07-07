const mockFetch = vi.fn()
global.fetch = mockFetch

describe('API service', () => {
  beforeEach(() => {
    mockFetch.mockReset()
  })

  it('createNote sends a POST request to /notes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    const { createNote } = await import('../src/api/notes')
    const result = await createNote({ title: 'T', content: 'C', passphrase: 'P' })
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notes'),
      expect.objectContaining({ method: 'POST' })
    )
    expect(result).toEqual({ id: '1' })
  })

  it('createNote includes the body as JSON', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1' }),
    })
    const { createNote } = await import('../src/api/notes')
    await createNote({ title: 'My Title', content: 'Secret', passphrase: 'pass123' })
    const callBody = JSON.parse(mockFetch.mock.calls[0][1].body)
    expect(callBody).toEqual({ title: 'My Title', content: 'Secret', passphrase: 'pass123' })
  })

  it('createNote throws on error response', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'Bad request' }),
    })
    const { createNote } = await import('../src/api/notes')
    await expect(createNote({ title: 'T', content: 'C', passphrase: 'P' })).rejects.toThrow('Bad request')
  })

  it('decryptNote sends a POST request to /notes/:id', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ id: '1', title: 'T', content: 'C' }),
    })
    const { decryptNote } = await import('../src/api/notes')
    await decryptNote('42', 'pass')
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('/notes/42'),
      expect.objectContaining({ method: 'POST' })
    )
  })

  it('decryptNote throws on wrong passphrase', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: 'wrong decryption key' }),
    })
    const { decryptNote } = await import('../src/api/notes')
    await expect(decryptNote('1', 'wrong')).rejects.toThrow('wrong decryption key')
  })
})

import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import App from './App'

describe('App component', () => {
  test('renders Qraft logo', async () => {
    render(<App />)
    const logoElement = await screen.findByText(/Qraft/i)
    expect(logoElement).toBeInTheDocument()
  })
})

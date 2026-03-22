import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import App from './App'

describe('App component', () => {
  test('renders Qraft logo', () => {
    render(<App />)
    const logoElement = screen.getByText(/Qraft/i)
    expect(logoElement).toBeInTheDocument()
  })
})

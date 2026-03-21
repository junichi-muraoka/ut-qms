import { render, screen } from '@testing-library/react'
import { expect, test, describe } from 'vitest'
import App from './App'

describe('App component', () => {
  test('renders UT-QMS logo', () => {
    render(<App />)
    const logoElement = screen.getByText(/UT-QMS/i)
    expect(logoElement).toBeInTheDocument()
  })
})

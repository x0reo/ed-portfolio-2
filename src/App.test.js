import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the hero portrait placeholder and call-to-action', () => {
  render(<App />);

  expect(screen.getByRole('img', { name: /profile portrait/i })).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /learn more/i })).toBeInTheDocument();
});

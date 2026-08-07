import { render, screen } from '@testing-library/react';
import App from './App';

test('renders resume builder', () => {
  render(<App />);
  expect(screen.getByText('ResumeForge')).toBeInTheDocument();
  expect(screen.getByText('Edit your resume')).toBeInTheDocument();
});

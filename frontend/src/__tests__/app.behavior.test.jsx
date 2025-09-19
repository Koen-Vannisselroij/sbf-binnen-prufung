import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App.jsx';

describe('App basic behavior', () => {
  test('opens with main menu visible', async () => {
    render(<App />);
    // Welcome headline in the popover
    expect(await screen.findByText(/Willkommen an Bord/i)).toBeInTheDocument();
    // Mode choices
    expect(screen.getByRole('button', { name: /Übungsmodus/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Fragebogen/i })).toBeInTheDocument();
  });

  test('shows exam selector overlay when starting exam', async () => {
    render(<App />);
    const examBtn = await screen.findByRole('button', { name: /Fragebogen/i });
    await userEvent.click(examBtn);
    // The menu closes and overlay opens to pick form
    expect(await screen.findByText(/Fragebogen auswählen/i)).toBeInTheDocument();
  });

  test('displays Tip link in practice mode', async () => {
    render(<App />);
    const practiceBtn = await screen.findByRole('button', { name: /Übungsmodus/i });
    await userEvent.click(practiceBtn);
    // Tip link should be present above the options
    expect(await screen.findByRole('button', { name: /Tipp anzeigen/i })).toBeInTheDocument();
  });
});


import { redirect } from 'next/navigation';

import Home from '../page';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

describe('Home Page', () => {
  it('redirects to /dashboard', () => {
    Home();
    expect(redirect).toHaveBeenCalledWith('/dashboard');
  });
});

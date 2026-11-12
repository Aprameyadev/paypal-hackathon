import { redirect } from 'next/navigation';

/**
 * /signup redirects to /login with the sign-up tab pre-selected.
 * The login page handles both sign-in and sign-up in one combined view.
 */
export default function SignupPage() {
  redirect('/login?mode=signup');
}


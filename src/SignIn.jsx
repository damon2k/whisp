import React from 'react';
import { auth, googleProvider } from './firebase'; // We'll create this later

function SignIn() {
  const signInWithGoogle = () => {
    auth.signInWithPopup(googleProvider);
  };

  return (
    <button onClick={signInWithGoogle}>Sign in with Google</button>
  );
}

export default SignIn;
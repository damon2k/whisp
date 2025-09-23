import React, { useState, useEffect } from 'react';
import { auth } from './firebase'; // We'll create this later
import ChatRoom from './ChatRoom'; // We'll create this later
import SignIn from './SignIn'; // We'll create this later

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user);
    });
    return unsubscribe;
  }, []);

  return (
    <div className="App">
      <header>
        <h1>⚛️ 🔥 Chat App</h1>
        <SignOut />
      </header>
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignOut() {
  return auth.currentUser && (
    <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
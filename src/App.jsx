// App.jsx
import React, { useState, useEffect } from 'react';
import { auth } from './firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import ChatRoom from './components/ChatRoom';
import SignIn from './components/SignIn';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleSignOut = () => {
    signOut(auth).catch((error) => {
      console.error('Error signing out:', error);
    });
  };

  if (loading) {
    return (
      <div className="App">
        <div className="loading-container">
          <h2>Loading...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header>
        <div className="header-content">
          <h1>⚛️🔥 Whisp Chat</h1>
          {user && (
            <div className="user-info">
              <img 
                src={user.photoURL || `https://ui-avatars.com/api/?name=${user.displayName || 'User'}&background=007bff&color=fff`} 
                alt="Profile" 
                className="profile-pic"
                referrerPolicy="no-referrer"
              />
              <span className="username">{user.displayName || user.phoneNumber || 'Guest'}</span>
              <button onClick={handleSignOut} className="sign-out-btn">
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>
      
      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

export default App;
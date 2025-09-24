// ChatRoom.jsx
import React, { useState, useRef, useEffect } from 'react';
import { firestore, auth } from '../firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  limit, 
  onSnapshot, 
  serverTimestamp 
} from 'firebase/firestore';

function ChatRoom() {
  const dummy = useRef();
  const [messages, setMessages] = useState([]);
  const [formValue, setFormValue] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const messagesRef = collection(firestore, 'messages');
    const q = query(messagesRef, orderBy('createdAt'), limit(100));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const messagesData = [];
      querySnapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      setMessages(messagesData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    if (dummy.current) {
      dummy.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    if (!formValue.trim()) return;

    const { uid, photoURL, displayName } = auth.currentUser;

    try {
      await addDoc(collection(firestore, 'messages'), {
        text: formValue,
        createdAt: serverTimestamp(),
        uid,
        photoURL,
        displayName: displayName || 'Anonymous'
      });

      setFormValue('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading messages...</div>;
  }

  return (
    <>
      <main>
        {messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
        <span ref={dummy}></span>
      </main>

      <form onSubmit={sendMessage}>
        <input 
          value={formValue} 
          onChange={(e) => setFormValue(e.target.value)} 
          placeholder="Type your message here..." 
        />
        <button type="submit" disabled={!formValue.trim()}>
          Send 📨
        </button>
      </form>
    </>
  );
}

function ChatMessage({ message }) {
  const { text, uid, photoURL, displayName } = message;
  const messageClass = uid === auth.currentUser?.uid ? 'sent' : 'received';

  return (
    <div className={`message ${messageClass}`}>
      <img 
        src={photoURL || `https://ui-avatars.com/api/?name=${displayName || 'User'}&background=007bff&color=fff`} 
        alt="user avatar" 
        referrerPolicy="no-referrer"
      />
      <div className="message-content">
        <span className="message-author">{displayName || 'Anonymous'}</span>
        <p>{text}</p>
      </div>
    </div>
  );
}

export default ChatRoom;
import React, { useEffect, useRef, useState } from 'react';
import './ChatPage.css';
import { useChatContext } from '../context/ChatContext';
import { useLocation, useNavigate } from 'react-router-dom';
import SockJS from 'sockjs-client';
import { baseURL } from '../config/AxiosHelper';
import { Stomp } from '@stomp/stompjs';
import toast from 'react-hot-toast';
import { getMessages } from '../services/RoomService';

const ChatPage = () => {
  const { roomId, currentUser, setConnected, setRoomId, setCurrentUser } = useChatContext();
  const navigate = useNavigate();
  const location = useLocation();
  const routedRoomId = location.state?.roomId;
  const routedUserName = location.state?.currentUser;
  const effectiveRoomId = roomId || routedRoomId || '';
  const effectiveUserName = currentUser || routedUserName || 'Zeon';

  useEffect(() => {
    if (routedRoomId) {
      setRoomId(routedRoomId);
    }
    if (routedUserName) {
      setCurrentUser(routedUserName);
    }
  }, [routedRoomId, routedUserName, setRoomId, setCurrentUser]);

  // Redirect only when room context is missing (handles websocket connection race on first open)
  useEffect(() => {
    if (!effectiveRoomId) navigate('/');
  }, [effectiveRoomId, navigate]);

  const [username] = useState(effectiveUserName);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [showHeader, setShowHeader] = useState(true);
  const scrollRef = useRef(null);
  const lastScrollTop = useRef(0);
  const [stompClient, setStompClient] = useState(null);
  const [isSending, setIsSending] = useState(false);

  // ✅ Load messages on component mount
  useEffect(() => {
    async function loadMessages() {
      try {
        const messagesData = await getMessages(roomId);
        setMessages(messagesData);
      } catch (error) {
        console.error('Failed to load messages:', error);
        toast.error('Failed to load messages');
      }
    }

    if (effectiveRoomId) {
      loadMessages();
    }
  }, [effectiveRoomId]);

  // ✅ WebSocket connection + scroll listener
  useEffect(() => {
    if (!effectiveRoomId) return;

    const connectWebSocket = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(() => sock);

      client.connect(
        {},
        () => {
          setStompClient(client);
          setConnected(true);
          toast.success('Connected to chat!');

          client.subscribe(`/topic/room/${effectiveRoomId}`, (message) => {
          const newMessage = JSON.parse(message.body);
          
          // ✅ Prevent duplicates by checking if message already exists
          setMessages((prev) => {
            // Check if message already exists (by timestamp or content)
            const messageExists = prev.some(
              msg => 
                msg.timestamp === newMessage.timestamp && 
                msg.content === newMessage.content &&
                msg.sender === newMessage.sender
            );
            
            if (!messageExists) {
              return [...prev, newMessage];
            }
            return prev;
          });
        });
      }, (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
        toast.error('Connection failed');
      });
    };

    connectWebSocket();

    // Scroll listener for header hide/show
    const el = scrollRef.current;
    if (!el) return;

    const onScroll = (e) => {
      const st = e.currentTarget.scrollTop;
      const delta = st - lastScrollTop.current;
      const threshold = 6;
      if (delta > threshold) setShowHeader(false);
      else if (delta < -threshold) setShowHeader(true);
      if (st <= 0) setShowHeader(true);
      lastScrollTop.current = st;
    };

    el.addEventListener('scroll', onScroll);
    
    // Cleanup function
    return () => {
      el.removeEventListener('scroll', onScroll);
      if (stompClient && stompClient.connected) {
        stompClient.disconnect(() => setConnected(false));
      } else {
        setConnected(false);
      }
    };
  }, [roomId]);

  // ✅ Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ✅ Send message - FIXED DUPLICATE ISSUE
  const handleSend = () => {
    if (!input.trim() || isSending) return;
    
    setIsSending(true);
    
    const timestamp = new Date().toISOString();
    const newMsg = { 
      sender: username, 
      content: input, 
      roomId: effectiveRoomId,
      timestamp: timestamp
    };

    // Clear input immediately for better UX
    setInput('');

    if (stompClient && stompClient.connected) {
      // Don't optimistically update - wait for WebSocket broadcast
      stompClient.send(`/app/sendMessage/${effectiveRoomId}`, {}, JSON.stringify(newMsg));
      
      // The message will be added when received from the WebSocket subscription
      setIsSending(false);
    } else {
      // Fallback: add message locally if not connected
      setMessages((prev) => [...prev, newMsg]);
      toast.error('Not connected to chat');
      setIsSending(false);
    }
  };

  // ✅ Alternative approach with optimistic update (if you prefer it)
  // const handleSend = () => {
  //   if (!input.trim() || isSending) return;
    
  //   setIsSending(true);
    
  //   const tempId = Date.now().toString(); // Generate temporary ID
  //   const timestamp = new Date().toISOString();
  //   const newMsg = { 
  //     sender: username, 
  //     content: input, 
  //     roomId: roomId,
  //     timestamp: timestamp,
  //     tempId: tempId // Add temporary ID to track optimistic update
  //   };

  //   // Optimistically update UI
  //   setMessages((prev) => [...prev, newMsg]);
  //   setInput('');

  //   if (stompClient && stompClient.connected) {
  //     stompClient.send(`/app/sendMessage/${roomId}`, {}, JSON.stringify(newMsg));
  //   } else {
  //     toast.error('Not connected to chat');
  //   }
  //   setIsSending(false);
  // };

  // ✅ Leave room
  const handleLeaveRoom = () => {
    if (stompClient && stompClient.connected) {
      stompClient.disconnect(() => setConnected(false));
    } else {
      setConnected(false);
    }
    setRoomId('');
    setCurrentUser('');
    setStompClient(null);
    navigate('/');
  };

  // Show loading state if no roomId
  if (!effectiveRoomId) {
    return <div>Loading...</div>;
  }

  return (
    <div className="chatpage">
      {/* Header */}
      <div className="chatpage__headerWrap">
        <header
          className={`chatpage__header ${showHeader ? '' : 'chatpage__header--hidden'}`}
        >
          <div>
            <h1 className="text-xl font-semibold">
              Room: <span>{effectiveRoomId || 'Family Room'}</span>
            </h1>
          </div>
          <div>
            <h1 className="text-xl font-semibold">
              User: <span>{username}</span>
            </h1>
          </div>
          <div>
            <button onClick={handleLeaveRoom} className="chatpage__leaveBtn">
              Leave room
            </button>
          </div>
        </header>
      </div>

      {/* Chat messages */}
      <main ref={scrollRef} className="chatpage__main">
        <div className="chatpage__mainInner">
          {messages.length === 0 ? (
            <div className="no-messages">No messages yet. Start the conversation!</div>
          ) : (
            messages.map((message, index) => {
              const isOwn = message.sender === username;
              return (
                <div key={`${message.timestamp}-${index}`} className={`msgRow ${isOwn ? 'msgRow--own' : ''}`}>
                  <div className="msgColumn">
                    <p className={`msgSender ${isOwn ? 'msgSender--own' : ''}`}>
                      {message.sender}
                    </p>
                    <div className={`msgBubble ${isOwn ? 'msgBubble--own' : ''}`}>
                      {message.content}
                    </div>
                    {message.timestamp && (
                      <small className="msgTime">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </small>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>

      {/* Footer */}
      <div className="chatpage__footerWrap">
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <footer className="chatpage__footer">
            <label
              htmlFor="chat-attachments"
              title="Attach files"
              className="chatpage__attachLabel"
            >
              📎
            </label>
            <input id="chat-attachments" type="file" multiple style={{ display: 'none' }} />

            <input
              type="text"
              placeholder="Type a message"
              className="chatpage__input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={isSending}
            />

            <button
              title="Send message"
              className="chatpage__sendBtn"
              onClick={handleSend}
              disabled={!input.trim() || isSending}
            >
              {isSending ? 'Sending...' : 'Send'}
            </button>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
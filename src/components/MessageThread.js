import React, { useState, useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Paper,
  IconButton,
  Divider,
  CircularProgress
} from '@mui/material';
import {
  Send as SendIcon,
  Close as CloseIcon
} from '@mui/icons-material';
import { collection, query, where, orderBy, onSnapshot, addDoc, serverTimestamp, or } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../context/AuthContext';
import { formatDate } from '../utils/helpers';

const MessageThread = ({ open, onClose, requestId, requestTitle, otherUserId, otherUserEmail }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (!open || !user || !otherUserId) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'messages'),
      where('requestId', '==', requestId)
    );

    const unsubscribe = onSnapshot(q, 
      (snapshot) => {
        const messagesData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Filter messages between these two users and sort by timestamp
        const filteredMessages = messagesData
          .filter(msg => 
            (msg.senderId === user.uid && msg.receiverId === otherUserId) ||
            (msg.senderId === otherUserId && msg.receiverId === user.uid)
          )
          .sort((a, b) => {
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeA - timeB;
          });
        
        setMessages(filteredMessages);
        setLoading(false);
        setTimeout(scrollToBottom, 100);
      },
      (error) => {
        console.error('Error loading messages:', error);
        setMessages([]);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [open, user, otherUserId, requestId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      await addDoc(collection(db, 'messages'), {
        requestId,
        senderId: user.uid,
        senderEmail: user.email,
        senderName: user.displayName || user.email.split('@')[0],
        receiverId: otherUserId,
        receiverEmail: otherUserEmail,
        message: newMessage.trim(),
        createdAt: serverTimestamp(),
        read: false
      });
      
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="h6">Message Thread</Typography>
            <Typography variant="caption" color="text.secondary">
              Re: {requestTitle}
            </Typography>
          </Box>
          <IconButton onClick={onClose} size="small">
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      
      <DialogContent dividers sx={{ height: 400, display: 'flex', flexDirection: 'column' }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <CircularProgress />
          </Box>
        ) : messages.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <Typography color="text.secondary">
              No messages yet. Start the conversation!
            </Typography>
          </Box>
        ) : (
          <Box sx={{ flexGrow: 1, overflowY: 'auto', mb: 2 }}>
            {messages.map((msg) => {
              const isOwnMessage = msg.senderId === user.uid;
              return (
                <Box
                  key={msg.id}
                  sx={{
                    display: 'flex',
                    justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                    mb: 2
                  }}
                >
                  <Paper
                    elevation={isOwnMessage ? 2 : 1}
                    sx={{
                      p: 1.5,
                      maxWidth: '70%',
                      bgcolor: isOwnMessage ? 'primary.main' : 'grey.100',
                      color: isOwnMessage ? 'white' : 'text.primary',
                      borderRadius: 2,
                      position: 'relative',
                      '&::before': isOwnMessage ? {
                        content: '""',
                        position: 'absolute',
                        right: -8,
                        top: 10,
                        width: 0,
                        height: 0,
                        borderLeft: '8px solid',
                        borderLeftColor: 'primary.main',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent'
                      } : {
                        content: '""',
                        position: 'absolute',
                        left: -8,
                        top: 10,
                        width: 0,
                        height: 0,
                        borderRight: '8px solid',
                        borderRightColor: 'grey.100',
                        borderTop: '8px solid transparent',
                        borderBottom: '8px solid transparent'
                      }
                    }}
                  >
                    <Typography variant="caption" sx={{ opacity: 0.8, display: 'block', mb: 0.5, fontWeight: 600 }}>
                      {isOwnMessage ? 'You' : msg.senderName}
                    </Typography>
                    <Typography variant="body2" sx={{ wordBreak: 'break-word', whiteSpace: 'pre-wrap' }}>
                      {msg.message}
                    </Typography>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                      <Typography variant="caption" sx={{ opacity: 0.7 }}>
                        {msg.createdAt ? formatDate(msg.createdAt) : 'Sending...'}
                      </Typography>
                      {isOwnMessage && msg.createdAt && (
                        <Typography variant="caption" sx={{ opacity: 0.7 }}>
                          • Sent
                        </Typography>
                      )}
                    </Box>
                  </Paper>
                </Box>
              );
            })}
            <div ref={messagesEndRef} />
          </Box>
        )}
      </DialogContent>
      
      <DialogActions sx={{ p: 2 }}>
        <form onSubmit={handleSendMessage} style={{ width: '100%' }}>
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              placeholder="Type your message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              disabled={sending}
              size="small"
              multiline
              maxRows={3}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!newMessage.trim() || sending}
              endIcon={sending ? <CircularProgress size={20} /> : <SendIcon />}
            >
              Send
            </Button>
          </Box>
        </form>
      </DialogActions>
    </Dialog>
  );
};

export default MessageThread;

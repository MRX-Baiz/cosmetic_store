import React, { useState } from 'react';
import { Box, Fab, Modal, Paper, Typography, TextField, Button, List, ListItem, ListItemText, IconButton, Divider } from '@mui/material';
import { Chat as ChatIcon, Close as CloseIcon, Send as SendIcon } from '@mui/icons-material';
import { useTheme } from '@mui/material/styles';
import { chatbotAPI } from '../services/api';

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loadingBot, setLoadingBot] = useState(false); // New loading state
  const theme = useTheme();

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSendMessage = async () => {
    if (input.trim() === '') return;

    const userMessage = { sender: 'user', text: input };
    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput('');
    setLoadingBot(true); // Set loading state

    try {
      const { data } = await chatbotAPI.sendMessage(input);
      const botResponse = { sender: 'bot', text: data.response };
      setMessages((prevMessages) => [...prevMessages, botResponse]);
    } catch (error) {
      console.error('Error sending message to chatbot:', error);
      const errorMessage = { sender: 'bot', text: 'Sorry, I am having trouble connecting right now. Please try again later.' };
      setMessages((prevMessages) => [...prevMessages, errorMessage]);
    } finally {
      setLoadingBot(false); // Clear loading state
    }
  };

  return (
    <>
      <Fab
        color="primary"
        aria-label="chat"
        onClick={handleOpen}
        sx={{
          position: 'fixed',
          bottom: theme.spacing(4),
          right: theme.spacing(4),
          zIndex: theme.zIndex.drawer + 1,
        }}
      >
        <ChatIcon />
      </Fab>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="chatbot-modal-title"
        aria-describedby="chatbot-modal-description"
        closeAfterTransition
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      >
        <Paper
          sx={{
            width: { xs: '90%', sm: 400 },
            height: { xs: '80%', sm: 500 },
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2,
            boxShadow: theme.shadows[5],
            overflow: 'hidden',
          }}
        >
          <Box sx={{ p: 2, bgcolor: theme.palette.primary.main, color: theme.palette.primary.contrastText, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h6" component="h2" id="chatbot-modal-title">
                Cosmetic Store Bot
              </Typography>
              <Typography variant="caption" sx={{ color: 'rgba(255,255,255,0.7)' }}>
                Your AI agent is here to help you discover beauty.
              </Typography>
            </Box>
            <Button
              variant="outlined"
              color="inherit"
              size="small"
              sx={{ mr: 1, whiteSpace: 'nowrap' }}
              onClick={() => window.open('https://wa.me/+212621561796?text=' + encodeURIComponent('Hello, I need support regarding my order/products.'), '_blank')}
            >
              Chat via WhatsApp
            </Button>
            <IconButton edge="end" color="inherit" onClick={handleClose}>
              <CloseIcon />
            </IconButton>
          </Box>
          <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: theme.palette.background.default }}>
            <List>
              {messages.map((msg, index) => (
                <ListItem key={index} sx={{ justifyContent: msg.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                  <ListItemText
                    sx={{
                      bgcolor: msg.sender === 'user' ? theme.palette.primary.light : theme.palette.grey[300],
                      color: msg.sender === 'user' ? theme.palette.primary.contrastText : theme.palette.text.primary,
                      borderRadius: 2,
                      p: 1.5,
                      maxWidth: '75%',
                      wordBreak: 'break-word',
                    }}
                    primary={msg.text}
                  />
                </ListItem>
              ))}
              {loadingBot && (
                <ListItem sx={{ justifyContent: 'flex-start' }}>
                  <ListItemText
                    sx={{
                      bgcolor: theme.palette.grey[300],
                      color: theme.palette.text.primary,
                      borderRadius: 2,
                      p: 1.5,
                      maxWidth: '75%',
                      wordBreak: 'break-word',
                    }}
                    primary="Bot is typing..."
                  />
                </ListItem>
              )}
            </List>
          </Box>
          <Divider />
          <Box sx={{ p: 2, display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleSendMessage();
                }
              }}
              sx={{ '& fieldset': { borderRadius: 2 } }}
            />
            <Button
              variant="contained"
              color="primary"
              onClick={handleSendMessage}
              endIcon={<SendIcon />}
              sx={{ borderRadius: 2 }}
              disabled={loadingBot} // Disable button while bot is loading
            >
              Send
            </Button>
          </Box>
        </Paper>
      </Modal>
    </>
  );
};

export default Chatbot;

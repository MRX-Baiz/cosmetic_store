import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Modal,
  Typography,
  Chip,
} from '@mui/material';
import {
  NavigateBefore,
  NavigateNext,
  PlayArrow,
  Image as ImageIcon,
} from '@mui/icons-material';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
const BACKEND_BASE_URL = API_BASE_URL.replace('/api', '');

// Helper function to convert relative URLs to full URLs
const getFullImageUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http')) return url;
  return `${BACKEND_BASE_URL}${url}`;
};

const ProductMediaCarousel = ({ media = [], height = 300 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

  if (!media || media.length === 0) {
    return (
      <Box
        sx={{
          height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 2,
          border: '1px solid #ddd',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          No media available
        </Typography>
      </Box>
    );
  }

  const currentMedia = media[currentIndex];

  const handlePrevious = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === 0 ? media.length - 1 : prev - 1));
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev === media.length - 1 ? 0 : prev + 1));
  };

  const openModal = (index) => {
    setModalIndex(index);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  const renderMedia = (item, index, isModal = false) => {
    const isVideo = item.type === 'video' || item.url?.includes('.mp4') || item.url?.includes('.mov');
    
    if (isVideo) {
      return (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isModal ? '80vh' : height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#000',
            borderRadius: isModal ? 0 : 2,
            overflow: 'hidden',
          }}
        >
          <video
            src={getFullImageUrl(item.url)}
            controls
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
            poster={getFullImageUrl(item.poster)}
          />
          <Chip
            icon={<PlayArrow />}
            label="Video"
            color="primary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        </Box>
      );
    } else {
      return (
        <Box
          sx={{
            position: 'relative',
            width: '100%',
            height: isModal ? '80vh' : height,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#f5f5f5',
            borderRadius: isModal ? 0 : 2,
            overflow: 'hidden',
            cursor: 'pointer',
          }}
          onClick={() => openModal(index)}
        >
          <img
            src={getFullImageUrl(item.url)}
            alt={item.alt || `Product image ${index + 1}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
          />
          <Chip
            icon={<ImageIcon />}
            label="Image"
            color="secondary"
            size="small"
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
            }}
          />
        </Box>
      );
    }
  };

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        {renderMedia(currentMedia, currentIndex)}
        
        {media.length > 1 && (
          <>
            <IconButton
              onClick={handlePrevious}
              sx={{
                position: 'absolute',
                left: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <NavigateBefore />
            </IconButton>
            
            <IconButton
              onClick={handleNext}
              sx={{
                position: 'absolute',
                right: 8,
                top: '50%',
                transform: 'translateY(-50%)',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
                '&:hover': {
                  backgroundColor: 'rgba(255, 255, 255, 0.9)',
                },
              }}
            >
              <NavigateNext />
            </IconButton>
          </>
        )}

        {/* Media indicators */}
        {media.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 8,
              left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex',
              gap: 1,
            }}
          >
            {media.map((_, index) => (
              <Box
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentIndex(index);
                }}
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  backgroundColor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.5)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  '&:hover': {
                    backgroundColor: index === currentIndex ? 'primary.dark' : 'rgba(255, 255, 255, 0.8)',
                  },
                }}
              />
            ))}
          </Box>
        )}
      </Box>

      {/* Modal for full-size viewing */}
      <Modal
        open={modalOpen}
        onClose={closeModal}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        }}
      >
        <Box sx={{ position: 'relative', maxWidth: '90vw', maxHeight: '90vh' }}>
          {renderMedia(media[modalIndex], modalIndex, true)}
          
          <IconButton
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.9)',
              },
            }}
          >
            ×
          </IconButton>
          
          {media.length > 1 && (
            <>
              <IconButton
                onClick={() => setModalIndex(modalIndex === 0 ? media.length - 1 : modalIndex - 1)}
                sx={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <NavigateBefore />
              </IconButton>
              
              <IconButton
                onClick={() => setModalIndex(modalIndex === media.length - 1 ? 0 : modalIndex + 1)}
                sx={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  backgroundColor: 'rgba(255, 255, 255, 0.8)',
                  '&:hover': {
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                  },
                }}
              >
                <NavigateNext />
              </IconButton>
            </>
          )}
        </Box>
      </Modal>
    </>
  );
};

export default ProductMediaCarousel;


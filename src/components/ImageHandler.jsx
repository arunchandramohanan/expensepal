// ImageHandler.jsx
import React from 'react';

const ImageHandler = ({ file, zoom }) => {
  return (
    <img 
      src={URL.createObjectURL(file)} 
      alt="Receipt"
      style={{
        maxWidth: '100%',
        height: 'auto',
        transform: `scale(${zoom})`,
        transformOrigin: '0 0',
      }}
      onLoad={(e) => URL.revokeObjectURL(e.target.src)} // Clean up the URL object
    />
  );
};

export default ImageHandler;
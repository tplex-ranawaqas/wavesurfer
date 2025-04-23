// components/MyButton.js
    import React from 'react';
    
    const MyButton = ({ onClick, children }) => {
      return (
        <button onClick={onClick}>
          {children}
        </button>
      );
    };
    
    export default MyButton;
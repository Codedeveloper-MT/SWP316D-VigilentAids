import React from "react";

const Button = ({ 
  children, 
  onClick, 
  className = "", 
  disabled = false 
}) => {
  return (
    <button
      onClick={onClick}
      className={`${className} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-90'}`}
      disabled={disabled}
      aria-disabled={disabled}
    >
      {children}
    </button>
  );
};

export default Button;
import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css';
import App from './App.jsx';
import './index.css';
import { GoogleOAuthProvider } from '@react-oauth/google';

ReactDOM.createRoot(document.getElementById('root')).render(
  <GoogleOAuthProvider clientId="882025545288-d6jj90v0tlq2fm0rprshbvc1gfegvsvp.apps.googleusercontent.com">
    <React.StrictMode>
       <BrowserRouter>
    <App />
  </BrowserRouter>
    </React.StrictMode>
  </GoogleOAuthProvider>

 
);

import React from 'react-dom/client';
import App from './App.jsx';
import { AuthProvider } from './component/AuthProvider';

React.createRoot(document.getElementById('root')).render(
    <AuthProvider>
        <App />
    </AuthProvider>
);

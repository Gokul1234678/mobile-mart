import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './App.jsx'
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import 'bootstrap-icons/font/bootstrap-icons.css';
import '@fortawesome/fontawesome-free/css/all.min.css';

import "./assets/styles/global.css";

// This component helps us set page title and meta description dynamically
import { HelmetProvider } from 'react-helmet-async';

// Redux
import { Provider } from "react-redux";
import { store } from "./redux/store";

createRoot(document.getElementById('root')).render(
  <StrictMode>
    {/* Redux Store Provider */}
    <Provider store={store}>
      {/* SEO Provider */}
      <HelmetProvider>
        <App />
      </HelmetProvider>

    </Provider>
  </StrictMode>,
)

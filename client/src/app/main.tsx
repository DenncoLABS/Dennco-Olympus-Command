import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import '../styles/index.css';
import '../styles/dock-hover-fix.css';
import '../styles/dock-visible-stage.css';
import '../styles/dock-float-layer.css';
import 'maplibre-gl/dist/maplibre-gl.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

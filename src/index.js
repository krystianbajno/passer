import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/index.css';
import './styles/App.css';
import './styles/quiz.css';

import reportWebVitals from './reportWebVitals';
import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";
import Creator from './pages/creator';
import Quiz from './pages/quiz';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Quiz/>}></Route>
      <Route path="/creator" element={<Creator/>}></Route>
    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();

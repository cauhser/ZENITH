import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard/EnhancedDashboard';
import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import WellnessProfile from './components/WellnessProfile/WellnessProfile';
import ContentAnalysis from './components/ContentAnalysis/ContentAnalysis';
import BreakReminders from './components/BreakReminders/BreakReminders';
import RealTimeAnalytics from './components/RealTimeAnalytics/RealTimeAnalytics';
import EyeTracking from './components/EyeTracking/EyeTracking';
import './styles/App.css';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  
  // Check system preference for dark mode
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(prefersDark);
    
    // Listen for system preference changes
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => setDarkMode(e.matches);
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);
  
  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode]);
  
  return (
    <Provider store={store}>
      <Router>
        <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
          {/* Navigation component removed as requested */}
          <main className="main-content">
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/wellness" element={<WellnessProfile />} />
              <Route path="/profile" element={<WellnessProfile />} />
              <Route path="/content-analysis" element={<ContentAnalysis />} />
              <Route path="/content" element={<ContentAnalysis />} />
              <Route path="/break-reminders" element={<BreakReminders />} />
              <Route path="/breaks" element={<BreakReminders />} />
              <Route path="/analytics" element={<RealTimeAnalytics />} />
              <Route path="/eye-tracking" element={<EyeTracking />} />
              {/* Add a catch-all route for undefined paths */}
              <Route path="*" element={<LandingPage />} />
            </Routes>
          </main>
        </div>
      </Router>
    </Provider>
  );
}

export default App;
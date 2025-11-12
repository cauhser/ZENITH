import * as React from 'react';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProfileProvider } from './contexts/UserProfileContext';
import { useUserProfileContext } from './contexts/UserProfileContext';
import './styles/App.css';


import LandingPage from './components/LandingPage/LandingPage';
import Login from './components/Login/Login';
import Signup from './components/Signup/Signup';
import EnhancedDashboard from './components/Dashboard/EnhancedDashboard';
import WellnessProfile from './components/WellnessProfile/WellnessProfile';
import ContentAnalysis from './components/ContentAnalysis/ContentAnalysis';
import BreakReminders from './components/BreakReminders/BreakReminders';
import RealTimeAnalytics from './components/RealTimeAnalytics/RealTimeAnalytics';
import EyeTracking from './components/EyeTracking/EyeTracking';
import WellnessTools from './components/Dashboard/WellnessTools';
import RelaxationPage from './components/Dashboard/RelaxationPage';
import FocusFlow from './components/Dashboard/FocusFlow';
import DigitalSunsetScheduler from './components/Dashboard/DigitalSunsetScheduler';
import ExportWellnessReport from './components/Dashboard/ExportWellnessReport';


const AppRoutes: React.FC = () => {
  const { userProfile } = useUserProfileContext();
  
  if (!userProfile) {
    return React.createElement('div', { className: 'loading' }, 'Loading...');
  }

  return React.createElement(
    Routes,
    null,
    React.createElement(Route, {
      path: '/',
      element: React.createElement(LandingPage, null)
    }),
    React.createElement(Route, {
      path: '/login',
      element: React.createElement(Login, null)
    }),
    React.createElement(Route, {
      path: '/signup',
      element: React.createElement(Signup, null)
    }),
    React.createElement(Route, {
      path: '/dashboard',
      element: React.createElement(EnhancedDashboard, null)
    }),
    React.createElement(Route, {
      path: '/wellness',
      element: React.createElement(WellnessProfile, null)
    }),
    React.createElement(Route, {
      path: '/profile',
      element: React.createElement(WellnessProfile, null)
    }),
    React.createElement(Route, {
      path: '/content-analysis',
      element: React.createElement(ContentAnalysis, null)
    }),
    React.createElement(Route, {
      path: '/content',
      element: React.createElement(ContentAnalysis, null)
    }),
    React.createElement(Route, {
      path: '/break-reminders',
      element: React.createElement(BreakReminders, null)
    }),
    React.createElement(Route, {
      path: '/breaks',
      element: React.createElement(BreakReminders, null)
    }),
    React.createElement(Route, {
      path: '/analytics',
      element: React.createElement(RealTimeAnalytics, null)
    }),
    React.createElement(Route, {
      path: '/eye-tracking',
      element: React.createElement(EyeTracking, null)
    }),
    React.createElement(Route, {
      path: '/wellness-tools',
      element: React.createElement(WellnessTools, null)
    }),
    React.createElement(Route, {
      path: '/relaxation',
      element: React.createElement(RelaxationPage, null)
    }),
    React.createElement(Route, {
      path: '/focus-flow',
      element: React.createElement(FocusFlow, null)
    }),
    React.createElement(Route, {
      path: '/digital-sunset',
      element: React.createElement(DigitalSunsetScheduler, null)
    }),
    React.createElement(Route, {
      path: '/export-report',
      element: React.createElement(ExportWellnessReport, null)
    }),
    React.createElement(Route, {
      path: '*',
      element: React.createElement(LandingPage, null)
    })
  );
};

function App() {
  return React.createElement(
    Provider,
    { 
      store: store,
      children: React.createElement(
        UserProfileProvider,
        null,
        React.createElement(
          Router,
          null,
          React.createElement('div', { className: 'App' }, React.createElement(AppRoutes, null))
        )
      )
    }
  );
}

export default App;
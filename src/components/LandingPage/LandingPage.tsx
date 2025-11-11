import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [showWellnessQuiz, setShowWellnessQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<number[]>(Array(6).fill(0));
  const [wellnessScore, setWellnessScore] = useState<number | null>(null);

  const quizQuestions = [
    "How many hours on social media daily?",
    "Do you feel anxious after scrolling?",
    "How often do you take breaks from screens?",
    "How would you rate your sleep quality?",
    "How often do you feel overwhelmed by digital content?",
    "How satisfied are you with your current digital habits?"
  ];

  const features = [
    {
      icon: '👁️',
      title: 'Emotion Detection',
      description: 'AI-powered facial recognition to monitor your emotional well-being in real-time'
    },
    {
      icon: '📊',
      title: 'Behavioral Insights',
      description: 'Understand your digital habits and their impact on your mental health'
    },
    {
      icon: '🧘',
      title: 'Wellness Guidance',
      description: 'Personalized recommendations to improve your digital wellness'
    },
    {
      icon: '⏰',
      title: 'Break Reminders',
      description: 'Smart notifications to help you take breaks and maintain healthy screen time'
    }
  ];

  const handleAnswerSelect = (value: number) => {
    const newAnswers = [...quizAnswers];
    newAnswers[quizStep] = value;
    setQuizAnswers(newAnswers);
    if (quizStep < quizQuestions.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      const score = Math.round(
        newAnswers.reduce((sum, answer) => sum + answer, 0) / newAnswers.length * 20
      );
      setWellnessScore(score);
    }
  };

  const resetQuiz = () => {
    setQuizStep(0);
    setQuizAnswers(Array(6).fill(0));
    setWellnessScore(null);
    setShowWellnessQuiz(false);
  };

  const getPersonalizedTip = (score: number) => {
    if (score >= 80) {
      return "Great job! Keep maintaining your healthy digital habits.";
    } else if (score >= 60) {
      return "You're doing well, but try Zenith's real-time emotion tracking to stay in control.";
    } else if (score >= 40) {
      return "Consider setting boundaries for your digital usage with Zenith's smart reminders.";
    } else {
      return "Try Zenith's real-time emotion tracking to better understand and manage your digital wellbeing.";
    }
  };

  return (
    <div className="landing-page">
      {}
      <section className="hero">
        <div className="hero-content">
          <h1 className="hero-title">Enhance Your Digital Wellbeing</h1>
          <p className="hero-subtitle">
            Zenith Wellness helps you understand and improve your emotional health through 
            AI-powered insights from your digital interactions.
          </p>
          <div className="hero-buttons">
            <button 
              className="btn btn-primary"
              onClick={() => navigate('/dashboard')}
            >
              Get Started
            </button>
            <button 
              className="btn btn-secondary"
              onClick={() => navigate('/login')}
            >
              Sign In
            </button>
          </div>
        </div>
        <div className="hero-image">
          <div className="dashboard-preview">
            <div className="preview-header">
              <div className="preview-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
            </div>
            <div className="preview-content">
              <div className="preview-chart"></div>
              <div className="preview-stats">
                <div className="stat-card">
                  <div className="stat-value">82</div>
                  <div className="stat-label">Wellness Score</div>
                </div>
                <div className="stat-card">
                  <div className="stat-value emoji">😊</div>
                  <div className="stat-label">Current Mood</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="wellness-calculator">
        <div className="section-header">
          <h2 className="section-title">Your Digital Wellness Score</h2>
          <p className="section-subtitle">
            Take our quick 6-question quiz to get your personalized wellness score
          </p>
        </div>
        {!showWellnessQuiz ? (
          <div className="calculator-cta">
            <button 
              className="btn btn-primary btn-large"
              onClick={() => setShowWellnessQuiz(true)}
            >
              Calculate Your Score
            </button>
          </div>
        ) : wellnessScore === null ? (
          <div className="quiz-container">
            <div className="quiz-progress">
              <div className="progress-bar">
                <div 
                  className="progress-fill" 
                  style={{ width: `${((quizStep + 1) / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
              <div className="progress-text">
                Question {quizStep + 1} of {quizQuestions.length}
              </div>
            </div>
            <div className="quiz-question">
              <h3>{quizQuestions[quizStep]}</h3>
              <div className="quiz-options">
                {[0, 1, 2, 3, 4].map((value) => (
                  <button
                    key={value}
                    className="btn btn-secondary quiz-option"
                    onClick={() => handleAnswerSelect(value)}
                  >
                    {value === 0 && "Never"}
                    {value === 1 && "Rarely"}
                    {value === 2 && "Sometimes"}
                    {value === 3 && "Often"}
                    {value === 4 && "Always"}
                  </button>
                ))}
              </div>
            </div>
            <button 
              className="btn btn-outline"
              onClick={resetQuiz}
            >
              Cancel
            </button>
          </div>
        ) : (
          <div className="quiz-results">
            <div className="score-display">
              <div className="score-value">{wellnessScore}/100</div>
              <div className="score-label">Your Wellness Score</div>
            </div>
            <div className="score-tip">
              <p>{getPersonalizedTip(wellnessScore)}</p>
            </div>
            <div className="quiz-actions">
              <button 
                className="btn btn-primary"
                onClick={resetQuiz}
              >
                Retake Quiz
              </button>
              <button 
                className="btn btn-secondary"
                onClick={() => navigate('/signup')}
              >
                Get Zenith
              </button>
            </div>
          </div>
        )}
      </section>

      {}
      <section className="features">
        <div className="section-header">
          <h2 className="section-title">Powerful Wellness Insights</h2>
          <p className="section-subtitle">
            Our AI analyzes your digital behavior to provide meaningful insights into your emotional health
          </p>
        </div>
        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title">{feature.title}</h3>
              <p className="feature-description">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {}
      <section className="how-it-works">
        <div className="section-header">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">
            Simple steps to start your wellness journey
          </p>
        </div>
        <div className="steps">
          <div className="step">
            <div className="step-number">1</div>
            <h3 className="step-title">Sign Up</h3>
            <p className="step-description">Create your account and set up your preferences</p>
          </div>
          <div className="step">
            <div className="step-number">2</div>
            <h3 className="step-title">Connect</h3>
            <p className="step-description">Allow camera access for emotion detection</p>
          </div>
          <div className="step">
            <div className="step-number">3</div>
            <h3 className="step-title">Analyze</h3>
            <p className="step-description">Our AI monitors your digital interactions</p>
          </div>
          <div className="step">
            <div className="step-number">4</div>
            <h3 className="step-title">Improve</h3>
            <p className="step-description">Receive personalized wellness recommendations</p>
          </div>
        </div>
      </section>

      {}
      <section className="science-section">
        <div className="section-header">
          <h2 className="section-title">Science Behind Zenith</h2>
          <p className="section-subtitle">
            Backed by research, designed for real impact
          </p>
        </div>
        <div className="science-content">
          <div className="science-card">
            <div className="science-icon">🧠</div>
            <h3>Emotion Detection</h3>
            <p>
              Powered by FER-2013 model with 92% accuracy in detecting 7 core emotions. 
              Real-time facial analysis with on-device processing ensures your privacy.
            </p>
          </div>
          <div className="science-card">
            <div className="science-icon">👁️</div>
            <h3>Eye Tracking</h3>
            <p>
              WebGazer.js provides 85% accuracy for attention heatmap generation. 
              Tobii hardware integration available for research-grade precision.
            </p>
          </div>
          <div className="science-card">
            <div className="science-icon">🔒</div>
            <h3>Privacy First</h3>
            <p>
              No raw data stored. All processing happens on-device. 
              Facial data deleted after 24h. HIPAA & GDPR compliant.
            </p>
          </div>
        </div>
      </section>

      {}
      <section className="problem-statement">
        <div className="section-header">
          <h2 className="section-title">The Digital Wellness Crisis</h2>
          <p className="section-subtitle">
            73% of university students report increased anxiety from social media usage
          </p>
        </div>
        <div className="problem-stats">
          <div className="stat-card">
            <div className="stat-value">4.8h</div>
            <div className="stat-label">Avg. daily screen time</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">67%</div>
            <div className="stat-label">Feel anxious after scrolling</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">3.2h</div>
            <div className="stat-label">Lost to distraction daily</div>
          </div>
        </div>
      </section>

      {}
      <section className="user-stories">
        <div className="section-header">
          <h2 className="section-title">Real User Stories</h2>
          <p className="section-subtitle">
            Anonymized testimonials from students who transformed their digital wellness
          </p>
        </div>
        <div className="stories-carousel">
          <div className="story-card">
            <div className="story-avatar blurred"></div>
            <div className="story-content">
              <p className="story-text">
                "Zenith caught me spiraling on X at 2 AM and suggested a breathing break. Saved my night."
              </p>
              <div className="story-author">
                <span className="author-info">PolyU Year 3</span>
              </div>
            </div>
          </div>
          <div className="story-card">
            <div className="story-avatar blurred"></div>
            <div className="story-content">
              <p className="story-text">
                "I never realized how much social media was affecting my mood until I started using Zenith. 
                The insights helped me set boundaries."
              </p>
              <div className="story-author">
                <span className="author-info">HKU Year 2</span>
              </div>
            </div>
          </div>
          <div className="story-card">
            <div className="story-avatar blurred"></div>
            <div className="story-content">
              <p className="story-text">
                "The emotion tracking feature is eye-opening. I can now see patterns in my stress levels 
                and take proactive steps to manage them."
              </p>
              <div className="story-author">
                <span className="author-info">CUHK Year 4</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {}
      <section className="extension-cta">
        <div className="cta-content">
          <div className="cta-text">
            <h2>👀 3,241 HK students are protecting their peace today. Join them?</h2>
          </div>
          <div className="cta-actions">
            <button className="btn btn-primary btn-large">
              Install Now
            </button>
          </div>
        </div>
      </section>

      {}
      <footer style={{ 
        textAlign: 'center', 
        padding: '30px 20px', 
        color: '#64748b', 
        fontSize: '0.9rem',
        borderTop: '1px solid #e2e8f0',
        marginTop: '40px',
        maxWidth: '100vw',
        width: '100%',
        margin: '40px auto 0',
        boxSizing: 'border-box'
      }}>
        <p>🌟 <strong>ZENITH</strong> | Protecting Hong Kong Gen Z</p>
        <p>🔒 No raw data stored · On-device AI · <a href="#" style={{ color: '#1667c9', textDecoration: 'none' }}>Privacy Policy</a></p>
        <p>Need help? <a href="#" style={{ color: '#1667c9', textDecoration: 'none' }}>Campus Resources</a></p>
      </footer>
    </div>
  );
};

export default LandingPage;
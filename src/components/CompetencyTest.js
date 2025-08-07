'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const CompetencyTest = () => {
  const { data: session } = useSession();
  
  // Stan testu
  const [testState, setTestState] = useState('loading'); // loading, intro, testing, completed, analyzed
  const [testId, setTestId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [progress, setProgress] = useState({ answered: 0, total: 0, percentage: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [analysisResults, setAnalysisResults] = useState(null);

  // Sprawdź stan testu przy załadowaniu
  useEffect(() => {
    if (session?.user) {
      checkExistingTest();
    }
  }, [session]);

  const checkExistingTest = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/competency-test/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const data = await response.json();
      
      if (data.success) {
        setTestId(data.testId);
        
        if (data.existingTest) {
          // Kontynuuj istniejący test
          await loadQuestions(data.testId);
          setProgress(data.progress);
          setTestState('testing');
        } else {
          // Nowy test
          setTestState('intro');
        }
      } else {
        setError(data.error);
        setTestState('error');
      }
    } catch (err) {
      setError('Błąd połączenia z serwerem');
      setTestState('error');
    } finally {
      setLoading(false);
    }
  };

  const loadQuestions = async (currentTestId) => {
    try {
      const response = await fetch(`/api/competency-test/questions?testId=${currentTestId}`);
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
        setAnswers(data.answeredQuestions || {});
        
        // Znajdź pierwsze nieudzielone pytanie
        const firstUnanswered = data.questions.findIndex(q => !data.answeredQuestions[q.id]);
        setCurrentQuestion(firstUnanswered >= 0 ? firstUnanswered : 0);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Błąd podczas ładowania pytań');
    }
  };

  const startTest = async () => {
    try {
      setLoading(true);
      await loadQuestions(testId);
      setTestState('testing');
    } catch (err) {
      setError('Błąd podczas rozpoczynania testu');
    } finally {
      setLoading(false);
    }
  };

  const saveAnswer = async (questionId, answerValue, questionType) => {
    try {
      setLoading(true);
      
      const response = await fetch('/api/competency-test/answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          testId,
          questionId,
          answerValue,
          questionType
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Zaktualizuj lokalny stan
        setAnswers(prev => ({ ...prev, [questionId]: answerValue }));
        setProgress(data.progress);
        
        if (data.isCompleted) {
          setTestState('completed');
        } else {
          // Przejdź do następnego pytania
          const nextQuestion = currentQuestion + 1;
          if (nextQuestion < questions.length) {
            setCurrentQuestion(nextQuestion);
          }
        }
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Błąd podczas zapisywania odpowiedzi');
    } finally {
      setLoading(false);
    }
  };

  const goToQuestion = (index) => {
    if (index >= 0 && index < questions.length) {
      setCurrentQuestion(index);
    }
  };

  // Renderowanie w zależności od stanu
  if (testState === 'loading') {
    return <LoadingScreen />;
  }

  if (testState === 'error') {
    return <ErrorScreen error={error} onRetry={checkExistingTest} />;
  }

  if (testState === 'intro') {
    return (
      <IntroScreen 
        onStart={startTest} 
        loading={loading}
        hasCompletedBefore={false}
      />
    );
  }

  if (testState === 'testing') {
    return (
      <TestingScreen
        questions={questions}
        currentQuestion={currentQuestion}
        answers={answers}
        progress={progress}
        loading={loading}
        onAnswer={saveAnswer}
        onGoToQuestion={goToQuestion}
      />
    );
  }

  if (testState === 'completed') {
    return (
      <CompletedScreen 
        testId={testId}
        progress={progress}
        onAnalyze={(results) => {
          setAnalysisResults(results);
          setTestState('analyzed');
        }}
      />
    );
  }

  if (testState === 'analyzed') {
    return (
      <AnalysisResultsScreen 
        profile={analysisResults}
      />
    );
  }

  return <div>Nieznany stan testu</div>;
};

// =============================================================================
// KOMPONENTY POMOCNICZE - ZAKTUALIZOWANE DO STYLU CHATCOMPONENT
// =============================================================================

const LoadingScreen = () => (
  <>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      @keyframes pulse {
        0%, 100% { opacity: 0.4; }
        50% { opacity: 1; }
      }
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `}</style>
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background particles */}
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '10%',
        width: '6px',
        height: '6px',
        background: 'radial-gradient(circle, #3b82f6, #60a5fa)',
        borderRadius: '50%',
        animation: 'pulse 4s ease-in-out infinite',
        boxShadow: '0 0 12px #3b82f6',
        opacity: 0.3
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '15%',
        width: '8px',
        height: '8px',
        background: 'radial-gradient(circle, #60a5fa, #3b82f6)',
        borderRadius: '50%',
        animation: 'pulse 6s ease-in-out infinite',
        boxShadow: '0 0 15px #60a5fa',
        opacity: 0.2,
        animationDelay: '2s'
      }} />
      
      <div style={{
        textAlign: 'center',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        animation: 'fadeInUp 0.8s ease-out',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{
          width: '64px',
          height: '64px',
          border: '3px solid rgba(59, 130, 246, 0.3)',
          borderTop: '3px solid #3b82f6',
          borderRadius: '50%',
          animation: 'spin 1.2s linear infinite',
          margin: '0 auto 24px auto'
        }} />
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 12px 0',
          background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text'
        }}>
          Ładowanie testu...
        </h2>
        <p style={{
          color: '#64748b',
          margin: 0,
          fontSize: '16px',
          fontWeight: 500
        }}>
          Przygotowujemy dla Ciebie pytania
        </p>
      </div>
    </div>
  </>
);

const ErrorScreen = ({ error, onRetry }) => (
  <>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .button-hover:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
      }
    `}</style>
    
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      padding: '16px'
    }}>
      <div style={{
        textAlign: 'center',
        maxWidth: '400px',
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '24px',
        padding: '48px 40px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
        border: '1px solid rgba(239, 68, 68, 0.2)',
        animation: 'fadeInUp 0.8s ease-out'
      }}>
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          borderRadius: '50%',
          padding: '16px',
          width: '80px',
          height: '80px',
          margin: '0 auto 24px auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(239, 68, 68, 0.2)'
        }}>
          <svg style={{ width: '48px', height: '48px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
        <h2 style={{
          fontSize: '24px',
          fontWeight: 700,
          color: '#1e293b',
          margin: '0 0 12px 0'
        }}>
          Wystąpił błąd
        </h2>
        <p style={{
          color: '#64748b',
          margin: '0 0 32px 0',
          fontSize: '16px',
          lineHeight: '1.6'
        }}>
          {error}
        </p>
        <button
          onClick={onRetry}
          className="button-hover"
          style={{
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '16px',
            padding: '14px 32px',
            borderRadius: '12px',
            border: 'none',
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
          }}
        >
          Spróbuj ponownie
        </button>
      </div>
    </div>
  </>
);

const IntroScreen = ({ onStart, loading, hasCompletedBefore }) => (
  <>
    <style jsx global>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      @keyframes pulse {
        0%, 100% { 
          transform: scale(1);
          opacity: 0.8;
        }
        50% { 
          transform: scale(1.05);
          opacity: 1;
        }
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .button-hover:hover:not(:disabled) {
        transform: translateY(-2px) scale(1.02);
        box-shadow: 0 16px 32px rgba(59, 130, 246, 0.4);
      }
      
      .feature-item:hover {
        transform: translateX(8px);
        background: rgba(59, 130, 246, 0.05);
      }
    `}</style>
    
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '16px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Background elements */}
      <div style={{
        position: 'absolute',
        top: '15%',
        left: '5%',
        width: '12px',
        height: '12px',
        background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(96, 165, 250, 0.2))',
        clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
        animation: 'pulse 8s ease-in-out infinite',
        opacity: 0.3
      }} />
      <div style={{
        position: 'absolute',
        top: '60%',
        right: '10%',
        width: '10px',
        height: '10px',
        background: 'linear-gradient(60deg, rgba(59, 130, 246, 0.4), rgba(96, 165, 250, 0.2))',
        clipPath: 'polygon(30% 0%, 70% 0%, 100% 50%, 70% 100%, 30% 100%, 0% 50%)',
        animation: 'pulse 6s ease-in-out infinite',
        opacity: 0.2,
        animationDelay: '3s'
      }} />
      
      <div style={{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '32px',
        padding: '48px',
        maxWidth: '700px',
        width: '100%',
        boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        animation: 'fadeInUp 0.8s ease-out',
        position: 'relative',
        zIndex: 2
      }}>
        <div style={{ textAlign: 'center', marginBottom: '48px' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            borderRadius: '50%',
            padding: '20px',
            width: '100px',
            height: '100px',
            margin: '0 auto 24px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(59, 130, 246, 0.2)',
            animation: 'pulse 4s ease-in-out infinite'
          }}>
            <svg style={{ width: '60px', height: '60px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Test Kompetencji Zawodowych
          </h1>
          <p style={{
            color: '#64748b',
            fontSize: '18px',
            fontWeight: 500,
            margin: 0
          }}>
            Odkryj swoje predyspozycje w branży budowlanej
          </p>
        </div>

        <div style={{ marginBottom: '48px' }}>
          {[
            {
              icon: '✅',
              title: '32 przemyślane pytania',
              desc: 'Każde pytanie zostało opracowane przez ekspertów branżowych',
              color: '#22c55e'
            },
            {
              icon: '👤',
              title: 'Spersonalizowany profil',
              desc: 'Otrzymasz szczegółową analizę swoich predyspozycji zawodowych',
              color: '#3b82f6'
            },
            {
              icon: '🎯',
              title: 'Rekomendacje zawodów',
              desc: 'Poznaj zawody budowlane najlepiej dopasowane do Twoich umiejętności',
              color: '#8b5cf6'
            },
            {
              icon: '⏰',
              title: '15-20 minut',
              desc: 'Test można przerwać w każdej chwili i kontynuować później',
              color: '#f59e0b'
            }
          ].map((feature, index) => (
            <div
              key={index}
              className="feature-item"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '16px',
                padding: '20px',
                marginBottom: '16px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'default',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
                backgroundColor: 'rgba(255, 255, 255, 0.5)',
                backdropFilter: 'blur(10px)'
              }}
            >
              <div style={{
                backgroundColor: `${feature.color}15`,
                borderRadius: '50%',
                padding: '12px',
                minWidth: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: `2px solid ${feature.color}30`,
                fontSize: '20px'
              }}>
                {feature.icon}
              </div>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1e293b',
                  margin: '0 0 4px 0'
                }}>
                  {feature.title}
                </h3>
                <p style={{
                  color: '#64748b',
                  fontSize: '15px',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {feature.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {hasCompletedBefore && (
          <div style={{
            backgroundColor: 'rgba(245, 158, 11, 0.1)',
            border: '1px solid rgba(245, 158, 11, 0.3)',
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '32px',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <svg style={{ width: '20px', height: '20px', color: '#f59e0b', marginRight: '12px' }} fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <p style={{
                color: '#92400e',
                fontSize: '15px',
                fontWeight: 500,
                margin: 0
              }}>
                <strong>Uwaga:</strong> Już wykonałeś ten test wcześniej. Rozpoczęcie nowego testu zastąpi poprzednie wyniki.
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onStart}
          disabled={loading}
          className="button-hover"
          style={{
            width: '100%',
            background: loading 
              ? 'rgba(148, 163, 184, 0.5)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: '#ffffff',
            fontWeight: 700,
            fontSize: '18px',
            padding: '20px 32px',
            borderRadius: '16px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: loading 
              ? 'none' 
              : '0 8px 25px rgba(59, 130, 246, 0.4)',
            opacity: loading ? 0.7 : 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '12px'
          }}
        >
          {loading ? (
            <>
              <div style={{
                width: '20px',
                height: '20px',
                border: '2px solid rgba(255, 255, 255, 0.3)',
                borderTop: '2px solid #ffffff',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              <span>Przygotowuję test...</span>
            </>
          ) : (
            <>
              <span>Rozpocznij Test Kompetencji</span>
              <span style={{ fontSize: '24px' }}>🚀</span>
            </>
          )}
        </button>
      </div>
    </div>
  </>
);

const TestingScreen = ({ 
  questions, 
  currentQuestion, 
  answers, 
  progress, 
  loading, 
  onAnswer, 
  onGoToQuestion 
}) => {
  const question = questions[currentQuestion];
  
  if (!question) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .button-hover:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: '20px'
      }}>
        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
          {/* Progress section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '32px',
            marginBottom: '24px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <h2 style={{
                fontSize: '24px',
                fontWeight: 700,
                color: '#1e293b',
                margin: 0
              }}>
                Pytanie {currentQuestion + 1} z {questions.length}
              </h2>
              <span style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                {progress.percentage}% ukończone
              </span>
            </div>
            
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '12px',
              height: '12px',
              overflow: 'hidden',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                height: '100%',
                borderRadius: '12px',
                transition: 'all 0.3s ease',
                width: `${progress.percentage}%`,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }} />
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              fontSize: '14px',
              color: '#64748b',
              marginTop: '12px',
              fontWeight: 500
            }}>
              <span>Odpowiedziano: {progress.answered}</span>
              <span>Pozostało: {progress.total - progress.answered}</span>
            </div>
          </div>

          {/* Question section */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.2s',
            animationFillMode: 'backwards'
          }}>
            <div style={{ marginBottom: '32px' }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 600,
                color: '#3b82f6',
                marginBottom: '12px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '6px 12px',
                borderRadius: '8px',
                display: 'inline-block',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                {question.category} • {question.subcategory}
              </div>
              <h1 style={{
                fontSize: '28px',
                fontWeight: 700,
                color: '#1e293b',
                lineHeight: '1.4',
                margin: 0
              }}>
                {question.questionText}
              </h1>
            </div>

            <QuestionInput
              question={question}
              currentAnswer={answers[question.id]}
              onAnswer={onAnswer}
              loading={loading}
            />
          </div>

          {/* Navigation */}
          <div style={{
            marginTop: '24px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.4s',
            animationFillMode: 'backwards'
          }}>
            <button
              onClick={() => onGoToQuestion(currentQuestion - 1)}
              disabled={currentQuestion === 0}
              className="button-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                color: currentQuestion === 0 ? '#94a3b8' : '#64748b',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: '1px solid rgba(0, 0, 0, 0.1)',
                cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: currentQuestion === 0 ? 0.5 : 1,
                boxShadow: currentQuestion === 0 ? 'none' : '0 4px 15px rgba(0, 0, 0, 0.1)'
              }}
            >
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span>Poprzednie</span>
            </button>

            <div style={{ textAlign: 'center' }}>
              <p style={{
                fontSize: '14px',
                color: '#64748b',
                margin: 0,
                fontWeight: 500
              }}>
                Możesz wrócić do tego pytania później
              </p>
            </div>

            <button
              onClick={() => onGoToQuestion(currentQuestion + 1)}
              disabled={currentQuestion === questions.length - 1}
              className="button-hover"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 24px',
                color: currentQuestion === questions.length - 1 ? '#94a3b8' : '#3b82f6',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                borderRadius: '12px',
                border: currentQuestion === questions.length - 1 ? '1px solid rgba(0, 0, 0, 0.1)' : '1px solid rgba(59, 130, 246, 0.3)',
                cursor: currentQuestion === questions.length - 1 ? 'not-allowed' : 'pointer',
                fontSize: '16px',
                fontWeight: 500,
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: currentQuestion === questions.length - 1 ? 0.5 : 1,
                boxShadow: currentQuestion === questions.length - 1 ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.2)'
              }}
            >
              <span>Następne</span>
              <svg style={{ width: '16px', height: '16px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const QuestionInput = ({ question, currentAnswer, onAnswer, loading }) => {
  // WSZYSTKIE HOOKI MUSZĄ BYĆ NA POCZĄTKU - BEZ WARUNKÓW!
  const [selectedValue, setSelectedValue] = useState('');
  const [rankingOrder, setRankingOrder] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [textValue, setTextValue] = useState('');

  // KLUCZOWY FIX: Reset stanu gdy zmienia się pytanie
  useEffect(() => {
    console.log('🔄 QuestionInput: Pytanie się zmieniło, resetuję stan');
    console.log('🔍 Aktualna odpowiedź:', currentAnswer);
    console.log('🔍 Typ pytania:', question.questionType);
    
    if (question.questionType === 'SINGLE_CHOICE' || question.questionType === 'SLIDER') {
      setSelectedValue(currentAnswer || '');
      setRankingOrder([]);
      setSelectedOptions([]);
      setTextValue('');
    } else if (question.questionType === 'MULTIPLE_CHOICE') {
      setSelectedOptions(Array.isArray(currentAnswer) ? currentAnswer : []);
      setSelectedValue('');
      setRankingOrder([]);
      setTextValue('');
    } else if (question.questionType === 'RANKING') {
      setRankingOrder(Array.isArray(currentAnswer) ? currentAnswer : []);
      setSelectedValue('');
      setSelectedOptions([]);
      setTextValue('');
    } else if (question.questionType === 'TEXT_SHORT') {
      setTextValue(currentAnswer || '');
      setSelectedValue('');
      setRankingOrder([]);
      setSelectedOptions([]);
    }
  }, [question.id, question.questionType, currentAnswer]); // Dodajemy question.id jako dependency

  // FUNKCJE POMOCNICZE
  const handleSubmit = () => {
    console.log('📝 Zapisuję odpowiedź dla pytania:', question.id);
    console.log('📝 Typ pytania:', question.questionType);
    
    if (question.questionType === 'RANKING') {
      if (rankingOrder.length > 0) {
        console.log('📝 RANKING - zapisuję:', rankingOrder);
        onAnswer(question.id, rankingOrder, question.questionType);
      } else {
        console.log('❌ RANKING - brak odpowiedzi');
      }
    } else if (question.questionType === 'MULTIPLE_CHOICE') {
      if (selectedOptions.length > 0) {
        console.log('📝 MULTIPLE_CHOICE - zapisuję:', selectedOptions);
        onAnswer(question.id, selectedOptions, question.questionType);
      } else {
        console.log('❌ MULTIPLE_CHOICE - brak odpowiedzi');
      }
    } else if (question.questionType === 'TEXT_SHORT') {
      if (textValue.trim() !== '') {
        console.log('📝 TEXT_SHORT - zapisuję:', textValue.trim());
        onAnswer(question.id, textValue.trim(), question.questionType);
      } else {
        console.log('❌ TEXT_SHORT - brak odpowiedzi');
      }
    } else if (selectedValue !== '') {
      console.log('📝 SINGLE_CHOICE/SLIDER - zapisuję:', selectedValue);
      onAnswer(question.id, selectedValue, question.questionType);
    } else {
      console.log('❌ Brak odpowiedzi do zapisania');
    }
  };

  const handleToggleOption = (optionValue) => {
    console.log('🔄 Toggle opcji:', optionValue);
    console.log('🔍 Aktualne opcje przed toggle:', selectedOptions);
    
    let newOptions;
    if (selectedOptions.includes(optionValue)) {
      newOptions = selectedOptions.filter(val => val !== optionValue);
      console.log('➖ Usuwam opcję:', optionValue);
    } else {
      newOptions = [...selectedOptions, optionValue];
      console.log('➕ Dodaję opcję:', optionValue);
    }
    
    console.log('🔍 Nowe opcje po toggle:', newOptions);
    setSelectedOptions(newOptions);
  };

  const handleTextSubmit = () => {
    if (textValue.trim() !== '') {
      console.log('📝 TEXT_SHORT submit:', textValue.trim());
      onAnswer(question.id, textValue.trim(), question.questionType);
    }
  };

  const handleMultipleSubmit = () => {
    if (selectedOptions.length > 0) {
      console.log('📝 MULTIPLE_CHOICE submit:', selectedOptions);
      onAnswer(question.id, selectedOptions, question.questionType);
    }
  };

  // RENDEROWANIE W ZALEŻNOŚCI OD TYPU
  if (question.questionType === 'SINGLE_CHOICE') {
    return (
      <>
        <style jsx>{`
          .option-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
          }
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            fontSize: '14px',
            color: '#64748b',
            marginBottom: '8px',
            fontWeight: 500,
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            padding: '8px 12px',
            borderRadius: '8px',
            border: '1px solid rgba(59, 130, 246, 0.2)'
          }}>
            ℹ️ Wybierz jedną odpowiedź | Aktualna wartość: {selectedValue || 'brak'}
          </div>
          
          {question.options.map((option, index) => (
            <label
              key={index}
              className="option-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                border: selectedValue === option.value 
                  ? '2px solid #3b82f6' 
                  : '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: selectedValue === option.value 
                  ? 'rgba(59, 130, 246, 0.05)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: selectedValue === option.value 
                  ? '0 8px 25px rgba(59, 130, 246, 0.15)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <input
                type="radio"
                name={`question_${question.id}`} // Unikalny name dla każdego pytania
                value={option.value}
                checked={selectedValue === option.value}
                onChange={(e) => {
                  console.log('🔄 Radio change:', e.target.value);
                  setSelectedValue(e.target.value);
                }}
                style={{ display: 'none' }}
              />
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                border: selectedValue === option.value 
                  ? '6px solid #3b82f6' 
                  : '2px solid #cbd5e1',
                marginRight: '16px',
                transition: 'all 0.2s ease',
                backgroundColor: '#ffffff',
                boxShadow: selectedValue === option.value 
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                  : 'none'
              }} />
              <span style={{
                color: '#1e293b',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '1.5'
              }}>
                {option.text}
              </span>
            </label>
          ))}
          
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || selectedValue === ''}
              className="submit-button"
              style={{
                width: '100%',
                background: loading || selectedValue === '' 
                  ? 'rgba(148, 163, 184, 0.5)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '18px',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || selectedValue === '' ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading || selectedValue === '' 
                  ? 'none' 
                  : '0 6px 20px rgba(59, 130, 246, 0.4)',
                opacity: loading || selectedValue === '' ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Zapisuję...</span>
                </>
              ) : (
                'Zapisz odpowiedź'
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (question.questionType === 'MULTIPLE_CHOICE') {
    return (
      <>
        <style jsx>{`
          .option-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
          }
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            padding: '16px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '8px'
          }}>
            <p style={{
              color: '#3b82f6',
              fontSize: '14px',
              fontWeight: 600,
              margin: '0 0 4px 0'
            }}>
              📝 Instrukcja:
            </p>
            <p style={{
              color: '#475569',
              fontSize: '14px',
              margin: '0 0 8px 0'
            }}>
              Możesz wybrać więcej niż jedną odpowiedź.
            </p>
            <p style={{
              color: '#8b5cf6',
              fontSize: '12px',
              margin: 0,
              fontWeight: 600
            }}>
              Zaznaczone: {selectedOptions.length} opcji
            </p>
          </div>

          {question.options.map((option, index) => (
            <label
              key={index}
              className="option-card"
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '20px 24px',
                border: selectedOptions.includes(option.value)
                  ? '2px solid #3b82f6' 
                  : '2px solid rgba(0, 0, 0, 0.1)',
                borderRadius: '16px',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                backgroundColor: selectedOptions.includes(option.value)
                  ? 'rgba(59, 130, 246, 0.05)' 
                  : 'rgba(255, 255, 255, 0.8)',
                backdropFilter: 'blur(10px)',
                boxShadow: selectedOptions.includes(option.value)
                  ? '0 8px 25px rgba(59, 130, 246, 0.15)' 
                  : '0 2px 8px rgba(0, 0, 0, 0.05)'
              }}
            >
              <input
                type="checkbox"
                checked={selectedOptions.includes(option.value)}
                onChange={() => handleToggleOption(option.value)}
                style={{ display: 'none' }}
              />
              <div style={{
                width: '20px',
                height: '20px',
                borderRadius: '4px',
                border: selectedOptions.includes(option.value)
                  ? '2px solid #3b82f6' 
                  : '2px solid #cbd5e1',
                marginRight: '16px',
                transition: 'all 0.2s ease',
                backgroundColor: selectedOptions.includes(option.value) ? '#3b82f6' : '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: selectedOptions.includes(option.value)
                  ? '0 2px 8px rgba(59, 130, 246, 0.3)' 
                  : 'none'
              }}>
                {selectedOptions.includes(option.value) && (
                  <svg style={{ width: '12px', height: '12px', color: '#ffffff' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
              <span style={{
                color: '#1e293b',
                fontSize: '16px',
                fontWeight: 500,
                lineHeight: '1.5'
              }}>
                {option.text}
              </span>
            </label>
          ))}
          
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={handleMultipleSubmit}
              disabled={loading || selectedOptions.length === 0}
              className="submit-button"
              style={{
                width: '100%',
                background: loading || selectedOptions.length === 0
                  ? 'rgba(148, 163, 184, 0.5)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '18px',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || selectedOptions.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading || selectedOptions.length === 0
                  ? 'none' 
                  : '0 6px 20px rgba(59, 130, 246, 0.4)',
                opacity: loading || selectedOptions.length === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Zapisuję...</span>
                </>
              ) : (
                <>
                  <span>Zapisz odpowiedzi</span>
                  {selectedOptions.length > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 700
                    }}>
                      {selectedOptions.length} wybrane
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (question.questionType === 'RANKING') {
    return (
      <>
        <style jsx>{`
          .ranking-item {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            cursor: move;
          }
          
          .ranking-item:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 25px rgba(59, 130, 246, 0.2);
          }
          
          .ranking-item.selected {
            border-color: #3b82f6;
            background-color: rgba(59, 130, 246, 0.05);
          }
          
          .submit-button:hover:not(:disabled) {
            transform: translateY(-2px) scale(1.02);
            box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
          }
        `}</style>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          <div style={{
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
            borderRadius: '12px',
            padding: '20px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            marginBottom: '16px'
          }}>
            <p style={{
              color: '#3b82f6',
              fontSize: '16px',
              fontWeight: 600,
              margin: '0 0 8px 0'
            }}>
              📋 Instrukcja:
            </p>
            <p style={{
              color: '#475569',
              fontSize: '15px',
              margin: 0,
              lineHeight: '1.5'
            }}>
              Uporządkuj opcje od najważniejszej (1) do najmniej ważnej ({question.options.length}). 
              Kliknij na opcję, aby dodać ją do rankingu.
            </p>
          </div>

          {/* Dostępne opcje */}
          <div>
            <h4 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: '#1e293b',
              marginBottom: '12px'
            }}>
              Dostępne opcje:
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {question.options.filter(option => !rankingOrder.find(r => r.value === option.value)).map((option, index) => (
                <div
                  key={index}
                  className="ranking-item"
                  onClick={() => {
                    setRankingOrder([...rankingOrder, { ...option, rank: rankingOrder.length + 1 }]);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 20px',
                    border: '2px solid rgba(0, 0, 0, 0.1)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)'
                  }}
                >
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    border: '2px solid #cbd5e1',
                    marginRight: '16px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ffffff',
                    fontSize: '18px',
                    color: '#64748b'
                  }}>
                    +
                  </div>
                  <span style={{
                    color: '#1e293b',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '1.5'
                  }}>
                    {option.text}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Ranking */}
          {rankingOrder.length > 0 && (
            <div>
              <h4 style={{
                fontSize: '16px',
                fontWeight: 600,
                color: '#1e293b',
                marginBottom: '12px'
              }}>
                Twój ranking:
              </h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {rankingOrder.map((item, index) => (
                  <div
                    key={index}
                    className="ranking-item selected"
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      padding: '16px 20px',
                      border: '2px solid #3b82f6',
                      borderRadius: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)'
                    }}
                  >
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      border: '2px solid #3b82f6',
                      marginRight: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: '#3b82f6',
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#ffffff'
                    }}>
                      {index + 1}
                    </div>
                    <span style={{
                      color: '#1e293b',
                      fontSize: '16px',
                      fontWeight: 500,
                      lineHeight: '1.5',
                      flex: 1
                    }}>
                      {item.text}
                    </span>
                    <button
                      onClick={() => {
                        setRankingOrder(rankingOrder.filter((_, i) => i !== index));
                      }}
                      style={{
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        borderRadius: '8px',
                        padding: '8px',
                        cursor: 'pointer',
                        color: '#ef4444',
                        fontSize: '14px',
                        fontWeight: 500,
                        marginLeft: '12px'
                      }}
                      title="Usuń z rankingu"
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ paddingTop: '24px' }}>
            <button
              onClick={handleSubmit}
              disabled={loading || rankingOrder.length === 0}
              className="submit-button"
              style={{
                width: '100%',
                background: loading || rankingOrder.length === 0
                  ? 'rgba(148, 163, 184, 0.5)' 
                  : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '18px',
                padding: '16px 32px',
                borderRadius: '12px',
                border: 'none',
                cursor: loading || rankingOrder.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: loading || rankingOrder.length === 0
                  ? 'none' 
                  : '0 6px 20px rgba(59, 130, 246, 0.4)',
                opacity: loading || rankingOrder.length === 0 ? 0.6 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              {loading ? (
                <>
                  <div style={{
                    width: '20px',
                    height: '20px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                  <span>Zapisuję...</span>
                </>
              ) : (
                <>
                  <span>Zapisz ranking</span>
                  {rankingOrder.length > 0 && (
                    <span style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.2)',
                      padding: '4px 8px',
                      borderRadius: '6px',
                      fontSize: '14px',
                      fontWeight: 700
                    }}>
                      {rankingOrder.length}/{question.options.length}
                    </span>
                  )}
                </>
              )}
            </button>
          </div>
        </div>
      </>
    );
  }

  if (question.questionType === 'SLIDER') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
        <div style={{ padding: '0 16px' }}>
          <input
            type="range"
            min={question.options.min}
            max={question.options.max}
            value={selectedValue || question.options.min}
            onChange={(e) => setSelectedValue(parseInt(e.target.value))}
            style={{
              width: '100%',
              height: '8px',
              background: 'linear-gradient(to right, #3b82f6, #60a5fa)',
              borderRadius: '4px',
              outline: 'none',
              cursor: 'pointer',
              WebkitAppearance: 'none',
              appearance: 'none'
            }}
          />
          
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: '#64748b',
            marginTop: '12px',
            fontWeight: 500
          }}>
            <span>{question.options.labels[question.options.min]}</span>
            <div style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              padding: '8px 16px',
              borderRadius: '12px',
              border: '2px solid rgba(59, 130, 246, 0.2)'
            }}>
              {selectedValue || question.options.min}
            </div>
            <span>{question.options.labels[question.options.max]}</span>
          </div>
          
          {question.options.description && (
            <p style={{
              fontSize: '15px',
              color: '#64748b',
              marginTop: '16px',
              textAlign: 'center',
              lineHeight: '1.5',
              fontWeight: 500
            }}>
              {question.options.description}
            </p>
          )}
        </div>
        
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="submit-button"
          style={{
            width: '100%',
            background: loading 
              ? 'rgba(148, 163, 184, 0.5)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '18px',
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: loading 
              ? 'none' 
              : '0 6px 20px rgba(59, 130, 246, 0.4)',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Zapisuję...' : 'Zapisz odpowiedź'}
        </button>
      </div>
    );
  }

  if (question.questionType === 'TEXT_SHORT') {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div style={{
          backgroundColor: 'rgba(59, 130, 246, 0.05)',
          borderRadius: '12px',
          padding: '16px',
          border: '1px solid rgba(59, 130, 246, 0.2)'
        }}>
          <p style={{
            color: '#3b82f6',
            fontSize: '14px',
            fontWeight: 600,
            margin: '0 0 4px 0'
          }}>
            ✏️ Instrukcja:
          </p>
          <p style={{
            color: '#475569',
            fontSize: '14px',
            margin: 0
          }}>
            Napisz krótką odpowiedź (maksymalnie 200 znaków).
          </p>
        </div>

        <div>
          <textarea
            value={textValue}
            onChange={(e) => setTextValue(e.target.value)}
            maxLength={200}
            rows={3}
            placeholder="Wpisz swoją odpowiedź..."
            style={{
              width: '100%',
              padding: '16px 20px',
              borderRadius: '12px',
              border: '2px solid rgba(0, 0, 0, 0.1)',
              outline: 'none',
              resize: 'none',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              color: '#1e293b',
              fontSize: '16px',
              fontFamily: 'inherit',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              backdropFilter: 'blur(10px)',
              boxSizing: 'border-box'
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#3b82f6';
              e.target.style.backgroundColor = 'rgba(59, 130, 246, 0.02)';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(0, 0, 0, 0.1)';
              e.target.style.backgroundColor = 'rgba(255, 255, 255, 0.8)';
            }}
          />
          <div style={{
            textAlign: 'right',
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '8px',
            fontWeight: 500
          }}>
            {textValue.length}/200 znaków
          </div>
        </div>
        
        <button
          onClick={handleTextSubmit}
          disabled={loading || textValue.trim() === ''}
          className="submit-button"
          style={{
            width: '100%',
            background: loading || textValue.trim() === ''
              ? 'rgba(148, 163, 184, 0.5)' 
              : 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            color: '#ffffff',
            fontWeight: 600,
            fontSize: '18px',
            padding: '16px 32px',
            borderRadius: '12px',
            border: 'none',
            cursor: loading || textValue.trim() === '' ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: loading || textValue.trim() === ''
              ? 'none' 
              : '0 6px 20px rgba(59, 130, 246, 0.4)',
            opacity: loading || textValue.trim() === '' ? 0.6 : 1
          }}
        >
          {loading ? 'Zapisuję...' : 'Zapisz odpowiedź'}
        </button>
      </div>
    );
  }

  return (
    <div style={{
      textAlign: 'center',
      padding: '40px 20px',
      backgroundColor: 'rgba(239, 68, 68, 0.05)',
      borderRadius: '16px',
      border: '1px solid rgba(239, 68, 68, 0.2)'
    }}>
      <div style={{
        fontSize: '18px',
        color: '#ef4444',
        fontWeight: 600
      }}>
        Nieobsługiwany typ pytania: {question.questionType}
      </div>
    </div>
  );
};

const CompletedScreen = ({ testId, progress, onAnalyze }) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisError, setAnalysisError] = useState(null);

  const handleAnalyze = async () => {
    try {
      setIsAnalyzing(true);
      setAnalysisError(null);
      
      console.log(`🧠 Rozpoczynam analizę AI dla testu ${testId}`);
      
      const response = await fetch('/api/competency-test/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testId }),
      });

      const data = await response.json();
      
      if (data.success) {
        console.log('✅ Analiza zakończona pomyślnie:', data.profile);
        onAnalyze(data.profile);
      } else {
        console.error('❌ Błąd analizy:', data.error);
        setAnalysisError(data.error || 'Wystąpił błąd podczas analizy');
      }
    } catch (error) {
      console.error('❌ Błąd połączenia:', error);
      setAnalysisError('Błąd połączenia z serwerem. Spróbuj ponownie.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        @keyframes pulse {
          0%, 100% { 
            transform: scale(1);
            opacity: 0.8;
          }
          50% { 
            transform: scale(1.05);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        .button-hover:hover:not(:disabled) {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 16px 32px rgba(168, 85, 247, 0.4);
        }
        
        .stat-card:hover {
          transform: translateY(-4px) scale(1.02);
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Background elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          left: '5%',
          width: '60px',
          height: '60px',
          background: 'radial-gradient(circle, rgba(34, 197, 94, 0.2), transparent)',
          borderRadius: '50%',
          animation: 'pulse 8s ease-in-out infinite',
          opacity: 0.6
        }} />
        <div style={{
          position: 'absolute',
          bottom: '15%',
          right: '8%',
          width: '40px',
          height: '40px',
          background: 'radial-gradient(circle, rgba(168, 85, 247, 0.2), transparent)',
          borderRadius: '50%',
          animation: 'pulse 6s ease-in-out infinite',
          opacity: 0.4,
          animationDelay: '3s'
        }} />
        
        <div style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          borderRadius: '32px',
          padding: '48px',
          maxWidth: '700px',
          width: '100%',
          textAlign: 'center',
          boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          animation: 'fadeInUp 0.8s ease-out',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Success icon */}
          <div style={{
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            borderRadius: '50%',
            padding: '20px',
            width: '100px',
            height: '100px',
            margin: '0 auto 32px auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: '3px solid rgba(34, 197, 94, 0.2)',
            animation: 'pulse 4s ease-in-out infinite'
          }}>
            <svg style={{ width: '60px', height: '60px', color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          {/* Title */}
          <h1 style={{
            fontSize: '36px',
            fontWeight: 800,
            margin: '0 0 12px 0',
            background: 'linear-gradient(135deg, #22c55e, #16a34a)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}>
            Gratulacje! 🎉
          </h1>
          
          <p style={{
            fontSize: '20px',
            color: '#64748b',
            margin: '0 0 40px 0',
            fontWeight: 500
          }}>
            Ukończyłeś test kompetencji zawodowych
          </p>
          
          {/* Statistics */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(168, 85, 247, 0.05))',
            borderRadius: '20px',
            padding: '32px',
            marginBottom: '40px',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            backdropFilter: 'blur(10px)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '24px'
            }}>
              <div 
                className="stat-card"
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'default'
                }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#3b82f6',
                  marginBottom: '4px'
                }}>
                  {progress.answered}
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Odpowiedzi
                </div>
              </div>
              
              <div 
                className="stat-card"
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'default'
                }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#22c55e',
                  marginBottom: '4px'
                }}>
                  {progress.percentage}%
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Ukończenie
                </div>
              </div>
              
              <div 
                className="stat-card"
                style={{
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  cursor: 'default'
                }}
              >
                <div style={{
                  fontSize: '36px',
                  fontWeight: 800,
                  color: '#a855f7',
                  marginBottom: '4px'
                }}>
                  🤖
                </div>
                <div style={{
                  fontSize: '14px',
                  color: '#64748b',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  Analiza AI
                </div>
              </div>
            </div>
          </div>
          
          {/* Error message */}
          {analysisError && (
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.05)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
              borderRadius: '16px',
              padding: '20px',
              marginBottom: '32px',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg style={{ width: '20px', height: '20px', color: '#ef4444' }} fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p style={{
                  color: '#dc2626',
                  fontSize: '15px',
                  fontWeight: 500,
                  margin: 0
                }}>
                  <strong>Błąd analizy:</strong> {analysisError}
                </p>
              </div>
            </div>
          )}
          
          {/* Analysis button */}
          <button
            onClick={handleAnalyze}
            disabled={isAnalyzing}
            className="button-hover"
            style={{
              width: '100%',
              background: isAnalyzing 
                ? 'rgba(148, 163, 184, 0.5)' 
                : 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '18px',
              padding: '20px 32px',
              borderRadius: '16px',
              border: 'none',
              cursor: isAnalyzing ? 'not-allowed' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              boxShadow: isAnalyzing 
                ? 'none' 
                : '0 8px 25px rgba(168, 85, 247, 0.4)',
              opacity: isAnalyzing ? 0.7 : 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px'
            }}
          >
            {isAnalyzing ? (
              <>
                <div style={{
                  width: '20px',
                  height: '20px',
                  border: '2px solid rgba(255, 255, 255, 0.3)',
                  borderTop: '2px solid #ffffff',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }} />
                <span>Analizuję Twoje odpowiedzi...</span>
              </>
            ) : (
              <>
                <svg style={{ width: '20px', height: '20px' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
                <span>Przeanalizuj wyniki z AI</span>
                <span style={{ fontSize: '24px' }}>🤖</span>
              </>
            )}
          </button>
          
          {/* Time info */}
          <p style={{
            fontSize: '12px',
            color: '#94a3b8',
            marginTop: '16px',
            fontWeight: 500
          }}>
            ⏱️ Analiza AI zazwyczaj trwa 10-30 sekund
          </p>

          {/* Back to home */}
          <div style={{
            marginTop: '32px',
            paddingTop: '32px',
            borderTop: '1px solid rgba(0, 0, 0, 0.1)'
          }}>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                color: '#3b82f6',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '14px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                padding: '8px 16px',
                borderRadius: '8px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = 'rgba(59, 130, 246, 0.1)';
                e.currentTarget.style.color = '#2563eb';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
                e.currentTarget.style.color = '#3b82f6';
              }}
            >
              ← Powrót do głównej strony
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

const AnalysisResultsScreen = ({ profile }) => {
  const [activeTab, setActiveTab] = useState('overview');

  if (!profile) {
    return (
      <>
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        `}</style>
        
        <div style={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
          fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px'
        }}>
          <div style={{
            textAlign: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '24px',
            padding: '48px 40px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(239, 68, 68, 0.2)'
          }}>
            <div style={{
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '50%',
              padding: '16px',
              width: '80px',
              height: '80px',
              margin: '0 auto 24px auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid rgba(239, 68, 68, 0.2)'
            }}>
              <svg style={{ width: '48px', height: '48px', color: '#ef4444' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h2 style={{
              fontSize: '24px',
              fontWeight: 700,
              color: '#1e293b',
              margin: '0 0 12px 0'
            }}>
              Brak wyników analizy
            </h2>
            <p style={{
              color: '#64748b',
              fontSize: '16px',
              margin: 0
            }}>
              Nie udało się załadować wyników analizy.
            </p>
          </div>
        </div>
      </>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Przegląd', icon: '📊' },
    { id: 'careers', label: 'Zawody', icon: '💼' },
    { id: 'competencies', label: 'Kompetencje', icon: '⭐' },
    { id: 'development', label: 'Rozwój', icon: '📈' }
  ];

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .tab-button:hover {
          transform: translateY(-2px);
        }
        
        .action-button:hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 25px rgba(59, 130, 246, 0.4);
        }
      `}</style>
      
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        padding: '20px'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '48px',
            marginBottom: '32px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'fadeInUp 0.8s ease-out'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1), rgba(236, 72, 153, 0.1))',
                borderRadius: '50%',
                padding: '20px',
                width: '100px',
                height: '100px',
                margin: '0 auto 24px auto',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '3px solid rgba(168, 85, 247, 0.2)'
              }}>
                <svg style={{ width: '60px', height: '60px', color: '#a855f7' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              
              <h1 style={{
                fontSize: '36px',
                fontWeight: 800,
                margin: '0 0 20px 0',
                background: 'linear-gradient(135deg, #a855f7, #ec4899)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text'
              }}>
                Twój Profil Zawodowy
              </h1>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                marginBottom: '24px',
                flexWrap: 'wrap'
              }}>
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  color: '#3b82f6',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {profile.personalityType}
                </div>
                <div style={{
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  color: '#22c55e',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 600,
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  Kod Holland'a: {profile.hollandCode}
                </div>
                {profile.confidenceScore && (
                  <div style={{
                    backgroundColor: 'rgba(168, 85, 247, 0.1)',
                    color: '#a855f7',
                    padding: '8px 16px',
                    borderRadius: '12px',
                    fontSize: '14px',
                    fontWeight: 600,
                    border: '1px solid rgba(168, 85, 247, 0.2)'
                  }}>
                    Pewność AI: {Math.round(profile.confidenceScore * 100)}%
                  </div>
                )}
              </div>
              
              {profile.careerProfile && (
                <p style={{
                  color: '#64748b',
                  maxWidth: '800px',
                  margin: '0 auto',
                  lineHeight: '1.7',
                  fontSize: '16px',
                  fontWeight: 500
                }}>
                  {profile.careerProfile}
                </p>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '20px',
            padding: '8px',
            marginBottom: '32px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.1)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.2s',
            animationFillMode: 'backwards'
          }}>
            <div style={{ display: 'flex', gap: '4px' }}>
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="tab-button"
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    padding: '16px 20px',
                    borderRadius: '12px',
                    fontSize: '16px',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    background: activeTab === tab.id
                      ? 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)'
                      : 'transparent',
                    color: activeTab === tab.id ? '#ffffff' : '#64748b',
                    boxShadow: activeTab === tab.id 
                      ? '0 8px 25px rgba(59, 130, 246, 0.3)' 
                      : 'none'
                  }}
                >
                  <span style={{ fontSize: '20px' }}>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div style={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderRadius: '32px',
            padding: '48px',
            boxShadow: '0 25px 50px rgba(0, 0, 0, 0.15)',
            border: '1px solid rgba(59, 130, 246, 0.2)',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.4s',
            animationFillMode: 'backwards'
          }}>
            {activeTab === 'overview' && (
              <OverviewTab profile={profile} />
            )}
            
            {activeTab === 'careers' && (
              <CareersTab careers={profile.recommendedCareers || profile.careerSuggestions} />
            )}
            
            {activeTab === 'competencies' && (
              <CompetenciesTab 
                competencies={profile.competencyScores}
                workValues={profile.workValues}
                environment={profile.preferredEnvironment}
              />
            )}
            
            {activeTab === 'development' && (
              <DevelopmentTab 
                developmentAreas={profile.developmentAreas}
                training={profile.recommendedTraining}
              />
            )}
          </div>

          {/* Action Buttons */}
          <div style={{
            display: 'flex',
            gap: '20px',
            marginTop: '32px',
            animation: 'fadeInUp 0.8s ease-out',
            animationDelay: '0.6s',
            animationFillMode: 'backwards'
          }}>
            <button
              onClick={() => window.location.href = '/'}
              className="action-button"
              style={{
                flex: 1,
                backgroundColor: 'rgba(100, 116, 139, 0.9)',
                backdropFilter: 'blur(20px)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '16px',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 6px 20px rgba(100, 116, 139, 0.3)'
              }}
            >
              🏠 Powrót do głównej
            </button>
            
            <button
              onClick={() => window.location.href = '/tests'}
              className="action-button"
              style={{
                flex: 1,
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                color: '#ffffff',
                fontWeight: 600,
                fontSize: '16px',
                padding: '16px 32px',
                borderRadius: '16px',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                boxShadow: '0 6px 20px rgba(59, 130, 246, 0.4)'
              }}
            >
              🔄 Wykonaj test ponownie
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

// =============================================================================
// KOMPONENTY ZAKŁADEK
// =============================================================================

const OverviewTab = ({ profile }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
    <h2 style={{
      fontSize: '28px',
      fontWeight: 700,
      color: '#1e293b',
      margin: '0 0 32px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '32px' }}>📊</span>
      Przegląd wyników
    </h2>
    
    {/* Quick statistics */}
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '24px'
    }}>
      <div style={{
        background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(59, 130, 246, 0.1))',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '40px',
          fontWeight: 800,
          color: '#3b82f6',
          marginBottom: '8px',
          fontFamily: 'monospace'
        }}>
          {profile.hollandCode}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#3b82f6',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Kod Holland'a
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '4px',
          fontWeight: 500
        }}>
          Typ zainteresowań
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(34, 197, 94, 0.1))',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(34, 197, 94, 0.2)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '40px',
          fontWeight: 800,
          color: '#22c55e',
          marginBottom: '8px'
        }}>
          {profile.recommendedCareers?.length || profile.careerSuggestions?.length || 0}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#22c55e',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Zawody
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '4px',
          fontWeight: 500
        }}>
          Rekomendowane
        </div>
      </div>
      
      <div style={{
        background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(168, 85, 247, 0.1))',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(168, 85, 247, 0.2)',
        textAlign: 'center',
        backdropFilter: 'blur(10px)'
      }}>
        <div style={{
          fontSize: '40px',
          fontWeight: 800,
          color: '#a855f7',
          marginBottom: '8px'
        }}>
          {profile.confidenceScore ? Math.round(profile.confidenceScore * 100) + '%' : '🤖'}
        </div>
        <div style={{
          fontSize: '14px',
          color: '#a855f7',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}>
          Pewność
        </div>
        <div style={{
          fontSize: '12px',
          color: '#64748b',
          marginTop: '4px',
          fontWeight: 500
        }}>
          Analiza AI
        </div>
      </div>
    </div>

    {/* Career profile description */}
    {profile.careerProfile && (
      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>💼</span>
          Twój profil zawodowy
        </h3>
        <p style={{
          color: '#475569',
          lineHeight: '1.7',
          fontSize: '16px',
          margin: 0,
          fontWeight: 500
        }}>
          {profile.careerProfile}
        </p>
      </div>
    )}

    {/* Top 3 careers preview */}
    {(profile.recommendedCareers || profile.careerSuggestions) && (
      <div style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.05), rgba(168, 85, 247, 0.05))',
        borderRadius: '20px',
        padding: '32px',
        border: '1px solid rgba(99, 102, 241, 0.2)',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          Najlepsze dopasowania zawodowe
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {(profile.recommendedCareers || profile.careerSuggestions).slice(0, 3).map((career, index) => (
            <div key={index} style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              borderRadius: '16px',
              padding: '24px',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)',
              border: '1px solid rgba(99, 102, 241, 0.1)',
              backdropFilter: 'blur(10px)'
            }}>
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '18px',
                  fontWeight: 600,
                  color: '#1e293b',
                  marginBottom: '4px'
                }}>
                  {career.job}
                </div>
                {career.description && (
                  <div style={{
                    fontSize: '14px',
                    color: '#64748b',
                    lineHeight: '1.5'
                  }}>
                    {career.description.substring(0, 120)}...
                  </div>
                )}
              </div>
              <div style={{
                textAlign: 'right',
                marginLeft: '24px'
              }}>
                <div style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  color: '#6366f1',
                  backgroundColor: 'rgba(99, 102, 241, 0.1)',
                  padding: '8px 16px',
                  borderRadius: '12px',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }}>
                  {career.match}%
                </div>
                <div style={{
                  fontSize: '10px',
                  color: '#94a3b8',
                  marginTop: '4px',
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  DOPASOWANIE
                </div>
              </div>
            </div>
          ))}
        </div>
        <div style={{
          textAlign: 'center',
          marginTop: '24px'
        }}>
          <span style={{
            fontSize: '14px',
            color: '#64748b',
            fontWeight: 500
          }}>
            Zobacz wszystkie rekomendacje w zakładce "Zawody" →
          </span>
        </div>
      </div>
    )}
  </div>
);

const CareersTab = ({ careers }) => {
  if (!careers || careers.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '80px 20px',
        backgroundColor: 'rgba(100, 116, 139, 0.05)',
        borderRadius: '20px',
        border: '1px solid rgba(100, 116, 139, 0.2)'
      }}>
        <div style={{
          fontSize: '80px',
          marginBottom: '24px',
          opacity: 0.3
        }}>
          💼
        </div>
        <h3 style={{
          fontSize: '20px',
          fontWeight: 600,
          color: '#475569',
          marginBottom: '8px'
        }}>
          Brak rekomendacji zawodów
        </h3>
        <p style={{
          color: '#94a3b8',
          fontSize: '16px',
          margin: 0
        }}>
          Nie znaleziono danych o rekomendowanych zawodach.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <h2 style={{
        fontSize: '28px',
        fontWeight: 700,
        color: '#1e293b',
        margin: '0 0 32px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <span style={{ fontSize: '32px' }}>💼</span>
        Rekomendowane zawody
      </h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {careers.map((career, index) => (
          <div key={index} style={{
            background: `linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))`,
            borderRadius: '20px',
            padding: '32px',
            border: '1px solid rgba(59, 130, 246, 0.1)',
            boxShadow: '0 8px 25px rgba(0, 0, 0, 0.05)',
            backdropFilter: 'blur(10px)',
            transition: 'all 0.3s ease',
            cursor: 'default'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-4px)';
            e.currentTarget.style.boxShadow = '0 12px 35px rgba(0, 0, 0, 0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 8px 25px rgba(0, 0, 0, 0.05)';
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              marginBottom: '20px'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{
                  fontSize: '24px',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '12px'
                }}>
                  {career.job}
                </h3>
                {career.description && (
                  <p style={{
                    color: '#64748b',
                    lineHeight: '1.6',
                    fontSize: '16px',
                    margin: 0,
                    fontWeight: 500
                  }}>
                    {career.description}
                  </p>
                )}
              </div>
              <div style={{
                marginLeft: '32px',
                textAlign: 'center'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  color: '#ffffff',
                  fontSize: '28px',
                  fontWeight: 800,
                  padding: '16px 20px',
                  borderRadius: '16px',
                  marginBottom: '8px',
                  boxShadow: '0 4px 15px rgba(59, 130, 246, 0.3)'
                }}>
                  {career.match}%
                </div>
                <div style={{
                  fontSize: '12px',
                  color: '#94a3b8',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px'
                }}>
                  DOPASOWANIE
                </div>
              </div>
            </div>
            
            {/* Progress bar */}
            <div style={{
              width: '100%',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              height: '8px',
              overflow: 'hidden',
              border: '1px solid rgba(59, 130, 246, 0.2)'
            }}>
              <div style={{
                background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                height: '100%',
                borderRadius: '8px',
                transition: 'all 0.3s ease',
                width: `${career.match}%`,
                boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
              }} />
            </div>
          </div>
        ))}
      </div>

      <div style={{
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
        border: '1px solid rgba(59, 130, 246, 0.2)',
        borderRadius: '20px',
        padding: '32px',
        marginTop: '40px',
        backdropFilter: 'blur(10px)'
      }}>
        <h3 style={{
          fontSize: '18px',
          fontWeight: 700,
          color: '#3b82f6',
          marginBottom: '16px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '20px' }}>💡</span>
          Jak interpretować wyniki?
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '16px',
          fontSize: '15px',
          color: '#475569',
          fontWeight: 500
        }}>
          {[
            { range: '90-100%', desc: 'Idealne dopasowanie - zawód bardzo dobrze pasuje do Twojego profilu', color: '#22c55e' },
            { range: '75-89%', desc: 'Bardzo dobre dopasowanie - warto rozważyć ten kierunek', color: '#3b82f6' },
            { range: '60-74%', desc: 'Dobre dopasowanie - może być ciekawą opcją po dodatkowym szkoleniu', color: '#f59e0b' },
            { range: 'Poniżej 60%', desc: 'Słabe dopasowanie - może wymagać znacznej zmiany profilu', color: '#ef4444' }
          ].map((item, index) => (
            <div key={index} style={{
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
              padding: '16px',
              borderRadius: '12px',
              border: `1px solid ${item.color}20`,
              backdropFilter: 'blur(5px)'
            }}>
              <div style={{
                fontSize: '14px',
                fontWeight: 700,
                color: item.color,
                marginBottom: '4px'
              }}>
                • {item.range}:
              </div>
              <div style={{
                fontSize: '13px',
                lineHeight: '1.4'
              }}>
                {item.desc}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const CompetenciesTab = ({ competencies, workValues, environment }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
    <h2 style={{
      fontSize: '28px',
      fontWeight: 700,
      color: '#1e293b',
      margin: '0 0 32px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '32px' }}>⭐</span>
      Analiza kompetencji
    </h2>
    
    {/* Competencies */}
    {competencies && (
      <div>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          Twoje kompetencje zawodowe
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(competencies).map(([skill, score]) => (
            <div key={skill} style={{
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.9))',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(59, 130, 246, 0.1)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(0, 0, 0, 0.05)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#475569',
                  textTransform: 'capitalize'
                }}>
                  {skill.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#3b82f6',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {score}/10
                </span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(59, 130, 246, 0.2)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
                  height: '100%',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  width: `${(score / 10) * 100}%`,
                  boxShadow: '0 2px 8px rgba(59, 130, 246, 0.3)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Work Values */}
    {workValues && (
      <div>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>💎</span>
          Twoje wartości w pracy
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(workValues).map(([value, score]) => (
            <div key={value} style={{
              background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(34, 197, 94, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(34, 197, 94, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#475569',
                  textTransform: 'capitalize'
                }}>
                  {value.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#22c55e',
                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(34, 197, 94, 0.2)'
                }}>
                  {score}/10
                </span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(34, 197, 94, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(34, 197, 94, 0.2)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)',
                  height: '100%',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  width: `${(score / 10) * 100}%`,
                  boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Preferred Environment */}
    {environment && (
      <div>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🏢</span>
          Preferowane środowisko pracy
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '20px'
        }}>
          {Object.entries(environment).map(([env, score]) => (
            <div key={env} style={{
              background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.05), rgba(236, 72, 153, 0.05))',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(168, 85, 247, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(168, 85, 247, 0.1)'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '12px'
              }}>
                <span style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: '#475569',
                  textTransform: 'capitalize'
                }}>
                  {env.replace(/_/g, ' ')}
                </span>
                <span style={{
                  fontSize: '20px',
                  fontWeight: 800,
                  color: '#a855f7',
                  backgroundColor: 'rgba(168, 85, 247, 0.1)',
                  padding: '4px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(168, 85, 247, 0.2)'
                }}>
                  {score}/10
                </span>
              </div>
              <div style={{
                width: '100%',
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                borderRadius: '8px',
                height: '8px',
                overflow: 'hidden',
                border: '1px solid rgba(168, 85, 247, 0.2)'
              }}>
                <div style={{
                  background: 'linear-gradient(135deg, #a855f7 0%, #ec4899 100%)',
                  height: '100%',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  width: `${(score / 10) * 100}%`,
                  boxShadow: '0 2px 8px rgba(168, 85, 247, 0.3)'
                }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

const DevelopmentTab = ({ developmentAreas, training }) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
    <h2 style={{
      fontSize: '28px',
      fontWeight: 700,
      color: '#1e293b',
      margin: '0 0 32px 0',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    }}>
      <span style={{ fontSize: '32px' }}>📈</span>
      Plan rozwoju zawodowego
    </h2>
    
    {/* Development Areas */}
    {developmentAreas && developmentAreas.length > 0 && (
      <div>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>🎯</span>
          Obszary do rozwoju
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {developmentAreas.map((area, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.05), rgba(217, 119, 6, 0.05))',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(245, 158, 11, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(245, 158, 11, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  backgroundColor: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '50%',
                  padding: '12px',
                  minWidth: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(245, 158, 11, 0.2)'
                }}>
                  <svg style={{ width: '24px', height: '24px', color: '#f59e0b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#475569',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {area}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Recommended Training */}
    {training && training.length > 0 && (
      <div>
        <h3 style={{
          fontSize: '22px',
          fontWeight: 700,
          color: '#1e293b',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <span style={{ fontSize: '24px' }}>📚</span>
          Rekomendowane szkolenia i kursy
        </h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
          gap: '20px'
        }}>
          {training.map((course, index) => (
            <div key={index} style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05), rgba(99, 102, 241, 0.05))',
              borderRadius: '16px',
              padding: '24px',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 4px 15px rgba(59, 130, 246, 0.1)'
            }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '50%',
                  padding: '12px',
                  minWidth: '48px',
                  height: '48px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <svg style={{ width: '24px', height: '24px', color: '#3b82f6' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div style={{ flex: 1 }}>
                  <p style={{
                    color: '#475569',
                    fontSize: '16px',
                    fontWeight: 500,
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {course}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )}

    {/* Motivational message */}
    <div style={{
      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(16, 185, 129, 0.05))',
      borderRadius: '20px',
      padding: '40px',
      border: '1px solid rgba(34, 197, 94, 0.2)',
      backdropFilter: 'blur(10px)',
      textAlign: 'center'
    }}>
      <div style={{
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderRadius: '50%',
        padding: '16px',
        width: '80px',
        height: '80px',
        margin: '0 auto 24px auto',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '3px solid rgba(34, 197, 94, 0.2)'
      }}>
        <svg style={{ width: '48px', height: '48px', color: '#22c55e' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </div>
      <h3 style={{
        fontSize: '24px',
        fontWeight: 700,
        color: '#1e293b',
        marginBottom: '16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px'
      }}>
        <span style={{ fontSize: '28px' }}>🚀</span>
        Gotowy na rozwój?
      </h3>
      <p style={{
        color: '#64748b',
        lineHeight: '1.7',
        fontSize: '16px',
        margin: 0,
        fontWeight: 500,
        maxWidth: '600px',
        marginLeft: 'auto',
        marginRight: 'auto'
      }}>
        Pamiętaj, że rozwój zawodowy to proces. Każda umiejętność, którą rozwiniesz, 
        przybliża Cię do wymarzonej kariery w branży budowlanej. Powodzenia!
      </p>
    </div>
  </div>
);

export default CompetencyTest;
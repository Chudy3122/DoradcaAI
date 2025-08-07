'use client';

import { useState } from 'react';

export default function TestAPIPage() {
  const [testId, setTestId] = useState('');
  const [questions, setQuestions] = useState([]);
  const [results, setResults] = useState('');
  const [loading, setLoading] = useState(false);

  const startTest = async () => {
    setLoading(true);
    setResults('');
    
    try {
      const response = await fetch('/api/competency-test/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
      
      if (data.success && data.testId) {
        setTestId(data.testId);
      }
    } catch (error) {
      setResults('Błąd: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const getQuestions = async () => {
    setLoading(true);
    setResults('');
    
    try {
      const url = testId 
        ? `/api/competency-test/questions?testId=${testId}`
        : '/api/competency-test/questions';
        
      const response = await fetch(url);
      const data = await response.json();
      
      setResults(JSON.stringify(data, null, 2));
      
      if (data.success && data.questions) {
        setQuestions(data.questions);
      }
    } catch (error) {
      setResults('Błąd: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const answerQuestion = async (questionId, answerValue, questionType) => {
    if (!testId) {
      setResults('Błąd: Najpierw rozpocznij test');
      return;
    }

    setLoading(true);
    
    try {
      const response = await fetch('/api/competency-test/answer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testId,
          questionId,
          answerValue,
          questionType
        }),
      });
      
      const data = await response.json();
      setResults(JSON.stringify(data, null, 2));
    } catch (error) {
      setResults('Błąd: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'monospace',
      backgroundColor: '#f5f5f5',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#3b82f6', marginBottom: '30px' }}>
        🧪 Test API Testów Kompetencji
      </h1>

      <div style={{ 
        display: 'grid', 
        gap: '20px', 
        gridTemplateColumns: '1fr 1fr',
        maxWidth: '1200px'
      }}>
        {/* Panel kontrolny */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>🎮 Panel kontrolny</h2>
          
          <div style={{ marginBottom: '20px' }}>
            <strong>Test ID:</strong> 
            <input 
              type="text" 
              value={testId} 
              onChange={(e) => setTestId(e.target.value)}
              placeholder="Automatycznie po start test"
              style={{
                marginLeft: '10px',
                padding: '5px',
                border: '1px solid #ccc',
                borderRadius: '4px',
                width: '200px'
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <button 
              onClick={startTest} 
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? '⏳ Loading...' : '🚀 Start Test'}
            </button>

            <button 
              onClick={getQuestions}
              disabled={loading}
              style={{
                padding: '10px 20px',
                backgroundColor: '#10b981',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontSize: '14px'
              }}
            >
              {loading ? '⏳ Loading...' : '📝 Get Questions'}
            </button>
          </div>

          {/* Przykładowe pytania */}
          {questions.length > 0 && (
            <div style={{ marginTop: '20px' }}>
              <h3>🎯 Przykładowe odpowiedzi:</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <button
                  onClick={() => answerQuestion('q001', 'R', 'SINGLE_CHOICE')}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f59e0b',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Odpowiedz na Q001: "R" (Realistic)
                </button>
                
                <button
                  onClick={() => answerQuestion('q003', 7, 'SLIDER')}
                  disabled={loading}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#8b5cf6',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Odpowiedz na Q003: 7 (Slider)
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Panel wyników */}
        <div style={{
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>📊 Wyniki API</h2>
          <pre style={{
            backgroundColor: '#1f2937',
            color: '#f3f4f6',
            padding: '15px',
            borderRadius: '6px',
            overflow: 'auto',
            maxHeight: '500px',
            fontSize: '12px',
            whiteSpace: 'pre-wrap'
          }}>
            {results || 'Kliknij przycisk aby przetestować API...'}
          </pre>
        </div>
      </div>

      {/* Lista pytań */}
      {questions.length > 0 && (
        <div style={{
          marginTop: '20px',
          backgroundColor: 'white',
          padding: '20px',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <h2>❓ Pytania testowe ({questions.length})</h2>
          <div style={{ display: 'grid', gap: '15px' }}>
            {questions.slice(0, 5).map((q, index) => (
              <div key={q.id} style={{
                padding: '12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                backgroundColor: '#f9fafb'
              }}>
                <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>
                  {q.id} ({q.questionType})
                </div>
                <div style={{ margin: '8px 0', fontSize: '14px' }}>
                  {q.questionText}
                </div>
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  Kategoria: {q.category} | Podkategoria: {q.subcategory}
                </div>
              </div>
            ))}
            {questions.length > 5 && (
              <div style={{ 
                textAlign: 'center', 
                color: '#6b7280',
                fontStyle: 'italic' 
              }}>
                ... i {questions.length - 5} więcej pytań
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
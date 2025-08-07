'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getCareerById,
  getAllCareers,
  formatSalary,
  getAverageSalary,
  CAREER_CATEGORIES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  HOLLAND_CODES,
  type Career
} from '@/lib/careers-data';

export default function ProfessionDetailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const [career, setCareer] = useState<Career | null>(null);
  const [similarCareers, setSimilarCareers] = useState<Career[]>([]);
  const [userProfile, setUserProfile] = useState<any>(null);

  const careerId = params.id as string;

  // Sprawdzenie autoryzacji
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Ładowanie danych zawodu
  useEffect(() => {
    if (careerId) {
      const careerData = getCareerById(careerId);
      if (careerData) {
        setCareer(careerData);
        
        // Znajdź podobne zawody
        const similar = getAllCareers()
          .filter(c => 
            c.id !== careerId && 
            (c.category === careerData.category || 
             c.holland_codes.some(code => careerData.holland_codes.includes(code)))
          )
          .slice(0, 3);
        setSimilarCareers(similar);
      }
    }
  }, [careerId]);

  // Próba pobrania profilu użytkownika
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (response.ok) {
          const data = await response.json();
          setUserProfile(data.profile);
        }
      } catch (error) {
        console.log('Brak profilu użytkownika');
      }
    };

    if (session) {
      fetchUserProfile();
    }
  }, [session]);

  if (status === 'loading') {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: '64px',
            height: '64px',
            border: '4px solid rgba(59, 130, 246, 0.3)',
            borderTop: '4px solid #3b82f6',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }} />
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#374151' }}>
            Ładowanie szczegółów zawodu...
          </h2>
        </div>
      </div>
    );
  }

  if (!session || !career) {
    return (
      <div style={{
        display: 'flex',
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            borderRadius: '50%',
            padding: '12px',
            width: '64px',
            height: '64px',
            margin: '0 auto 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
              <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L5.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>
            Zawód nie znaleziony
          </h2>
          <p style={{ color: '#6b7280', marginBottom: '16px' }}>
            Przepraszamy, nie udało się znaleźć informacji o tym zawodzie.
          </p>
          <Link 
            href="/professions"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              padding: '8px 16px',
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              borderRadius: '8px',
              textDecoration: 'none',
              fontWeight: 600,
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            Powrót do listy zawodów
          </Link>
        </div>
      </div>
    );
  }

  const categoryInfo = CAREER_CATEGORIES.find(cat => cat.id === career.category);
  const educationInfo = EDUCATION_LEVELS.find(edu => edu.id === career.education_level);
  const experienceInfo = EXPERIENCE_LEVELS.find(exp => exp.id === career.experience_required);
  const averageSalary = getAverageSalary(career);

  // Obliczenie dopasowania do profilu użytkownika
  const calculateMatch = () => {
    if (!userProfile || !userProfile.hollandCode) return null;
    
    const userCodes = userProfile.hollandCode.split('');
    const careerCodes = career.holland_codes;
    
    let match = 0;
    userCodes.forEach((code: string, index: number) => {
      if (careerCodes.includes(code)) {
        match += (3 - index) * 25; // Pierwsze miejsce = 75%, drugie = 50%, trzecie = 25%
      }
    });
    
    return Math.min(100, match);
  };

  const matchPercentage = calculateMatch();

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
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
        
        @keyframes slideInFromLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        .content-section {
          animation: fadeInUp 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .content-section:nth-child(1) { animation-delay: 0.1s; }
        .content-section:nth-child(2) { animation-delay: 0.2s; }
        .content-section:nth-child(3) { animation-delay: 0.3s; }
        .content-section:nth-child(4) { animation-delay: 0.4s; }
        .content-section:nth-child(5) { animation-delay: 0.5s; }
        .content-section:nth-child(6) { animation-delay: 0.6s; }
        
        .sidebar-section {
          animation: slideInFromLeft 0.6s ease-out forwards;
          opacity: 0;
        }
        
        .sidebar-section:nth-child(1) { animation-delay: 0.2s; }
        .sidebar-section:nth-child(2) { animation-delay: 0.4s; }
        .sidebar-section:nth-child(3) { animation-delay: 0.6s; }
      `}</style>
      
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Tło z wzorem */}
        <svg style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 0,
          opacity: 0.1
        }}>
          <defs>
            <pattern id="circuit" x="0" y="0" width="100" height="100" patternUnits="userSpaceOnUse">
              <path d="M20 20h60v60h-60z" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
              <circle cx="20" cy="20" r="2" fill="#3b82f6"/>
              <circle cx="80" cy="20" r="2" fill="#3b82f6"/>
              <circle cx="20" cy="80" r="2" fill="#3b82f6"/>
              <circle cx="80" cy="80" r="2" fill="#3b82f6"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#circuit)"/>
        </svg>

        {/* Główny container */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          height: '100vh',
          position: 'relative',
          zIndex: 2
        }}>
          {/* Header */}
          <header style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '12px 20px',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(20px)',
            borderBottom: '1px solid rgba(59, 130, 246, 0.2)',
            boxShadow: '0 4px 20px rgba(0,0,0,0.05)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <Link 
                href="/professions" 
                style={{
                  marginRight: '16px',
                  padding: '8px',
                  backgroundColor: 'rgba(0, 0, 0, 0.02)',
                  border: '1px solid rgba(0, 0, 0, 0.05)',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  textDecoration: 'none',
                  color: '#64748b',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Zawody</span>
              </Link>
              
              <div style={{ 
                position: 'relative', 
                width: '40px', 
                height: '40px', 
                marginRight: '12px',
                borderRadius: '12px',
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <span style={{ fontSize: '20px' }}>{categoryInfo?.icon}</span>
              </div>
              
              <div>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  margin: 0,
                  lineHeight: '1.2'
                }}>
                  {career.job}
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  margin: 0 
                }}>
                  {categoryInfo?.name}
                </p>
              </div>
            </div>
            
            {/* Holland Code badges */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {career.holland_codes.map(code => (
                <div 
                  key={code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    color: '#ffffff',
                    backgroundColor: HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.color,
                    fontSize: '14px',
                    fontWeight: 600
                  }}
                >
                  <span>{code}</span>
                  <span style={{ fontSize: '12px', opacity: 0.9 }}>
                    {HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.name}
                  </span>
                </div>
              ))}
            </div>
          </header>
          
          {/* Obszar główny z przewijaniem */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '2fr 1fr',
              gap: '24px',
              maxWidth: '1400px',
              margin: '0 auto'
            }}>
              {/* Główna zawartość */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Dopasowanie do profilu użytkownika */}
                {matchPercentage !== null && (
                  <div 
                    className="content-section"
                    style={{
                      background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1), rgba(59, 130, 246, 0.1))',
                      border: '1px solid rgba(34, 197, 94, 0.2)',
                      borderRadius: '16px',
                      padding: '20px',
                      backdropFilter: 'blur(20px)'
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      marginBottom: '12px'
                    }}>
                      <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                        Twoje dopasowanie
                      </h3>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <span style={{ fontSize: '16px', fontWeight: 700, color: '#22c55e' }}>
                          {matchPercentage}%
                        </span>
                      </div>
                    </div>
                    <div style={{
                      width: '100%',
                      height: '8px',
                      backgroundColor: 'rgba(229, 231, 235, 0.8)',
                      borderRadius: '4px',
                      marginBottom: '8px'
                    }}>
                      <div 
                        style={{
                          height: '100%',
                          background: 'linear-gradient(90deg, #22c55e, #3b82f6)',
                          borderRadius: '4px',
                          width: `${matchPercentage}%`,
                          transition: 'width 1s ease-out'
                        }}
                      />
                    </div>
                    <p style={{ fontSize: '14px', color: '#64748b', margin: 0 }}>
                      Na podstawie Twojego profilu Holland ({userProfile.hollandCode})
                    </p>
                  </div>
                )}

                {/* Opis zawodu */}
                <div 
                  className="content-section"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                    Opis zawodu
                  </h2>
                  <p style={{ color: '#374151', lineHeight: '1.6', marginBottom: '20px' }}>
                    {career.description}
                  </p>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '16px'
                  }}>
                    <div style={{
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#1e40af', marginBottom: '8px' }}>
                        Środowisko pracy
                      </h4>
                      <p style={{ fontSize: '14px', color: '#1e40af', margin: 0 }}>
                        {career.environment}
                      </p>
                    </div>
                    <div style={{
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px',
                      padding: '16px'
                    }}>
                      <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#15803d', marginBottom: '8px' }}>
                        Perspektywy
                      </h4>
                      <p style={{ fontSize: '14px', color: '#15803d', margin: 0 }}>
                        {career.outlook}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Codzienne zadania */}
                <div 
                  className="content-section"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                    Codzienne zadania
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {career.daily_tasks.map((task, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                        <div style={{
                          flexShrink: 0,
                          width: '24px',
                          height: '24px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          marginTop: '2px'
                        }}>
                          <svg width="12" height="12" viewBox="0 0 20 20" fill="#3b82f6">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <p style={{ color: '#374151', fontSize: '14px', margin: 0, lineHeight: '1.5' }}>
                          {task}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Ścieżka kariery */}
                <div 
                  className="content-section"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                    Ścieżka rozwoju kariery
                  </h2>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {career.career_path.map((step, index) => (
                      <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                          flexShrink: 0,
                          width: '32px',
                          height: '32px',
                          background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ffffff',
                          fontWeight: 700,
                          fontSize: '14px'
                        }}>
                          {index + 1}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{
                            backgroundColor: 'rgba(249, 250, 251, 0.8)',
                            borderRadius: '12px',
                            padding: '12px'
                          }}>
                            <p style={{ fontWeight: 500, color: '#1e293b', margin: 0 }}>
                              {step}
                            </p>
                          </div>
                        </div>
                        {index < career.career_path.length - 1 && (
                          <div style={{ flexShrink: 0 }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                              <path d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plusy i minusy */}
                <div 
                  className="content-section"
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '20px'
                  }}
                >
                  {/* Plusy */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(34, 197, 94, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="#22c55e">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Zalety
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {career.pros.map((pro, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="#22c55e" style={{ marginTop: '2px', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span style={{ color: '#374151', fontSize: '14px' }}>{pro}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Minusy */}
                  <div style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}>
                    <h3 style={{
                      fontSize: '18px',
                      fontWeight: 700,
                      color: '#1e293b',
                      marginBottom: '16px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: 'rgba(239, 68, 68, 0.1)',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}>
                        <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444">
                          <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                        </svg>
                      </div>
                      Wyzwania
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {career.cons.map((con, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="#ef4444" style={{ marginTop: '2px', flexShrink: 0 }}>
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span style={{ color: '#374151', fontSize: '14px' }}>{con}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Umiejętności */}
                <div 
                  className="content-section"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#1e293b', marginBottom: '20px' }}>
                    Wymagane umiejętności
                  </h2>
                  
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '24px'
                  }}>
                    {/* Wymagane */}
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                        Konieczne
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {career.required_skills.map((skill, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#ef4444',
                              borderRadius: '50%',
                              flexShrink: 0
                            }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Opcjonalne */}
                    <div>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                        Mile widziane
                      </h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {career.optional_skills.map((skill, index) => (
                          <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <div style={{
                              width: '8px',
                              height: '8px',
                              backgroundColor: '#22c55e',
                              borderRadius: '50%',
                              flexShrink: 0
                            }} />
                            <span style={{ fontSize: '14px', color: '#374151' }}>{skill}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                
                {/* Kluczowe informacje */}
                <div 
                  className="sidebar-section"
                  style={{
                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '16px',
                    padding: '24px'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                    Kluczowe informacje
                  </h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {/* Zarobki */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: 'rgba(34, 197, 94, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                          <line x1="12" y1="1" x2="12" y2="23"></line>
                          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                          Zarobki
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 700, color: '#22c55e' }}>
                          {formatSalary(career.salary_min, career.salary_max)}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          Śr. {averageSalary.toLocaleString('pl-PL')} PLN
                        </div>
                      </div>
                    </div>

                    {/* Wykształcenie */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                          <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                          <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                          Wykształcenie
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#3b82f6', textTransform: 'capitalize' }}>
                          {educationInfo?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {educationInfo?.description}
                        </div>
                      </div>
                    </div>

                    {/* Doświadczenie */}
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '12px',
                      backgroundColor: 'rgba(168, 85, 247, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                          <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                          Doświadczenie
                        </span>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '14px', fontWeight: 500, color: '#a855f7', textTransform: 'capitalize' }}>
                          {experienceInfo?.name}
                        </div>
                        <div style={{ fontSize: '12px', color: '#64748b' }}>
                          {experienceInfo?.description}
                        </div>
                      </div>
                    </div>

                    {/* Lokalizacje */}
                    <div style={{
                      padding: '12px',
                      backgroundColor: 'rgba(107, 114, 128, 0.1)',
                      borderRadius: '12px'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                          <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        <span style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                          Miejsca pracy
                        </span>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {career.location_types.map((location, index) => (
                          <div key={index} style={{ fontSize: '12px', color: '#6b7280' }}>
                            • {location}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Podobne zawody */}
                {similarCareers.length > 0 && (
                  <div 
                    className="sidebar-section"
                    style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '16px',
                      padding: '24px'
                    }}
                  >
                    <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                      Podobne zawody
                    </h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {similarCareers.map((similarCareer) => {
                        const similarCategoryInfo = CAREER_CATEGORIES.find(cat => cat.id === similarCareer.category);
                        return (
                          <Link 
                            key={similarCareer.id}
                            href={`/professions/${similarCareer.id}`}
                            style={{
                              display: 'block',
                              padding: '12px',
                              border: '1px solid rgba(229, 231, 235, 0.8)',
                              borderRadius: '12px',
                              textDecoration: 'none',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                              <span style={{ fontSize: '18px' }}>{similarCategoryInfo?.icon}</span>
                              <div style={{ flex: 1 }}>
                                <div style={{ fontSize: '14px', fontWeight: 500, color: '#1e293b' }}>
                                  {similarCareer.job}
                                </div>
                                <div style={{ fontSize: '12px', color: '#64748b' }}>
                                  {similarCategoryInfo?.name}
                                </div>
                              </div>
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                                <path d="M9 5l7 7-7 7" />
                              </svg>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Call to action */}
                <div 
                  className="sidebar-section"
                  style={{
                    background: 'linear-gradient(135deg, #3b82f6, #6366f1)',
                    borderRadius: '16px',
                    padding: '24px',
                    color: '#ffffff'
                  }}
                >
                  <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '8px' }}>
                    Zainteresowany tym zawodem?
                  </h3>
                  <p style={{ fontSize: '14px', opacity: 0.9, marginBottom: '16px', lineHeight: '1.5' }}>
                    Wykonaj test kompetencji, aby sprawdzić swoje dopasowanie do tej ścieżki kariery.
                  </p>
                  <Link 
                    href="/tests"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      backgroundColor: '#ffffff',
                      color: '#3b82f6',
                      padding: '10px 16px',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      textDecoration: 'none',
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                    }}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>Wykonaj test</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
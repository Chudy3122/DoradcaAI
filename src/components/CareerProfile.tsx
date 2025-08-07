'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface ProfileData {
  id: string;
  hollandCode?: string;
  personalityType?: string;
  competencyScores?: Record<string, number>;
  workValues?: Record<string, any>;
  preferredEnvironment?: Record<string, any>;
  careerSuggestions?: (string | { job: string; [key: string]: any })[];
  developmentAreas?: (string | { name: string; [key: string]: any })[];
  aiAnalysis?: string;
  confidenceScore?: number;
  personalInfo?: {
    bio?: string;
    currentPosition?: string;
    yearsOfExperience?: number;
    location?: string;
  };
  experience?: {
    skills?: string[];
    certifications?: string[];
    achievements?: string[];
  };
  goals?: {
    shortTerm?: string[];
    longTerm?: string[];
    preferredIndustries?: string[];
  };
}

const HOLLAND_CODES = {
  'R': { name: 'Realizator', description: 'Praktyczny, techniczny', color: '#ef4444' },
  'I': { name: 'Badacz', description: 'Analityczny, naukowy', color: '#3b82f6' },
  'A': { name: 'Artysta', description: 'Kreatywny, innowacyjny', color: '#8b5cf6' },
  'S': { name: 'Społecznik', description: 'Pomocny, empatyczny', color: '#10b981' },
  'E': { name: 'Przedsiębiorca', description: 'Przedsiębiorczy, przywódczy', color: '#f59e0b' },
  'C': { name: 'Konwencjonalista', description: 'Organizacyjny, systematyczny', color: '#6b7280' }
};

export default function CareerProfile() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [hasTest, setHasTest] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'goals'>('overview');
  const [tempProfile, setTempProfile] = useState<ProfileData | null>(null);

  // Sprawdzenie autoryzacji
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    fetchProfile();
  }, [session, status, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/user/profile');
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setTempProfile(data.profile);
        setHasTest(data.hasTest);
      } else {
        console.error('Błąd pobierania profilu:', data.error);
      }
    } catch (error) {
      console.error('Błąd podczas pobierania profilu:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tempProfile) return;
    
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(tempProfile),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setProfile(data.profile);
        setEditing(false);
      } else {
        alert('Błąd podczas zapisywania profilu');
      }
    } catch (error) {
      console.error('Błąd podczas zapisywania:', error);
      alert('Błąd podczas zapisywania profilu');
    }
  };

  const handleCancel = () => {
    setTempProfile(profile);
    setEditing(false);
  };

  const updateTempProfile = (section: string, field: string, value: any) => {
    if (!tempProfile) return;
    
    const currentSection = tempProfile[section as keyof ProfileData] as Record<string, any> || {};
    
    setTempProfile({
      ...tempProfile,
      [section]: {
        ...currentSection,
        [field]: value
      }
    });
  };

  if (status === 'loading' || loading) {
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
            Ładowanie profilu...
          </h2>
        </div>
      </div>
    );
  }

  if (!session) return null;

  // Jeśli nie ma testu kompetencji
  if (!hasTest) {
    return (
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
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
                href="/" 
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
                  color: '#64748b'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Powrót</span>
              </Link>
              
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#1e293b', 
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Mój Profil Zawodowy
              </h1>
            </div>
          </header>

          {/* Brak testu */}
          <div style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '40px'
          }}>
            <div style={{
              textAlign: 'center',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '40px',
              maxWidth: '500px'
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 24px'
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"></path>
                  <rect x="8" y="2" width="8" height="4" rx="1" ry="1"></rect>
                </svg>
              </div>
              
              <h2 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#1e293b', 
                marginBottom: '12px' 
              }}>
                Wykonaj test kompetencji
              </h2>
              
              <p style={{ 
                color: '#64748b', 
                fontSize: '16px',
                lineHeight: '1.6',
                marginBottom: '24px' 
              }}>
                Aby móc skorzystać z profilu zawodowego, musisz najpierw wykonać test kompetencji. 
                Test pomoże określić Twoje predyspozycje zawodowe i wygeneruje spersonalizowany profil.
              </p>
              
              <Link 
                href="/tests"
                style={{
                  display: 'inline-block',
                  padding: '12px 24px',
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  color: '#ffffff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  fontWeight: 600,
                  fontSize: '16px',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  boxShadow: '0 8px 25px rgba(59, 130, 246, 0.3)'
                }}
              >
                Wykonaj test kompetencji
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .profile-section {
          animation: fadeInUp 0.6s ease-out forwards;
        }
      `}</style>
      
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif"
      }}>
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
                href="/" 
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
                  color: '#64748b'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                <span>Powrót</span>
              </Link>
              
              <div style={{ 
                position: 'relative', 
                width: '36px', 
                height: '36px', 
                marginRight: '12px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, rgba(59, 130, 246, 0.2), transparent)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <Image 
                  src="/DoradcaAI.png" 
                  alt="DoradcaAI Logo" 
                  width={28}
                  height={28}
                  style={{ objectFit: 'contain' }}
                  priority
                />
              </div>
              
              <h1 style={{ 
                fontSize: '24px', 
                fontWeight: 700, 
                color: '#1e293b', 
                margin: 0,
                background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>
                Mój Profil Zawodowy
              </h1>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              {!editing ? (
                <button
                  onClick={() => setEditing(true)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 16px',
                    background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer'
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                  Edytuj
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'rgba(0, 0, 0, 0.05)',
                      color: '#64748b',
                      border: '1px solid rgba(0, 0, 0, 0.1)',
                      borderRadius: '8px',
                      fontSize: '14px',
                      cursor: 'pointer'
                    }}
                  >
                    Anuluj
                  </button>
                  <button
                    onClick={handleSave}
                    style={{
                      padding: '8px 16px',
                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontSize: '14px',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    Zapisz
                  </button>
                </>
              )}
            </div>
          </header>
          
          {/* Zawartość */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px'
          }}>
            {profile && (
              <>
                {/* Tabsy */}
                <div style={{
                  display: 'flex',
                  gap: '8px',
                  marginBottom: '20px',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(59, 130, 246, 0.2)',
                  borderRadius: '12px',
                  padding: '8px'
                }}>
                  {[
                    { id: 'overview', label: 'Przegląd', icon: '👤' },
                    { id: 'experience', label: 'Doświadczenie', icon: '💼' },
                    { id: 'goals', label: 'Cele', icon: '🎯' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        flex: 1,
                        padding: '12px 16px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        fontSize: '14px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}
                    >
                      <span>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Przegląd */}
                {activeTab === 'overview' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Kod Hollanda */}
                    <div className="profile-section" style={{
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
                        <span>🧬</span>
                        Kod Hollanda
                      </h3>
                      
                      {profile.hollandCode && (
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                          {profile.hollandCode.split('').map((code, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                padding: '12px',
                                backgroundColor: HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.color + '20',
                                border: `2px solid ${HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.color}`,
                                borderRadius: '12px',
                                flex: 1
                              }}
                            >
                              <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                backgroundColor: HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.color,
                                color: '#ffffff',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontWeight: 700,
                                fontSize: '18px',
                                marginBottom: '8px'
                              }}>
                                {code}
                              </div>
                              <div style={{ textAlign: 'center' }}>
                                <div style={{ 
                                  fontSize: '14px', 
                                  fontWeight: 600, 
                                  color: '#1e293b',
                                  marginBottom: '4px'
                                }}>
                                  {HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.name}
                                </div>
                                <div style={{ 
                                  fontSize: '12px', 
                                  color: '#64748b' 
                                }}>
                                  {HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.description}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      <div style={{
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        padding: '12px',
                        borderRadius: '8px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <div style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b', marginBottom: '4px' }}>
                          Typ osobowości zawodowej
                        </div>
                        <div style={{ fontSize: '16px', color: '#3b82f6', fontWeight: 700 }}>
                          {profile.personalityType || 'Nie określono'}
                        </div>
                      </div>
                    </div>

                    {/* Informacje osobiste */}
                    <div className="profile-section" style={{
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
                        <span>👤</span>
                        Informacje osobiste
                      </h3>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151', 
                            marginBottom: '4px' 
                          }}>
                            Obecne stanowisko
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              value={tempProfile?.personalInfo?.currentPosition || ''}
                              onChange={(e) => updateTempProfile('personalInfo', 'currentPosition', e.target.value)}
                              placeholder="np. Technik budowlany"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                              {profile.personalInfo?.currentPosition || 'Nie podano'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151', 
                            marginBottom: '4px' 
                          }}>
                            Lata doświadczenia
                          </label>
                          {editing ? (
                            <input
                              type="number"
                              value={tempProfile?.personalInfo?.yearsOfExperience || ''}
                              onChange={(e) => updateTempProfile('personalInfo', 'yearsOfExperience', parseInt(e.target.value) || 0)}
                              placeholder="0"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                              {profile.personalInfo?.yearsOfExperience || 0} lat
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151', 
                            marginBottom: '4px' 
                          }}>
                            Lokalizacja
                          </label>
                          {editing ? (
                            <input
                              type="text"
                              value={tempProfile?.personalInfo?.location || ''}
                              onChange={(e) => updateTempProfile('personalInfo', 'location', e.target.value)}
                              placeholder="np. Warszawa"
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none'
                              }}
                            />
                          ) : (
                            <div style={{ fontSize: '14px', color: '#64748b' }}>
                              {profile.personalInfo?.location || 'Nie podano'}
                            </div>
                          )}
                        </div>

                        <div>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: 500, 
                            color: '#374151', 
                            marginBottom: '4px' 
                          }}>
                            O mnie
                          </label>
                          {editing ? (
                            <textarea
                              value={tempProfile?.personalInfo?.bio || ''}
                              onChange={(e) => updateTempProfile('personalInfo', 'bio', e.target.value)}
                              placeholder="Opisz krótko swoją ścieżkę zawodową i zainteresowania..."
                              rows={3}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '8px',
                                fontSize: '14px',
                                outline: 'none',
                                resize: 'vertical'
                              }}
                            />
                          ) : (
                            <div style={{ 
                              fontSize: '14px', 
                              color: '#64748b',
                              lineHeight: '1.5'
                            }}>
                              {profile.personalInfo?.bio || 'Brak opisu'}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Kompetencje */}
                    <div className="profile-section" style={{
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
                        <span>⚡</span>
                        Wyniki kompetencji
                      </h3>

                      {profile.competencyScores && Object.keys(profile.competencyScores).length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {Object.entries(profile.competencyScores).map(([area, score]) => {
                            const percentage = Math.min(100, Math.max(0, (score as number) * 10));
                            return (
                              <div key={area}>
                                <div style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  alignItems: 'center',
                                  marginBottom: '4px'
                                }}>
                                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#374151' }}>
                                    {area.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                  </span>
                                  <span style={{ fontSize: '12px', color: '#64748b' }}>
                                    {Math.round(percentage)}%
                                  </span>
                                </div>
                                <div style={{
                                  width: '100%',
                                  height: '8px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  borderRadius: '4px',
                                  overflow: 'hidden'
                                }}>
                                  <div style={{
                                    width: `${percentage}%`,
                                    height: '100%',
                                    background: `linear-gradient(90deg, #3b82f6, #60a5fa)`,
                                    transition: 'width 0.5s ease'
                                  }} />
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '14px',
                          padding: '20px'
                        }}>
                          Brak danych o kompetencjach
                        </div>
                      )}
                    </div>

                    {/* Rekomendacje zawodów */}
                    <div className="profile-section" style={{
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
                        <span>💼</span>
                        Rekomendowane zawody
                      </h3>

                      {profile.careerSuggestions && profile.careerSuggestions.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {profile.careerSuggestions.map((career, idx) => (
                            <div
                              key={idx}
                              style={{
                                padding: '12px',
                                backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                border: '1px solid rgba(34, 197, 94, 0.2)',
                                borderRadius: '8px',
                                fontSize: '14px',
                                fontWeight: 500,
                                color: '#374151'
                              }}
                            >
                              {typeof career === 'string' ? career : (career as any)?.job || 'Nieznany zawód'}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '14px',
                          padding: '20px'
                        }}>
                          Brak rekomendacji zawodów
                        </div>
                      )}

                      <Link
                        href="/professions"
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginTop: '16px',
                          padding: '8px 16px',
                          backgroundColor: 'rgba(59, 130, 246, 0.1)',
                          color: '#3b82f6',
                          borderRadius: '8px',
                          textDecoration: 'none',
                          fontSize: '14px',
                          fontWeight: 500,
                          transition: 'all 0.3s ease'
                        }}
                      >
                        <span>Przeglądaj wszystkie zawody</span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M7 17l9.2-9.2M17 17V7H7" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                )}

                {/* Doświadczenie */}
                {activeTab === 'experience' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Umiejętności */}
                    <div className="profile-section" style={{
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
                        <span>🛠️</span>
                        Umiejętności
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.experience?.skills || []).join('\n')}
                            onChange={(e) => updateTempProfile('experience', 'skills', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Wpisz umiejętności (każdą w nowej linii)&#10;np. Obsługa koparki&#10;Czytanie planów budowlanych&#10;Spawanie MIG/MAG"
                            rows={6}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(profile.experience?.skills || []).length > 0 ? (
                            (profile.experience?.skills || []).map((skill, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '6px 12px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                                  color: '#3b82f6',
                                  borderRadius: '6px',
                                  fontSize: '12px',
                                  fontWeight: 500
                                }}
                              >
                                {skill}
                              </span>
                            ))
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                              Brak umiejętności. Kliknij "Edytuj" aby dodać.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Certyfikaty */}
                    <div className="profile-section" style={{
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
                        <span>🏆</span>
                        Certyfikaty i uprawnienia
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.experience?.certifications || []).join('\n')}
                            onChange={(e) => updateTempProfile('experience', 'certifications', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Wpisz certyfikaty (każdy w nowej linii)&#10;np. Uprawnienia SEP do 1kV&#10;Certyfikat operatora żurawia&#10;Kurs BHP"
                            rows={6}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(profile.experience?.certifications || []).length > 0 ? (
                            (profile.experience?.certifications || []).map((cert, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '12px',
                                  backgroundColor: 'rgba(34, 197, 94, 0.05)',
                                  border: '1px solid rgba(34, 197, 94, 0.2)',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  color: '#374151'
                                }}
                              >
                                {cert}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                              Brak certyfikatów. Kliknij "Edytuj" aby dodać.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Osiągnięcia */}
                    <div className="profile-section" style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '16px',
                      padding: '24px',
                      gridColumn: '1 / -1'
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
                        <span>🌟</span>
                        Osiągnięcia zawodowe
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.experience?.achievements || []).join('\n')}
                            onChange={(e) => updateTempProfile('experience', 'achievements', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Opisz swoje osiągnięcia zawodowe (każde w nowej linii)&#10;np. Kierowanie zespołem 15 osób przy budowie centrum handlowego&#10;Ukończenie projektu przed terminem o 2 tygodnie&#10;Otrzymanie nagrody za najlepszy projekt roku"
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {(profile.experience?.achievements || []).length > 0 ? (
                            (profile.experience?.achievements || []).map((achievement, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '16px',
                                  backgroundColor: 'rgba(245, 158, 11, 0.05)',
                                  border: '1px solid rgba(245, 158, 11, 0.2)',
                                  borderRadius: '12px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  lineHeight: '1.5'
                                }}
                              >
                                {achievement}
                              </div>
                            ))
                          ) : (
                            <div style={{ 
                              color: '#64748b', 
                              fontSize: '14px',
                              textAlign: 'center',
                              padding: '20px'
                            }}>
                              Brak osiągnięć. Kliknij "Edytuj" aby dodać swoje sukcesy zawodowe.
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Cele */}
                {activeTab === 'goals' && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                    {/* Cele krótkoterminowe */}
                    <div className="profile-section" style={{
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
                        <span>📅</span>
                        Cele krótkoterminowe (1-2 lata)
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.goals?.shortTerm || []).join('\n')}
                            onChange={(e) => updateTempProfile('goals', 'shortTerm', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Twoje cele na najbliższe 1-2 lata&#10;np. Uzyskanie uprawnień budowlanych&#10;Awans na stanowisko kierownika&#10;Ukończenie kursu spawania"
                            rows={6}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(profile.goals?.shortTerm || []).length > 0 ? (
                            (profile.goals?.shortTerm || []).map((goal, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '12px',
                                  backgroundColor: 'rgba(59, 130, 246, 0.05)',
                                  border: '1px solid rgba(59, 130, 246, 0.2)',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  lineHeight: '1.4'
                                }}
                              >
                                {goal}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                              Brak celów krótkoterminowych. Kliknij "Edytuj" aby je dodać.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Cele długoterminowe */}
                    <div className="profile-section" style={{
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
                        <span>🎯</span>
                        Cele długoterminowe (3-5 lat)
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.goals?.longTerm || []).join('\n')}
                            onChange={(e) => updateTempProfile('goals', 'longTerm', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Twoje cele na najbliższe 3-5 lat&#10;np. Założenie własnej firmy budowlanej&#10;Zostanie głównym inżynierem projektu&#10;Specjalizacja w budownictwie ekologicznym"
                            rows={6}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          {(profile.goals?.longTerm || []).length > 0 ? (
                            (profile.goals?.longTerm || []).map((goal, idx) => (
                              <div
                                key={idx}
                                style={{
                                  padding: '12px',
                                  backgroundColor: 'rgba(168, 85, 247, 0.05)',
                                  border: '1px solid rgba(168, 85, 247, 0.2)',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  color: '#374151',
                                  lineHeight: '1.4'
                                }}
                              >
                                {goal}
                              </div>
                            ))
                          ) : (
                            <div style={{ color: '#64748b', fontSize: '14px' }}>
                              Brak celów długoterminowych. Kliknij "Edytuj" aby je dodać.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Preferowane branże */}
                    <div className="profile-section" style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '16px',
                      padding: '24px',
                      gridColumn: '1 / -1'
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
                        <span>🏭</span>
                        Preferowane branże i sektory
                      </h3>

                      {editing ? (
                        <div>
                          <textarea
                            value={(tempProfile?.goals?.preferredIndustries || []).join('\n')}
                            onChange={(e) => updateTempProfile('goals', 'preferredIndustries', e.target.value.split('\n').filter(Boolean))}
                            placeholder="Branże w których chciałbyś pracować&#10;np. Budownictwo mieszkaniowe&#10;Infrastruktura drogowa&#10;Budownictwo przemysłowe&#10;Energetyka odnawialna"
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical'
                            }}
                          />
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                          {(profile.goals?.preferredIndustries || []).length > 0 ? (
                            (profile.goals?.preferredIndustries || []).map((industry, idx) => (
                              <span
                                key={idx}
                                style={{
                                  padding: '8px 16px',
                                  backgroundColor: 'rgba(34, 197, 94, 0.1)',
                                  color: '#16a34a',
                                  borderRadius: '8px',
                                  fontSize: '14px',
                                  fontWeight: 500,
                                  border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}
                              >
                                {industry}
                              </span>
                            ))
                          ) : (
                            <div style={{ 
                              color: '#64748b', 
                              fontSize: '14px',
                              textAlign: 'center',
                              padding: '20px',
                              width: '100%'
                            }}>
                              Brak preferencji branżowych. Kliknij "Edytuj" aby je dodać.
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Obszary do rozwoju */}
                    <div className="profile-section" style={{
                      backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      backdropFilter: 'blur(20px)',
                      border: '1px solid rgba(59, 130, 246, 0.2)',
                      borderRadius: '16px',
                      padding: '24px',
                      gridColumn: '1 / -1'
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
                        <span>📈</span>
                        Obszary do rozwoju
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 400,
                          color: '#64748b',
                          marginLeft: '8px'
                        }}>
                          (na podstawie testu kompetencji)
                        </span>
                      </h3>

                      {profile.developmentAreas && profile.developmentAreas.length > 0 ? (
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                          {profile.developmentAreas.map((area, idx) => {
                            const areaName = typeof area === 'string' ? area : (area as any)?.name || 'Nieznany obszar';
                            return (
                              <div
                                key={idx}
                                style={{
                                  padding: '16px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.05)',
                                  border: '1px solid rgba(239, 68, 68, 0.2)',
                                  borderRadius: '12px',
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '12px'
                                }}
                              >
                                <div style={{
                                  width: '40px',
                                  height: '40px',
                                  backgroundColor: 'rgba(239, 68, 68, 0.1)',
                                  borderRadius: '50%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}>
                                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                                    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                  </svg>
                                </div>
                                <div>
                                  <div style={{ 
                                    fontSize: '14px', 
                                    fontWeight: 600, 
                                    color: '#374151',
                                    marginBottom: '4px'
                                  }}>
                                    {areaName.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                  </div>
                                  <div style={{ 
                                    fontSize: '12px', 
                                    color: '#64748b'
                                  }}>
                                    Obszar do wzmocnienia
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div style={{
                          textAlign: 'center',
                          color: '#64748b',
                          fontSize: '14px',
                          padding: '20px'
                        }}>
                          Brak zidentyfikowanych obszarów do rozwoju
                        </div>
                      )}

                      <div style={{
                        marginTop: '16px',
                        padding: '16px',
                        backgroundColor: 'rgba(59, 130, 246, 0.05)',
                        borderRadius: '12px',
                        border: '1px solid rgba(59, 130, 246, 0.2)'
                      }}>
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          marginBottom: '8px'
                        }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <path d="M12 6v6l4 2"></path>
                          </svg>
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>
                            Wskazówka rozwojowa
                          </span>
                        </div>
                        <p style={{ 
                          fontSize: '14px', 
                          color: '#64748b', 
                          margin: 0,
                          lineHeight: '1.5'
                        }}>
                          Skoncentruj się na rozwoju 1-2 obszarów jednocześnie. Rozważ kursy, szkolenia lub mentoring 
                          w tych dziedzinach. Regularne doskonalenie kompetencji zwiększy Twoje szanse na rynku pracy.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis na dole */}
                {profile.aiAnalysis && (
                  <div style={{
                    marginTop: '20px',
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
                      <span>🤖</span>
                      Analiza AI
                      {profile.confidenceScore && (
                        <span style={{
                          fontSize: '12px',
                          fontWeight: 500,
                          color: '#64748b',
                          backgroundColor: 'rgba(34, 197, 94, 0.1)',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          border: '1px solid rgba(34, 197, 94, 0.2)'
                        }}>
                          Pewność: {Math.round(profile.confidenceScore * 100)}%
                        </span>
                      )}
                    </h3>
                    
                    <div style={{
                      fontSize: '14px',
                      color: '#374151',
                      lineHeight: '1.6',
                      backgroundColor: 'rgba(59, 130, 246, 0.05)',
                      padding: '16px',
                      borderRadius: '12px',
                      border: '1px solid rgba(59, 130, 246, 0.2)'
                    }}>
                      {profile.aiAnalysis}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
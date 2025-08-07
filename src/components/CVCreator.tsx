'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

// Definicja typów
interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  website?: string;
  linkedin?: string;
  photo?: string;
}

interface Experience {
  id: string;
  position: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  id: string;
  degree: string;
  school: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  gpa?: string;
  description?: string;
}

interface Skill {
  id: string;
  name: string;
  level: 'Podstawowy' | 'Średniozaawansowany' | 'Zaawansowany' | 'Ekspert';
  category: 'Techniczne' | 'Językowe' | 'Miękkie' | 'Branżowe';
}

interface Language {
  id: string;
  name: string;
  level: 'Podstawowy' | 'Komunikatywny' | 'Zaawansowany' | 'Ojczysty';
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  date: string;
  expiryDate?: string;
  credentialId?: string;
}

interface CVData {
  personalInfo: PersonalInfo;
  summary: string;
  experience: Experience[];
  education: Education[];
  skills: Skill[];
  languages: Language[];
  certifications: Certification[];
  interests: string[];
  template: 'classic' | 'modern' | 'creative';
  color: string;
  fontSize: 'small' | 'medium' | 'large';
}

// Domyślne dane CV
const DEFAULT_CV_DATA: CVData = {
  personalInfo: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    linkedin: '',
    website: ''
  },
  summary: '',
  experience: [{
    id: 'exp_1',
    position: '',
    company: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    description: '',
    achievements: []
  }],
  education: [{
    id: 'edu_1',
    degree: '',
    school: '',
    location: '',
    startDate: '',
    endDate: '',
    current: false,
    gpa: '',
    description: ''
  }],
  skills: [],
  languages: [],
  certifications: [],
  interests: [],
  template: 'classic',
  color: '#3b82f6',
  fontSize: 'medium'
};

const TEMPLATES = [
  {
    id: 'classic' as const,
    name: 'Klasyczny',
    description: 'Tradycyjny, jednoszpaltowy layout. Idealny dla branż konserwatywnych.',
    icon: '📄',
    color: '#374151',
    features: ['ATS-friendly', 'Jednoszpaltowy', 'Minimalistyczny', 'Uniwersalny']
  },
  {
    id: 'modern' as const,
    name: 'Nowoczesny', 
    description: 'Dwuszpaltowy z bocznym panelem i wykresami umiejętności.',
    icon: '🎨',
    color: '#3b82f6',
    features: ['Dwuszpaltowy', 'Wykresy umiejętności', 'Ikony', 'Kolorowe akcenty']
  },
  {
    id: 'creative' as const,
    name: 'Kreatywny',
    description: 'Kolorowy i graficzny. Dla branż kreatywnych i marketingu.',
    icon: '🌈',
    color: '#8b5cf6',
    features: ['Timeline', 'Grafiki', 'Kolorowy', 'Interaktywny']
  }
];

const COLOR_OPTIONS = [
  '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
  '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'
];

export default function CVCreator() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [cvData, setCvData] = useState<CVData>(DEFAULT_CV_DATA);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'personal' | 'experience' | 'education' | 'skills' | 'template'>('personal');
  const [generating, setGenerating] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Sprawdzenie autoryzacji
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
    setLoading(false);
  }, [session, status, router]);

  // Funkcje pomocnicze
  const updatePersonalInfo = (field: keyof PersonalInfo, value: string) => {
    setCvData(prev => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [field]: value }
    }));
  };

  const updateSummary = (value: string) => {
    setCvData(prev => ({ ...prev, summary: value }));
  };

  // Funkcje dla doświadczenia
  const addExperience = () => {
    const newExp: Experience = {
      id: `exp_${Date.now()}`,
      position: '',
      company: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      description: '',
      achievements: []
    };
    setCvData(prev => ({
      ...prev,
      experience: [...prev.experience, newExp]
    }));
  };

  const removeExperience = (id: string) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.filter(exp => exp.id !== id)
    }));
  };

  const updateExperience = (id: string, field: keyof Experience, value: any) => {
    setCvData(prev => ({
      ...prev,
      experience: prev.experience.map(exp => 
        exp.id === id ? { ...exp, [field]: value } : exp
      )
    }));
  };

  // Funkcje dla wykształcenia
  const addEducation = () => {
    const newEdu: Education = {
      id: `edu_${Date.now()}`,
      degree: '',
      school: '',
      location: '',
      startDate: '',
      endDate: '',
      current: false,
      gpa: '',
      description: ''
    };
    setCvData(prev => ({
      ...prev,
      education: [...prev.education, newEdu]
    }));
  };

  const removeEducation = (id: string) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const updateEducation = (id: string, field: keyof Education, value: any) => {
    setCvData(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  // Funkcje dla umiejętności
  const addSkill = () => {
    const newSkill: Skill = {
      id: `skill_${Date.now()}`,
      name: '',
      level: 'Średniozaawansowany',
      category: 'Techniczne'
    };
    setCvData(prev => ({
      ...prev,
      skills: [...prev.skills, newSkill]
    }));
  };

  const removeSkill = (id: string) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill.id !== id)
    }));
  };

  const updateSkill = (id: string, field: keyof Skill, value: any) => {
    setCvData(prev => ({
      ...prev,
      skills: prev.skills.map(skill => 
        skill.id === id ? { ...skill, [field]: value } : skill
      )
    }));
  };

  // Funkcje dla języków
  const addLanguage = () => {
    const newLang: Language = {
      id: `lang_${Date.now()}`,
      name: '',
      level: 'Komunikatywny'
    };
    setCvData(prev => ({
      ...prev,
      languages: [...prev.languages, newLang]
    }));
  };

  const removeLanguage = (id: string) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.filter(lang => lang.id !== id)
    }));
  };

  const updateLanguage = (id: string, field: keyof Language, value: any) => {
    setCvData(prev => ({
      ...prev,
      languages: prev.languages.map(lang => 
        lang.id === id ? { ...lang, [field]: value } : lang
      )
    }));
  };

  // Funkcje dla certyfikatów
  const addCertification = () => {
    const newCert: Certification = {
      id: `cert_${Date.now()}`,
      name: '',
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: ''
    };
    setCvData(prev => ({
      ...prev,
      certifications: [...prev.certifications, newCert]
    }));
  };

  const removeCertification = (id: string) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.filter(cert => cert.id !== id)
    }));
  };

  const updateCertification = (id: string, field: keyof Certification, value: any) => {
    setCvData(prev => ({
      ...prev,
      certifications: prev.certifications.map(cert => 
        cert.id === id ? { ...cert, [field]: value } : cert
      )
    }));
  };

  // Aktualizacja szablonu i koloru
  const updateTemplate = (template: 'classic' | 'modern' | 'creative') => {
    setCvData(prev => ({ ...prev, template }));
  };

  const updateColor = (color: string) => {
    setCvData(prev => ({ ...prev, color }));
  };

  // Generowanie PDF
const generatePDF = async () => {
  setGenerating(true);
  try {
    // Sprawdź czy podstawowe dane są wypełnione
    if (!cvData.personalInfo.firstName || !cvData.personalInfo.lastName || !cvData.personalInfo.email) {
      alert('Wypełnij podstawowe dane osobowe (imię, nazwisko, email) przed wygenerowaniem CV.');
      setGenerating(false);
      return;
    }

    console.log('🔄 Generuję PDF z danymi:', cvData);

    const response = await fetch('/api/generate-cv-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cvData),
      credentials: 'include',
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Błąd HTTP: ${response.status}`);
    }

    // Pobierz PDF jako blob
    const blob = await response.blob();
    
    // Sprawdź czy otrzymaliśmy PDF
    if (blob.type !== 'application/pdf') {
      throw new Error('Otrzymano nieprawidłowy format pliku');
    }

    // Utwórz URL dla blob
    const url = window.URL.createObjectURL(blob);
    
    // Utwórz link do pobrania
    const link = document.createElement('a');
    link.href = url;
    link.download = `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}.pdf`;
    
    // Dodaj link do DOM, kliknij i usuń
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Zwolnij pamięć
    window.URL.revokeObjectURL(url);
    
    console.log('✅ PDF wygenerowany i pobrany pomyślnie!');
    
  } catch (error) {
    console.error('❌ Błąd podczas generowania PDF:', error);
    
    const errorMessage = error instanceof Error ? error.message : 'Nieznany błąd';
    alert(`Wystąpił błąd podczas generowania CV: ${errorMessage}`);
    
  } finally {
    setGenerating(false);
  }
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
            Ładowanie kreatora CV...
          </h2>
        </div>
      </div>
    );
  }

  if (!session) return null;

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
        
        .cv-section {
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
              
              <div>
                <h1 style={{ 
                  fontSize: '24px', 
                  fontWeight: 700, 
                  color: '#1e293b', 
                  margin: 0,
                  background: 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent'
                }}>
                  Kreator CV
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  margin: 0 
                }}>
                  Stwórz profesjonalne CV w kilka minut
                </p>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
              <button
                onClick={() => setPreviewMode(!previewMode)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  backgroundColor: previewMode ? 'rgba(59, 130, 246, 0.15)' : 'rgba(0, 0, 0, 0.02)',
                  color: previewMode ? '#3b82f6' : '#64748b',
                  border: previewMode ? '1px solid rgba(59, 130, 246, 0.3)' : '1px solid rgba(0, 0, 0, 0.1)',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 500,
                  cursor: 'pointer'
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
                {previewMode ? 'Edytuj' : 'Podgląd'}
              </button>
              
              <button
                onClick={generatePDF}
                disabled={generating}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 16px',
                  background: generating ? 'rgba(156, 163, 175, 0.5)' : 'linear-gradient(135deg, #3b82f6, #60a5fa)',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: generating ? 'not-allowed' : 'pointer',
                  boxShadow: generating ? 'none' : '0 4px 15px rgba(59, 130, 246, 0.4)'
                }}
              >
                {generating ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255, 255, 255, 0.3)',
                    borderTop: '2px solid #ffffff',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7,10 12,15 17,10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                )}
                {generating ? 'Generuję...' : 'Pobierz PDF'}
              </button>
            </div>
          </header>
          
          {/* Zawartość */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            display: 'flex',
            gap: '20px'
          }}>
            {/* Panel edycji */}
            {!previewMode && (
              <div style={{
                width: '400px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '16px',
                padding: '0',
                height: 'fit-content',
                maxHeight: 'calc(100vh - 120px)',
                overflow: 'auto'
              }}>
                {/* Tabsy edycji */}
                <div style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '4px',
                  padding: '16px',
                  borderBottom: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  {[
                    { id: 'personal', label: 'Dane osobowe', icon: '👤' },
                    { id: 'experience', label: 'Doświadczenie', icon: '💼' },
                    { id: 'education', label: 'Wykształcenie', icon: '🎓' },
                    { id: 'skills', label: 'Umiejętności', icon: '⚡' },
                    { id: 'template', label: 'Szablon', icon: '🎨' }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      style={{
                        flex: '1',
                        minWidth: '120px',
                        padding: '8px 12px',
                        borderRadius: '8px',
                        border: 'none',
                        backgroundColor: activeTab === tab.id ? 'rgba(59, 130, 246, 0.15)' : 'transparent',
                        color: activeTab === tab.id ? '#3b82f6' : '#64748b',
                        fontWeight: activeTab === tab.id ? 600 : 500,
                        fontSize: '12px',
                        cursor: 'pointer',
                        transition: 'all 0.3s ease',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '4px'
                      }}
                    >
                      <span style={{ fontSize: '14px' }}>{tab.icon}</span>
                      <span>{tab.label}</span>
                    </button>
                  ))}
                </div>

                {/* Zawartość tabów */}
                <div style={{ padding: '20px' }}>
                  {/* Dane osobowe */}
                  {activeTab === 'personal' && (
                    <div className="cv-section">
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                        Dane osobowe
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                          <div>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                              Imię *
                            </label>
                            <input
                              type="text"
                              value={cvData.personalInfo.firstName}
                              onChange={(e) => updatePersonalInfo('firstName', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                          <div>
                            <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                              Nazwisko *
                            </label>
                            <input
                              type="text"
                              value={cvData.personalInfo.lastName}
                              onChange={(e) => updatePersonalInfo('lastName', e.target.value)}
                              style={{
                                width: '100%',
                                padding: '8px 12px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '6px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                          </div>
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                            Email *
                          </label>
                          <input
                            type="email"
                            value={cvData.personalInfo.email}
                            onChange={(e) => updatePersonalInfo('email', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                            Telefon
                          </label>
                          <input
                            type="tel"
                            value={cvData.personalInfo.phone}
                            onChange={(e) => updatePersonalInfo('phone', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                            Lokalizacja
                          </label>
                          <input
                            type="text"
                            value={cvData.personalInfo.location}
                            onChange={(e) => updatePersonalInfo('location', e.target.value)}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                            LinkedIn
                          </label>
                          <input
                            type="url"
                            value={cvData.personalInfo.linkedin || ''}
                            onChange={(e) => updatePersonalInfo('linkedin', e.target.value)}
                            placeholder="https://linkedin.com/in/username"
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                        
                        <div>
                          <label style={{ fontSize: '14px', fontWeight: 500, color: '#374151', marginBottom: '4px', display: 'block' }}>
                            Profil zawodowy
                          </label>
                          <textarea
                            value={cvData.summary}
                            onChange={(e) => updateSummary(e.target.value)}
                            placeholder="Krótki opis Twojego doświadczenia i celów zawodowych..."
                            rows={4}
                            style={{
                              width: '100%',
                              padding: '8px 12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '6px',
                              fontSize: '14px',
                              outline: 'none',
                              resize: 'vertical',
                              boxSizing: 'border-box'
                            }}
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Doświadczenie */}
                  {activeTab === 'experience' && (
                    <div className="cv-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                          Doświadczenie zawodowe
                        </h3>
                        <button
                          onClick={addExperience}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Dodaj
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cvData.experience.map((exp, index) => (
                          <div key={exp.id} style={{
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                Stanowisko {index + 1}
                              </span>
                              {cvData.experience.length > 1 && (
                                <button
                                  onClick={() => removeExperience(exp.id)}
                                  style={{
                                    padding: '4px',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <input
                                type="text"
                                placeholder="Stanowisko"
                                value={exp.position}
                                onChange={(e) => updateExperience(exp.id, 'position', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <input
                                type="text"
                                placeholder="Firma"
                                value={exp.company}
                                onChange={(e) => updateExperience(exp.id, 'company', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                  type="month"
                                  placeholder="Data rozpoczęcia"
                                  value={exp.startDate}
                                  onChange={(e) => updateExperience(exp.id, 'startDate', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                
                                <input
                                  type="month"
                                  placeholder="Data zakończenia"
                                  value={exp.endDate}
                                  onChange={(e) => updateExperience(exp.id, 'endDate', e.target.value)}
                                  disabled={exp.current}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    opacity: exp.current ? 0.5 : 1,
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input
                                  type="checkbox"
                                  checked={exp.current}
                                  onChange={(e) => updateExperience(exp.id, 'current', e.target.checked)}
                                />
                                Obecnie pracuję na tym stanowisku
                              </label>
                              
                              <textarea
                                placeholder="Opis obowiązków i osiągnięć..."
                                value={exp.description}
                                onChange={(e) => updateExperience(exp.id, 'description', e.target.value)}
                                rows={3}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  resize: 'vertical',
                                  boxSizing: 'border-box'
                                }}
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Wykształcenie */}
                  {activeTab === 'education' && (
                    <div className="cv-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                          Wykształcenie
                        </h3>
                        <button
                          onClick={addEducation}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Dodaj
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {cvData.education.map((edu, index) => (
                          <div key={edu.id} style={{
                            padding: '16px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc'
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                              <span style={{ fontSize: '14px', fontWeight: 600, color: '#374151' }}>
                                Wykształcenie {index + 1}
                              </span>
                              {cvData.education.length > 1 && (
                                <button
                                  onClick={() => removeEducation(edu.id)}
                                  style={{
                                    padding: '4px',
                                    backgroundColor: 'transparent',
                                    color: '#ef4444',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer'
                                  }}
                                >
                                  🗑️
                                </button>
                              )}
                            </div>
                            
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                              <input
                                type="text"
                                placeholder="Kierunek studiów / tytuł"
                                value={edu.degree}
                                onChange={(e) => updateEducation(edu.id, 'degree', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <input
                                type="text"
                                placeholder="Uczelnia / Szkoła"
                                value={edu.school}
                                onChange={(e) => updateEducation(edu.id, 'school', e.target.value)}
                                style={{
                                  width: '100%',
                                  padding: '8px 12px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '6px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                <input
                                  type="month"
                                  placeholder="Data rozpoczęcia"
                                  value={edu.startDate}
                                  onChange={(e) => updateEducation(edu.id, 'startDate', e.target.value)}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    boxSizing: 'border-box'
                                  }}
                                />
                                
                                <input
                                  type="month"
                                  placeholder="Data zakończenia"
                                  value={edu.endDate}
                                  onChange={(e) => updateEducation(edu.id, 'endDate', e.target.value)}
                                  disabled={edu.current}
                                  style={{
                                    width: '100%',
                                    padding: '8px 12px',
                                    border: '1px solid #e2e8f0',
                                    borderRadius: '6px',
                                    fontSize: '14px',
                                    outline: 'none',
                                    opacity: edu.current ? 0.5 : 1,
                                    boxSizing: 'border-box'
                                  }}
                                />
                              </div>
                              
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
                                <input
                                  type="checkbox"
                                  checked={edu.current}
                                  onChange={(e) => updateEducation(edu.id, 'current', e.target.checked)}
                                />
                                Obecnie się uczę
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Umiejętności */}
                  {activeTab === 'skills' && (
                    <div className="cv-section">
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', margin: 0 }}>
                          Umiejętności
                        </h3>
                        <button
                          onClick={addSkill}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#3b82f6',
                            color: '#ffffff',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            fontWeight: 600,
                            cursor: 'pointer'
                          }}
                        >
                          + Dodaj
                        </button>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        {cvData.skills.map((skill, index) => (
                          <div key={skill.id} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            padding: '12px',
                            border: '1px solid #e2e8f0',
                            borderRadius: '8px',
                            backgroundColor: '#f8fafc'
                          }}>
                            <input
                              type="text"
                              placeholder="Nazwa umiejętności"
                              value={skill.name}
                              onChange={(e) => updateSkill(skill.id, 'name', e.target.value)}
                              style={{
                                flex: 1,
                                padding: '6px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '14px',
                                outline: 'none',
                                boxSizing: 'border-box'
                              }}
                            />
                            
                            <select
                              value={skill.level}
                              onChange={(e) => updateSkill(skill.id, 'level', e.target.value as any)}
                              style={{
                                padding: '6px 8px',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontSize: '12px',
                                outline: 'none',
                                minWidth: '120px'
                              }}
                            >
                              <option value="Podstawowy">Podstawowy</option>
                              <option value="Średniozaawansowany">Średni</option>
                              <option value="Zaawansowany">Zaawansowany</option>
                              <option value="Ekspert">Ekspert</option>
                            </select>
                            
                            <button
                              onClick={() => removeSkill(skill.id)}
                              style={{
                                padding: '4px',
                                backgroundColor: 'transparent',
                                color: '#ef4444',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        ))}
                      </div>
                      
                      {/* Sekcja języków */}
                      <div style={{ marginTop: '24px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                          <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', margin: 0 }}>
                            Znajomość języków
                          </h4>
                          <button
                            onClick={addLanguage}
                            style={{
                              padding: '4px 8px',
                              backgroundColor: '#10b981',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '4px',
                              fontSize: '11px',
                              fontWeight: 600,
                              cursor: 'pointer'
                            }}
                          >
                            + Język
                          </button>
                        </div>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {cvData.languages.map((lang, index) => (
                            <div key={lang.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              backgroundColor: '#f0fdf4'
                            }}>
                              <input
                                type="text"
                                placeholder="Język"
                                value={lang.name}
                                onChange={(e) => updateLanguage(lang.id, 'name', e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '6px 8px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <select
                                value={lang.level}
                                onChange={(e) => updateLanguage(lang.id, 'level', e.target.value as any)}
                                style={{
                                  padding: '6px 8px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  fontSize: '12px',
                                  outline: 'none',
                                  minWidth: '120px'
                                }}
                              >
                                <option value="Podstawowy">Podstawowy</option>
                                <option value="Komunikatywny">Komunikatywny</option>
                                <option value="Zaawansowany">Zaawansowany</option>
                                <option value="Ojczysty">Ojczysty</option>
                              </select>
                              
                              <button
                                onClick={() => removeLanguage(lang.id)}
                                style={{
                                  padding: '4px',
                                  backgroundColor: 'transparent',
                                  color: '#ef4444',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Sekcja certyfikatów */}
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                          Certyfikaty i uprawnienia
                        </h4>
                        
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                          {cvData.certifications.map((cert, index) => (
                            <div key={cert.id} style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '12px',
                              border: '1px solid #e2e8f0',
                              borderRadius: '8px',
                              backgroundColor: '#f8fafc'
                            }}>
                              <input
                                type="text"
                                placeholder="Nazwa certyfikatu"
                                value={cert.name}
                                onChange={(e) => updateCertification(cert.id, 'name', e.target.value)}
                                style={{
                                  flex: 1,
                                  padding: '6px 8px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <input
                                type="text"
                                placeholder="Wydawca"
                                value={cert.issuer}
                                onChange={(e) => updateCertification(cert.id, 'issuer', e.target.value)}
                                style={{
                                  width: '120px',
                                  padding: '6px 8px',
                                  border: '1px solid #e2e8f0',
                                  borderRadius: '4px',
                                  fontSize: '14px',
                                  outline: 'none',
                                  boxSizing: 'border-box'
                                }}
                              />
                              
                              <button
                                onClick={() => removeCertification(cert.id)}
                                style={{
                                  padding: '4px',
                                  backgroundColor: 'transparent',
                                  color: '#ef4444',
                                  border: 'none',
                                  borderRadius: '4px',
                                  cursor: 'pointer'
                                }}
                              >
                                🗑️
                              </button>
                            </div>
                          ))}
                          
                          <button
                            onClick={addCertification}
                            style={{
                              padding: '8px 12px',
                              backgroundColor: 'rgba(59, 130, 246, 0.1)',
                              color: '#3b82f6',
                              border: '1px dashed rgba(59, 130, 246, 0.3)',
                              borderRadius: '6px',
                              fontSize: '14px',
                              cursor: 'pointer'
                            }}
                          >
                            + Dodaj certyfikat
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Szablony */}
                  {activeTab === 'template' && (
                    <div className="cv-section">
                      <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#1e293b', marginBottom: '16px' }}>
                        Wybierz szablon
                      </h3>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                        {TEMPLATES.map(template => (
                          <div
                            key={template.id}
                            onClick={() => updateTemplate(template.id)}
                            style={{
                              padding: '16px',
                              border: cvData.template === template.id 
                                ? `2px solid ${template.color}` 
                                : '1px solid #e2e8f0',
                              borderRadius: '12px',
                              cursor: 'pointer',
                              backgroundColor: cvData.template === template.id 
                                ? `${template.color}15` 
                                : '#ffffff',
                              transition: 'all 0.3s ease'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '24px' }}>{template.icon}</span>
                              <div>
                                <h4 style={{ 
                                  fontSize: '16px', 
                                  fontWeight: 600, 
                                  color: cvData.template === template.id ? template.color : '#1e293b',
                                  margin: 0 
                                }}>
                                  {template.name}
                                </h4>
                                <p style={{ 
                                  fontSize: '12px', 
                                  color: '#64748b', 
                                  margin: '2px 0 0 0' 
                                }}>
                                  {template.description}
                                </p>
                              </div>
                            </div>
                            
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {template.features.map(feature => (
                                <span
                                  key={feature}
                                  style={{
                                    padding: '2px 8px',
                                    backgroundColor: cvData.template === template.id 
                                      ? `${template.color}25` 
                                      : 'rgba(107, 114, 128, 0.1)',
                                    color: cvData.template === template.id 
                                      ? template.color 
                                      : '#6b7280',
                                    borderRadius: '4px',
                                    fontSize: '11px',
                                    fontWeight: 500
                                  }}
                                >
                                  {feature}
                                </span>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      {/* Kolory */}
                      <div style={{ marginTop: '24px' }}>
                        <h4 style={{ fontSize: '16px', fontWeight: 600, color: '#1e293b', marginBottom: '12px' }}>
                          Kolor akcentu
                        </h4>
                        
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                          {COLOR_OPTIONS.map(color => (
                            <button
                              key={color}
                              onClick={() => updateColor(color)}
                              style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '8px',
                                backgroundColor: color,
                                border: cvData.color === color ? '3px solid #ffffff' : '1px solid #e2e8f0',
                                boxShadow: cvData.color === color 
                                  ? `0 0 0 2px ${color}` 
                                  : '0 2px 4px rgba(0,0,0,0.1)',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Panel podglądu CV */}
            <div style={{
              flex: 1,
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '16px',
              padding: '24px',
              overflow: 'auto'
            }}>
              <CVPreview cvData={cvData} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// Komponent podglądu CV
function CVPreview({ cvData }: { cvData: CVData }) {
  const template = cvData.template;
  const color = cvData.color;

  if (template === 'classic') {
    return <ClassicTemplate cvData={cvData} color={color} />;
  } else if (template === 'creative') {
    return <CreativeTemplate cvData={cvData} color={color} />;
  } else {
    return <ModernTemplate cvData={cvData} color={color} />;
  }
}

// Szablon Klasyczny
function ClassicTemplate({ cvData, color }: { cvData: CVData; color: string }) {
  return (
    <div style={{
      fontFamily: 'serif',
      lineHeight: '1.5',
      color: '#1e293b',
      maxWidth: '210mm',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      padding: '20mm',
      minHeight: '297mm'
    }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '24px', borderBottom: `2px solid ${color}`, paddingBottom: '16px' }}>
        <h1 style={{
          fontSize: '28px',
          fontWeight: 700,
          color: color,
          margin: '0 0 8px 0',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
        </h1>
        
        <div style={{ fontSize: '14px', color: '#64748b', display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
          <span>{cvData.personalInfo.email}</span>
          {cvData.personalInfo.phone && <span>{cvData.personalInfo.phone}</span>}
          {cvData.personalInfo.location && <span>{cvData.personalInfo.location}</span>}
          {cvData.personalInfo.linkedin && <span>{cvData.personalInfo.linkedin}</span>}
        </div>
      </div>

      {/* Profil zawodowy */}
      {cvData.summary && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '8px', textTransform: 'uppercase' }}>
            Profil zawodowy
          </h2>
          <p style={{ fontSize: '14px', textAlign: 'justify', margin: 0 }}>
            {cvData.summary}
          </p>
        </div>
      )}

      {/* Doświadczenie */}
      {cvData.experience.length > 0 && cvData.experience.some(exp => exp.position) && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '12px', textTransform: 'uppercase' }}>
            Doświadczenie zawodowe
          </h2>
          {cvData.experience.filter(exp => exp.position).map(exp => (
            <div key={exp.id} style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  {exp.position}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {exp.startDate} - {exp.current ? 'obecnie' : exp.endDate}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b', marginBottom: '4px' }}>
                {exp.company} {exp.location && `• ${exp.location}`}
              </div>
              {exp.description && (
                <p style={{ fontSize: '14px', margin: 0, textAlign: 'justify' }}>
                  {exp.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Wykształcenie */}
      {cvData.education.length > 0 && cvData.education.some(edu => edu.degree) && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '12px', textTransform: 'uppercase' }}>
            Wykształcenie
          </h2>
          {cvData.education.filter(edu => edu.degree).map(edu => (
            <div key={edu.id} style={{ marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                  {edu.degree}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748b' }}>
                  {edu.startDate} - {edu.current ? 'obecnie' : edu.endDate}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#64748b' }}>
                {edu.school} {edu.location && `• ${edu.location}`}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Umiejętności */}
      {cvData.skills.length > 0 && cvData.skills.some(skill => skill.name) && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '12px', textTransform: 'uppercase' }}>
            Umiejętności
          </h2>
          <div style={{ fontSize: '14px' }}>
            {cvData.skills.filter(skill => skill.name).map(skill => skill.name).join(' • ')}
          </div>
        </div>
      )}

      {/* Języki */}
      {cvData.languages.length > 0 && cvData.languages.some(lang => lang.name) && (
        <div style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '12px', textTransform: 'uppercase' }}>
            Znajomość języków
          </h2>
          <div style={{ fontSize: '14px' }}>
            {cvData.languages.filter(lang => lang.name).map(lang => `${lang.name} (${lang.level})`).join(' • ')}
          </div>
        </div>
      )}

      {/* Certyfikaty */}
      {cvData.certifications.length > 0 && cvData.certifications.some(cert => cert.name) && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: color, marginBottom: '12px', textTransform: 'uppercase' }}>
            Certyfikaty
          </h2>
          {cvData.certifications.filter(cert => cert.name).map(cert => (
            <div key={cert.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
              <strong>{cert.name}</strong>
              {cert.issuer && <span style={{ color: '#64748b' }}> • {cert.issuer}</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Szablon Nowoczesny
function ModernTemplate({ cvData, color }: { cvData: CVData; color: string }) {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      lineHeight: '1.4',
      color: '#1e293b',
      maxWidth: '210mm',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '297mm',
      display: 'grid',
      gridTemplateColumns: '2fr 1fr',
      gap: '0'
    }}>
      {/* Główna kolumna */}
      <div style={{ padding: '40px 30px 40px 40px' }}>
        {/* Header */}
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{
            fontSize: '32px',
            fontWeight: 800,
            color: '#1e293b',
            margin: '0 0 8px 0',
            letterSpacing: '-0.5px'
          }}>
            {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
          </h1>
          
          <div style={{ fontSize: '16px', color: color, fontWeight: 500 }}>
            
          </div>
        </div>

        {/* Profil zawodowy */}
        {cvData.summary && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: color, 
              marginBottom: '12px',
              position: 'relative',
              paddingLeft: '20px'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '20px',
                backgroundColor: color,
                borderRadius: '2px'
              }}></span>
              O mnie
            </h2>
            <p style={{ fontSize: '14px', textAlign: 'justify', margin: 0 }}>
              {cvData.summary}
            </p>
          </div>
        )}

        {/* Doświadczenie */}
        {cvData.experience.length > 0 && cvData.experience.some(exp => exp.position) && (
          <div style={{ marginBottom: '30px' }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: color, 
              marginBottom: '20px',
              position: 'relative',
              paddingLeft: '20px'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '20px',
                backgroundColor: color,
                borderRadius: '2px'
              }}></span>
              Doświadczenie zawodowe
            </h2>
            {cvData.experience.filter(exp => exp.position).map(exp => (
              <div key={exp.id} style={{ marginBottom: '20px', position: 'relative', paddingLeft: '20px' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: color,
                  borderRadius: '50%'
                }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#1e293b' }}>
                    {exp.position}
                  </h3>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#ffffff',
                    backgroundColor: color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 500
                  }}>
                    {exp.startDate} - {exp.current ? 'obecnie' : exp.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: color, marginBottom: '8px', fontWeight: 500 }}>
                  {exp.company} {exp.location && `• ${exp.location}`}
                </div>
                {exp.description && (
                  <p style={{ fontSize: '13px', margin: 0, textAlign: 'justify', color: '#64748b' }}>
                    {exp.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Wykształcenie */}
        {cvData.education.length > 0 && cvData.education.some(edu => edu.degree) && (
          <div>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 700, 
              color: color, 
              marginBottom: '20px',
              position: 'relative',
              paddingLeft: '20px'
            }}>
              <span style={{
                position: 'absolute',
                left: 0,
                top: '50%',
                transform: 'translateY(-50%)',
                width: '4px',
                height: '20px',
                backgroundColor: color,
                borderRadius: '2px'
              }}></span>
              Wykształcenie
            </h2>
            {cvData.education.filter(edu => edu.degree).map(edu => (
              <div key={edu.id} style={{ marginBottom: '16px', position: 'relative', paddingLeft: '20px' }}>
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: '8px',
                  width: '8px',
                  height: '8px',
                  backgroundColor: color,
                  borderRadius: '50%'
                }}></div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                    {edu.degree}
                  </h3>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#ffffff',
                    backgroundColor: color,
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontWeight: 500
                  }}>
                    {edu.startDate} - {edu.current ? 'obecnie' : edu.endDate}
                  </span>
                </div>
                <div style={{ fontSize: '14px', color: color, fontWeight: 500 }}>
                  {edu.school} {edu.location && `• ${edu.location}`}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Boczna kolumna */}
      <div style={{ 
        backgroundColor: `${color}15`, 
        padding: '40px 30px',
        borderLeft: `4px solid ${color}`
      }}>
        {/* Dane kontaktowe */}
        <div style={{ marginBottom: '30px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: color, marginBottom: '16px', textTransform: 'uppercase' }}>
            Kontakt
          </h3>
          <div style={{ fontSize: '13px', color: '#1e293b' }}>
            {cvData.personalInfo.email && (
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: color }}>✉</span>
                {cvData.personalInfo.email}
              </div>
            )}
            {cvData.personalInfo.phone && (
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: color }}>📞</span>
                {cvData.personalInfo.phone}
              </div>
            )}
            {cvData.personalInfo.location && (
              <div style={{ marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: color }}>📍</span>
                {cvData.personalInfo.location}
              </div>
            )}
            {cvData.personalInfo.linkedin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ color: color }}>💼</span>
                LinkedIn
              </div>
            )}
          </div>
        </div>

        {/* Umiejętności */}
        {cvData.skills.length > 0 && cvData.skills.some(skill => skill.name) && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: color, marginBottom: '16px', textTransform: 'uppercase' }}>
              Umiejętności
            </h3>
            {cvData.skills.filter(skill => skill.name).map(skill => (
              <div key={skill.id} style={{ marginBottom: '12px' }}>
                <div style={{ fontSize: '13px', fontWeight: 500, marginBottom: '4px' }}>
                  {skill.name}
                </div>
                <div style={{ 
                  height: '6px',
                  backgroundColor: 'rgba(0,0,0,0.1)',
                  borderRadius: '3px',
                  overflow: 'hidden'
                }}>
                  <div style={{
                    height: '100%',
                    backgroundColor: color,
                    width: skill.level === 'Ekspert' ? '100%' : 
                           skill.level === 'Zaawansowany' ? '75%' :
                           skill.level === 'Średniozaawansowany' ? '50%' : '25%',
                    borderRadius: '3px'
                  }}></div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Języki */}
        {cvData.languages.length > 0 && cvData.languages.some(lang => lang.name) && (
          <div style={{ marginBottom: '30px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: color, marginBottom: '16px', textTransform: 'uppercase' }}>
              Języki
            </h3>
            {cvData.languages.filter(lang => lang.name).map(lang => (
              <div key={lang.id} style={{ marginBottom: '8px', fontSize: '13px' }}>
                <strong>{lang.name}</strong>
                <span style={{ color: '#64748b', marginLeft: '8px' }}>({lang.level})</span>
              </div>
            ))}
          </div>
        )}

        {/* Certyfikaty */}
        {cvData.certifications.length > 0 && cvData.certifications.some(cert => cert.name) && (
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: color, marginBottom: '16px', textTransform: 'uppercase' }}>
              Certyfikaty
            </h3>
            {cvData.certifications.filter(cert => cert.name).map(cert => (
              <div key={cert.id} style={{ marginBottom: '12px', fontSize: '13px' }}>
                <div style={{ fontWeight: 500 }}>{cert.name}</div>
                {cert.issuer && <div style={{ color: '#64748b' }}>{cert.issuer}</div>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Szablon Kreatywny
function CreativeTemplate({ cvData, color }: { cvData: CVData; color: string }) {
  return (
    <div style={{
      fontFamily: "'Inter', sans-serif",
      lineHeight: '1.4',
      color: '#1e293b',
      maxWidth: '210mm',
      margin: '0 auto',
      backgroundColor: '#ffffff',
      minHeight: '297mm',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Dekoracyjne elementy */}
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '200px',
        height: '200px',
        background: `linear-gradient(45deg, ${color}20, ${color}05)`,
        borderRadius: '50%',
        transform: 'translate(50%, -50%)'
      }}></div>
      
      <div style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        width: '150px',
        height: '150px',
        background: `linear-gradient(135deg, ${color}15, ${color}05)`,
        borderRadius: '50%',
        transform: 'translate(-25%, 25%)'
      }}></div>

      <div style={{ padding: '40px', position: 'relative', zIndex: 1 }}>
        {/* Header */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '40px',
          background: `linear-gradient(135deg, ${color}10, ${color}05)`,
          padding: '30px',
          borderRadius: '20px',
          border: `2px solid ${color}30`
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 900,
            background: `linear-gradient(135deg, ${color}, ${color}80)`,
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            margin: '0 0 12px 0',
            letterSpacing: '-1px'
          }}>
            {cvData.personalInfo.firstName} {cvData.personalInfo.lastName}
          </h1>
          
          <div style={{ 
            fontSize: '16px', 
            color: '#64748b',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap',
            gap: '20px',
            marginTop: '16px'
          }}>
            {cvData.personalInfo.email && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: color, fontSize: '18px' }}>✉</span>
                {cvData.personalInfo.email}
              </div>
            )}
            {cvData.personalInfo.phone && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: color, fontSize: '18px' }}>📞</span>
                {cvData.personalInfo.phone}
              </div>
            )}
            {cvData.personalInfo.location && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ color: color, fontSize: '18px' }}>📍</span>
                {cvData.personalInfo.location}
              </div>
            )}
          </div>
        </div>

        {/* Grid layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
          {/* Lewa kolumna */}
          <div>
            {/* Profil zawodowy */}
            {cvData.summary && (
              <div style={{ 
                marginBottom: '30px',
                background: `linear-gradient(135deg, ${color}08, transparent)`,
                padding: '20px',
                borderRadius: '15px',
                borderLeft: `4px solid ${color}`
              }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>👋</span>
                  O mnie
                </h2>
                <p style={{ fontSize: '14px', textAlign: 'justify', margin: 0 }}>
                  {cvData.summary}
                </p>
              </div>
            )}

            {/* Umiejętności */}
            {cvData.skills.length > 0 && cvData.skills.some(skill => skill.name) && (
              <div style={{ 
                marginBottom: '30px',
                background: `linear-gradient(135deg, ${color}08, transparent)`,
                padding: '20px',
                borderRadius: '15px',
                borderLeft: `4px solid ${color}`
              }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>⚡</span>
                  Umiejętności
                </h2>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {cvData.skills.filter(skill => skill.name).map(skill => (
                    <span
                      key={skill.id}
                      style={{
                        padding: '6px 12px',
                        backgroundColor: color,
                        color: '#ffffff',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: 500
                      }}
                    >
                      {skill.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Języki */}
            {cvData.languages.length > 0 && cvData.languages.some(lang => lang.name) && (
              <div style={{ 
                background: `linear-gradient(135deg, ${color}08, transparent)`,
                padding: '20px',
                borderRadius: '15px',
                borderLeft: `4px solid ${color}`
              }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🗣️</span>
                  Języki
                </h2>
                {cvData.languages.filter(lang => lang.name).map(lang => (
                  <div key={lang.id} style={{ marginBottom: '8px', fontSize: '14px' }}>
                    <strong>{lang.name}</strong>
                    <span style={{ color: '#64748b', marginLeft: '8px' }}>({lang.level})</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Prawa kolumna */}
          <div>
            {/* Doświadczenie */}
            {cvData.experience.length > 0 && cvData.experience.some(exp => exp.position) && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>💼</span>
                  Doświadczenie
                </h2>
                {cvData.experience.filter(exp => exp.position).map(exp => (
                  <div key={exp.id} style={{ 
                    marginBottom: '20px',
                    background: `linear-gradient(135deg, ${color}05, transparent)`,
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${color}20`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '6px' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0, color: '#1e293b' }}>
                        {exp.position}
                      </h3>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#ffffff',
                        backgroundColor: color,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}>
                        {exp.startDate} - {exp.current ? 'obecnie' : exp.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: color, marginBottom: '8px', fontWeight: 500 }}>
                      {exp.company} {exp.location && `• ${exp.location}`}
                    </div>
                    {exp.description && (
                      <p style={{ fontSize: '13px', margin: 0, textAlign: 'justify', color: '#64748b' }}>
                        {exp.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Wykształcenie */}
            {cvData.education.length > 0 && cvData.education.some(edu => edu.degree) && (
              <div style={{ marginBottom: '30px' }}>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🎓</span>
                  Wykształcenie
                </h2>
                {cvData.education.filter(edu => edu.degree).map(edu => (
                  <div key={edu.id} style={{ 
                    marginBottom: '16px',
                    background: `linear-gradient(135deg, ${color}05, transparent)`,
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${color}20`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <h3 style={{ fontSize: '16px', fontWeight: 600, margin: 0 }}>
                        {edu.degree}
                      </h3>
                      <span style={{ 
                        fontSize: '11px', 
                        color: '#ffffff',
                        backgroundColor: color,
                        padding: '3px 8px',
                        borderRadius: '10px',
                        fontWeight: 500,
                        whiteSpace: 'nowrap',
                        marginLeft: '8px'
                      }}>
                        {edu.startDate} - {edu.current ? 'obecnie' : edu.endDate}
                      </span>
                    </div>
                    <div style={{ fontSize: '14px', color: color, fontWeight: 500, marginTop: '4px' }}>
                      {edu.school} {edu.location && `• ${edu.location}`}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Certyfikaty */}
            {cvData.certifications.length > 0 && cvData.certifications.some(cert => cert.name) && (
              <div>
                <h2 style={{ 
                  fontSize: '22px', 
                  fontWeight: 700, 
                  color: color, 
                  marginBottom: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <span style={{ fontSize: '24px' }}>🏆</span>
                  Certyfikaty
                </h2>
                {cvData.certifications.filter(cert => cert.name).map(cert => (
                  <div key={cert.id} style={{ 
                    marginBottom: '12px',
                    background: `linear-gradient(135deg, ${color}05, transparent)`,
                    padding: '12px',
                    borderRadius: '10px',
                    border: `1px solid ${color}20`
                  }}>
                    <div style={{ fontWeight: 500, fontSize: '14px' }}>{cert.name}</div>
                    {cert.issuer && <div style={{ color: '#64748b', fontSize: '13px' }}>{cert.issuer}</div>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
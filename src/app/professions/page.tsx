'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  getAllCareers,
  formatSalary,
  getAverageSalary,
  CAREER_CATEGORIES,
  EDUCATION_LEVELS,
  EXPERIENCE_LEVELS,
  SALARY_RANGES,
  HOLLAND_CODES,
  type Career
} from '@/lib/careers-data';

export default function ProfessionsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  // State dla filtrów
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedEducation, setSelectedEducation] = useState<string>('all');
  const [selectedExperience, setSelectedExperience] = useState<string>('all');
  const [selectedSalaryRange, setSelectedSalaryRange] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'name' | 'salary' | 'demand'>('name');
  const [showFilters, setShowFilters] = useState(false);

  // Sprawdzenie autoryzacji
  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/login');
      return;
    }
  }, [session, status, router]);

  // Filtrowanie i sortowanie zawodów
  const filteredCareers = useMemo(() => {
    let careers = getAllCareers();

    // Wyszukiwanie
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      careers = careers.filter(career =>
        career.job.toLowerCase().includes(query) ||
        career.description.toLowerCase().includes(query) ||
        career.required_skills.some(skill => skill.toLowerCase().includes(query)) ||
        career.daily_tasks.some(task => task.toLowerCase().includes(query))
      );
    }

    // Filtr kategorii
    if (selectedCategory !== 'all') {
      careers = careers.filter(career => career.category === selectedCategory);
    }

    // Filtr wykształcenia
    if (selectedEducation !== 'all') {
      careers = careers.filter(career => career.education_level === selectedEducation);
    }

    // Filtr doświadczenia
    if (selectedExperience !== 'all') {
      careers = careers.filter(career => career.experience_required === selectedExperience);
    }

    // Filtr zarobków
    if (selectedSalaryRange !== 'all') {
      const range = SALARY_RANGES.find(r => r.id === selectedSalaryRange);
      if (range) {
        careers = careers.filter(career => 
          career.salary_min >= range.min && career.salary_max <= range.max
        );
      }
    }

    // Sortowanie
    careers.sort((a, b) => {
      switch (sortBy) {
        case 'salary':
          return getAverageSalary(b) - getAverageSalary(a);
        case 'demand':
          return a.outlook.localeCompare(b.outlook);
        default:
          return a.job.localeCompare(b.job);
      }
    });

    return careers;
  }, [searchQuery, selectedCategory, selectedEducation, selectedExperience, selectedSalaryRange, sortBy]);

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
            Ładowanie zawodów...
          </h2>
        </div>
      </div>
    );
  }

  if (!session) {
    return null;
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
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .career-card {
          animation: fadeInUp 0.6s ease-out forwards;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        .career-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(59, 130, 246, 0.15);
        }
      `}</style>
      
      <div style={{ 
        display: 'flex', 
        height: '100vh',
        background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 50%, #cbd5e1 100%)',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Tło z wzorem - podobne do ChatComponent */}
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
          {/* Header - podobny do ChatComponent */}
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
                  color: '#64748b',
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  backdropFilter: 'blur(10px)'
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
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text'
                }}>
                  Przeglądaj Zawody
                </h1>
                <p style={{ 
                  fontSize: '14px', 
                  color: '#64748b', 
                  margin: 0 
                }}>
                  Odkryj możliwości kariery w budownictwie
                </p>
              </div>
            </div>
            
            <div style={{ 
              fontSize: '14px', 
              color: '#64748b' 
            }}>
              Znaleziono: <span style={{ fontWeight: 600, color: '#3b82f6' }}>
                {filteredCareers.length}
              </span> zawodów
            </div>
          </header>
          
          {/* Obszar główny z przewijaniem */}
          <div style={{
            flex: 1,
            overflow: 'auto',
            padding: '20px',
            background: 'rgba(255, 255, 255, 0.05)'
          }}>
            {/* Filtry */}
            <div style={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
              borderRadius: '12px',
              padding: '20px',
              marginBottom: '20px'
            }}>
              {/* Wyszukiwarka */}
              <div style={{ position: 'relative', marginBottom: '16px' }}>
                <div style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  pointerEvents: 'none'
                }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Wyszukaj zawód, umiejętność lub zadanie..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 44px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '16px',
                    outline: 'none',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    backgroundColor: '#ffffff'
                  }}
                />
              </div>

              {/* Filtry w rzędzie */}
              <div style={{ 
                display: 'flex', 
                flexWrap: 'wrap', 
                gap: '12px', 
                alignItems: 'center',
                marginBottom: '16px'
              }}>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="all">Wszystkie kategorie</option>
                  {CAREER_CATEGORIES.map(category => (
                    <option key={category.id} value={category.id}>
                      {category.icon} {category.name}
                    </option>
                  ))}
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  style={{
                    padding: '8px 12px',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '14px',
                    outline: 'none',
                    backgroundColor: '#ffffff'
                  }}
                >
                  <option value="name">Sortuj alfabetycznie</option>
                  <option value="salary">Sortuj po zarobkach</option>
                  <option value="demand">Sortuj po zapotrzebowaniu</option>
                </select>

                <button
                  onClick={() => setShowFilters(!showFilters)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    border: '1px solid rgba(59, 130, 246, 0.2)',
                    borderRadius: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  <span>Więcej filtrów</span>
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    style={{ 
                      transform: showFilters ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s ease'
                    }}
                  >
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </div>

              {/* Rozszerzone filtry */}
              {showFilters && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px',
                  paddingTop: '16px',
                  borderTop: '1px solid rgba(59, 130, 246, 0.2)'
                }}>
                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#374151', 
                      marginBottom: '4px' 
                    }}>
                      Wykształcenie
                    </label>
                    <select
                      value={selectedEducation}
                      onChange={(e) => setSelectedEducation(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="all">Wszystkie poziomy</option>
                      {EDUCATION_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#374151', 
                      marginBottom: '4px' 
                    }}>
                      Doświadczenie
                    </label>
                    <select
                      value={selectedExperience}
                      onChange={(e) => setSelectedExperience(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="all">Wszystkie poziomy</option>
                      {EXPERIENCE_LEVELS.map(level => (
                        <option key={level.id} value={level.id}>{level.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: 500, 
                      color: '#374151', 
                      marginBottom: '4px' 
                    }}>
                      Zarobki
                    </label>
                    <select
                      value={selectedSalaryRange}
                      onChange={(e) => setSelectedSalaryRange(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        fontSize: '14px',
                        outline: 'none',
                        backgroundColor: '#ffffff'
                      }}
                    >
                      <option value="all">Wszystkie zakresy</option>
                      {SALARY_RANGES.map(range => (
                        <option key={range.id} value={range.id}>{range.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            {/* Lista zawodów */}
            {filteredCareers.length > 0 ? (
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                gap: '20px'
              }}>
                {filteredCareers.map((career, index) => (
                  <CareerCard key={career.id} career={career} index={index} />
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
                borderRadius: '12px'
              }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px'
                }}>
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </div>
                <h3 style={{ 
                  fontSize: '18px', 
                  fontWeight: 600, 
                  color: '#1e293b', 
                  marginBottom: '8px' 
                }}>
                  Brak wyników
                </h3>
                <p style={{ 
                  color: '#64748b', 
                  marginBottom: '16px' 
                }}>
                  Nie znaleźliśmy zawodów pasujących do wybranych kryteriów.
                </p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedEducation('all');
                    setSelectedExperience('all');
                    setSelectedSalaryRange('all');
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#3b82f6',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                  }}
                >
                  Wyczyść filtry
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// Komponent karty zawodu
function CareerCard({ career, index }: { career: Career; index: number }) {
  const categoryInfo = CAREER_CATEGORIES.find(cat => cat.id === career.category);

  return (
    <Link href={`/professions/${career.id}`} style={{ textDecoration: 'none' }}>
      <div 
        className="career-card"
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(59, 130, 246, 0.2)',
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          animationDelay: `${index * 0.1}s`,
          position: 'relative'
        }}
      >
        {/* Header z kategorią */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
          padding: '16px 20px',
          color: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '20px' }}>{categoryInfo?.icon}</span>
              <span style={{ fontSize: '14px', fontWeight: 500 }}>
                {categoryInfo?.name}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '4px' }}>
              {career.holland_codes.map(code => (
                <span 
                    key={code}
                    style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        fontSize: '12px',
                        fontWeight: 700,
                        color: '#ffffff',
                        backgroundColor: HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                  title={HOLLAND_CODES[code as keyof typeof HOLLAND_CODES]?.description}
                >
                  {code}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Zawartość */}
        <div style={{ padding: '20px' }}>
          <h3 style={{
            fontSize: '20px',
            fontWeight: 700,
            color: '#1e293b',
            marginBottom: '8px',
            lineHeight: '1.3'
          }}>
            {career.job}
          </h3>
          
          <p style={{
            color: '#64748b',
            fontSize: '14px',
            lineHeight: '1.5',
            marginBottom: '16px',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {career.description}
          </p>

          {/* Zarobki */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '12px'
          }}>
            <div style={{
              backgroundColor: 'rgba(34, 197, 94, 0.1)',
              padding: '4px',
              borderRadius: '6px'
            }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"></line>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
              </svg>
            </div>
            <span style={{
              fontSize: '14px',
              fontWeight: 600,
              color: '#1e293b'
            }}>
              {formatSalary(career.salary_min, career.salary_max)}
            </span>
          </div>

          {/* Wykształcenie i doświadczenie */}
          <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                padding: '4px',
                borderRadius: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"></path>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"></path>
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Wykształcenie {career.education_level}
              </span>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{
                backgroundColor: 'rgba(168, 85, 247, 0.1)',
                padding: '4px',
                borderRadius: '6px'
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                  <polyline points="22,12 18,12 15,21 9,3 6,12 2,12"></polyline>
                </svg>
              </div>
              <span style={{ fontSize: '13px', color: '#64748b' }}>
                Doświadczenie {career.experience_required}
              </span>
            </div>
          </div>

          {/* Umiejętności */}
          <div style={{ marginBottom: '16px' }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '8px'
            }}>
              Kluczowe umiejętności
            </h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
              {career.required_skills.slice(0, 3).map((skill, idx) => (
                <span 
                  key={idx}
                  style={{
                    fontSize: '12px',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    color: '#3b82f6',
                    padding: '4px 8px',
                    borderRadius: '6px',
                    fontWeight: 500
                  }}
                >
                  {skill}
                </span>
              ))}
              {career.required_skills.length > 3 && (
                <span style={{
                  fontSize: '12px',
                  backgroundColor: 'rgba(107, 114, 128, 0.1)',
                  color: '#6b7280',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  fontWeight: 500
                }}>
                  +{career.required_skills.length - 3} więcej
                </span>
              )}
            </div>
          </div>

          {/* Perspektywy */}
          <div style={{
            backgroundColor: 'rgba(249, 250, 251, 0.8)',
            padding: '12px',
            borderRadius: '8px',
            marginBottom: '16px'
          }}>
            <h4 style={{
              fontSize: '12px',
              fontWeight: 600,
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '4px'
            }}>
              Perspektywy zawodu
            </h4>
            <p style={{
              fontSize: '13px',
              color: '#374151',
              margin: 0,
              lineHeight: '1.4'
            }}>
              {career.outlook}
            </p>
          </div>

          {/* Call to action */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '16px',
            borderTop: '1px solid rgba(229, 231, 235, 0.8)'
          }}>
            <span style={{
              fontSize: '14px',
              color: '#64748b',
              fontWeight: 500
            }}>
              Zobacz szczegóły
            </span>
            <svg 
              width="20" 
              height="20" 
              viewBox="0 0 24 24" 
              fill="none" 
              stroke="#3b82f6" 
              strokeWidth="2"
              style={{
                transition: 'transform 0.3s ease'
              }}
            >
              <line x1="7" y1="17" x2="17" y2="7"></line>
              <polyline points="7,7 17,7 17,17"></polyline>
            </svg>
          </div>
        </div>
      </div>
    </Link>
  );
}
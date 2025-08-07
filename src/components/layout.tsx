'use client';

import React from 'react';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { signOut } from 'next-auth/react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { data: session } = useSession();
  const [dropdownOpen, setDropdownOpen] = React.useState(false);
  const [careerSectionOpen, setCareerSectionOpen] = React.useState(true);
  const pathname = usePathname();

  const isActive = (path: string) => {
    if (path === '/') return pathname === '/';
    return pathname.startsWith(path);
  };

  // Główne funkcje aplikacji
  const mainFeatures = [
    {
      name: 'Czat AI',
      href: '/',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Szablony dokumentów',
      href: '/templates',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path d="M9 2a2 2 0 00-2 2v8a2 2 0 002 2h6a2 2 0 002-2V6.414A2 2 0 0016.414 5L14 2.586A2 2 0 0012.586 2H9z" />
          <path d="M3 8a2 2 0 012-2v10h8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
        </svg>
      )
    },
    {
      name: 'Wgraj dokument',
      href: '/upload',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  // Moduły doradcy zawodowego
  const careerModules = [
    {
      name: 'Testy Kompetencji',
      href: '/tests',
      status: 'ready',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M9 3a1 1 0 012 0v5.5a.5.5 0 001 0V4a1 1 0 112 0v4.5a.5.5 0 001 0V6a1 1 0 112 0v5a7 7 0 11-14 0V9a1 1 0 012 0v2.5a.5.5 0 001 0V4a1 1 0 012 0v4.5a.5.5 0 001 0V3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Przeglądaj Zawody',
      href: '/professions',
      status: 'development',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clipRule="evenodd" />
          <path d="M2 13.692V16a2 2 0 002 2h12a2 2 0 002-2v-2.308A24.974 24.974 0 0110 15c-2.796 0-5.487-.46-8-1.308z" />
        </svg>
      )
    },
    {
      name: 'Mój Profil Zawodowy',
      href: '/profile',
      status: 'development',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Kreator CV',
      href: '/cv-builder',
      status: 'planned',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
        </svg>
      )
    },
    {
      name: 'Znajdź Pracę',
      href: '/job-finder',
      status: 'planned',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
        </svg>
      )
    }
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800';
      case 'development':
        return 'bg-yellow-100 text-yellow-800';
      case 'planned':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ready':
        return 'Gotowe';
      case 'development':
        return 'W budowie';
      case 'planned':
        return 'Planowane';
      default:
        return 'Nieznane';
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col">
        <div className="flex flex-col flex-grow pt-5 overflow-y-auto bg-white border-r border-gray-200">
          <div className="flex items-center justify-center flex-shrink-0 px-4 mb-5">
            <div className="relative h-10 w-36">
              <Image 
                src="/DoradcaAI.png" 
                alt="DoradcaAI" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
          
          <div className="flex flex-col flex-grow px-4 mt-5">
            <nav className="flex-1 space-y-2">
              {/* Główne funkcje */}
              <div className="space-y-1">
                {mainFeatures.map((feature) => (
                  <Link 
                    key={feature.href}
                    href={feature.href} 
                    className={`flex items-center px-4 py-2 text-sm font-medium rounded-lg group transition-colors ${
                      isActive(feature.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {feature.icon}
                    <span>{feature.name}</span>
                  </Link>
                ))}
              </div>

              {/* Divider */}
              <div className="border-t border-gray-200 my-4"></div>

              {/* Sekcja Doradcy Zawodowego */}
              <div>
                <button
                  onClick={() => setCareerSectionOpen(!careerSectionOpen)}
                  className="flex items-center justify-between w-full px-4 py-2 text-sm font-semibold text-gray-900 hover:bg-gray-50 rounded-lg"
                >
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-5 h-5 mr-3 text-blue-600" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3z" />
                    </svg>
                    <span>Doradztwo Kariery</span>
                  </div>
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className={`w-4 h-4 transition-transform ${careerSectionOpen ? 'rotate-90' : ''}`}
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                  </svg>
                </button>

                {/* Moduły doradcy zawodowego */}
                {careerSectionOpen && (
                  <div className="mt-2 space-y-1 pl-2">
                    {careerModules.map((module) => {
                      const isDisabled = module.status === 'planned';
                      
                      return (
                        <Link
                          key={module.href}
                          href={isDisabled ? '#' : module.href}
                          onClick={(e) => {
                            if (isDisabled) {
                              e.preventDefault();
                            }
                          }}
                          className={`flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg group transition-colors ${
                            isActive(module.href) && !isDisabled
                              ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                              : isDisabled
                              ? 'text-gray-400 cursor-not-allowed'
                              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                          }`}
                        >
                          <div className="flex items-center min-w-0 flex-1">
                            {module.icon}
                            <span className="truncate">{module.name}</span>
                          </div>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(module.status)}`}>
                            {getStatusText(module.status)}
                          </span>
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            </nav>
            
            {/* Ostatnio używane */}
            <div className="mt-6">
              <h3 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Ostatnio używane
              </h3>
              <div className="mt-2 space-y-1">
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-4 h-4 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="truncate w-36">Wniosek projektowy EFS</div>
                    <div className="text-xs text-gray-500">Dzisiaj</div>
                  </div>
                </button>
                
                <button className="flex items-center w-full px-4 py-2 text-sm text-gray-700 rounded-lg hover:bg-gray-100 group">
                  <svg xmlns="http://www.w3.org/2000/svg" className="flex-shrink-0 w-4 h-4 mr-3 text-gray-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <div className="truncate w-36">Harmonogram szkoleniowy</div>
                    <div className="text-xs text-gray-500">Wczoraj</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main content area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Top navigation */}
        <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
          <div className="flex items-center md:hidden">
            <div className="relative h-8 w-28 mr-3">
              <Image 
                src="/DoradcaAI.png" 
                alt="DoradcaAI" 
                fill
                style={{ objectFit: 'contain' }}
                priority
              />
            </div>
          </div>
          
          <div className="flex-1 flex justify-between items-center">
            <h1 className="text-lg font-semibold text-gray-900 hidden md:block">DoradcaAI</h1>
            
            <button 
              type="button" 
              className="bg-green-100 text-green-800 flex items-center px-4 py-2 text-sm rounded-lg md:ml-4 hover:bg-green-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
              Wgraj PDF
            </button>
          </div>
          
          <div className="ml-4 relative">
            <div>
              <button 
                className="flex items-center text-sm rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500" 
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <span className="sr-only">Otwórz menu użytkownika</span>
                <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                  {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : (session?.user?.email?.charAt(0).toUpperCase() || 'U')}
                </div>
                <span className="ml-2 text-sm font-medium text-gray-700 hidden md:block">
                  {session?.user?.name || session?.user?.email || 'Użytkownik'}
                </span>
              </button>
            </div>
            
            {dropdownOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                <button
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Wyloguj się
                </button>
              </div>
            )}
          </div>
        </header>
        
        {/* Content area */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
// src/app/api/cv-creator/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PrismaClient } from '@prisma/client';
import jsPDF from 'jspdf';

const prisma = new PrismaClient();

export interface CVData {
  // Dane osobowe
  personalInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    location: string;
    website?: string;
    linkedin?: string;
    photo?: string;
  };
  
  // Podsumowanie zawodowe
  summary: string;
  
  // Doświadczenie zawodowe
  experience: Array<{
    id: string;
    position: string;
    company: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    description: string;
    achievements: string[];
  }>;
  
  // Wykształcenie
  education: Array<{
    id: string;
    degree: string;
    school: string;
    location: string;
    startDate: string;
    endDate: string;
    current: boolean;
    gpa?: string;
    description?: string;
  }>;
  
  // Umiejętności
  skills: Array<{
    id: string;
    name: string;
    level: 'Podstawowy' | 'Średniozaawansowany' | 'Zaawansowany' | 'Ekspert';
    category: 'Techniczne' | 'Językowe' | 'Miękkie' | 'Branżowe';
  }>;
  
  // Języki
  languages: Array<{
    id: string;
    name: string;
    level: 'Podstawowy' | 'Komunikatywny' | 'Zaawansowany' | 'Ojczysty';
  }>;
  
  // Certyfikaty
  certifications: Array<{
    id: string;
    name: string;
    issuer: string;
    date: string;
    expiryDate?: string;
    credentialId?: string;
  }>;
  
  // Projekty/Osiągnięcia
  projects: Array<{
    id: string;
    name: string;
    description: string;
    technologies?: string[];
    url?: string;
    date: string;
  }>;
  
  // Zainteresowania
  interests: string[];
  
  // Ustawienia
  template: 'classic' | 'modern' | 'creative';
  color: string;
  fontSize: 'small' | 'medium' | 'large';
}

// GET - Pobierz dane do CV z profilu użytkownika
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: {
        careerProfile: true
      }
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Użytkownik nie znaleziony' },
        { status: 404 }
      );
    }

    // Generuj początkowe dane CV na podstawie profilu
    const cvData = generateCVFromProfile(user);

    return NextResponse.json({
      success: true,
      cvData,
      hasProfile: !!user.careerProfile
    });

  } catch (error) {
    console.error('Błąd podczas pobierania danych CV:', error);
    return NextResponse.json(
      { error: 'Błąd serwera' },
      { status: 500 }
    );
  }
}

// POST - Generuj PDF z CV
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Brak autoryzacji' },
        { status: 401 }
      );
    }

    const cvData: CVData = await request.json();
    
    // Zapisz CV w bazie danych
    const savedCV = await saveCV(session.user.email, cvData);
    
    // Generuj PDF
    const pdfBuffer = await generateCVPDF(cvData);
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}.pdf"`,
        'CV-Id': savedCV.id
      },
    });

  } catch (error) {
    console.error('Błąd podczas generowania CV:', error);
    return NextResponse.json(
      { error: 'Błąd podczas generowania CV' },
      { status: 500 }
    );
  }
}

// Funkcja do generowania danych CV z profilu użytkownika
function generateCVFromProfile(user: any): CVData {
  const profile = user.careerProfile;
  
  return {
    personalInfo: {
      firstName: user.name?.split(' ')[0] || '',
      lastName: user.name?.split(' ').slice(1).join(' ') || '',
      email: user.email || '',
      phone: profile?.personalInfo?.phone || '',
      location: profile?.personalInfo?.location || '',
      website: profile?.personalInfo?.website || '',
      linkedin: profile?.personalInfo?.linkedin || '',
      photo: profile?.personalInfo?.photo || ''
    },
    
    summary: profile?.personalInfo?.bio || profile?.aiAnalysis?.substring(0, 300) || '',
    
    experience: profile?.experience?.workHistory?.map((exp: any, index: number) => ({
      id: `exp_${index}`,
      position: exp.position || profile?.personalInfo?.currentPosition || '',
      company: exp.company || '',
      location: exp.location || '',
      startDate: exp.startDate || '',
      endDate: exp.endDate || '',
      current: exp.current || false,
      description: exp.description || '',
      achievements: exp.achievements || profile?.experience?.achievements || []
    })) || [{
      id: 'exp_1',
      position: profile?.personalInfo?.currentPosition || '',
      company: '',
      location: profile?.personalInfo?.location || '',
      startDate: '',
      endDate: '',
      current: true,
      description: '',
      achievements: profile?.experience?.achievements || []
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
    
    skills: profile?.experience?.skills?.map((skill: string, index: number) => ({
      id: `skill_${index}`,
      name: skill,
      level: 'Średniozaawansowany' as const,
      category: 'Techniczne' as const
    })) || [],
    
    languages: [{
      id: 'lang_1',
      name: 'Polski',
      level: 'Ojczysty' as const
    }],
    
    certifications: profile?.experience?.certifications?.map((cert: string, index: number) => ({
      id: `cert_${index}`,
      name: cert,
      issuer: '',
      date: '',
      expiryDate: '',
      credentialId: ''
    })) || [],
    
    projects: [],
    
    interests: profile?.goals?.preferredIndustries || [],
    
    template: 'modern' as const,
    color: '#3b82f6',
    fontSize: 'medium' as const
  };
}

// Funkcja do zapisania CV w bazie danych
async function saveCV(userEmail: string, cvData: CVData) {
  // Tutaj można dodać model CVs do schema.prisma jeśli chcemy przechowywać CV
  // Na razie zwracamy mock
  return { 
    id: `cv_${Date.now()}`,
    createdAt: new Date(),
    template: cvData.template,
    title: `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}`
  };
}

// Funkcja do generowania PDF (uproszczona - będzie rozszerzona)
async function generateCVPDF(cvData: CVData): Promise<Buffer> {
  const doc = new jsPDF();
  
  // Nagłówek
  doc.setFontSize(24);
  doc.text(`${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}`, 20, 30);
  
  // Kontakt
  doc.setFontSize(12);
  let yPosition = 50;
  doc.text(`Email: ${cvData.personalInfo.email}`, 20, yPosition);
  yPosition += 10;
  if (cvData.personalInfo.phone) {
    doc.text(`Telefon: ${cvData.personalInfo.phone}`, 20, yPosition);
    yPosition += 10;
  }
  if (cvData.personalInfo.location) {
    doc.text(`Lokalizacja: ${cvData.personalInfo.location}`, 20, yPosition);
    yPosition += 10;
  }
  
  yPosition += 10;
  
  // Podsumowanie
  if (cvData.summary) {
    doc.setFontSize(16);
    doc.text('Profil zawodowy', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(cvData.summary, 170);
    doc.text(summaryLines, 20, yPosition);
    yPosition += summaryLines.length * 6 + 10;
  }
  
  // Doświadczenie
  if (cvData.experience.length > 0) {
    doc.setFontSize(16);
    doc.text('Doświadczenie zawodowe', 20, yPosition);
    yPosition += 10;
    
    cvData.experience.forEach(exp => {
      if (yPosition > 250) {
        doc.addPage();
        yPosition = 30;
      }
      
      doc.setFontSize(14);
      doc.text(exp.position, 20, yPosition);
      yPosition += 8;
      doc.setFontSize(12);
      doc.text(`${exp.company} | ${exp.startDate} - ${exp.current ? 'obecnie' : exp.endDate}`, 20, yPosition);
      yPosition += 6;
      
      if (exp.description) {
        const descLines = doc.splitTextToSize(exp.description, 170);
        doc.text(descLines, 20, yPosition);
        yPosition += descLines.length * 6;
      }
      
      yPosition += 10;
    });
  }
  
  // Umiejętności
  if (cvData.skills.length > 0) {
    if (yPosition > 200) {
      doc.addPage();
      yPosition = 30;
    }
    
    doc.setFontSize(16);
    doc.text('Umiejętności', 20, yPosition);
    yPosition += 10;
    doc.setFontSize(12);
    
    const skillsText = cvData.skills.map(skill => skill.name).join(', ');
    const skillsLines = doc.splitTextToSize(skillsText, 170);
    doc.text(skillsLines, 20, yPosition);
  }
  
  return Buffer.from(doc.output('arraybuffer'));
}
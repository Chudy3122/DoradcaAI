// src/app/api/generate-cv-pdf/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
// Zmieniony import - użyj ścieżki do pliku z authOptions lub stwórz osobny plik konfiguracyjny
// import { authOptions } from '../auth/[...nextauth]/route';

// Tymczasowe rozwiązanie - możesz stworzyć osobny plik auth.config.ts lub sprawdzić sesję inaczej
export async function POST(request: NextRequest) {
  try {
    // Alternatywna metoda sprawdzania sesji bez importu authOptions
    const session = await getServerSession();
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const cvData = await request.json();
    
    // Walidacja danych
    if (!cvData || !cvData.personalInfo || !cvData.personalInfo.firstName) {
      return NextResponse.json(
        { error: 'Nieprawidłowe dane CV' },
        { status: 400 }
      );
    }

    // Import bibliotek dynamicznie (aby uniknąć problemów z SSR)
    const puppeteer = require('puppeteer');
    
    // Generowanie HTML na podstawie szablonu
    const htmlContent = generateCVHTML(cvData);
    
    // Konfiguracja Puppeteer
    const browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu'
      ]
    });
    
    const page = await browser.newPage();
    
    // Ustawienie zawartości HTML
    await page.setContent(htmlContent, {
      waitUntil: 'networkidle0'
    });
    
    // Generowanie PDF
    const pdfBuffer = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '0mm',
        right: '0mm',
        bottom: '0mm',
        left: '0mm'
      }
    });
    
    await browser.close();
    
    // Zwracanie PDF jako odpowiedź
    const fileName = `CV_${cvData.personalInfo.firstName}_${cvData.personalInfo.lastName}.pdf`;
    
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${fileName}"`,
        'Content-Length': pdfBuffer.length.toString()
      }
    });

  } catch (error) {
    console.error('Błąd podczas generowania PDF:', error);
    return NextResponse.json(
      { error: 'Błąd podczas generowania PDF' },
      { status: 500 }
    );
  }
}

// Funkcja generująca HTML na podstawie danych CV
function generateCVHTML(cvData: any): string {
  const { template, color } = cvData;
  
  // Bazowe style CSS
  const baseStyles = `
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
      
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }
      
      body {
        font-family: 'Inter', sans-serif;
        line-height: 1.4;
        color: #1e293b;
        background: #ffffff;
      }
      
      .page {
        width: 210mm;
        min-height: 297mm;
        margin: 0 auto;
        background: white;
        position: relative;
      }
      
      h1, h2, h3, h4, h5, h6 {
        font-weight: 700;
      }
      
      .text-primary { color: ${color}; }
      .bg-primary { background-color: ${color}; }
      .border-primary { border-color: ${color}; }
      .bg-primary-light { background-color: ${color}15; }
      .border-l-primary { border-left: 4px solid ${color}; }
    </style>
  `;
  
  // Wybór szablonu
  let templateHTML = '';
  
  switch (template) {
    case 'modern':
      templateHTML = generateModernTemplateHTML(cvData, color);
      break;
    case 'creative':
      templateHTML = generateCreativeTemplateHTML(cvData, color);
      break;
    default:
      templateHTML = generateClassicTemplateHTML(cvData, color);
  }
  
  return `
    <!DOCTYPE html>
    <html lang="pl">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CV - ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}</title>
      ${baseStyles}
    </head>
    <body>
      <div class="page">
        ${templateHTML}
      </div>
    </body>
    </html>
  `;
}

// Szablon klasyczny
function generateClassicTemplateHTML(cvData: any, color: string): string {
  return `
    <div style="font-family: serif; padding: 40px;">
      <!-- Header -->
      <div style="text-align: center; margin-bottom: 30px; border-bottom: 2px solid ${color}; padding-bottom: 20px;">
        <h1 style="font-size: 32px; font-weight: 700; color: ${color}; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 1px;">
          ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
        </h1>
        <div style="font-size: 14px; color: #64748b; display: flex; justify-content: center; gap: 20px; flex-wrap: wrap;">
          <span>${cvData.personalInfo.email}</span>
          ${cvData.personalInfo.phone ? `<span>${cvData.personalInfo.phone}</span>` : ''}
          ${cvData.personalInfo.location ? `<span>${cvData.personalInfo.location}</span>` : ''}
          ${cvData.personalInfo.linkedin ? `<span>${cvData.personalInfo.linkedin}</span>` : ''}
        </div>
      </div>

      ${cvData.summary ? `
      <!-- Profil zawodowy -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 12px; text-transform: uppercase;">
          Profil zawodowy
        </h2>
        <p style="font-size: 14px; text-align: justify;">${cvData.summary}</p>
      </div>
      ` : ''}

      ${cvData.experience?.length > 0 && cvData.experience.some((exp: any) => exp.position) ? `
      <!-- Doświadczenie -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 15px; text-transform: uppercase;">
          Doświadczenie zawodowe
        </h2>
        ${cvData.experience.filter((exp: any) => exp.position).map((exp: any) => `
        <div style="margin-bottom: 20px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 5px;">
            <h3 style="font-size: 16px; font-weight: 600;">${exp.position}</h3>
            <span style="font-size: 12px; color: #64748b;">
              ${exp.startDate} - ${exp.current ? 'obecnie' : exp.endDate}
            </span>
          </div>
          <div style="font-size: 14px; color: #64748b; margin-bottom: 8px;">
            ${exp.company}${exp.location ? ` • ${exp.location}` : ''}
          </div>
          ${exp.description ? `<p style="font-size: 14px; text-align: justify;">${exp.description}</p>` : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${cvData.education?.length > 0 && cvData.education.some((edu: any) => edu.degree) ? `
      <!-- Wykształcenie -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 15px; text-transform: uppercase;">
          Wykształcenie
        </h2>
        ${cvData.education.filter((edu: any) => edu.degree).map((edu: any) => `
        <div style="margin-bottom: 15px;">
          <div style="display: flex; justify-content: space-between; align-items: baseline;">
            <h3 style="font-size: 16px; font-weight: 600;">${edu.degree}</h3>
            <span style="font-size: 12px; color: #64748b;">
              ${edu.startDate} - ${edu.current ? 'obecnie' : edu.endDate}
            </span>
          </div>
          <div style="font-size: 14px; color: #64748b;">
            ${edu.school}${edu.location ? ` • ${edu.location}` : ''}
          </div>
        </div>
        `).join('')}
      </div>
      ` : ''}

      ${cvData.skills?.length > 0 && cvData.skills.some((skill: any) => skill.name) ? `
      <!-- Umiejętności -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 15px; text-transform: uppercase;">
          Umiejętności
        </h2>
        <div style="font-size: 14px;">
          ${cvData.skills.filter((skill: any) => skill.name).map((skill: any) => skill.name).join(' • ')}
        </div>
      </div>
      ` : ''}

      ${cvData.languages?.length > 0 && cvData.languages.some((lang: any) => lang.name) ? `
      <!-- Języki -->
      <div style="margin-bottom: 30px;">
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 15px; text-transform: uppercase;">
          Znajomość języków
        </h2>
        <div style="font-size: 14px;">
          ${cvData.languages.filter((lang: any) => lang.name).map((lang: any) => `${lang.name} (${lang.level})`).join(' • ')}
        </div>
      </div>
      ` : ''}

      ${cvData.certifications?.length > 0 && cvData.certifications.some((cert: any) => cert.name) ? `
      <!-- Certyfikaty -->
      <div>
        <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 15px; text-transform: uppercase;">
          Certyfikaty
        </h2>
        ${cvData.certifications.filter((cert: any) => cert.name).map((cert: any) => `
        <div style="margin-bottom: 10px; font-size: 14px;">
          <strong>${cert.name}</strong>
          ${cert.issuer ? `<span style="color: #64748b;"> • ${cert.issuer}</span>` : ''}
        </div>
        `).join('')}
      </div>
      ` : ''}
    </div>
  `;
}

// Szablon nowoczesny
function generateModernTemplateHTML(cvData: any, color: string): string {
  return `
    <div style="display: grid; grid-template-columns: 2fr 1fr; min-height: 100vh;">
      <!-- Główna kolumna -->
      <div style="padding: 40px 30px 40px 40px;">
        <!-- Header -->
        <div style="margin-bottom: 30px;">
          <h1 style="font-size: 32px; font-weight: 800; color: #1e293b; margin-bottom: 8px; letter-spacing: -0.5px;">
            ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
          </h1>
          <div style="font-size: 16px; color: ${color}; font-weight: 500;">
            Specjalista ds. rozwoju zawodowego
          </div>
        </div>

        ${cvData.summary ? `
        <!-- Profil zawodowy -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 12px; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background-color: ${color}; border-radius: 2px;"></span>
            O mnie
          </h2>
          <p style="font-size: 14px; text-align: justify;">${cvData.summary}</p>
        </div>
        ` : ''}

        ${cvData.experience?.length > 0 && cvData.experience.some((exp: any) => exp.position) ? `
        <!-- Doświadczenie -->
        <div style="margin-bottom: 30px;">
          <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 20px; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background-color: ${color}; border-radius: 2px;"></span>
            Doświadczenie zawodowe
          </h2>
          ${cvData.experience.filter((exp: any) => exp.position).map((exp: any) => `
          <div style="margin-bottom: 20px; position: relative; padding-left: 20px;">
            <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background-color: ${color}; border-radius: 50%;"></div>
            <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
              <h3 style="font-size: 16px; font-weight: 600; color: #1e293b;">${exp.position}</h3>
              <span style="font-size: 12px; color: white; background-color: ${color}; padding: 2px 8px; border-radius: 12px; font-weight: 500;">
                ${exp.startDate} - ${exp.current ? 'obecnie' : exp.endDate}
              </span>
            </div>
            <div style="font-size: 14px; color: ${color}; margin-bottom: 8px; font-weight: 500;">
              ${exp.company}${exp.location ? ` • ${exp.location}` : ''}
            </div>
            ${exp.description ? `<p style="font-size: 13px; text-align: justify; color: #64748b;">${exp.description}</p>` : ''}
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${cvData.education?.length > 0 && cvData.education.some((edu: any) => edu.degree) ? `
        <!-- Wykształcenie -->
        <div>
          <h2 style="font-size: 20px; font-weight: 700; color: ${color}; margin-bottom: 20px; position: relative; padding-left: 20px;">
            <span style="position: absolute; left: 0; top: 50%; transform: translateY(-50%); width: 4px; height: 20px; background-color: ${color}; border-radius: 2px;"></span>
            Wykształcenie
          </h2>
          ${cvData.education.filter((edu: any) => edu.degree).map((edu: any) => `
          <div style="margin-bottom: 16px; position: relative; padding-left: 20px;">
            <div style="position: absolute; left: 0; top: 8px; width: 8px; height: 8px; background-color: ${color}; border-radius: 50%;"></div>
            <div style="display: flex; justify-content: space-between; align-items: baseline;">
              <h3 style="font-size: 16px; font-weight: 600;">${edu.degree}</h3>
              <span style="font-size: 12px; color: white; background-color: ${color}; padding: 2px 8px; border-radius: 12px; font-weight: 500;">
                ${edu.startDate} - ${edu.current ? 'obecnie' : edu.endDate}
              </span>
            </div>
            <div style="font-size: 14px; color: ${color}; font-weight: 500;">
              ${edu.school}${edu.location ? ` • ${edu.location}` : ''}
            </div>
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>

      <!-- Boczna kolumna -->
      <div style="background-color: ${color}15; padding: 40px 30px; border-left: 4px solid ${color};">
        <!-- Dane kontaktowe -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 16px; text-transform: uppercase;">
            Kontakt
          </h3>
          <div style="font-size: 13px; color: #1e293b;">
            ${cvData.personalInfo.email ? `
            <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="color: ${color};">✉</span>
              ${cvData.personalInfo.email}
            </div>
            ` : ''}
            ${cvData.personalInfo.phone ? `
            <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="color: ${color};">📞</span>
              ${cvData.personalInfo.phone}
            </div>
            ` : ''}
            ${cvData.personalInfo.location ? `
            <div style="margin-bottom: 8px; display: flex; align-items: center; gap: 8px;">
              <span style="color: ${color};">📍</span>
              ${cvData.personalInfo.location}
            </div>
            ` : ''}
            ${cvData.personalInfo.linkedin ? `
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="color: ${color};">💼</span>
              LinkedIn
            </div>
            ` : ''}
          </div>
        </div>

        ${cvData.skills?.length > 0 && cvData.skills.some((skill: any) => skill.name) ? `
        <!-- Umiejętności -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 16px; text-transform: uppercase;">
            Umiejętności
          </h3>
          ${cvData.skills.filter((skill: any) => skill.name).map((skill: any) => `
          <div style="margin-bottom: 12px;">
            <div style="font-size: 13px; font-weight: 500; margin-bottom: 4px;">
              ${skill.name}
            </div>
            <div style="height: 6px; background-color: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
              <div style="height: 100%; background-color: ${color}; width: ${
                skill.level === 'Ekspert' ? '100%' : 
                skill.level === 'Zaawansowany' ? '75%' :
                skill.level === 'Średniozaawansowany' ? '50%' : '25%'
              }; border-radius: 3px;"></div>
            </div>
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${cvData.languages?.length > 0 && cvData.languages.some((lang: any) => lang.name) ? `
        <!-- Języki -->
        <div style="margin-bottom: 30px;">
          <h3 style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 16px; text-transform: uppercase;">
            Języki
          </h3>
          ${cvData.languages.filter((lang: any) => lang.name).map((lang: any) => `
          <div style="margin-bottom: 8px; font-size: 13px;">
            <strong>${lang.name}</strong>
            <span style="color: #64748b; margin-left: 8px;">(${lang.level})</span>
          </div>
          `).join('')}
        </div>
        ` : ''}

        ${cvData.certifications?.length > 0 && cvData.certifications.some((cert: any) => cert.name) ? `
        <!-- Certyfikaty -->
        <div>
          <h3 style="font-size: 16px; font-weight: 700; color: ${color}; margin-bottom: 16px; text-transform: uppercase;">
            Certyfikaty
          </h3>
          ${cvData.certifications.filter((cert: any) => cert.name).map((cert: any) => `
          <div style="margin-bottom: 12px; font-size: 13px;">
            <div style="font-weight: 500;">${cert.name}</div>
            ${cert.issuer ? `<div style="color: #64748b;">${cert.issuer}</div>` : ''}
          </div>
          `).join('')}
        </div>
        ` : ''}
      </div>
    </div>
  `;
}

// Szablon kreatywny
function generateCreativeTemplateHTML(cvData: any, color: string): string {
  return `
    <div style="position: relative; overflow: hidden; padding: 40px;">
      <!-- Dekoracyjne elementy -->
      <div style="position: absolute; top: 0; right: 0; width: 200px; height: 200px; background: linear-gradient(45deg, ${color}20, ${color}05); border-radius: 50%; transform: translate(50%, -50%);"></div>
      <div style="position: absolute; bottom: 0; left: 0; width: 150px; height: 150px; background: linear-gradient(135deg, ${color}15, ${color}05); border-radius: 50%; transform: translate(-25%, 25%);"></div>

      <div style="position: relative; z-index: 1;">
        <!-- Header -->
        <div style="text-align: center; margin-bottom: 40px; background: linear-gradient(135deg, ${color}10, ${color}05); padding: 30px; border-radius: 20px; border: 2px solid ${color}30;">
          <h1 style="font-size: 36px; font-weight: 900; background: linear-gradient(135deg, ${color}, ${color}80); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 12px; letter-spacing: -1px;">
            ${cvData.personalInfo.firstName} ${cvData.personalInfo.lastName}
          </h1>
          
          <div style="font-size: 16px; color: #64748b; display: flex; justify-content: center; flex-wrap: wrap; gap: 20px; margin-top: 16px;">
            ${cvData.personalInfo.email ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: ${color}; font-size: 18px;">✉</span>
              ${cvData.personalInfo.email}
            </div>
            ` : ''}
            ${cvData.personalInfo.phone ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: ${color}; font-size: 18px;">📞</span>
              ${cvData.personalInfo.phone}
            </div>
            ` : ''}
            ${cvData.personalInfo.location ? `
            <div style="display: flex; align-items: center; gap: 6px;">
              <span style="color: ${color}; font-size: 18px;">📍</span>
              ${cvData.personalInfo.location}
            </div>
            ` : ''}
          </div>
        </div>

        <!-- Grid layout -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
          <!-- Lewa kolumna -->
          <div>
            ${cvData.summary ? `
            <!-- Profil zawodowy -->
            <div style="margin-bottom: 30px; background: linear-gradient(135deg, ${color}08, transparent); padding: 20px; border-radius: 15px; border-left: 4px solid ${color};">
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 12px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">👋</span>
                O mnie
              </h2>
              <p style="font-size: 14px; text-align: justify;">${cvData.summary}</p>
            </div>
            ` : ''}

            ${cvData.skills?.length > 0 && cvData.skills.some((skill: any) => skill.name) ? `
            <!-- Umiejętności -->
            <div style="margin-bottom: 30px; background: linear-gradient(135deg, ${color}08, transparent); padding: 20px; border-radius: 15px; border-left: 4px solid ${color};">
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">⚡</span>
                Umiejętności
              </h2>
              <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${cvData.skills.filter((skill: any) => skill.name).map((skill: any) => `
                <span style="padding: 6px 12px; background-color: ${color}; color: white; border-radius: 20px; font-size: 12px; font-weight: 500;">
                  ${skill.name}
                </span>
                `).join('')}
              </div>
            </div>
            ` : ''}

            ${cvData.languages?.length > 0 && cvData.languages.some((lang: any) => lang.name) ? `
            <!-- Języki -->
            <div style="background: linear-gradient(135deg, ${color}08, transparent); padding: 20px; border-radius: 15px; border-left: 4px solid ${color};">
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 16px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🗣️</span>
                Języki
              </h2>
              ${cvData.languages.filter((lang: any) => lang.name).map((lang: any) => `
              <div style="margin-bottom: 8px; font-size: 14px;">
                <strong>${lang.name}</strong>
                <span style="color: #64748b; margin-left: 8px;">(${lang.level})</span>
              </div>
              `).join('')}
            </div>
            ` : ''}
          </div>

          <!-- Prawa kolumna -->
          <div>
            ${cvData.experience?.length > 0 && cvData.experience.some((exp: any) => exp.position) ? `
            <!-- Doświadczenie -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">💼</span>
                Doświadczenie
              </h2>
              ${cvData.experience.filter((exp: any) => exp.position).map((exp: any) => `
              <div style="margin-bottom: 20px; background: linear-gradient(135deg, ${color}05, transparent); padding: 16px; border-radius: 12px; border: 1px solid ${color}20;">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 6px;">
                  <h3 style="font-size: 16px; font-weight: 600; color: #1e293b;">${exp.position}</h3>
                  <span style="font-size: 11px; color: white; background-color: ${color}; padding: 3px 8px; border-radius: 10px; font-weight: 500; white-space: nowrap; margin-left: 8px;">
                    ${exp.startDate} - ${exp.current ? 'obecnie' : exp.endDate}
                  </span>
                </div>
                <div style="font-size: 14px; color: ${color}; margin-bottom: 8px; font-weight: 500;">
                  ${exp.company}${exp.location ? ` • ${exp.location}` : ''}
                </div>
                ${exp.description ? `<p style="font-size: 13px; text-align: justify; color: #64748b;">${exp.description}</p>` : ''}
              </div>
              `).join('')}
            </div>
            ` : ''}

            ${cvData.education?.length > 0 && cvData.education.some((edu: any) => edu.degree) ? `
            <!-- Wykształcenie -->
            <div style="margin-bottom: 30px;">
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🎓</span>
                Wykształcenie
              </h2>
              ${cvData.education.filter((edu: any) => edu.degree).map((edu: any) => `
              <div style="margin-bottom: 16px; background: linear-gradient(135deg, ${color}05, transparent); padding: 16px; border-radius: 12px; border: 1px solid ${color}20;">
                <div style="display: flex; justify-content: space-between; align-items: start;">
                  <h3 style="font-size: 16px; font-weight: 600;">${edu.degree}</h3>
                  <span style="font-size: 11px; color: white; background-color: ${color}; padding: 3px 8px; border-radius: 10px; font-weight: 500; white-space: nowrap; margin-left: 8px;">
                    ${edu.startDate} - ${edu.current ? 'obecnie' : edu.endDate}
                  </span>
                </div>
                <div style="font-size: 14px; color: ${color}; font-weight: 500; margin-top: 4px;">
                  ${edu.school}${edu.location ? ` • ${edu.location}` : ''}
                </div>
              </div>
              `).join('')}
            </div>
            ` : ''}

            ${cvData.certifications?.length > 0 && cvData.certifications.some((cert: any) => cert.name) ? `
            <!-- Certyfikaty -->
            <div>
              <h2 style="font-size: 22px; font-weight: 700; color: ${color}; margin-bottom: 20px; display: flex; align-items: center; gap: 10px;">
                <span style="font-size: 24px;">🏆</span>
                Certyfikaty
              </h2>
              ${cvData.certifications.filter((cert: any) => cert.name).map((cert: any) => `
              <div style="margin-bottom: 12px; background: linear-gradient(135deg, ${color}05, transparent); padding: 12px; border-radius: 10px; border: 1px solid ${color}20;">
                <div style="font-weight: 500; font-size: 14px;">${cert.name}</div>
                ${cert.issuer ? `<div style="color: #64748b; font-size: 13px;">${cert.issuer}</div>` : ''}
              </div>
              `).join('')}
            </div>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `;
}
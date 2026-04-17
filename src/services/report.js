import puppeteer from 'puppeteer';

const PUPPETEER_TIMEOUT_MS = 60_000;

// ── Puppeteer concurrency guard ─────────────────────────────────────────────
// Railway containers have limited RAM. Only one Puppeteer browser at a time.
let _renderBusy = false;
const _renderQueue = [];
async function acquireRender() {
  if (!_renderBusy) { _renderBusy = true; return; }
  return new Promise(resolve => _renderQueue.push(resolve));
}
function releaseRender() {
  if (_renderQueue.length > 0) { _renderQueue.shift()(); } else { _renderBusy = false; }
}

// ── HTML escaping ────────────────────────────────────────────────────────────
function esc(str) {
  if (str == null) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Score helpers ────────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 75) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#dc2626';
}

// ── PDF i18n labels ──────────────────────────────────────────────────────────
const PDF_LABELS = {
  en: {
    report_title: 'Resume Analysis Report',
    generated_for: 'Generated for',
    ats_compat: 'Shortlist Match Rate',
    human_read: 'Human Readability',
    exp_match: 'Experience Match',
    strong: 'Strong', fair: 'Fair', weak: 'Weak',
    breakdown_title: 'Score Breakdown',
    breakdown_hard: 'Hard Skills Match',
    breakdown_title_align: 'Job Title Alignment',
    breakdown_parse: 'Resume Parseability',
    breakdown_sections: 'Section Completeness',
    breakdown_soft: 'Soft Skills Match',
    breakdown_exp: 'Experience Match',
    linkedin: 'LinkedIn Headline Suggestion',
    strengths: 'Strengths',
    weaknesses: 'Weaknesses',
    kw_matches: 'Keyword Matches',
    kw_gaps: 'Keyword Gaps',
    red_flags_title: 'Job Description Red Flags',
    red_flags_note: 'These signals in the job posting are worth knowing before you apply or negotiate.',
    no_red_flags: 'No significant red flags detected in this job description.',
    salary_title: 'Salary Intelligence',
    negotiation_title: 'Negotiation Tips',
    summary_title: 'Professional Summary Rewrite',
    bullets_title: 'Rewritten Bullet Points',
    skills_title: 'Optimised Skills Section',
    cover_title: 'Cover Letter',
    cover_note: 'Personalised to this role. Edit the bracketed placeholders before sending.',
    interview_title: 'Interview Question Forecaster',
    interview_note: '8 likely questions derived from this specific job description and your resume gaps, with STAR answer frameworks built from your background.',
    why_likely: 'Why likely:',
    star: 'STAR framework:',
  },
  es: {
    report_title: 'Informe de Análisis de CV',
    generated_for: 'Generado para',
    ats_compat: 'Tasa de Preseleccion',
    human_read: 'Legibilidad Humana',
    exp_match: 'Afinidad con el Puesto',
    strong: 'Sólido', fair: 'Aceptable', weak: 'Débil',
    breakdown_title: 'Desglose de Puntuacion',
    breakdown_hard: 'Habilidades Tecnicas',
    breakdown_title_align: 'Alineacion de Titulo',
    breakdown_parse: 'Legibilidad del CV',
    breakdown_sections: 'Completitud de Secciones',
    breakdown_soft: 'Habilidades Blandas',
    breakdown_exp: 'Experiencia',
    linkedin: 'Titular de LinkedIn Sugerido',
    strengths: 'Fortalezas',
    weaknesses: 'Áreas de Mejora',
    kw_matches: 'Palabras Clave Encontradas',
    kw_gaps: 'Palabras Clave Faltantes',
    red_flags_title: 'Alertas en la Oferta de Trabajo',
    red_flags_note: 'Estas señales en la oferta merecen atención antes de aplicar o negociar.',
    no_red_flags: 'No se detectaron alertas significativas en esta oferta.',
    salary_title: 'Inteligencia Salarial',
    negotiation_title: 'Consejos de Negociación',
    summary_title: 'Perfil Profesional Reescrito',
    bullets_title: 'Logros Reescritos',
    skills_title: 'Sección de Habilidades Optimizada',
    cover_title: 'Carta de Presentación',
    cover_note: 'Personalizada para este puesto. Edita los marcadores entre corchetes antes de enviar.',
    interview_title: 'Preguntas de Entrevista Previstas',
    interview_note: '8 preguntas probables derivadas de esta oferta y tus brechas de perfil, con estructura STAR basada en tu experiencia.',
    why_likely: 'Por qué es probable:',
    star: 'Estructura STAR:',
  },
  fr: {
    report_title: "Rapport d'Analyse de CV",
    generated_for: 'Généré pour',
    ats_compat: 'Taux de Presélection',
    human_read: 'Lisibilité Humaine',
    exp_match: "Adéquation au Poste",
    strong: 'Solide', fair: 'Correct', weak: 'Faible',
    breakdown_title: 'Détail du Score',
    breakdown_hard: 'Compétences Techniques',
    breakdown_title_align: 'Alignement du Titre',
    breakdown_parse: 'Lisibilité du CV',
    breakdown_sections: 'Complétude des Sections',
    breakdown_soft: 'Compétences Interpersonnelles',
    breakdown_exp: 'Expérience',
    linkedin: 'Titre LinkedIn Suggéré',
    strengths: 'Points Forts',
    weaknesses: "Points d'Amélioration",
    kw_matches: 'Mots-Clés Présents',
    kw_gaps: 'Mots-Clés Manquants',
    red_flags_title: "Alertes sur l'Offre d'Emploi",
    red_flags_note: "Ces signaux dans l'offre méritent attention avant de postuler ou de négocier.",
    no_red_flags: "Aucun signal préoccupant détecté dans cette offre.",
    salary_title: 'Salaire et Marché',
    negotiation_title: 'Conseils de Négociation',
    summary_title: 'Résumé Professionnel Réécrit',
    bullets_title: 'Réalisations Réécrites',
    skills_title: 'Section Compétences Optimisée',
    cover_title: 'Lettre de Motivation',
    cover_note: 'Personnalisée pour ce poste. Modifiez les espaces entre crochets avant envoi.',
    interview_title: "Questions d'Entretien Prévues",
    interview_note: "8 questions probables dérivées de cette offre et de vos lacunes, avec des cadres STAR basés sur votre expérience.",
    why_likely: 'Pourquoi probable:',
    star: 'Cadre STAR:',
  },
  pt: {
    report_title: 'Relatório de Análise de Currículo',
    generated_for: 'Gerado para',
    ats_compat: 'Taxa de Pre-selecao',
    human_read: 'Legibilidade Humana',
    exp_match: 'Correspondência de Experiência',
    strong: 'Forte', fair: 'Razoável', weak: 'Fraco',
    breakdown_title: 'Detalhes da Pontuacao',
    breakdown_hard: 'Competencias Tecnicas',
    breakdown_title_align: 'Alinhamento de Titulo',
    breakdown_parse: 'Legibilidade do CV',
    breakdown_sections: 'Integridade das Secoes',
    breakdown_soft: 'Competencias Interpessoais',
    breakdown_exp: 'Experiencia',
    linkedin: 'Título do LinkedIn Sugerido',
    strengths: 'Pontos Fortes',
    weaknesses: 'Pontos de Melhoria',
    kw_matches: 'Palavras-Chave Encontradas',
    kw_gaps: 'Palavras-Chave em Falta',
    red_flags_title: 'Alertas na Vaga',
    red_flags_note: 'Estes sinais na vaga merecem atenção antes de candidatar-se ou negociar.',
    no_red_flags: 'Nenhum alerta significativo detectado nesta vaga.',
    salary_title: 'Inteligência Salarial',
    negotiation_title: 'Dicas de Negociação',
    summary_title: 'Resumo Profissional Reescrito',
    bullets_title: 'Realizações Reescritas',
    skills_title: 'Seção de Competências Otimizada',
    cover_title: 'Carta de Apresentação',
    cover_note: 'Personalizada para esta vaga. Edite os marcadores entre colchetes antes de enviar.',
    interview_title: 'Previsão de Perguntas de Entrevista',
    interview_note: '8 perguntas prováveis derivadas desta vaga e das suas lacunas, com estrutura STAR baseada na sua experiência.',
    why_likely: 'Por que é provável:',
    star: 'Estrutura STAR:',
  },
  de: {
    report_title: 'Lebenslauf-Analysebericht',
    generated_for: 'Erstellt für',
    ats_compat: 'Shortlist-Trefferquote',
    human_read: 'Menschliche Lesbarkeit',
    exp_match: 'Erfahrungsübereinstimmung',
    strong: 'Stark', fair: 'Angemessen', weak: 'Schwach',
    breakdown_title: 'Score-Aufschlüsselung',
    breakdown_hard: 'Technische Fähigkeiten',
    breakdown_title_align: 'Jobtitel-Übereinstimmung',
    breakdown_parse: 'CV-Lesbarkeit',
    breakdown_sections: 'Vollständigkeit der Abschnitte',
    breakdown_soft: 'Soft Skills',
    breakdown_exp: 'Berufserfahrung',
    linkedin: 'Vorgeschlagener LinkedIn-Titel',
    strengths: 'Stärken',
    weaknesses: 'Verbesserungsbereiche',
    kw_matches: 'Gefundene Schlüsselwörter',
    kw_gaps: 'Fehlende Schlüsselwörter',
    red_flags_title: 'Warnzeichen in der Stellenanzeige',
    red_flags_note: 'Diese Signale in der Stellenanzeige sollten vor Bewerbung oder Verhandlung bekannt sein.',
    no_red_flags: 'Keine signifikanten Warnzeichen in dieser Stellenanzeige gefunden.',
    salary_title: 'Gehaltsintelligenz',
    negotiation_title: 'Gehaltsverhandlungstipps',
    summary_title: 'Professionelle Zusammenfassung',
    bullets_title: 'Umgeschriebene Leistungspunkte',
    skills_title: 'Optimierter Kompetenzbereich',
    cover_title: 'Anschreiben',
    cover_note: 'Auf diese Stelle zugeschnitten. Platzhalter in eckigen Klammern vor dem Senden bearbeiten.',
    interview_title: 'Voraussichtliche Interviewfragen',
    interview_note: '8 wahrscheinliche Fragen basierend auf dieser Stelle und Ihren Profillücken, mit STAR-Rahmen aus Ihrem Hintergrund.',
    why_likely: 'Warum wahrscheinlich:',
    star: 'STAR-Rahmen:',
  },
  it: {
    report_title: 'Rapporto di Analisi del CV',
    generated_for: 'Generato per',
    ats_compat: 'Tasso di Preselezione',
    human_read: 'Leggibilità Umana',
    exp_match: 'Corrispondenza Esperienza',
    strong: 'Forte', fair: 'Accettabile', weak: 'Debole',
    breakdown_title: 'Dettaglio del Punteggio',
    breakdown_hard: 'Competenze Tecniche',
    breakdown_title_align: 'Allineamento del Titolo',
    breakdown_parse: 'Leggibilita del CV',
    breakdown_sections: 'Completezza delle Sezioni',
    breakdown_soft: 'Soft Skills',
    breakdown_exp: 'Esperienza',
    linkedin: 'Titolo LinkedIn Suggerito',
    strengths: 'Punti di Forza',
    weaknesses: 'Aree di Miglioramento',
    kw_matches: 'Parole Chiave Trovate',
    kw_gaps: 'Parole Chiave Mancanti',
    red_flags_title: "Segnali nell'Offerta di Lavoro",
    red_flags_note: "Questi segnali nell'offerta meritano attenzione prima di candidarsi o negoziare.",
    no_red_flags: "Nessun segnale preoccupante rilevato in questa offerta.",
    salary_title: 'Intelligence Salariale',
    negotiation_title: 'Consigli di Negoziazione',
    summary_title: 'Profilo Professionale Riscritto',
    bullets_title: 'Risultati Riscritti',
    skills_title: 'Sezione Competenze Ottimizzata',
    cover_title: 'Lettera di Presentazione',
    cover_note: 'Personalizzata per questo ruolo. Modifica i segnaposto tra parentesi prima di inviare.',
    interview_title: 'Previsione Domande di Colloquio',
    interview_note: '8 domande probabili derivate da questa offerta e dalle tue lacune, con struttura STAR basata sulla tua esperienza.',
    why_likely: 'Perché probabile:',
    star: 'Schema STAR:',
  },
};

const CV_LABELS = {
  en: { profile: 'Profile', experience: 'Experience', skills: 'Skills', education: 'Education', certifications: 'Certifications', languages: 'Languages' },
  es: { profile: 'Perfil', experience: 'Experiencia', skills: 'Habilidades', education: 'Educación', certifications: 'Certificaciones', languages: 'Idiomas' },
  fr: { profile: 'Profil', experience: 'Expérience', skills: 'Compétences', education: 'Formation', certifications: 'Certifications', languages: 'Langues' },
  pt: { profile: 'Perfil', experience: 'Experiência', skills: 'Competências', education: 'Educação', certifications: 'Certificações', languages: 'Idiomas' },
  de: { profile: 'Profil', experience: 'Berufserfahrung', skills: 'Fähigkeiten', education: 'Ausbildung', certifications: 'Zertifikate', languages: 'Sprachen' },
  it: { profile: 'Profilo', experience: 'Esperienza', skills: 'Competenze', education: 'Istruzione', certifications: 'Certificazioni', languages: 'Lingue' },
};

function getLabels(lang) { return PDF_LABELS[lang] || PDF_LABELS.en; }
function getCvLabels(lang) { return CV_LABELS[lang] || CV_LABELS.en; }

function buildHtml(job, analysis, rewrites, lang = 'en') {
  const L = getLabels(lang);
  const tier = job.tier;
  const score = analysis.shortlist_match_rate;
  const humanScore = analysis.human_score ?? null;
  const expMatch = analysis.experience_match;

  const scoreLabel = (s) => s >= 75 ? L.strong : s >= 50 ? L.fair : L.weak;

  const keywordGaps = (analysis.keyword_gaps || []).map((k) => `<li>${esc(k)}</li>`).join('');
  const keywordMatches = (analysis.keyword_matches || []).map((k) => `<li>${esc(k)}</li>`).join('');
  const strengths = (analysis.strengths || []).map((s) => `<li>${esc(s)}</li>`).join('');
  const weaknesses = (analysis.weaknesses || []).map((w) => `<li>${esc(w)}</li>`).join('');

  const redFlags = analysis.jd_red_flags || [];
  const redFlagSection = redFlags.length > 0
    ? `<section>
        <h2>&#9888; ${L.red_flags_title}</h2>
        <p class="section-note">${L.red_flags_note}</p>
        <ul class="red-flags">${redFlags.map((f) => `<li>${esc(f)}</li>`).join('')}</ul>
      </section>`
    : `<section>
        <h2>${L.red_flags_title}</h2>
        <p class="section-note good-signal">${L.no_red_flags}</p>
      </section>`;

  const salaryRange = analysis.salary_range;
  const salaryCurrency = salaryRange?.currency || 'USD';
  const salaryPeriod = salaryRange?.period || 'annual';
  const currencySymbols = { USD: '$', GBP: '£', EUR: '€', CAD: 'CA$', AUD: 'A$', MXN: 'MX$', COP: 'COP ', PEN: 'S/ ', CLP: 'CLP ', BRL: 'R$' };
  const currSym = currencySymbols[salaryCurrency] || (salaryCurrency + ' ');
  const fmt = (n) => (n || 0).toLocaleString();
  const buildSalaryAmounts = (val) => {
    if (!val) return 'N/A';
    if (salaryPeriod === 'annual') {
      return `<strong>${currSym}${fmt(val)}/yr</strong><br><span class="salary-monthly">${currSym}${fmt(Math.round(val / 12))}/mo</span>`;
    }
    return `<strong>${currSym}${fmt(val)}/mo</strong><br><span class="salary-monthly">${currSym}${fmt(Math.round(val * 12))}/yr</span>`;
  };
  const salarySection = salaryRange
    ? `<section>
        <h2>${L.salary_title}</h2>
        <div class="salary-bar-wrap">
          <div class="salary-labels">
            <span>Low<br>${buildSalaryAmounts(salaryRange.low)}</span>
            <span class="salary-mid">Market Mid<br>${buildSalaryAmounts(salaryRange.mid)}</span>
            <span style="text-align:right">High<br>${buildSalaryAmounts(salaryRange.high)}</span>
          </div>
          <div class="salary-bar">
            <div class="salary-bar-fill"></div>
            <div class="salary-bar-dot"></div>
          </div>
        </div>
        <p class="salary-notes">${esc(salaryRange.notes || '')}</p>
        ${(analysis.negotiation_tips || []).length > 0 ? `
        <h3 class="subsection">${L.negotiation_title}</h3>
        <ul>${(analysis.negotiation_tips || []).map((t) => `<li>${esc(t)}</li>`).join('')}</ul>
        ` : ''}
      </section>`
    : '';

  const rewriteSection = tier === 'FULL' && rewrites
    ? `
      <section>
        <h2>${L.summary_title}</h2>
        <p>${esc(rewrites.summary_rewrite)}</p>
      </section>

      <section>
        <h2>${L.bullets_title}</h2>
        <ul>${(rewrites.rewritten_bullets || []).map((b) => `<li>${esc(b)}</li>`).join('')}</ul>
      </section>

      <section>
        <h2>${L.skills_title}</h2>
        <p>${esc(rewrites.skills_section)}</p>
      </section>

      ${rewrites.cover_letter ? `
      <section class="cover-letter-section">
        <h2>${L.cover_title}</h2>
        <p class="section-note">${L.cover_note}</p>
        <div class="cover-letter-body"><p>${esc(rewrites.cover_letter).replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p></div>
      </section>` : ''}

      ${(rewrites.interview_questions || []).length > 0 ? `
      <section>
        <h2>${L.interview_title}</h2>
        <p class="section-note">${L.interview_note}</p>
        ${rewrites.interview_questions.map((q, i) => `
          <div class="interview-q">
            <div class="q-number">Q${i + 1}</div>
            <div class="q-body">
              <p class="q-text">${esc(q.question)}</p>
              <p class="q-why"><em>${L.why_likely}</em> ${esc(q.why_likely)}</p>
              <p class="q-star"><em>${L.star}</em> ${esc(q.star_framework)}</p>
            </div>
          </div>
        `).join('')}
      </section>` : ''}
    `
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, sans-serif;
    color: #1a1a1a;
    padding: 48px 56px;
    font-size: 14px;
    line-height: 1.6;
  }
  h1 { font-size: 22px; font-weight: 700; margin-bottom: 4px; }
  h2 { font-size: 15px; font-weight: 600; margin: 28px 0 10px; color: #333; border-bottom: 1px solid #e5e7eb; padding-bottom: 4px; }
  h3.subsection { font-size: 13px; font-weight: 600; margin: 14px 0 6px; color: #444; }
  .subtitle { color: #6b7280; font-size: 12px; margin-bottom: 32px; }
  .scores { display: flex; gap: 16px; margin-bottom: 8px; }
  .score-card {
    flex: 1;
    border: 1px solid #e5e7eb;
    border-radius: 8px;
    padding: 16px;
    text-align: center;
  }
  .score-number { font-size: 38px; font-weight: 700; }
  .score-label { font-size: 11px; color: #6b7280; margin-top: 4px; text-transform: uppercase; letter-spacing: 0.04em; }
  .score-sublabel { font-size: 11px; font-weight: 600; margin-top: 2px; }
  .score-notes { font-size: 12px; color: #374151; margin-top: 8px; text-align: left; }
  ul { padding-left: 20px; }
  li { margin-bottom: 6px; }
  .two-col { display: flex; gap: 24px; }
  .two-col section { flex: 1; }
  .headline-box {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 12px 16px;
    font-style: italic;
    color: #374151;
  }
  section { margin-bottom: 4px; }
  .badge {
    display: inline-block;
    font-size: 11px;
    font-weight: 600;
    padding: 2px 8px;
    border-radius: 9999px;
    background: #fff3ed;
    color: #e85d04;
    margin-left: 8px;
    vertical-align: middle;
  }
  .section-note { font-size: 12px; color: #6b7280; margin-bottom: 8px; }
  .good-signal { color: #16a34a; }
  ul.red-flags li { color: #b91c1c; }
  .salary-bar-wrap { margin: 12px 0; }
  .salary-labels { display: flex; justify-content: space-between; font-size: 12px; color: #374151; margin-bottom: 6px; }
  .salary-mid { text-align: center; }
  .salary-bar { height: 8px; background: #e5e7eb; border-radius: 9999px; position: relative; }
  .salary-bar-fill { position: absolute; left: 0; top: 0; height: 100%; width: 100%; background: linear-gradient(to right, #fde68a, #16a34a); border-radius: 9999px; }
  .salary-bar-dot { position: absolute; top: -4px; left: 50%; transform: translateX(-50%); width: 16px; height: 16px; background: #1a1a1a; border: 2px solid #fff; border-radius: 50%; box-shadow: 0 1px 3px rgba(0,0,0,0.2); }
  .salary-notes { font-size: 12px; color: #6b7280; margin-top: 10px; }
  .salary-monthly { font-size: 11px; color: #9ca3af; font-weight: 400; }
  .breakdown { margin: 16px 0 4px; }
  .breakdown-row { display: flex; align-items: center; gap: 10px; margin-bottom: 7px; }
  .breakdown-label { font-size: 11px; color: #374151; min-width: 160px; }
  .breakdown-bar-wrap { flex: 1; height: 6px; background: #f3f4f6; border-radius: 9999px; overflow: hidden; }
  .breakdown-bar-fill { height: 100%; border-radius: 9999px; background: #1a1a1a; transition: width 0s; }
  .breakdown-value { font-size: 11px; color: #6b7280; min-width: 36px; text-align: right; }
  .breakdown-max { font-size: 10px; color: #9ca3af; }
  .cover-letter-section { page-break-before: always; }
  .cover-letter-body {
    background: #f9fafb;
    border: 1px solid #e5e7eb;
    border-radius: 6px;
    padding: 20px 24px;
    line-height: 1.8;
    color: #1a1a1a;
  }
  .cover-letter-body p { margin-bottom: 14px; }
  .interview-q {
    display: flex;
    gap: 12px;
    margin-bottom: 18px;
    padding-bottom: 18px;
    border-bottom: 1px solid #f3f4f6;
  }
  .interview-q:last-child { border-bottom: none; }
  .q-number {
    min-width: 28px;
    height: 28px;
    background: #1a1a1a;
    color: #fff;
    border-radius: 50%;
    font-size: 12px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-top: 2px;
  }
  .q-body { flex: 1; }
  .q-text { font-weight: 600; margin-bottom: 6px; }
  .q-why { font-size: 12px; color: #6b7280; margin-bottom: 4px; }
  .q-star { font-size: 12px; color: #374151; }
</style>
</head>
<body>
  <h1>${L.report_title} <span class="badge">${tier === 'FULL' ? 'The Glow-Up' : 'The Audit'}</span></h1>
  <p class="subtitle">${L.generated_for}${job.email ? ' ' + esc(job.email) + ' &middot;' : ''} getshortlisted.fyi</p>

  <div class="scores">
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(score)}">${score}</div>
      <div class="score-label">${L.ats_compat}</div>
      <div class="score-sublabel" style="color:${scoreColor(score)}">${scoreLabel(score)}</div>
    </div>
    ${humanScore !== null ? `
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(humanScore)}">${humanScore}</div>
      <div class="score-label">${L.human_read}</div>
      <div class="score-sublabel" style="color:${scoreColor(humanScore)}">${scoreLabel(humanScore)}</div>
      <div class="score-notes">${esc(analysis.human_score_notes || '')}</div>
    </div>` : ''}
    <div class="score-card">
      <div class="score-number" style="color:${scoreColor(expMatch)}">${expMatch}</div>
      <div class="score-label">${L.exp_match}</div>
      <div class="score-sublabel" style="color:${scoreColor(expMatch)}">${scoreLabel(expMatch)}</div>
      <div class="score-notes">${esc(analysis.experience_match_notes || '')}</div>
    </div>
  </div>

  ${(() => {
    const bd = analysis.score_breakdown;
    if (!bd) return '';
    const row = (label, val, max) => {
      const pct = Math.round((val / max) * 100);
      const color = pct >= 70 ? '#16a34a' : pct >= 40 ? '#d97706' : '#dc2626';
      return `<div class="breakdown-row">
        <span class="breakdown-label">${label}</span>
        <div class="breakdown-bar-wrap"><div class="breakdown-bar-fill" style="width:${pct}%;background:${color}"></div></div>
        <span class="breakdown-value">${val}<span class="breakdown-max">/${max}</span></span>
      </div>`;
    };
    return `<section>
      <h2>${L.breakdown_title}</h2>
      <div class="breakdown">
        ${row(L.breakdown_hard, bd.hard_skill_score, 35)}
        ${row(L.breakdown_title_align, bd.job_title_score, 20)}
        ${row(L.breakdown_parse, bd.parseability_score, 15)}
        ${row(L.breakdown_sections, bd.section_completeness_score, 15)}
        ${row(L.breakdown_soft, bd.soft_skill_score, 10)}
        ${row(L.breakdown_exp, bd.experience_score, 5)}
      </div>
    </section>`;
  })()}

  <section>
    <h2>${L.linkedin}</h2>
    <div class="headline-box">${esc(analysis.linkedin_headline)}</div>
  </section>

  <div class="two-col">
    <section>
      <h2>${L.strengths}</h2>
      <ul>${strengths}</ul>
    </section>
    <section>
      <h2>${L.weaknesses}</h2>
      <ul>${weaknesses}</ul>
    </section>
  </div>

  <div class="two-col">
    <section>
      <h2>${L.kw_matches}</h2>
      <ul>${keywordMatches}</ul>
    </section>
    <section>
      <h2>${L.kw_gaps}</h2>
      <ul>${keywordGaps}</ul>
    </section>
  </div>

  ${redFlagSection}
  ${salarySection}
  ${rewriteSection}
</body>
</html>`;
}

function buildCvHtml(cvData, lang = 'en') {
  const L = getCvLabels(lang);
  const { name, title, contact, profile, experience, education, skills, certifications, languages } = cvData;

  const contactParts = [
    contact?.email,
    contact?.phone,
    contact?.location,
    contact?.linkedin,
  ].filter(Boolean);

  const experienceHtml = (experience || []).map(exp => {
    const bulletsHtml = (exp.bullets || []).map(b =>
      `<div class="bullet">&#8211;&nbsp;${esc(b)}</div>`
    ).join('');
    const dateLocation = [exp.dates, exp.location].filter(Boolean).map(esc).join(' &middot; ');
    return `
    <div class="role">
      <div class="role-meta">
        <span class="role-company">${esc(exp.company)}</span>${exp.title ? ` &mdash; <span class="role-title">${esc(exp.title)}</span>` : ''}
        ${dateLocation ? `<span class="role-right">${dateLocation}</span>` : ''}
      </div>
      <div class="bullets">${bulletsHtml}</div>
    </div>`;
  }).join('');

  const educationHtml = (education || []).map(edu => `
    <div class="edu-row">
      <span class="edu-degree">${esc(edu.degree)}</span>${edu.school ? ` &middot; <span class="edu-school">${esc(edu.school)}</span>` : ''}
      ${edu.dates ? `<span class="role-right">${esc(edu.dates)}</span>` : ''}
    </div>`
  ).join('');

  const skillsHtml = (skills || []).map(s => `<span class="pill">${esc(s)}</span>`).join(' ');

  const certHtml = (certifications || []).length > 0
    ? `<div class="section">
        <div class="section-head"><span class="section-label">${L.certifications}</span><span class="section-rule"></span></div>
        ${certifications.map(c => `
          <div class="cert-row">
            <span class="cert-name">${esc(c.name)}</span>
            ${c.issuer ? `<span class="cert-meta">${esc(c.issuer)}${c.year ? `, ${esc(c.year)}` : ''}</span>` : ''}
          </div>`).join('')}
      </div>`
    : '';

  const langHtml = (languages || []).length > 0
    ? `<div class="section">
        <div class="section-head"><span class="section-label">${L.languages}</span><span class="section-rule"></span></div>
        <p class="body-text">${esc(languages.join(', '))}</p>
      </div>`
    : '';

  const profileHtml = profile
    ? `<div class="section">
        <div class="section-head"><span class="section-label">${L.profile}</span><span class="section-rule"></span></div>
        <p class="body-text">${esc(profile)}</p>
      </div>`
    : '';

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
<meta charset="UTF-8">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body {
    font-family: system-ui, -apple-system, Arial, sans-serif;
    color: #2d2d2d;
    font-size: 10.5px;
    line-height: 1.5;
    background: #fff;
    padding: 32px 36px 48px;
    width: 794px;
  }
  /* ---- Header ---- */
  .cv-name {
    font-size: 24px;
    font-weight: 600;
    color: #1a2744;
    margin-bottom: 2px;
  }
  .cv-job-title {
    font-size: 13px;
    color: #E8571A;
    margin-bottom: 6px;
  }
  .cv-contact {
    font-size: 11px;
    color: #666;
  }
  .cv-contact-sep { margin: 0 6px; color: #bbb; }
  /* ---- Sections ---- */
  .section { margin-bottom: 18px; }
  .section-head {
    display: table;
    width: 100%;
    margin-bottom: 8px;
  }
  .section-label {
    display: table-cell;
    font-size: 11px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: #E8571A;
    white-space: nowrap;
    padding-right: 10px;
    vertical-align: middle;
  }
  .section-rule {
    display: table-cell;
    width: 100%;
    border-bottom: 1px solid #E8571A;
    vertical-align: middle;
  }
  /* ---- Body text ---- */
  .body-text { font-size: 10.5px; color: #2d2d2d; line-height: 1.5; }
  /* ---- Experience ---- */
  .role { margin-bottom: 12px; }
  .role-meta {
    font-size: 10.5px;
    color: #2d2d2d;
    margin-bottom: 3px;
    overflow: hidden;
  }
  .role-company { font-size: 12px; font-weight: 600; color: #2d2d2d; }
  .role-title { font-size: 12px; font-weight: 600; color: #2d2d2d; }
  .role-right { font-size: 11px; color: #666; float: right; }
  .bullets { margin-top: 3px; }
  .bullet { font-size: 10.5px; color: #2d2d2d; line-height: 1.5; margin-bottom: 2px; padding-left: 10px; }
  /* ---- Education ---- */
  .edu-row { overflow: hidden; margin-bottom: 6px; }
  .edu-degree { font-size: 12px; font-weight: 600; color: #2d2d2d; }
  .edu-school { font-size: 10.5px; color: #666; }
  /* ---- Skills pills ---- */
  .skills-wrap { line-height: 2; }
  .pill {
    display: inline-block;
    font-size: 10px;
    color: #2d2d2d;
    background: #f3f4f6;
    border: 1px solid #e5e7eb;
    border-radius: 3px;
    padding: 1px 7px;
    margin: 1px 3px 1px 0;
  }
  /* ---- Certs ---- */
  .cert-row { overflow: hidden; margin-bottom: 6px; }
  .cert-name { font-size: 10.5px; color: #2d2d2d; }
  .cert-meta { font-size: 10.5px; color: #666; float: right; }
  /* ---- Footer ---- */
  .cv-footer {
    margin-top: 24px;
    text-align: center;
    font-size: 9px;
    color: #999;
  }
</style>
</head>
<body>
  <div class="cv-name">${esc(name)}</div>
  ${title ? `<div class="cv-job-title">${esc(title)}</div>` : ''}
  <div class="cv-contact">
    ${contactParts.map((p, i) => `${i > 0 ? '<span class="cv-contact-sep">&middot;</span>' : ''}<span>${esc(p)}</span>`).join('')}
  </div>

  <div style="margin-top:20px;">
    ${profileHtml}

    ${(experience || []).length > 0 ? `
    <div class="section">
      <div class="section-head"><span class="section-label">${L.experience}</span><span class="section-rule"></span></div>
      ${experienceHtml}
    </div>` : ''}

    ${(skills || []).length > 0 ? `
    <div class="section">
      <div class="section-head"><span class="section-label">${L.skills}</span><span class="section-rule"></span></div>
      <div class="skills-wrap">${skillsHtml}</div>
    </div>` : ''}

    ${(education || []).length > 0 ? `
    <div class="section">
      <div class="section-head"><span class="section-label">${L.education}</span><span class="section-rule"></span></div>
      ${educationHtml}
    </div>` : ''}

    ${certHtml}
    ${langHtml}
  </div>

  <div class="cv-footer">Optimised by Shortlisted &middot; getshortlisted.fyi</div>
</body>
</html>`;
}

async function renderPdf(html) {
  await acquireRender();
  const browser = await puppeteer.launch({
    executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  try {
    const work = async () => {
      const page = await browser.newPage();
      await page.setContent(html, { waitUntil: 'networkidle0' });
      const pdfBuffer = await page.pdf({
        format: 'A4',
        margin: { top: '0', right: '0', bottom: '0', left: '0' },
        printBackground: true,
      });
      return Buffer.from(pdfBuffer);
    };
    return await withTimeout(work(), PUPPETEER_TIMEOUT_MS, 'Puppeteer PDF render');
  } finally {
    await browser.close();
    releaseRender();
  }
}

function withTimeout(promise, ms, label) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Timeout: ${label} did not complete within ${ms}ms`)), ms)
  );
  return Promise.race([promise, timeout]);
}

export async function generateCv(cvData, lang = 'en') {
  return renderPdf(buildCvHtml(cvData, lang));
}

export async function generateReport(job, analysis, rewrites) {
  const lang = analysis.detected_language || 'en';
  return renderPdf(buildHtml(job, analysis, rewrites, lang));
}

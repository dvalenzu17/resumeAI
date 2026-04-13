import { createContext, useContext, useState, useEffect } from 'react';

const STORAGE_KEY = 'sl_lang';

// ─── Detect preferred language ───────────────────────────────────────────────
function detectLang() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === 'en' || saved === 'es') return saved;
  const browser = navigator.language || navigator.languages?.[0] || 'en';
  return browser.toLowerCase().startsWith('es') ? 'es' : 'en';
}

// ─── Translations ─────────────────────────────────────────────────────────────
const translations = {
  en: {
    // Nav
    nav_cta: 'Get free score',
    nav_logo: 'shortlisted',

    // Language switcher
    lang_en: 'English',
    lang_es: 'Español',

    // Hero
    hero_badge: 'Free · No account · ~30 seconds',
    hero_reject_source: 'linkedin.com · just now',
    hero_reject_quote: '"After careful consideration, we\'ve decided to move forward with other candidates."',
    hero_reject_caption: 'The recruiter never read your resume. The ATS filtered it out in under a second.',
    hero_headline_line1: 'Stop losing to',
    hero_headline_line2: 'an algorithm',
    hero_headline_accent: "you can't even see.",
    hero_sub: 'We score your resume against the job description, find every keyword the ATS is penalising you for, and tell you exactly what to fix.',
    hero_cta: 'Get My Free Score',
    stat1_num: '75%',
    stat1_desc: 'of resumes filtered before a human sees them',
    stat2_num: '7s',
    stat2_desc: 'average recruiter time per resume, if it gets through',

    // How it works
    how_eyebrow: 'How it works',
    how_heading: 'Three steps. Thirty seconds.',
    step1_title: 'Upload your resume',
    step1_body: 'PDF only. We extract the text and read every line the way an ATS does — no OCR, no guessing.',
    step2_title: 'Paste the job posting',
    step2_body: 'The full thing. Responsibilities, requirements, all of it. More detail means a more precise match.',
    step3_title: 'Get your score free',
    step3_body: 'ATS compatibility score, keyword gaps, and experience match. Instant. No account. No card.',

    // Results preview
    preview_eyebrow: 'Free before you pay anything',
    preview_heading: 'See your score. Then decide.',
    preview_sub: 'You get a real ATS score and your first two keyword gaps before we ask for a cent. Most people are surprised. That surprise is the point.',
    preview_free_score: 'Your free score',
    preview_keyword_gaps: 'Keyword Gaps',
    preview_gaps_found: '8 found',
    preview_blur_note: '6 more gaps revealed after upgrade',

    // Form
    form_title: 'Analyse your resume',
    form_sub: 'Free score in ~30 seconds. No account required.',
    form_resume_label: 'Your resume',
    form_drop_text: 'Drop your resume here',
    form_browse: 'browse files',
    form_drop_hint_suffix: 'PDF · max 10 MB',
    form_ready: 'ready to analyse',
    form_jd_label: 'The job description',
    form_jd_placeholder: "Paste the full job posting here: responsibilities, requirements, the whole thing. The more you give us, the more accurate the analysis. Don't just paste the title.",
    form_jd_hint_empty: 'Paste the full posting, not just the title',
    form_jd_hint_good: 'characters · good',
    form_jd_hint_more: 'more characters needed',
    form_submit: 'Get My Free Score',
    form_submitting: 'Analysing…',
    form_secure: 'No account · No card · Your data is never sold or shared',
    form_privacy: 'Your resume is processed server-side and never stored beyond 30 days. We don\'t sell, share, or use it to train AI models.',
    form_err_pdf: 'PDF files only. Not a JPEG of your resume.',
    form_err_size: 'File must be under 10 MB.',
    form_err_file: 'Drop your resume first.',
    form_err_jd: 'Need more of the job description. Paste the whole thing.',

    // Pricing
    pricing_eyebrow: 'After your free preview',
    pricing_heading: 'Simple, one-time pricing.',
    pricing_sub: 'No subscription. No account. Pay once, get the PDF. That\'s it.',
    pricing_coach: 'A career coach charges $150+ per hour and books two weeks out. The Glow-Up costs less and delivers in 60 seconds.',
    pricing_sample: 'Not sure what you get?',
    pricing_sample_link: 'See a real sample report',
    pricing_sample_suffix: 'before you decide.',
    pricing_meta: 'One-time · No account · PDF in ~60s',
    tier_basic_name: 'The Audit',
    tier_basic_desc: 'Everything wrong with your resume, and exactly how to fix it.',
    tier_full_name: 'The Glow-Up',
    tier_full_desc: 'Not just the analysis. The actual rewrites. Ready to paste in.',
    tier_most_popular: 'Most popular',

    // FAQ
    faq_heading: 'Questions',
    faq1_q: 'Is my resume data safe?',
    faq1_a: "Your resume is processed server-side to generate your report. It's never sold, shared, or used to train AI models. We store the text temporarily to run the analysis — that's it.",
    faq2_q: 'How accurate is the ATS score?',
    faq2_a: 'We use the same keyword-matching logic most corporate ATS systems use, plus an AI layer that catches semantic gaps the basic systems miss. It correlates well with what Workday, Greenhouse, and Lever flag, but no third-party tool can replicate the exact same software.',
    faq3_q: "What if I'm not happy with the report?",
    faq3_a: "Email hello@getshortlisted.fyi and we'll refund you. No questions asked. If the report doesn't work for your situation, you shouldn't pay for it.",
    faq4_q: 'Do I need an account?',
    faq4_a: "No. You submit, you pay, you get the PDF. We only collect your email at checkout so we can send you the report link. That's the only reason.",

    // Founder section
    founder_eyebrow: 'Why this exists',
    founder_quote: '"I built Shortlisted after watching my own resume get filtered out for roles I was genuinely qualified for. I had no idea which keywords I was missing or why the ATS kept rejecting me. After fixing the gaps the tool identified, I started getting callbacks. That\'s the whole reason this exists."',
    founder_name: 'Daniel',
    founder_role: 'Founder, Shortlisted',

    // Footer
    footer_tagline: 'Beat the bots. Get the interview.',
    footer_privacy: 'Privacy Policy',
    footer_terms: 'Terms of Service',
    footer_built: 'Built by Daniel Valenzuela · Panama',

    // Processing view
    processing_analyzing: 'Analysing your resume',
    processing_confirming: 'Confirming your payment',
    processing_confirming_sub: 'Your payment is being processed. This usually takes less than a minute.',
    processing_generating: 'Generating your report',
    processing_done: 'Your report is ready',
    processing_failed: 'Something went wrong',
    processing_failed_sub: 'We\'ve been notified. If you paid, email us and we\'ll sort it out.',
    processing_start_over: 'Start over',
    processing_steps: [
      'Reading your resume',
      'Scanning the job description',
      'Calculating ATS compatibility',
      'Finding keyword gaps',
    ],

    // Preview view
    preview_score_header: 'Your free score',
    preview_heading_high: "You're in the top tier.",
    preview_heading_high_accent: "Now let's make it airtight.",
    preview_heading_mid: "You're close.",
    preview_heading_mid_accent: "The gaps are fixable.",
    preview_heading_low: "The bots filtered you out.",
    preview_heading_low_accent: "Here's the full damage report.",
    preview_verdict_high: 'Strong resume. A few tweaks will make it airtight.',
    preview_verdict_mid: 'Room for improvement. Keyword gaps are costing you callbacks.',
    preview_verdict_low: "The bots are filtering you out before a human ever sees this.",
    preview_section_gaps: 'Keyword Gaps',
    preview_section_gaps_note: "These are the exact keywords the ATS is looking for that aren't in your resume.",
    preview_section_matches: 'Keyword Matches',
    preview_section_strengths: 'Strengths',
    preview_section_weaknesses: 'Weaknesses',
    preview_section_linkedin: 'LinkedIn Headline',
    preview_gap_found: 'found',
    preview_paywall_heading_suffix: 'keyword gaps found. Here\'s the full picture.',
    preview_paywall_sub: 'Every gap, every match, every fix. Delivered as a PDF in about 60 seconds. Apply to the same role tomorrow with a resume that actually passes.',
    preview_email_label: 'Where should we send your report?',
    preview_email_placeholder: 'you@example.com',
    preview_unlock_btn: 'Unlock',
    preview_unlock_for: 'for',
    preview_redirecting: 'Redirecting…',
    preview_paywall_note: 'One-time · No account · PDF link valid 72h ·',
    preview_refunds: 'hello@getshortlisted.fyi for refunds',
    preview_urgency: 'Jobs fill fast. Applicants who fix their resume today get callbacks this week.',
    preview_personalise_title: 'Make your cover letter sound like',
    preview_personalise_you: 'you',
    preview_personalise_note: '3 quick questions. All optional. Skip any you\'d rather leave out. Your answers make the difference between AI-sounding and actually compelling.',
    preview_cl_q1: 'What\'s one specific thing about this company or role that made you apply?',
    preview_cl_q1_ph: 'e.g. Their engineering blog on distributed systems, or the focus on developer tooling',
    preview_cl_q2: 'What\'s the one achievement from your career most relevant to this role?',
    preview_cl_q2_ph: 'e.g. Cut API latency by 80% by rewriting the query layer. Went from 600ms to 95ms',
    preview_cl_q3: 'Anything non-obvious about your background that\'s relevant here?',
    preview_cl_q3_ph: 'e.g. I ran a 3-person freelance agency before joining my current company, so I\'ve done every part of the stack',
    preview_continue_checkout: 'Continue to checkout for $29',
    preview_sending_to: 'Sending to',
    preview_tier_badge: 'Best value',

    // Success view
    success_heading: 'Your report is on its way.',
    success_sub: 'Check your inbox in the next 60 seconds. Check spam if it\'s not there.',
    success_share: 'Know someone else grinding through job applications?',
    success_share_btn: 'Copy link to share',
    success_copied: 'Link copied',
    success_another: 'Analyse another resume',

    // Not found
    notfound_heading: 'This page doesn\'t exist.',
    notfound_sub: 'The bots didn\'t filter you out. This page just doesn\'t exist.',
    notfound_cta: 'Go home',
  },

  es: {
    // Nav
    nav_cta: 'Obtener puntuacion gratis',
    nav_logo: 'shortlisted',

    // Language switcher
    lang_en: 'English',
    lang_es: 'Espanol',

    // Hero
    hero_badge: 'Gratis · Sin cuenta · ~30 segundos',
    hero_reject_source: 'linkedin.com · ahora mismo',
    hero_reject_quote: '"Despues de una cuidadosa consideracion, hemos decidido avanzar con otros candidatos."',
    hero_reject_caption: 'El reclutador nunca leyo tu CV. El ATS lo filtro en menos de un segundo.',
    hero_headline_line1: 'Deja de perder contra',
    hero_headline_line2: 'un algoritmo',
    hero_headline_accent: 'que ni siquiera puedes ver.',
    hero_sub: 'Evaluamos tu CV contra la descripcion del puesto, encontramos cada palabra clave que el ATS te penaliza y te decimos exactamente que corregir.',
    hero_cta: 'Obtener mi puntuacion gratis',
    stat1_num: '75%',
    stat1_desc: 'de los CV son filtrados antes de que un humano los vea',
    stat2_num: '7s',
    stat2_desc: 'tiempo promedio del reclutador por CV, si es que llega',

    // How it works
    how_eyebrow: 'Como funciona',
    how_heading: 'Tres pasos. Treinta segundos.',
    step1_title: 'Sube tu CV',
    step1_body: 'Solo PDF. Extraemos el texto y leemos cada linea como lo hace un ATS, sin OCR ni suposiciones.',
    step2_title: 'Pega la oferta de trabajo',
    step2_body: 'Todo el texto. Responsabilidades, requisitos, todo. Mas detalle significa una comparacion mas precisa.',
    step3_title: 'Obtene tu puntuacion gratis',
    step3_body: 'Puntuacion de compatibilidad ATS, palabras clave faltantes y experiencia relevante. Instantaneo. Sin cuenta. Sin tarjeta.',

    // Results preview
    preview_eyebrow: 'Gratis antes de pagar',
    preview_heading: 'Ve tu puntuacion. Luego decide.',
    preview_sub: 'Obtienes una puntuacion ATS real y tus primeras dos brechas de palabras clave antes de que te pidamos un centavo. La mayoria se sorprende. Esa sorpresa es el punto.',
    preview_free_score: 'Tu puntuacion gratis',
    preview_keyword_gaps: 'Palabras clave faltantes',
    preview_gaps_found: '8 encontradas',
    preview_blur_note: '6 brechas mas reveladas al actualizar',

    // Form
    form_title: 'Analiza tu CV',
    form_sub: 'Puntuacion gratis en ~30 segundos. Sin cuenta.',
    form_resume_label: 'Tu CV',
    form_drop_text: 'Arrastra tu CV aqui',
    form_browse: 'selecciona el archivo',
    form_drop_hint_suffix: 'PDF · max 10 MB',
    form_ready: 'listo para analizar',
    form_jd_label: 'La descripcion del puesto',
    form_jd_placeholder: 'Pega la oferta completa aqui: responsabilidades, requisitos, todo. Cuanto mas des, mas preciso sera el analisis.',
    form_jd_hint_empty: 'Pega la oferta completa, no solo el titulo',
    form_jd_hint_good: 'caracteres · bien',
    form_jd_hint_more: 'caracteres mas necesarios',
    form_submit: 'Obtener mi puntuacion gratis',
    form_submitting: 'Analizando...',
    form_secure: 'Sin cuenta · Sin tarjeta · Tus datos nunca se venden ni comparten',
    form_privacy: 'Tu CV se procesa en nuestros servidores y nunca se almacena mas de 30 dias. No lo vendemos, compartimos ni usamos para entrenar IA.',
    form_err_pdf: 'Solo archivos PDF. No imagenes de tu CV.',
    form_err_size: 'El archivo debe pesar menos de 10 MB.',
    form_err_file: 'Sube tu CV primero.',
    form_err_jd: 'Necesitamos mas de la descripcion del puesto. Pega el texto completo.',

    // Pricing
    pricing_eyebrow: 'Despues de tu vista previa gratis',
    pricing_heading: 'Precio unico y simple.',
    pricing_sub: 'Sin suscripcion. Sin cuenta. Pagas una vez, recibes el PDF. Eso es todo.',
    pricing_coach: 'Un coach de carrera cobra $150+ por hora y tiene agenda llena dos semanas. The Glow-Up cuesta menos y entrega en 60 segundos.',
    pricing_sample: 'No estas seguro de lo que obtienes?',
    pricing_sample_link: 'Ve un reporte de ejemplo real',
    pricing_sample_suffix: 'antes de decidir.',
    pricing_meta: 'Pago unico · Sin cuenta · PDF en ~60s',
    tier_basic_name: 'The Audit',
    tier_basic_desc: 'Todo lo que esta mal en tu CV, y exactamente como corregirlo.',
    tier_full_name: 'The Glow-Up',
    tier_full_desc: 'No solo el analisis. Las correcciones reales. Listas para copiar y pegar.',
    tier_most_popular: 'Mas popular',

    // FAQ
    faq_heading: 'Preguntas',
    faq1_q: 'Estan seguros mis datos?',
    faq1_a: 'Tu CV se procesa en nuestros servidores para generar tu reporte. Nunca se vende, comparte ni usa para entrenar IA. Almacenamos el texto temporalmente para correr el analisis, nada mas.',
    faq2_q: 'Que tan precisa es la puntuacion ATS?',
    faq2_a: 'Usamos la misma logica de coincidencia de palabras clave que la mayoria de los sistemas ATS corporativos, mas una capa de IA que detecta las brechas semanticas que los sistemas basicos omiten.',
    faq3_q: 'Que pasa si no estoy satisfecho con el reporte?',
    faq3_a: 'Escribe a hello@getshortlisted.fyi y te haremos el reembolso. Sin preguntas. Si el reporte no funciona para tu situacion, no deberias pagar por el.',
    faq4_q: 'Necesito una cuenta?',
    faq4_a: 'No. Envias, pagas y recibes el PDF. Solo recopilamos tu email en el pago para enviarte el enlace del reporte. Es la unica razon.',

    // Founder section
    founder_eyebrow: 'Por que existe esto',
    founder_quote: '"Cree Shortlisted despues de ver como mi propio CV era filtrado en roles para los que estaba genuinamente calificado. No tenia idea de que palabras clave me faltaban ni por que el ATS me rechazaba. Despues de corregir las brechas que la herramienta identifico, empece a recibir llamadas. Esa es la razon de ser de esto."',
    founder_name: 'Daniel',
    founder_role: 'Fundador, Shortlisted',

    // Footer
    footer_tagline: 'Supera los bots. Consigue la entrevista.',
    footer_privacy: 'Politica de privacidad',
    footer_terms: 'Terminos de servicio',
    footer_built: 'Desarrollado por Daniel Valenzuela · Panama',

    // Processing view
    processing_analyzing: 'Analizando tu CV',
    processing_confirming: 'Confirmando tu pago',
    processing_confirming_sub: 'Tu pago esta siendo procesado. Esto generalmente demora menos de un minuto.',
    processing_generating: 'Generando tu reporte',
    processing_done: 'Tu reporte esta listo',
    processing_failed: 'Algo salio mal',
    processing_failed_sub: 'Hemos sido notificados. Si pagaste, escribe y lo resolvemos.',
    processing_start_over: 'Empezar de nuevo',
    processing_steps: [
      'Leyendo tu CV',
      'Escaneando la descripcion del puesto',
      'Calculando compatibilidad ATS',
      'Encontrando brechas de palabras clave',
    ],

    // Preview view
    preview_score_header: 'Tu puntuacion gratis',
    preview_heading_high: 'Estas en el nivel mas alto.',
    preview_heading_high_accent: 'Ahora hagamos que sea perfecto.',
    preview_heading_mid: 'Estas cerca.',
    preview_heading_mid_accent: 'Las brechas se pueden corregir.',
    preview_heading_low: 'Los bots te filtraron.',
    preview_heading_low_accent: 'Aqui esta el reporte completo del dano.',
    preview_verdict_high: 'CV solido. Algunos ajustes lo haran perfecto.',
    preview_verdict_mid: 'Hay margen de mejora. Las brechas de palabras clave te estan costando entrevistas.',
    preview_verdict_low: 'Los bots te estan filtrando antes de que un humano vea tu CV.',
    preview_section_gaps: 'Palabras clave faltantes',
    preview_section_gaps_note: 'Estas son las palabras clave exactas que el ATS busca y no estan en tu CV.',
    preview_section_matches: 'Palabras clave encontradas',
    preview_section_strengths: 'Fortalezas',
    preview_section_weaknesses: 'Debilidades',
    preview_section_linkedin: 'Titular de LinkedIn',
    preview_gap_found: 'encontradas',
    preview_paywall_heading_suffix: 'brechas de palabras clave encontradas. Aqui esta el panorama completo.',
    preview_paywall_sub: 'Cada brecha, cada coincidencia, cada correccion. Entregado como PDF en unos 60 segundos. Aplica al mismo puesto manana con un CV que realmente pasa.',
    preview_email_label: 'Donde enviamos tu reporte?',
    preview_email_placeholder: 'tu@ejemplo.com',
    preview_unlock_btn: 'Desbloquear',
    preview_unlock_for: 'por',
    preview_redirecting: 'Redirigiendo...',
    preview_paywall_note: 'Pago unico · Sin cuenta · Enlace PDF valido 72h ·',
    preview_refunds: 'hello@getshortlisted.fyi para reembolsos',
    preview_urgency: 'Los puestos se llenan rapido. Los candidatos que corrigen su CV hoy reciben llamadas esta semana.',
    preview_personalise_title: 'Haz que tu carta de presentacion suene como',
    preview_personalise_you: 'tu',
    preview_personalise_note: '3 preguntas rapidas. Todas opcionales. Omite las que prefieras. Tus respuestas marcan la diferencia entre sonar como IA o sonar como una persona real.',
    preview_cl_q1: 'Que es una cosa especifica de esta empresa o rol que te hizo aplicar?',
    preview_cl_q1_ph: 'ej. Su blog de ingenieria sobre sistemas distribuidos, o el enfoque en herramientas de desarrollo',
    preview_cl_q2: 'Cual es el logro de tu carrera mas relevante para este puesto?',
    preview_cl_q2_ph: 'ej. Reduje la latencia de la API en un 80% reescribiendo la capa de consultas. Pase de 600ms a 95ms',
    preview_cl_q3: 'Hay algo no obvio de tu trayectoria que sea relevante aqui?',
    preview_cl_q3_ph: 'ej. Lleve una agencia freelance de 3 personas antes de unirme a mi empresa actual, por eso conozco todo el stack',
    preview_continue_checkout: 'Continuar al pago por $29',
    preview_sending_to: 'Enviando a',
    preview_tier_badge: 'Mejor relacion precio-valor',

    // Success view
    success_heading: 'Tu reporte esta en camino.',
    success_sub: 'Revisa tu bandeja de entrada en los proximos 60 segundos. Revisa spam si no llego.',
    success_share: 'Conoces a alguien mas que esta en busqueda de trabajo?',
    success_share_btn: 'Copiar enlace para compartir',
    success_copied: 'Enlace copiado',
    success_another: 'Analizar otro CV',

    // Not found
    notfound_heading: 'Esta pagina no existe.',
    notfound_sub: 'Los bots no te filtraron. Esta pagina simplemente no existe.',
    notfound_cta: 'Ir al inicio',
  },
};

// ─── Context ──────────────────────────────────────────────────────────────────
const LangContext = createContext(null);

export function LangProvider({ children }) {
  const [lang, setLangState] = useState(detectLang);

  const setLang = (l) => {
    localStorage.setItem(STORAGE_KEY, l);
    setLangState(l);
  };

  return (
    <LangContext.Provider value={{ lang, setLang }}>
      {children}
    </LangContext.Provider>
  );
}

// ─── Hook ─────────────────────────────────────────────────────────────────────
export function useT() {
  const ctx = useContext(LangContext);
  const lang = ctx?.lang ?? 'en';
  const t = (key) => translations[lang]?.[key] ?? translations.en[key] ?? key;
  return { t, lang, setLang: ctx?.setLang };
}

// ─── Language Switcher component ──────────────────────────────────────────────
export function LangSwitcher({ className }) {
  const { lang, setLang, t } = useT();

  return (
    <select
      className={className}
      value={lang}
      onChange={(e) => setLang(e.target.value)}
      aria-label="Select language"
    >
      <option value="en">{t('lang_en')}</option>
      <option value="es">{t('lang_es')}</option>
    </select>
  );
}

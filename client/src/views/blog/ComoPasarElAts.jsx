import { Link } from 'react-router-dom';
import BlogLayout from './BlogLayout.jsx';

export default function ComoPasarElAts() {
  return (
    <BlogLayout
      title="Cómo Pasar el ATS y Conseguir Más Entrevistas"
      description="La mayoría de los candidatos calificados nunca llegan a hablar con un reclutador porque un software filtra su currículum primero. Aquí está la guía completa para optimizar tu currículum y superar el filtro ATS."
      date="Mayo 2025"
      readTime="8 min de lectura"
      slug="es/como-pasar-el-ats"
      publishedDate="2025-05-04"
    >
      <p>
        Pasas horas preparando tu currículum. Lo envías a cinco trabajos para los que estás calificado.
        No recibes respuesta. Ni siquiera un correo de rechazo. ¿Qué está pasando?
      </p>
      <p>
        En la mayoría de los casos, ningún reclutador ha visto tu currículum. Un sistema de
        seguimiento de candidatos, conocido como ATS (Applicant Tracking System), lo filtró
        automáticamente antes de que llegara a manos humanas. Entender cómo funciona este sistema
        es lo más importante que puedes hacer para mejorar tus resultados en la búsqueda de trabajo.
      </p>

      <h2>¿Qué es un ATS?</h2>
      <p>
        Un ATS es el software que las empresas usan para recibir, organizar y filtrar solicitudes
        de empleo a gran escala. Sistemas como Workday, Greenhouse, Lever, iCIMS y SAP SuccessFactors
        son los más comunes. Cuando haces clic en "Aplicar" en cualquier portal de empleo,
        tu currículum va directamente a uno de estos sistemas.
      </p>
      <p>
        El ATS hace tres cosas de inmediato con tu currículum:
      </p>
      <ol>
        <li>
          <strong>Lo analiza.</strong> Extrae el texto de tu PDF o documento Word y lo clasifica
          en campos estructurados: títulos de trabajo, nombres de empresas, fechas, habilidades, educación.
        </li>
        <li>
          <strong>Lo puntúa.</strong> Compara el texto extraído con la descripción del trabajo
          usando algoritmos de coincidencia de palabras clave. ¿Cuántas habilidades requeridas
          aparecen en tu currículum? ¿Tu título más reciente se parece al puesto que solicitas?
        </li>
        <li>
          <strong>Lo clasifica.</strong> Asigna una puntuación y coloca tu solicitud en una cola ordenada.
          Los reclutadores filtran esta cola por puntuación y generalmente solo revisan las solicitudes
          que superan cierto umbral. Si tu puntuación te coloca en la posición 150, tu currículum
          nunca será visto.
        </li>
      </ol>

      <h2>Por qué los currículums son rechazados antes de que nadie los lea</h2>
      <p>
        Hay dos razones principales por las que el ATS descarta un currículum: falta de palabras clave
        y problemas de formato.
      </p>

      <h3>Falta de palabras clave</h3>
      <p>
        El ATS compara tu currículum con la descripción del trabajo buscando términos específicos.
        Si la oferta dice "gestión de proyectos" y tu currículum dice "coordiné equipos de trabajo,"
        muchos sistemas ATS no lo contarán como una coincidencia. Buscan la frase exacta o variantes
        muy similares.
      </p>
      <p>
        Este es el problema más común y el más fácil de solucionar. La mayoría de los candidatos
        describimos nuestra experiencia con nuestras propias palabras en lugar de usar el vocabulario
        exacto de la oferta de trabajo. El resultado es una puntuación baja aunque tengamos
        toda la experiencia relevante.
      </p>

      <h3>Problemas de formato</h3>
      <p>
        Los analizadores ATS tienen dificultades para extraer texto de ciertos formatos de currículum
        que se ven bien para un humano pero confunden al software:
      </p>
      <ul>
        <li><strong>Diseños de dos columnas.</strong> El texto de dos columnas se mezcla al ser procesado, produciendo contenido ilegible.</li>
        <li><strong>Tablas.</strong> El contenido dentro de tablas frecuentemente se omite o se extrae en el orden incorrecto.</li>
        <li><strong>Cuadros de texto.</strong> El texto en cuadros de texto muchas veces no se extrae en absoluto.</li>
        <li><strong>Gráficos e imágenes.</strong> Cualquier texto incrustado en imágenes es completamente invisible para el ATS.</li>
        <li><strong>PDFs basados en imagen.</strong> Si tu PDF fue creado desde un escáner en lugar de texto digital, el ATS recibe esencialmente un documento en blanco.</li>
      </ul>

      <h2>El formato de currículum que funciona con los ATS</h2>
      <p>
        El formato que mejor funciona con los sistemas ATS es simple, limpio y estructurado:
      </p>
      <ul>
        <li><strong>Una sola columna.</strong> Sin diseños de dos columnas ni barras laterales.</li>
        <li><strong>Sin tablas ni cuadros de texto.</strong> Usa listas simples en lugar de tablas para organizar información.</li>
        <li><strong>Sin gráficos ni íconos.</strong> Elimina los diseños visuales que incluyen texto dentro de imágenes.</li>
        <li><strong>Encabezados de sección estándar.</strong> Usa "Experiencia Laboral," "Habilidades," "Educación." Evita nombres creativos.</li>
        <li><strong>Información de contacto en el cuerpo del documento.</strong> No en el encabezado o pie de página del documento.</li>
        <li><strong>PDF de texto.</strong> Exporta desde Word o Google Docs, nunca desde un escáner.</li>
        <li><strong>Fuentes estándar.</strong> Arial, Calibri, Times New Roman. Evita fuentes decorativas.</li>
      </ul>

      <h2>Cómo identificar las palabras clave correctas</h2>
      <p>
        La fuente de las palabras clave correctas es la propia oferta de trabajo. El proceso es directo:
      </p>
      <ol>
        <li>
          <strong>Lee la descripción del trabajo tres veces.</strong> La primera vez para entender
          el contexto general. La segunda para identificar habilidades y requisitos específicos.
          La tercera para notar qué frases se repiten con más frecuencia.
        </li>
        <li>
          <strong>Extrae las habilidades técnicas específicas.</strong> Herramientas, software,
          certificaciones, metodologías. "Excel," "Salesforce," "Agile," "SAP," "PMP." Estas son
          coincidencias exactas que el ATS busca.
        </li>
        <li>
          <strong>Anota las frases que se repiten.</strong> Si "gestión de stakeholders" aparece
          tres veces en la oferta, es una palabra clave de alta prioridad.
        </li>
        <li>
          <strong>Identifica el vocabulario del sector.</strong> Finanzas: "EBITDA," "due diligence."
          Marketing: "CAC," "NPS," "embudo de conversión." Tecnología: "sprint," "backlog," "DevOps."
        </li>
      </ol>

      <h2>Dónde colocar las palabras clave</h2>
      <p>
        Los sistemas ATS ponderan diferentes secciones de manera distinta:
      </p>
      <ul>
        <li>
          <strong>Sección de habilidades (mayor peso).</strong> Lista tus habilidades técnicas
          y metodologías explícitamente. "Excel, Power BI, SQL, Agile, Gestión de Proyectos."
          Esta sección recibe el mayor peso en el análisis de palabras clave.
        </li>
        <li>
          <strong>Bullets de experiencia reciente.</strong> Usa el lenguaje exacto de la oferta
          al describir tus logros. "Lideré sprints de Agile" es mejor que "organicé reuniones
          semanales del equipo" si la oferta menciona Agile.
        </li>
        <li>
          <strong>Resumen profesional.</strong> Un párrafo breve al inicio que incluya los
          términos clave del puesto al que aplicas.
        </li>
      </ul>

      <h2>El proceso completo para cada solicitud</h2>
      <p>
        Adaptar tu currículum a cada oferta toma entre 15 y 25 minutos cuando tienes práctica.
        Aquí está el proceso paso a paso:
      </p>
      <ol>
        <li>Revisa tu puntuación ATS actual con tu currículum y la oferta específica</li>
        <li>Identifica las palabras clave faltantes de la descripción del trabajo</li>
        <li>Agrega las habilidades que tienes a tu sección de habilidades</li>
        <li>Reescribe los bullets de tu experiencia más reciente usando el vocabulario de la oferta</li>
        <li>Actualiza tu resumen profesional para este puesto específico</li>
        <li>Verifica tu puntuación nuevamente antes de enviar</li>
      </ol>
      <p>
        Los candidatos que siguen este proceso consistentemente consiguen significativamente
        más entrevistas que los que envían el mismo currículum genérico a todas las ofertas.
        La diferencia no está en las calificaciones. Está en el esfuerzo de adaptación.
      </p>

      <h2>Errores comunes que debes evitar</h2>
      <ul>
        <li>
          <strong>Usar sinónimos en lugar de las frases exactas.</strong> "Supervisé al equipo"
          en lugar de "gestión de equipos" cuando la oferta dice "gestión de equipos."
        </li>
        <li>
          <strong>Incluir palabras clave que no puedes respaldar.</strong> El ATS te pasa,
          el reclutador te pregunta, y no puedes responder. Esto daña tu credibilidad.
        </li>
        <li>
          <strong>Enviar el mismo currículum a todas las ofertas.</strong> Cada descripción
          de trabajo usa un vocabulario diferente. Un currículum genérico nunca maximiza
          la coincidencia de palabras clave para ningún puesto específico.
        </li>
        <li>
          <strong>Ignorar el formato.</strong> Las mejores palabras clave del mundo no sirven
          si el ATS no puede extraer el texto de tu currículum.
        </li>
      </ul>

      <h2>Cómo verificar tu puntuación ATS antes de enviar</h2>
      <p>
        La manera más rápida de saber si tus cambios mejoraron tu puntuación es verificarla
        contra la oferta específica antes de enviar. <Link to="/">Shortlisted</Link> hace esto
        en aproximadamente 30 segundos: sube tu currículum, pega la descripción del trabajo,
        y verás tu puntuación de compatibilidad ATS más la lista exacta de palabras clave
        que te faltan. La primera verificación es gratuita y no requiere cuenta.
      </p>
      <div className="callout">
        <p>
          <strong>Verifica tu puntuación ATS ahora.</strong> Sube tu currículum y la descripción
          del trabajo. Ve tu puntuación, las palabras clave que te faltan y qué mejorar.
          Gratis, sin cuenta necesaria.{' '}
          <Link to="/">Verificar mi currículum gratis.</Link>
        </p>
      </div>
    </BlogLayout>
  );
}

/* ═══════════════════════════════════════════════════════════════════════════
   ARFUCH CASTILLO & ASOC. — Comportamiento del sitio
   Vanilla JS, sin dependencias. Todo es progresivo: si el JS no carga, el
   sitio sigue siendo navegable y todo el contenido queda visible.
   ═══════════════════════════════════════════════════════════════════════════ */

(function () {
  'use strict';

  var sinMovimiento = window.matchMedia('(prefers-reduced-motion: reduce)').matches;


  /* ─── 1. Barra superior ───────────────────────────────────────────────────
     Arranca transparente sobre la foto de portada. Se vuelve sólida apenas
     el visitante se desplaza, si no los enlaces blancos quedarían sobre
     fondo claro. */

  var barra = document.getElementById('barra');

  if (barra) {
    var actualizarBarra = function () {
      barra.dataset.desplazada = window.scrollY > 24 ? 'true' : 'false';
    };
    actualizarBarra();
    window.addEventListener('scroll', actualizarBarra, { passive: true });
  }


  /* ─── 2. Menú móvil ───────────────────────────────────────────────────── */

  var menuBoton = document.querySelector('.menu-boton');
  var menuMovil = document.getElementById('menu-movil');

  if (menuBoton && menuMovil) {
    var cerrarMenu = function () {
      menuBoton.setAttribute('aria-expanded', 'false');
      menuBoton.setAttribute('aria-label', 'Abrir menú');
      menuMovil.hidden = true;
    };

    var abrirMenu = function () {
      menuBoton.setAttribute('aria-expanded', 'true');
      menuBoton.setAttribute('aria-label', 'Cerrar menú');
      menuMovil.hidden = false;
      // Con el menú abierto la barra necesita fondo sólido aunque estemos
      // arriba de todo, o el panel flota sobre la foto sin separación.
      if (barra) barra.dataset.desplazada = 'true';
    };

    menuBoton.addEventListener('click', function () {
      if (menuBoton.getAttribute('aria-expanded') === 'true') {
        cerrarMenu();
        if (barra) actualizarBarra();
      } else {
        abrirMenu();
      }
    });

    menuMovil.addEventListener('click', function (evento) {
      if (evento.target.closest('a')) cerrarMenu();
    });

    document.addEventListener('keydown', function (evento) {
      if (evento.key === 'Escape' && menuBoton.getAttribute('aria-expanded') === 'true') {
        cerrarMenu();
        if (barra) actualizarBarra();
        menuBoton.focus();
      }
    });

    document.addEventListener('click', function (evento) {
      if (menuBoton.getAttribute('aria-expanded') !== 'true') return;
      if (!evento.target.closest('#barra')) {
        cerrarMenu();
        if (barra) actualizarBarra();
      }
    });

    var anchoEscritorio = window.matchMedia('(min-width: 68rem)');
    var alCambiarAncho = function (consulta) { if (consulta.matches) cerrarMenu(); };

    if (anchoEscritorio.addEventListener) {
      anchoEscritorio.addEventListener('change', alCambiarAncho);
    } else if (anchoEscritorio.addListener) {
      anchoEscritorio.addListener(alCambiarAncho); // Safari < 14
    }
  }


  /* ─── 3. Riel de casos y de temas ────────────────────────────────────────────────────
     Marca en qué caso está parado el visitante. Se usa el punto medio de la
     ventana como referencia: así el caso activo es el que ocupa el centro de
     la pantalla, que es lo que la persona está leyendo. */

  var enlacesRiel = document.querySelectorAll('[data-riel]');
  // .caso son los bloques de la home; .tema, los subtemas de las paginas
  // de area. El riel funciona igual en las dos: observa el bloque que
  // cruza el medio de la ventana y marca su entrada.
  var bloquesCaso = document.querySelectorAll('.caso, .tema');

  if (enlacesRiel.length && bloquesCaso.length) {
    var marcarActivo = function (id) {
      enlacesRiel.forEach(function (enlace) {
        enlace.dataset.activo = (enlace.dataset.riel === id) ? 'true' : 'false';
      });
    };

    if ('IntersectionObserver' in window) {
      var observadorRiel = new IntersectionObserver(function (entradas) {
        entradas.forEach(function (entrada) {
          if (entrada.isIntersecting) marcarActivo(entrada.target.id);
        });
      }, {
        // Franja fina en el medio de la ventana: sólo un caso la cruza a la vez.
        rootMargin: '-45% 0px -45% 0px',
        threshold: 0
      });

      bloquesCaso.forEach(function (bloque) { observadorRiel.observe(bloque); });
    }

    // Al hacer clic marcamos de inmediato, sin esperar a que termine el scroll.
    enlacesRiel.forEach(function (enlace) {
      enlace.addEventListener('click', function () {
        marcarActivo(enlace.dataset.riel);
      });
    });
  }


  /* ─── 4. Contacto permanente ───────────────────────────────────
     La barra de WhatsApp ya no se muestra ni se oculta según el scroll: el
     punto 10 del informe pide que esté visible en todo momento, así que es
     CSS puro y no necesita JavaScript. Se deja el hueco numerado para no
     renumerar los bloques siguientes. */


  /* ─── 5. Mapa con carga diferida ──────────────────────────────────────────
     El iframe de Google Maps pesa cientos de KB y dispara varias peticiones
     a terceros. Se inserta recién cuando alguien pide ver el mapa. */

  var mapa = document.getElementById('mapa');

  if (mapa) {
    var disparador = mapa.querySelector('.mapa__disparador');

    if (disparador && disparador.dataset.mapa) {
      disparador.addEventListener('click', function () {
        var marco = document.createElement('iframe');
        marco.className = 'mapa__marco';
        marco.src = disparador.dataset.mapa;
        marco.title = 'Mapa con la ubicación del estudio en City Bell, La Plata';
        marco.loading = 'lazy';
        marco.referrerPolicy = 'no-referrer-when-downgrade';
        marco.setAttribute('allowfullscreen', '');
        mapa.replaceChildren(marco);
      });
    }
  }


  /* ─── 6. Entrada escalonada de bloques ────────────────────────────────────
     Los atributos se agregan desde JS: sin JS nada queda oculto. */

  if (!sinMovimiento && 'IntersectionObserver' in window) {
    var observadorEntrada = new IntersectionObserver(function (entradas, observador) {
      entradas.forEach(function (entrada) {
        if (!entrada.isIntersecting) return;
        entrada.target.dataset.visto = 'true';
        observador.unobserve(entrada.target);
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -6% 0px' });

    /* El escalonado se reinicia en cada grupo: si se numerara de corrido, los
       bloques del final arrastrarían retrasos larguísimos. */
    var grupos = [
      '.portada__contenido > *',
      '.casos-indice__encabezado, .casos-indice__lista > li',
      '.caso',
      '.errores__encabezado, .error, .errores__cierre',
      '.situaciones__encabezado, .situacion, .situaciones__cierre',
      '.estudio__texto > *, .cobertura',
      '.llamada__encabezado, .consulta, .llamada__cierre',
      '.contacto__llamado, .contacto__datos, .contacto .mapa',
      '.tema',
      '.preguntas-area__encabezado, .preguntas-area__lista',
      '.cierre-area__llamado, .cierre-area__otras'
    ];

    grupos.forEach(function (selector) {
      document.querySelectorAll(selector).forEach(function (bloque, indice) {
        bloque.dataset.anima = '';
        bloque.style.setProperty('--retraso', (indice * 80) + 'ms');
        observadorEntrada.observe(bloque);
      });
    });
  }


  /* ─── 7. Foco correcto al saltar por ancla ────────────────────────────────
     El scroll suave del navegador no mueve el foco: lo movemos a mano para
     que quien navegue con teclado siga en el lugar correcto. */

  document.addEventListener('click', function (evento) {
    var enlace = evento.target.closest('a[href^="#"]');
    if (!enlace) return;

    var id = enlace.getAttribute('href');
    if (!id || id === '#') return;

    var destino = document.querySelector(id);
    if (!destino) return;

    window.setTimeout(function () {
      if (!destino.hasAttribute('tabindex')) destino.setAttribute('tabindex', '-1');
      destino.focus({ preventScroll: true });
    }, sinMovimiento ? 0 : 600);
  });

  /* ─── 8. Año del copyright ───────────────────────────────────────
     El año viene escrito en el HTML, así que si esto no corre igual se ve un
     año válido. Acá sólo se lo pone al día. */

  var marcasAnio = document.querySelectorAll('[data-anio]');

  if (marcasAnio.length) {
    var anioActual = String(new Date().getFullYear());
    marcasAnio.forEach(function (marca) { marca.textContent = anioActual; });
  }

})();

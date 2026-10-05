/**
 * Movimento da landing — o que anima quando a pessoa rola a página.
 *
 *   <script src="js/movimento.js" defer></script>
 *
 * Quatro efeitos, e a ordem de prioridade de cada um é deliberada:
 *
 * 1. **Entrada por revelação.** Os filhos de cada bloco aparecem com um leve
 *    deslocamento, escalonados. É o efeito que faz a página "respirar" ao descer
 *    em vez de entregar tudo de uma vez.
 *
 * 2. **Cabeçalho com sombra ao rolar.** Sombra de verdade só quando passou do
 *    topo: no começo ela é sujeira visual sobre um fundo limpo.
 *
 * 3. **Barra de leitura.** Uma linha fininha no topo que mostra quanto da página
 *    já foi lida. Numa página de 9 seções, é a única forma de a pessoa saber
 *    onde está sem ler o menu.
 *
 * 4. **Paralaxe no celular do hero.** O aparelho sobe um pouco mais devagar que
 *    a página. Só no desktop, e nunca com movimento reduzido.
 *
 * DUAS REGRAS que o resto deste arquivo respeita:
 *
 * - **Sem JavaScript, tudo aparece.** A classe `js` no `<html>` só é adicionada
 *   por este arquivo, e é ela que habilita o estado "invisível" no CSS. Se o
 *   script falhar, for bloqueado ou demorar, a landing aparece inteira e
 *   estática — que é o estado correto, não um site quebrado. A alternativa
 *   (esconder no CSS e depender do JS para mostrar) deixa quem tem JS desligado
 *   olhando uma página em branco.
 *
 * - **`prefers-reduced-motion` mata tudo.** Quem pediu menos movimento no
 *   sistema recebe uma página estática e completa. É acessibilidade, e também
 * também é respeito por quem enjoa com transição.
 *
 * Os blocos animados são marcados por este próprio script (`data-anima`), e não
 * no HTML: assim a lista do que se move fica num lugar só, e o HTML não enche de
 * atributo que ninguém sabe para que serve.
 */

(function () {
  'use strict';

  var raiz = document.documentElement;

  /**
   * Estilos inline pela marcação `style="--i: 3"`: o atraso escalonado precisa
   * ser por elemento, e não dá para fazer isso em CSS sem `nth-child` para cada
   * quantidade possível de filhos.
   */
  var CONTAINERS = [
    '.hero-grid',
    '.section .container',
    '.privacy',
    '.site-footer .container',
  ];

  var semMovimento = window.matchMedia
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /**
   * Marca os blocos e mede o que será animado.
   *
   * `data-anima` só entra aqui — nunca no HTML — porque o CSS esconde os filhos
   * de `[data-anima]`. Marcar no HTML transformaria qualquer erro de carregamento
   * deste arquivo em uma página com buracos.
   */
  function preparar() {
    var marcados = [];
    for (var i = 0; i < CONTAINERS.length; i++) {
      var lista = document.querySelectorAll(CONTAINERS[i]);
      for (var j = 0; j < lista.length; j++) {
        lista[j].setAttribute('data-anima', '');
        marcados.push(lista[j]);
      }
    }
    return marcados;
  }

  /**
   * Escala o atraso: 8 filhos em 70ms cada dão quase meio segundo no fim da
   * lista, e o conjunto passa a parecer lento. Acima de 8, o atraso para de
   * crescer — melhor repetir dois simultâneos do que esperar.
   */
  function escalonar(container) {
    var filhos = container.children;
    for (var i = 0; i < filhos.length; i++) {
      filhos[i].style.setProperty('--i', Math.min(i, 8));
    }
  }

  function revelar() {
    if (!semMovimento && 'IntersectionObserver' in window) {
      raiz.classList.add('js');
      var blocos = preparar();

      var observador = new IntersectionObserver(
        function (entradas) {
          entradas.forEach(function (e) {
            if (!e.isIntersecting) return;
            escalonar(e.target);
            e.target.classList.add('entrou');
            observador.unobserve(e.target);
          });
        },
        // 12% do bloco visível já conta: um bloco grande (a galeria) pode nunca
        // chegar a 50% numa tela alta, e o efeito nunca dispararia.
        { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
      );

      blocos.forEach(function (b) {
        observador.observe(b);
      });

      // Blocos que já estão na tela ao carregar não podem esperar o observer:
      // sem isto, a primeira dobra fica invisível até o primeiro scroll.
      blocos.forEach(function (b) {
        const r = b.getBoundingClientRect();
        if (r.top < window.innerHeight * 0.92) {
          escalonar(b);
          b.classList.add('entrou');
          observador.unobserve(b);
        }
      });
    }
    if (semMovimento) raiz.classList.add('js'); // nenhum movimento, tudo visível
  }

  /**
   * Cabeçalho com sombra + barra de leitura, num `requestAnimationFrame` só.
   *
   * Um `scroll` handler que escreve estilo direto reflow a cada evento — e
   * `scroll` dispara mais vezes que os quadros na maioria dos navegadores. A
   * trava do rAF garante no máximo uma escrita por quadro.
   */
  function noScroll() {
    var cabecalho = document.querySelector('.site-header');
    var barra = document.createElement('div');
    barra.className = 'barra-leitura';
    barra.setAttribute('aria-hidden', 'true');

    if (!semMovimento && cabecalho) document.body.appendChild(barra);

    var pendente = false;
    function aplicar() {
      pendente = false;
      var y = window.scrollY || document.documentElement.scrollTop;
      if (cabecalho) cabecalho.classList.toggle('rolado', y > 8);
      if (barra) {
        var doc = document.documentElement;
        var total = doc.scrollHeight - window.innerHeight;
        var pct = total > 0 ? Math.min(100, (y / total) * 100) : 0;
        barra.style.transform = 'scaleX(' + pct / 100 + ')';
      }
    }
    function pedir() {
      if (pendente) return;
      pendente = true;
      window.requestAnimationFrame(aplicar);
    }

    window.addEventListener('scroll', pedir, { passive: true });
    window.addEventListener('resize', pedir);
    aplicar();
  }

  /**
   * Paralaxe do celular do hero.
   *
   * Só no desktop e com o hero ainda na tela: fora disso o cálculo é trabalho
   * jogado fora. O deslocamento é pequeno (até 60px) de propósito — parallax
   * exagerado é o que faz uma página parecer montada de peças soltas.
   */
  function parallax() {
    if (semMovimento) return;
    var visual = document.querySelector('.hero-visual');
    if (!visual) return;
    if (!window.matchMedia('(min-width: 981px)').matches) return;

    var pendente = false;
    function aplicar() {
      pendente = false;
      var y = window.scrollY || 0;
      if (y > window.innerHeight) {
        visual.style.transform = '';
        return;
      }
      visual.style.transform = 'translateY(' + Math.round(y * 0.12) + 'px)';
    }
    function pedir() {
      if (pendente) return;
      pendente = true;
      window.requestAnimationFrame(aplicar);
    }
    window.addEventListener('scroll', pedir, { passive: true });
    aplicar();
  }

  revelar();
  noScroll();
  parallax();
})();

(() => {
  const params = new URLSearchParams(location.search);
  const animationOverride = params.get('animation');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches || animationOverride === 'reduced';
  const forceNativeAnimation = animationOverride === 'native';
  document.documentElement.classList.add('js');
  console.log('[boot] script loaded', { reduceMotion });
  // Detect GSAP availability once for use across branches
  const hasGSAP = !forceNativeAnimation && (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined');
  // 提示但不提前 return，确保交互（点击跳转）仍然可用
  if (reduceMotion) {
    console.log('检测到 prefers-reduced-motion: reduce，已禁用复杂动画');
  }

  // --- STABILITY FIX: JS-LOCKED HEIGHT (TARGETED FOR FIREFOX iOS) ---
  // Fixes content jumping specifically on Firefox iOS when address bar toggles.
  const isFirefoxIOS = /FxiOS/.test(navigator.userAgent);

  if (isFirefoxIOS) {
    console.log('[Stability] Firefox iOS detected, enabling HARD height lock.');
    let lastWidth = window.innerWidth;
    
    function lockSceneHeight() {
      // Hard-set the pixel height on the elements directly. 
      // This overrides any CSS variability and is rock-solid.
      const height = window.innerHeight + 'px';
      const scenes = document.querySelectorAll('.scene');
      scenes.forEach(scene => {
        scene.style.minHeight = height;
      });
    }
    
    window.addEventListener('resize', () => {
      // Only refresh if width changes (orientation change)
      if (window.innerWidth !== lastWidth) {
        lastWidth = window.innerWidth;
        lockSceneHeight();
        if (hasGSAP) ScrollTrigger.refresh();
      }
    });
    
    // Lock immediately
    lockSceneHeight();
  }

  const debug = params.get('debug') === '1';
  // 平滑滚动显式开启，默认使用浏览器原生滚动。
  const useSmooth = params.get('smooth') === '1';
  const CONTACT_EMAIL = 'contact@eyayoo.com';
  const legalPage = document.querySelector('main.policy[data-legal-page]');
  // Storage may be unavailable in an embedded reader. Reading and switching
  // languages must remain usable without persistent preferences.
  function readPreference(key) {
    try { return localStorage.getItem(key); } catch { return null; }
  }
  function savePreference(key, value) {
    try { localStorage.setItem(key, value); } catch {}
  }
  function validLanguage(value) { return value === 'zh' || value === 'en' ? value : null; }

  function positionLegalAnchor() {
    if (!legalPage || location.hash !== '#data-deletion') return;
    requestAnimationFrame(() => {
      const target = document.getElementById('data-deletion');
      if (!target) return;
      const header = document.querySelector('.site-header');
      const headerBottom = header ? header.getBoundingClientRect().bottom : 0;
      target.style.scrollMarginTop = Math.max(24, headerBottom + 24) + 'px';
      target.scrollIntoView({ block: 'start', behavior: 'instant' });
    });
  }

  function syncLegalLanguage(lang) {
    if (legalPage) {
      // Keep a single public anchor, owned by the currently visible translation.
      legalPage.querySelectorAll('[data-legal-anchor]').forEach((heading) => {
        const section = heading.closest('[data-legal-lang]');
        heading.id = section.dataset.legalLang + '-' + heading.dataset.legalAnchor;
      });
      legalPage.querySelectorAll('[data-legal-lang]').forEach((section) => {
        section.hidden = section.dataset.legalLang !== lang;
        if (!section.hidden && section.dataset.title) document.title = section.dataset.title;
      });
      legalPage.querySelectorAll('[data-legal-anchor]').forEach((heading) => {
        if (heading.closest('[data-legal-lang]').dataset.legalLang === lang) heading.id = heading.dataset.legalAnchor;
      });
    }
    document.querySelectorAll('a[href]').forEach((link) => {
      // Related links follow the visible document, including header and footer navigation.
      const href = link.getAttribute('href');
      if (!href || href.startsWith('#')) return;
      let target;
      try { target = new URL(href, location.href); } catch { return; }
      if (!/^https?:$/.test(target.protocol)) return;
      if (target.origin !== location.origin && !['eyayoo.com', 'www.eyayoo.com'].includes(target.hostname)) return;
      if (!/\/(privacy|terms|mahjong-master-data-deletion|contacts)\.html$/.test(target.pathname)) return;
      const section = link.closest('[data-legal-lang]');
      target.searchParams.set('lang', section ? section.dataset.legalLang : lang);
      // Retain the original relative/absolute path and the existing fragment.
      const path = link.getAttribute('data-deletion-entry') !== null
        ? (/\/zh\//.test(location.pathname) ? '../privacy.html' : './privacy.html')
        : href.split(/[?#]/)[0];
      link.setAttribute('href', path + target.search + target.hash);
    });
    positionLegalAnchor();
  }

  if (legalPage) {
    window.addEventListener('hashchange', positionLegalAnchor);
    window.addEventListener('load', positionLegalAnchor);
    if (document.fonts) document.fonts.ready.then(positionLegalAnchor);
    // Native readers can inject their stylesheet after the document has loaded.
    // Reposition only when stylesheets change, not for ordinary DOM updates.
    if (typeof MutationObserver !== 'undefined' && document.head) {
      const readerStyles = new MutationObserver((records) => {
        if (records.some((record) => [...record.addedNodes, ...record.removedNodes]
          .some((node) => node.nodeName === 'STYLE' || node.nodeName === 'LINK'))) positionLegalAnchor();
      });
      readerStyles.observe(document.head, { childList: true });
    }
  }
  const configuredFormEndpoint = String(window.EYAYOO_CONFIG?.formspreeEndpoint || '').trim();
  const isProductionFormEndpoint = /^https:\/\/formspree\.io\/f\/[a-z0-9_-]+$/i.test(configuredFormEndpoint);
  // Loopback HTTP is accepted only so the production request path can be exercised locally without external calls.
  const isLocalTestEndpoint = /^http:\/\/(?:127\.0\.0\.1|localhost)(?::\d+)?\/[^\s]+$/i.test(configuredFormEndpoint);
  const formspreeEndpoint = isProductionFormEndpoint || isLocalTestEndpoint
    ? configuredFormEndpoint
    : '';
  // i18n
  const I18N = {
    zh: {
      nav: { home: '首页', products: '应用', about: '关于', contact: '联系', privacy: '隐私', terms: '条款' },
      hero: { title: '小小欢喜\n每天发生', sub: '独立制作的应用，\n陪你创作、学习与玩乐。', cta: '查看作品' },
      products: { title: '我们的产品', desc: '面向全球用户的移动应用，持续打磨体验与品质。' },
      about: { title: '关于我们', desc: 'Eyayoo Studio 自 2023 年起持续打造移动应用。目前公开发布的两款产品分别聚焦儿童创意绘画与麻将学习训练。我们重视清晰易用的体验，并持续完善产品内容。' },
      contact: {
        title: '联系我们', desc: '商务合作与支持，请通过邮箱联系。', subjectPh: '邮件标题', bodyPh: '邮件内容',
        copy: '复制邮箱', send: '发送邮件', sending: '发送中…', sent: '已发送',
        status: {
          copied: '已复制：{email}', copyFailed: '复制失败，请手动复制：{email}',
          blocked: '发送失败，请稍后再试。', wait: '请稍后再发送…',
          openingMail: '正在打开邮件客户端；如未自动打开，请点击：',
          success: '发送成功，我们会尽快回复你。', failed: '发送失败，请改用邮件：'
        }
      },
      productsCards: [
        { title: '儿童创意绘画', tag: '给小小创作者的绘画天地', desc: '在涂涂画画和趣味活动中探索色彩，把脑海里的想象变成自己的作品。' },
        { title: '麻将训练', tag: '从认识规则，到练习胡牌判断', desc: '通过由浅入深的练习熟悉麻将规则，在一道道题目中逐步建立判断能力。' }
      ]
    },
    en: {
      nav: { home: 'Home', products: 'Apps', about: 'About', contact: 'Contact', privacy: 'Privacy', terms: 'Terms' },
      hero: { title: 'Small joys\nmade daily', sub: 'Independent apps for creativity, learning, and play.', cta: 'View our apps' },
      products: { title: 'Our Products', desc: 'Mobile apps for everyone, polished with care.' },
      about: { title: 'About Us', desc: 'Eyayoo Studio has been creating mobile experiences since 2023. Our two published apps focus on children\'s creative drawing and practical mahjong learning. We keep refining each product with clear, approachable design and thoughtful updates.' },
      contact: {
        title: 'Contact Us', desc: 'For business and support inquiries, please email us.', subjectPh: 'Email subject', bodyPh: 'Email message',
        copy: 'Copy Email', send: 'Send Email', sending: 'Sending…', sent: 'Sent',
        status: {
          copied: 'Copied: {email}', copyFailed: 'Copy failed. Please copy manually: {email}',
          blocked: 'Unable to send. Please try again later.', wait: 'Please wait a moment before sending…',
          openingMail: 'Opening your email app. If it does not open, use:',
          success: 'Message sent. We will reply as soon as possible.', failed: 'Send failed. Please email us at:'
        }
      },
      productsCards: [
        { title: 'Funny Painting', tag: 'A creative playground for little artists', desc: 'Explore colors through drawing and playful activities. Turn everyday imagination into artwork of your own.' },
        { title: 'Mahjong Training', tag: 'Learn the rules. Build your judgment.', desc: 'Get to know mahjong through step-by-step practice. Build your winning-hand judgment, one challenge at a time.' }
      ]
    }
  };
  function activeContactText() {
    const lang = document.documentElement.lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
    return I18N[lang].contact;
  }

  function buildMailto(subject, body) {
    const query = new URLSearchParams();
    if (subject) query.set('subject', subject);
    if (body) query.set('body', body);
    const suffix = query.toString();
    return `mailto:${CONTACT_EMAIL}${suffix ? `?${suffix}` : ''}`;
  }

  function renderContactHint(element, messageKey, mailtoHref = '') {
    if (!element) return;
    const message = activeContactText().status[messageKey] || '';
    element.dataset.contactMessage = messageKey;
    element.dataset.mailtoHref = mailtoHref;
    element.replaceChildren(document.createTextNode(message.replace('{email}', CONTACT_EMAIL)));
    if (mailtoHref) {
      element.append(document.createTextNode(' '));
      const link = document.createElement('a');
      link.href = mailtoHref;
      link.textContent = CONTACT_EMAIL;
      element.append(link);
    }
  }

  function setSubmitState(button, state) {
    if (!button) return;
    button.dataset.contactState = state;
    const text = activeContactText();
    button.textContent = text[state] || text.send;
  }

  function applyI18n(lang) {
    const t = I18N[lang] || I18N.en;
    document.documentElement.lang = (lang === 'zh' ? 'zh-CN' : 'en');
    const setText = (id, val) => { const el = document.getElementById(id); if (el && val) el.textContent = val; };
    setText('nav-home', t.nav.home);
    setText('nav-products', t.nav.products);
    setText('nav-about', t.nav.about);
    setText('nav-contact', t.nav.contact);
    setText('nav-privacy', t.nav.privacy);
    setText('nav-terms', t.nav.terms);
    setText('hero-title', t.hero.title);
    setText('hero-sub', t.hero.sub);
    setText('hero-cta', t.hero.cta);
    setText('products-title', t.products.title);
    setText('products-desc', t.products.desc);
    setText('about-title', t.about.title);
    setText('about-desc', t.about.desc);
    setText('contact-title', t.contact.title);
    setText('contact-desc', t.contact.desc);
    const subj = document.getElementById('email-subject'); if (subj) subj.placeholder = t.contact.subjectPh;
    const body = document.getElementById('email-body'); if (body) body.placeholder = t.contact.bodyPh;
    const copyBtn = document.getElementById('copy-email');
    if (copyBtn) { copyBtn.textContent = t.contact.copy; copyBtn.setAttribute('aria-label', t.contact.copy); }
    const sendBtn = document.getElementById('email-submit');
    if (sendBtn) {
      sendBtn.setAttribute('aria-label', t.contact.send);
      setSubmitState(sendBtn, sendBtn.dataset.contactState || 'send');
    }
    document.querySelectorAll('[data-contact-message]').forEach((element) => {
      renderContactHint(element, element.dataset.contactMessage, element.dataset.mailtoHref || '');
    });
    const toggle = document.getElementById('lang-toggle'); if (toggle) toggle.textContent = (lang === 'zh' ? 'EN' : '中');
    // Store badges fixed to English per requirement
    const appBadge = document.getElementById('badge-appstore');
    const gpBadge = document.getElementById('badge-googleplay');
    if (appBadge) { appBadge.alt = 'Download on the App Store'; const a=appBadge.closest('a'); if (a) a.setAttribute('aria-label', 'Download on the App Store'); }
    if (gpBadge) { gpBadge.alt = 'GET IT ON Google Play'; const a=gpBadge.closest('a'); if (a) a.setAttribute('aria-label', 'GET IT ON Google Play'); }
    // Products cards
    if (t.productsCards && t.productsCards.length >= 2) {
      const c1 = t.productsCards[0], c2 = t.productsCards[1];
      setText('prod1-title', c1.title);
      setText('prod1-tag', c1.tag);
      setText('prod1-desc', c1.desc);
      setText('prod2-title', c2.title);
      setText('prod2-tag', c2.tag);
      setText('prod2-desc', c2.desc);
    }
    syncLegalLanguage(lang);
  }

  function setTheme(theme) {
    if (theme === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else if (theme === 'light') {
      document.documentElement.setAttribute('data-theme', 'light');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  }
  // 锚点配置（可在此调整默认路径锚点）
  function defaultAnchors() {
    return {
      home:  [{x:12,y:25},{x:78,y:28},{x:36,y:62}],
      apps:  [{x:48,y:34},{x:60,y:38},{x:42,y:30}],
      about: [{x:28,y:58},{x:38,y:64},{x:20,y:68}],
    };
  }
  function getAnchors() { return defaultAnchors(); }

  // 预放置全局光球到指定阶段，避免初始左上角闪烁
  function placeBallsAt(stage) {
    const anchors = getAnchors();
    const g1 = document.querySelector('.gball.g1');
    const g2 = document.querySelector('.gball.g2');
    const g3 = document.querySelector('.gball.g3');
    if (!g1 || !g2 || !g3) return;
    const vw = (v) => window.innerWidth * (v/100);
    const vh = (v) => window.innerHeight * (v/100);
    [g1,g2,g3].forEach((el, i) => {
      const p = anchors[stage][i];
      const x = vw(p.x), y = vh(p.y);
      el.style.transform = `translate(${x}px, ${y}px)`;
      el.style.opacity = '0.6';
    });
  }

  // 原生降级方案仅在 GSAP/ScrollTrigger 不可用时启动。

  const sections = Array.from(document.querySelectorAll('.scene'));
  const hasSceneAnimations = sections.length > 0 && Boolean(document.querySelector('#home'));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  function animate() {
    const vh = window.innerHeight;
    const sy = window.scrollY || window.pageYOffset;

    for (const sec of sections) {
      // Hero uses one CSS entrance and normal document scrolling in every mode.
      if (sec.id === 'home') continue;
      const rect = sec.getBoundingClientRect();
      const top = rect.top + sy; // section 顶部相对文档
      const h = sec.offsetHeight; // 约 300vh
      const start = top;
      const end = top + h - vh;
      const p = clamp01((sy - start) / Math.max(1, end - start)); // 0..1

      // 全局光球在原生模式下基于整体进度单独处理
      const h1 = sec.querySelector('h1');
      const h2 = sec.querySelector('h2');
      const pTag = sec.querySelector('p');

      //（装饰元素逻辑移交给全局光球）

      const textY = (1 - p) * 60; // 更快上移
      if (h1) { h1.style.transform = `translateY(${textY}%)`; }
      if (h2) { h2.style.transform = `translateY(${textY}%)`; }
      if (pTag) { pTag.style.transform = `translateY(${textY * 0.8}%)`; }

      // 产品：进入时整体略微放大 + 字间距
      if (sec.id === 'apps') {
        const s = 1 + Math.max(0, (p - 0.05)) * 0.03;
        if (h2) { h2.style.transform += ` scale(${s})`; h2.style.letterSpacing = `${(0.5 * p).toFixed(2)}px`; }
        if (pTag) { pTag.style.transform += ` scale(${s * 0.99})`; pTag.style.letterSpacing = `${(0.3 * p).toFixed(2)}px`; }
      }
      if (sec.id === 'apps') {
        // 基于视窗进入进度的淡入
        const enter = clamp01((vh - rect.top) / (vh * 0.85));
        // 标题与副标题：淡入 + 字距从 0.3em 收束至正常
        const titles = sec.querySelectorAll('.content > h2, .content > p');
        titles.forEach(el => {
          const y = lerp(60, 0, enter);
          const s = lerp(0.98, 1.02, enter);
          const ls = lerp(0.3, 0, enter);
          el.style.opacity = enter.toFixed(3);
          el.style.transform = `translateY(${y}px) scale(${s})`;
          el.style.letterSpacing = `${ls}em`;
        });
        // 卡片：顺序淡入 + 位移动画（无字距动画）
        const cards = sec.querySelectorAll('.card');
        const n = cards.length || 1;
        const base = enter;
        cards.forEach((card, i) => {
          const d = i / Math.max(1, n - 1);
          const local = clamp01((base - d * 0.45) / 0.25);
          const y = lerp(40, 0, local);
          const s = lerp(0.98, 1.02, local);
          card.style.transform = `translateY(${y}px) scale(${s})`;
          card.style.opacity = local.toFixed(3);
        });
      }
      if (sec.id === 'about') {
        const enter = clamp01((vh - rect.top) / (vh * 0.85));
        const ls = (0.3 - 0.3 * enter).toFixed(3) + 'em';
        if (h2) {
          const y = lerp(60, 0, enter);
          h2.style.opacity = enter.toFixed(3);
          h2.style.transform = `translateY(${y}px)`;
          h2.style.letterSpacing = ls;
        }
        if (pTag) {
          const yb = lerp(60, 0, enter);
          pTag.style.opacity = enter.toFixed(3);
          pTag.style.transform = `translateY(${yb}px)`;
          pTag.style.letterSpacing = ls;
        }
      }
      if (sec.id === 'contact') {
        const enter = clamp01((vh - rect.top) / (vh * 0.6));
        const ls = (0.3 - 0.3 * enter).toFixed(3) + 'em';
        if (h2) {
          const y = lerp(40, 0, enter);
          h2.style.opacity = enter.toFixed(3);
          h2.style.transform = `translateY(${y}px)`;
          h2.style.letterSpacing = ls;
        }
        if (pTag) {
          const yb = lerp(30, 0, enter);
          pTag.style.opacity = enter.toFixed(3);
          pTag.style.transform = `translateY(${yb}px)`;
          // pTag.style.letterSpacing = ls;
        }
      }
    }
    requestAnimationFrame(animate);
  }

  function showStaticContent(mode) {
    document.documentElement.dataset.animationMode = mode;
    document.documentElement.dataset.smoothScroll = 'native';
    document.querySelectorAll('.scene .content, .scene h1, .scene h2, .scene p, .scene .card, .scene .email-form').forEach((el) => {
      el.style.opacity = '1';
      el.style.transform = 'none';
      el.style.filter = 'none';
      el.style.letterSpacing = 'normal';
    });
    document.querySelectorAll('.gball').forEach((el) => {
      el.style.opacity = '0';
    });
  }

  function initGsapAnimations() {
    try {
      gsap.registerPlugin(ScrollTrigger);
      ScrollTrigger.config({ ignoreMobileResize: true });
      if (debug) ScrollTrigger.defaults({ markers: true });

      document.documentElement.dataset.animationMode = 'gsap';
      document.documentElement.dataset.smoothScroll = 'native';
      const isTouchDevice = params.get('input') === 'touch' || 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      if (useSmooth && typeof Lenis !== 'undefined' && !isTouchDevice) {
        const lenis = new Lenis({ smoothWheel: true, duration: 1.0 });
        document.documentElement.dataset.smoothScroll = 'lenis';
        function raf(time) {
          lenis.raf(time);
          ScrollTrigger.update();
          requestAnimationFrame(raf);
        }
        requestAnimationFrame(raf);
      }

      placeBallsAt('home');

      // GSAP drives the later scenes; Hero keeps its CSS entrance only.
      const contentScenes = document.querySelectorAll('.scene:not(#home)');
      contentScenes.forEach((scene) => {
        const elems = scene.querySelectorAll('.content > h2, .content > p, .content .card, .content > .email-form');
        const contentWrapper = scene.querySelector('.content');
        if (elems.length === 0 || !contentWrapper) return;

        gsap.set(elems, {
          y: 80,
          opacity: 0,
          scale: 0.92,
          filter: 'blur(10px)',
          transformOrigin: 'center center'
        });

        gsap.timeline({
          scrollTrigger: {
            trigger: contentWrapper,
            start: 'top 90%',
            end: 'bottom top',
            scrub: 0.5
          }
        })
          .to(elems, {
            y: 0,
            opacity: 1,
            scale: 1,
            filter: 'blur(0px)',
            duration: 0.45,
            stagger: 0.08,
            ease: 'power2.out'
          })
          .to(elems, { y: 0, duration: 0.1 })
          .to(elems, {
            y: -60,
            opacity: 0,
            scale: 0.96,
            filter: 'blur(5px)',
            duration: 0.45,
            stagger: 0.05,
            ease: 'power2.in'
          });
      });

      const anchors = getAnchors();
      const balls = [
        document.querySelector('.gball.g1'),
        document.querySelector('.gball.g2'),
        document.querySelector('.gball.g3')
      ];
      const vw = (value) => window.innerWidth * (value / 100);
      const vh = (value) => window.innerHeight * (value / 100);
      const point = (anchor) => ({ x: vw(anchor.x), y: vh(anchor.y) });
      const controls = (a, b, dx = 10, dy = 10) => [
        { x: a.x + vw(dx), y: a.y + vh(dy) },
        { x: b.x - vw(dx), y: b.y - vh(dy) }
      ];
      const bezier = (p0, p1, p2, p3, t) => {
        const u = 1 - t;
        return {
          x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
          y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
        };
      };

      ScrollTrigger.create({
        trigger: '#home',
        endTrigger: '#about',
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          const sets = [['home', 'apps'], ['apps', 'about']];
          const segment = Math.min(sets.length - 1, Math.floor(self.progress * sets.length));
          const segmentStart = segment / sets.length;
          const segmentEnd = (segment + 1) / sets.length;
          const segmentProgress = (self.progress - segmentStart) / (segmentEnd - segmentStart);
          const [from, to] = sets[segment];

          balls.forEach((ball, index) => {
            if (!ball) return;
            const start = point(anchors[from][index]);
            const end = point(anchors[to][index]);
            const [control1, control2] = controls(start, end, index === 1 ? 8 : 10, index === 2 ? 14 : 10);
            const position = bezier(start, control1, control2, end, segmentProgress);
            ball.style.transform = `translate(${position.x}px, ${position.y}px)`;
            ball.style.opacity = '0.6';
          });
        }
      });

      window.addEventListener('load', () => ScrollTrigger.refresh());
    } catch (e) {
      console.warn('[gsap] init error, using static content', e);
      showStaticContent('static');
    }
  }

  if (!hasSceneAnimations) {
    showStaticContent('none');
  } else if (reduceMotion) {
    showStaticContent('reduced');
  } else if (hasGSAP) {
    initGsapAnimations();
  } else {
    document.documentElement.dataset.animationMode = 'native';
    document.documentElement.dataset.smoothScroll = 'native';
    placeBallsAt('home');
    requestAnimationFrame(animate);
  }

  // 设备类型智能跳转：顶部 CTA 根据设备选择应用商店 + 卡片点击跳转对应平台
  (function smartLinks(){
    console.log('[smartLinks] init');
    // Hamburger menu toggle
    const toggle = document.getElementById('menu-toggle');
    const links = document.getElementById('nav-links');
    if (toggle && links) {
      const closeMenu = () => { links.classList.remove('open'); toggle.setAttribute('aria-expanded','false'); try { toggle.focus(); } catch {} };
      const openMenu = () => { links.classList.add('open'); toggle.setAttribute('aria-expanded','true'); };
      toggle.addEventListener('click', () => {
        const willOpen = !links.classList.contains('open');
        if (willOpen) openMenu(); else closeMenu();
      });
      // 点击下拉菜单区域任意处（含链接/按钮）即收起
      links.addEventListener('click', (e) => {
        // 允许链接正常跳转，再异步收起菜单
        setTimeout(closeMenu, 0);
      });
      // 点击菜单外部空白区域收起
      const outsideHandler = (e) => {
        if (!links.classList.contains('open')) return;
        const t = e.target;
        if (links.contains(t) || toggle.contains(t)) return;
        closeMenu();
      };
      document.addEventListener('click', outsideHandler, { passive: true, capture: true });
      document.addEventListener('touchstart', outsideHandler, { passive: true, capture: true });
      // 键盘 Esc 关闭菜单（无障碍）
      const escHandler = (e) => {
        if ((e.key === 'Escape' || e.key === 'Esc') && links.classList.contains('open')) {
          e.preventDefault();
          closeMenu();
        }
      };
      document.addEventListener('keydown', escHandler);
    }
    // Header scroll awareness
    const header = document.querySelector('.site-header');
    const onScroll = () => {
      if (!header) return;
      const y = window.scrollY || document.documentElement.scrollTop || 0;
      if (y > 10) header.classList.add('scrolled'); else header.classList.remove('scrolled');
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    // Language toggle + auto-detect from browser
    const langBtn = document.getElementById('lang-toggle');
    const urlLang = validLanguage(params.get('lang'));
    const storedLang = validLanguage(readPreference('lang'));
    const browserLangRaw = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const browserLang = (browserLangRaw || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const docDefault = (document.documentElement.lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    // Use preset decided in head to avoid flash, fallback to existing order
    const headPreset = validLanguage(document.documentElement.getAttribute('data-preset-lang'));
    // Root legal URLs are shared by apps: explicit parameters, then browser
    // language. /zh/ remains a complete Chinese entrypoint even without JS.
    const legalDefault = /\/(?:zh)\//.test(location.pathname || '') ? 'zh' : browserLang;
    const preset = urlLang || (legalPage ? legalDefault : headPreset || storedLang || docDefault || browserLang);
    try {
      applyI18n(preset);
      if (urlLang) savePreference('lang', preset);
      // Reveal page after i18n applied (no-flash)
      document.documentElement.classList.remove('no-i18n-flash');
    } catch {}
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const cur = document.documentElement.lang.toLowerCase().startsWith('zh') ? 'zh' : 'en';
        const next = (cur === 'zh' ? 'en' : 'zh');
        savePreference('lang', next);
        applyI18n(next);
        if (legalPage) {
          const address = new URL(location.href);
          address.searchParams.set('lang', next);
          window.history.replaceState(null, '', address.href);
        }
      });
    }

    // Theme toggle (light/dark)
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themePreset = readPreference('theme') || (prefersDark ? 'dark' : 'light');
    setTheme(themePreset);
    if (themeBtn) {
      themeBtn.textContent = (themePreset === 'dark' ? '☀︎' : '☾');
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || themePreset;
        const next = (cur === 'dark' ? 'light' : 'dark');
        setTheme(next);
        savePreference('theme', next);
        themeBtn.textContent = (next === 'dark' ? '☀︎' : '☾');
      });
    }
    const el = document.getElementById('smart-cta');
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const platformOverride = params.get('platform');
    const isAndroid = platformOverride ? platformOverride === 'android' : /Android/i.test(ua);
    const isIOS = platformOverride ? platformOverride === 'ios' : /iPhone|iPad|iPod/i.test(ua);
    // Adapt icons to the device; download navigation uses native links.
    const grid = document.getElementById('product-grid');
    if (grid) {

      const storePlatform = isAndroid ? 'android' : 'ios';
      document.documentElement.dataset.storePlatform = storePlatform;
      grid.querySelectorAll('.card').forEach((card) => {
        const storeName = card.getAttribute(`data-${storePlatform}-name`) || '';
        const storeIcon = card.getAttribute(`data-${storePlatform}-icon`) || '';
        const icon = card.querySelector('.icon');
        if (icon && storeIcon) {
          icon.src = storeIcon;
          icon.alt = `${storeName || 'Product'} icon`;
        }
      });

    } else {
      console.log('[smartLinks] product-grid not found');
    }

    // Contact: copy address, use mailto by default, or submit to an explicitly configured Formspree endpoint.
    const copyBtn = document.getElementById('copy-email');
    if (copyBtn) {
      const hint = document.getElementById('copy-hint');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(CONTACT_EMAIL);
          renderContactHint(hint, 'copied');
        } catch (error) {
          renderContactHint(hint, 'copyFailed');
        }
      });
    }

    const formEl = document.getElementById('email-form');
    if (formEl) {
      const started = document.getElementById('email-started');
      if (started) started.value = String(Date.now());
      const submitBtn = document.getElementById('email-submit');
      const submitHint = document.getElementById('submit-hint');
      formEl.addEventListener('submit', async (event) => {
        event.preventDefault();
        const subject = (document.getElementById('email-subject')?.value || '').trim();
        const body = (document.getElementById('email-body')?.value || '').trim();
        const hp = (document.getElementById('hp')?.value || '').trim();
        const startedVal = parseInt(document.getElementById('email-started')?.value || '0', 10);
        const mailtoHref = buildMailto(subject, body);

        if (hp) {
          renderContactHint(submitHint, 'blocked');
          return;
        }
        if (!Number.isFinite(startedVal) || Date.now() - startedVal < 2500) {
          renderContactHint(submitHint, 'wait');
          return;
        }
        if (!formspreeEndpoint) {
          renderContactHint(submitHint, 'openingMail', mailtoHref);
          window.location.href = mailtoHref;
          return;
        }

        if (submitBtn) submitBtn.disabled = true;
        setSubmitState(submitBtn, 'sending');
        try {
          const response = await fetch(formspreeEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
            body: JSON.stringify({ subject, message: body, page: location.href, ua: navigator.userAgent })
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
          renderContactHint(submitHint, 'success');
          setSubmitState(submitBtn, 'sent');
        } catch (error) {
          console.warn('[contact] Formspree request failed', error);
          renderContactHint(submitHint, 'failed', mailtoHref);
          setSubmitState(submitBtn, 'send');
        } finally {
          if (submitBtn) submitBtn.disabled = false;
        }
      });
    }
  })();

})();

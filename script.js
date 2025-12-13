(() => {
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add('js');
  console.log('[boot] script loaded', { reduceMotion });
  // Detect GSAP availability once for use across branches
  const hasGSAP = (typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined');
  // 小屏（竖屏/近方屏）用于阈值判断（不再禁用动画）
  const smallScreen = window.matchMedia('(max-width: 600px)').matches;
  // 窗口高度较短（例如笔记本占用较多浏览器 UI 或窗口高度较小）时，推迟 About 的进入，减少与 Apps 的视觉交叠
  const shortHeight = window.matchMedia('(max-height: 740px)').matches;



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
        ScrollTrigger.refresh(); 
      }
    });
    
    // Lock immediately
    lockSceneHeight();
  }

  // If local GSAP and ScrollTrigger are available, enable advanced animations
  const params = new URLSearchParams(location.search);
  const debug = params.get('debug') === '1';
  // 平滑滚动改为“显式开启”，避免惯性导致多次手势
  const useSmooth = true;
  // i18n
  const I18N = {
    zh: {
      nav: { home: '首页', products: '应用', about: '关于', contact: '联系', privacy: '隐私', terms: '条款' },
      hero: { title: '小小欢喜，每天发生', sub: '为每个日常时刻而作' },
      products: { title: '我们的产品', desc: '面向全球用户的移动应用，持续打磨体验与品质。' },
      about: { title: '关于我们', desc: '自 2023 年起，我们从一人起步，成长为一支热忱且专业的团队，致力于让每天都更有趣。目前发布的两款产品收获了来自美国、英国、中国、巴西、香港、日本、比利时、法国、德国等地区玩家的下载与支持。我们专注每一个细节，持续打磨，力求打造独特的移动体验；旅程不会停下，始终以创造被玩家真心喜爱的产品为目标。' },
      contact: { title: '联系我们', desc: '商务合作与支持，请通过邮箱联系。', subjectPh: '邮件标题', bodyPh: '邮件内容', copy: '复制邮箱', send: '发送邮件' },
      productsCards: [
        { title: '儿童奇妙绘画馆 - 绘画启蒙', tag: '教育 / 绘画启蒙', desc: '从简单线条到色彩搭配，帮助儿童快乐启蒙与创意表达，支持离线创作与家长共享。' },
        { title: '麻将训练 - 大师之路', tag: '益智 / 训练', desc: '通过专项训练与实战练习提升麻将技巧，随时随地巩固牌技，助你迈向大师之路。' }
      ]
    },
    en: {
      nav: { home: 'Home', products: 'Apps', about: 'About', contact: 'Contact', privacy: 'Privacy', terms: 'Terms' },
      hero: { title: 'Small joys, made daily', sub: 'Crafting delight for all' },
      products: { title: 'Our Products', desc: 'Mobile apps for everyone, polished with care.' },
      about: { title: 'About Us', desc: 'Since 2023, what began as one person in a room has grown into a passionate, professional team devoted to making every day more entertaining. The two titles we have released have already welcomed players from the United States, United Kingdom, China, Brazil, Hong Kong, Japan, Belgium, France, and Germany. We pour our hearts into every detail, refining relentlessly to craft distinctive mobile experiences. Our journey never stops, and we are committed to building products that players truly love.' },
      contact: { title: 'Contact Us', desc: 'For business and support inquiries, please email us.', subjectPh: 'Email subject', bodyPh: 'Email message', copy: 'Copy Email', send: 'Send Email' },
      productsCards: [
        { title: 'Funny Painting — Enlightenment', tag: 'Education / Painting', desc: 'From simple lines to colors, inspire children’s creativity with offline support and easy sharing.' },
        { title: 'Mahjong Training — Be a Master', tag: 'Puzzle / Training', desc: 'Improve skills with drills and practice anytime, anywhere. Step onto the path to mastery.' }
      ]
    }
  };
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
    setText('products-title', t.products.title);
    setText('products-desc', t.products.desc);
    setText('about-title', t.about.title);
    setText('about-desc', t.about.desc);
    setText('contact-title', t.contact.title);
    setText('contact-desc', t.contact.desc);
    const subj = document.getElementById('email-subject'); if (subj) subj.placeholder = t.contact.subjectPh;
    const body = document.getElementById('email-body'); if (body) body.placeholder = t.contact.bodyPh;
    const copyBtn = document.getElementById('copy-email'); if (copyBtn) copyBtn.textContent = t.contact.copy;
    const sendBtn = document.getElementById('email-submit'); if (sendBtn) sendBtn.textContent = t.contact.send;
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
  // 动画幅度可调常量（全局复用：GSAP 与原生分支一致）
  const CARD_SCALE_MAX = 1.035; // 卡片最大缩放
  const H3_LETTER_MAX = 0.6;    // 标题最大字距(px)

  // 锚点配置（可在此调整默认路径锚点）
  function defaultAnchors() {
    return {
      home:  [{x:12,y:25},{x:78,y:28},{x:36,y:62}],
      apps:  [{x:48,y:34},{x:60,y:38},{x:42,y:30}],
      about: [{x:28,y:58},{x:38,y:64},{x:20,y:68}],
    };
  }
  function getAnchors() { return defaultAnchors(); }

  // 将段落拆分为片段，便于逐行/逐句淡入
  function splitSegments(el) {
    if (!el) return [];
    const text = (el.textContent || '').trim();
    if (!text) return [];
    const parts = text.split(/(?<=[。！？!?]|，|,)/).filter(Boolean);
    if (parts.length <= 1) return [];
    el.textContent = '';
    return parts.map((part) => {
      const span = document.createElement('span');
      span.textContent = part;
      span.style.display = 'block';
      span.style.opacity = '0';
      span.style.transform = 'translateY(30px)';
      el.appendChild(span);
      return span;
    });
  }

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

  if (!reduceMotion && hasGSAP) {
    try {
      gsap.registerPlugin(ScrollTrigger);
      // Prevent layout jumps on mobile address bar toggle
      ScrollTrigger.config({ ignoreMobileResize: true });
      
      if (debug) ScrollTrigger.defaults({ markers: true });
      // 平滑滚动（可选）：仅在非触摸设备上启用 Lenis
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      const useSmooth = true;
      let lenis;
      if (useSmooth && typeof Lenis !== 'undefined' && !isTouchDevice) {
        lenis = new Lenis({ smoothWheel: true, duration: 1.0 });
        function raf(time) { lenis.raf(time); ScrollTrigger.update(); requestAnimationFrame(raf); }
        requestAnimationFrame(raf);
      }

      // 初始态
      // GSAP aniamtions are disabled for layout debugging.
      const visionBody = document.querySelector('#about .content p');
      if (visionBody) {
        visionBody.__segments = splitSegments(visionBody);
        // 父元素需保持可见，交由子片段控制透明度
        visionBody.style.opacity = '1';
      }

      // 初始放置光球至 home 锚点
      placeBallsAt('home');

      /* --- ANIMATIONS DISABLED FOR LAYOUT DEBUGGING ---

      // 首屏：直接按滚动进度响应（上移 + 放大 + 字距），线性跟随
      gsap.set('#home .content', { opacity: 1 });
      ScrollTrigger.create({
        trigger: '#home', start: 'top top', end: '+=80%', scrub: true,
        onUpdate: (self) => {
          const p = self.progress; // 0..1
          const y = -140 * p; // 更直接的上移反馈
          const s1 = 1 + 0.12 * p; // h1 放大（均匀）
          const s2 = 1 + 0.09 * p; // p 放大（均匀）
          const ls = (0.5 * p).toFixed(3) + 'em';
          gsap.set('#home .content', { y });
          gsap.set('#home .content h1', { scale: s1, letterSpacing: ls, transformOrigin: '50% 0%' });
          gsap.set('#home .content p',  { scale: s2, letterSpacing: ls, transformOrigin: '50% 0%' });
          // 出场淡出，从 60% 开始逐步降低不透明度
          const op = 1 - Math.max(0, (p - 0.6) / 0.4);
          gsap.set('#home .content', { opacity: op });
        }
      });

      const productsTl = gsap.timeline({ paused: true })
        .to('#apps .content h2, #apps .content p', { opacity: 1, y: 0, scale: 1, letterSpacing: '0em', duration: 0.45, ease: 'power1.out' }, 0)
        .to('#apps .card', { opacity: 1, y: 0, scale: 1, stagger: { each: 0.18 }, duration: 0.45, ease: 'power2.out' }, 0.1);

      // ScrollTrigger 驱动：直接以本段滚动进度控制时间轴
      ScrollTrigger.create({
        trigger: '#apps',
        // 在短视口高度下，略晚开始且更早结束，减少与 About 的交叠
        start: shortHeight ? 'top 85%' : 'top 80%',
        end:   shortHeight ? 'top 30%' : 'top 10%',
        scrub: true,
        animation: productsTl
      });

      const aboutTl = gsap.timeline({ paused: true })
      // 标题保持字间距动画（因为标题通常很短，不容易换行）
      .fromTo('#about .content h2', { y: 60, opacity: 0, letterSpacing: '0.3em' }, { y: 0, opacity: 1, letterSpacing: '0em', ease: 'none', duration: 0.5 }, 0)
      // 正文段落移除 letterSpacing，只保留位移和透明度
      .fromTo('#about .content p',  { y: 60, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.5 }, 0);
      ScrollTrigger.create({
        trigger: '#about',
        start: () => 'top bottom',
        end:   () => '+=420',
        scrub: true,
        animation: aboutTl
      });

      const contactTl = gsap.timeline({ paused: true })
      .fromTo('#contact .content h2', { y: 40, opacity: 0, letterSpacing: '0.3em' }, { y: 0, opacity: 1, letterSpacing: '0em', ease: 'none', duration: 0.5 }, 0)
      // 只保留位移和透明度，正文不再动字间距
      .fromTo('#contact .content p',  { y: 30, opacity: 0 }, { y: 0, opacity: 1, ease: 'none', duration: 0.5 }, 0.05);
      ScrollTrigger.create({
        trigger: '#contact',
        start: 'top 95%',
        end:   'top 25%',
        scrub: true,
        animation: contactTl
      });

      // 跨屏全局光球（GSAP）：分段贝塞尔连接各屏锚点（hero -> products -> vision）
    const g1 = document.querySelector('.gball.g1');
    const g2 = document.querySelector('.gball.g2');
    const g3 = document.querySelector('.gball.g3');
    const anchors = getAnchors();
    const balls = [g1,g2,g3];
    function vw(v){ return window.innerWidth * (v/100); }
    function vh(v){ return window.innerHeight * (v/100); }
    function bezier(p0,p1,p2,p3,t){ const u=1-t; return { x:u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
                                                            y:u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y};}
    function pt(vwvh){ return { x: vw(vwvh.x), y: vh(vwvh.y) }; }
    function segCtrl(a,b,dx=10,dy=10){ return [ {x: a.x + vw(dx), y: a.y + vh(dy)}, {x: b.x - vw(dx), y: b.y - vh(dy)} ]; }

      ScrollTrigger.create({
        trigger: '#home', endTrigger: '#about', start: 'top top', end: 'bottom top', scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const sets = [['home','apps'], ['apps','about']];
          const segLen = sets.length;
          const seg = Math.min(segLen-1, Math.floor(p*segLen));
          const segStart = seg/segLen, segEnd = (seg+1)/segLen;
          const tSeg = (p - segStart)/(segEnd - segStart);
          const [from,to] = sets[seg];
          [0,1,2].forEach((i)=>{
            const a = pt(anchors[from][i]); const b = pt(anchors[to][i]);
            const [c1,c2] = segCtrl(a,b, (i===1?8:10), (i===2?14:10));
            const pos = bezier(a,c1,c2,b, tSeg); const el=balls[i];
            if (el) el.style.transform = `translate(${pos.x}px, ${pos.y}px)`;
          });
          // 保持光球透明度一致
          [g1,g2,g3].forEach(el => { if (el) el.style.opacity = '0.6'; });
        }
      });

      */




    // 取消整页淡入，避免“页面已显示后再整体淡入”的观感

    // 取消整页淡入，避免“页面已显示后再整体淡入”的观感
    } catch (e) {
      console.warn('[gsap] init error', e);
    }
  }

  // 纯原生方案（在未启用 reduce motion 且未加载 GSAP 时使用）：
  // 保留小屏动画；稳定性靠 svh 与短高度触发策略

  const sections = Array.from(document.querySelectorAll('.scene'));
  const lerp = (a, b, t) => a + (b - a) * t;
  const clamp01 = (v) => Math.max(0, Math.min(1, v));
  // 预拆分第三屏正文，供原生分支使用
  const nativeVisionBody = document.querySelector('#about .content p');
  if (nativeVisionBody && !nativeVisionBody.__segments) {
    nativeVisionBody.__segments = splitSegments(nativeVisionBody);
  }

  function animate() {
    const vh = window.innerHeight;
    const sy = window.scrollY || window.pageYOffset;

    for (const sec of sections) {
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

      // 首屏文字：随滚动放大与横向拉伸（替代 letter-spacing，避免布局抖动）
      if (sec.id === 'home') {
        const s1 = 1 + p * 0.12; // 1.00 -> 1.12
        const s2 = 1 + p * 0.09; // 1.00 -> 1.09
        const ls = (0.5 * p).toFixed(3) + 'em';
        if (h1) { h1.style.transform += ` scale(${s1})`; h1.style.letterSpacing = ls; }
        if (pTag) { pTag.style.transform += ` scale(${s2})`; pTag.style.letterSpacing = ls; }
      }

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
        const titles = sec.querySelectorAll('.content h2, .content p');
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
        // --- MODERN ANIMATION RESTORATION ---
        
        // Performance: Reduce blur radius on small screens (mobile) to prevent jank
        const blurAmount = smallScreen ? '4px' : '10px';

        // 1. Hero Section: Parallax Exit with Blur
        // As you scroll down, the hero text fades out, moves up, and blurs
        gsap.to('#home .content', {
          scrollTrigger: {
            trigger: '#home',
            start: 'top top',
            end: 'bottom center', 
            scrub: true
          },
          y: -50,
          opacity: 0,
          scale: 1.25,
          filter: `blur(${blurAmount})`, // Adaptive blur
          ease: 'none'
        });
  
        // 2. Content Sections: Timeline Scrub (Lifecycle)
        // Instead of triggering a one-off animation, we link the animation progress directly to the scrollbar.
        // This creates a "movie strip" effect where you can scrub back and forth through the entrance and exit.
        
        const contentScenes = document.querySelectorAll('.scene:not(#home)');
        
        contentScenes.forEach(scene => {
          // Select target elements within this specific scene
          const elems = scene.querySelectorAll('h2, p, .card, .email-form');
          // Use the actual content wrapper as the trigger to ensure animation aligns with visible content
          const contentWrapper = scene.querySelector('.content'); 
          
          if (elems.length === 0 || !contentWrapper) return;

          // Set initial state: Lower down, smaller, and blurred for depth
          gsap.set(elems, { 
            y: 80, 
            opacity: 0, 
            scale: 0.92, 
            filter: 'blur(10px)',
            transformOrigin: "center center"
          });

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: contentWrapper, 
              start: "top 90%",    
              end: "bottom top",   
              scrub: 0.5           
            }
          });

          // Define the timeline sequence relative to the scroll distance (0% to 100%)
          tl
            // 0% - 45%: Entrance (Deep Rise + Focus + Zoom In)
            .to(elems, {
              y: 0,
              opacity: 1,
              scale: 1,
              filter: 'blur(0px)', // Clear focus
              duration: 0.45, 
              stagger: 0.08, // Tighter stagger for cohesive feel
              ease: "power2.out"
            })
            // 45% - 55%: Hold (Crystal clear center stage)
            .to(elems, {
              y: 0, 
              duration: 0.1 
            })
            // 55% - 100%: Exit (Float Away + Blur Out + Slight Zoom Out)
            .to(elems, {
              y: -60,
              opacity: 0,
              scale: 0.96, // Subtle recession
              filter: 'blur(5px)', // Soft exit
              duration: 0.45, 
              stagger: 0.05,
              ease: "power2.in"
            });
        });
  
              // 3. Global Decor Balls: Bézier Curve Path Animation
              // This restores the complex path movement for the background balls
              const g1 = document.querySelector('.gball.g1');
              const g2 = document.querySelector('.gball.g2');
              const g3 = document.querySelector('.gball.g3');
              const anchors = getAnchors();
              const balls = [g1,g2,g3];
              
              // Helper functions for path calculation
              function vw(v){ return window.innerWidth * (v/100); }
              function vh(v){ return window.innerHeight * (v/100); }
              function bezier(p0,p1,p2,p3,t){ 
                const u = 1 - t; 
                return { 
                  x: u*u*u*p0.x + 3*u*u*t*p1.x + 3*u*t*t*p2.x + t*t*t*p3.x,
                  y: u*u*u*p0.y + 3*u*u*t*p1.y + 3*u*t*t*p2.y + t*t*t*p3.y
                };
              }
              function pt(vwvh){ return { x: vw(vwvh.x), y: vh(vwvh.y) }; }
              function segCtrl(a,b,dx=10,dy=10){ 
                return [ {x: a.x + vw(dx), y: a.y + vh(dy)}, {x: b.x - vw(dx), y: b.y - vh(dy)} ]; 
              }
        
              ScrollTrigger.create({
                trigger: '#home', 
                endTrigger: '#about', 
                start: 'top top', 
                end: 'bottom top', 
                scrub: true,
                onUpdate: (self) => {
                  const p = self.progress;
                  // Define segments: Home -> Apps, Apps -> About
                  const sets = [['home','apps'], ['apps','about']];
                  const segLen = sets.length;
                  // Calculate which segment we are currently in
                  const seg = Math.min(segLen-1, Math.floor(p*segLen));
                  const segStart = seg/segLen;
                  const segEnd = (seg+1)/segLen;
                  // Normalized progress (0..1) within the current segment
                  const tSeg = (p - segStart)/(segEnd - segStart);
                  
                  const [from,to] = sets[seg];
                  
                  [0,1,2].forEach((i)=>{
                    if (!balls[i]) return;
                    const a = pt(anchors[from][i]); 
                    const b = pt(anchors[to][i]);
                    // Control points for the curve
                    const [c1,c2] = segCtrl(a,b, (i===1?8:10), (i===2?14:10));
                    
                    const pos = bezier(a,c1,c2,b, tSeg); 
                    balls[i].style.transform = `translate(${pos.x}px, ${pos.y}px)`;
                    balls[i].style.opacity = '0.6'; // Ensure visibility
                  });
                }
              });

      // Ensure layout is stable before calculating trigger positions
      window.addEventListener("load", () => ScrollTrigger.refresh());  // 已移除整页淡入：初始即为可见，通过位移/缩放/字距实现进入/离场节奏

  // 首次进入：Hero 文案打字效果（按站点语言优先级选择：URL > localStorage > docDefault）
  (function typeIntro() {
    const h1 = document.querySelector('#home .content h1');
    const p = document.querySelector('#home .content p');
    const wrap = document.querySelector('#home .content');
    if (!h1 || !p) return;
    // 语言选择与文案来源（避免受浏览器语言干扰）
    const params = new URLSearchParams(location.search);
    const urlLang = params.get('lang');
    const storedLang = localStorage.getItem('lang');
    const docDefault = (document.documentElement.lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const presetAttr = document.documentElement.getAttribute('data-preset-lang');
    const lang = presetAttr || urlLang || storedLang || docDefault;
    const t = (typeof I18N !== 'undefined' && I18N[lang]) ? I18N[lang] : (I18N && I18N.en);
    const text1 = (t && t.hero && t.hero.title) ? t.hero.title : (h1.textContent || '').trim();
    const text2 = (t && t.hero && t.hero.sub) ? t.hero.sub : (p.textContent || '').trim();
    // 确保首屏可见以显示打字动画
    try { if (wrap) wrap.style.opacity = '1'; } catch {}
    h1.textContent = '';
    p.textContent = '';
    let i = 0, j = 0;
    const speed1 = 30; // ms per char
    const speed2 = 18;
    function stepH1() {
      if (i <= text1.length) {
        h1.textContent = text1.slice(0, i++);
        setTimeout(stepH1, speed1);
      } else {
        setTimeout(stepP, 120);
      }
    }
    function stepP() {
      if (j <= text2.length) {
        p.textContent = text2.slice(0, j++);
        setTimeout(stepP, speed2);
      }
    }
    // Avoid typing while page is hidden by no-i18n-flash
    (function waitVisible(){
      if (!document.documentElement.classList.contains('no-i18n-flash')) { stepH1(); }
      else { setTimeout(waitVisible, 30); }
    })();
  })();

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
    const urlLang = (new URLSearchParams(location.search)).get('lang');
    const storedLang = localStorage.getItem('lang');
    const browserLangRaw = (navigator.languages && navigator.languages[0]) || navigator.language || '';
    const browserLang = (browserLangRaw || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    const docDefault = (document.documentElement.lang || '').toLowerCase().startsWith('zh') ? 'zh' : 'en';
    // Use preset decided in head to avoid flash, fallback to existing order
    const headPreset = document.documentElement.getAttribute('data-preset-lang');
    const preset = headPreset || urlLang || storedLang || docDefault || browserLang;
    try {
      applyI18n(preset);
      if (urlLang) localStorage.setItem('lang', preset);
      // Reveal page after i18n applied (no-flash)
      document.documentElement.classList.remove('no-i18n-flash');
    } catch {}
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        const cur = localStorage.getItem('lang') || preset;
        const next = (cur === 'zh' ? 'en' : 'zh');
        localStorage.setItem('lang', next);
        applyI18n(next);
      });
    }

    // Theme toggle (light/dark)
    const themeBtn = document.getElementById('theme-toggle');
    const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const themePreset = localStorage.getItem('theme') || (prefersDark ? 'dark' : 'light');
    setTheme(themePreset);
    if (themeBtn) {
      themeBtn.textContent = (themePreset === 'dark' ? '☀︎' : '☾');
      themeBtn.addEventListener('click', () => {
        const cur = document.documentElement.getAttribute('data-theme') || themePreset;
        const next = (cur === 'dark' ? 'light' : 'dark');
        setTheme(next);
        localStorage.setItem('theme', next);
        themeBtn.textContent = (next === 'dark' ? '☀︎' : '☾');
      });
    }
    const el = document.getElementById('smart-cta');
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isAndroid = /Android/i.test(ua);
    const isIOS = /iPhone|iPad|iPod/i.test(ua);
    // 顶部按钮已移除，此处仅保留卡片点击跳转
    // 卡片点击：跳转到对应平台链接（来自 data-ios / data-android）
    const grid = document.getElementById('product-grid');
    if (grid) {
      console.log('[smartLinks] grid found, binding handlers');
      grid.addEventListener('click', (e) => {
        // 若点击了卡片内的锚点（如“Learn Mahjong →”），交给默认导航处理
        if (e.target && e.target.closest('a')) {
          return; // 不触发卡片整卡跳转
        }
        const card = e.target.closest('.card');
        if (!card) return console.log('[smartLinks] click but not on card');
        const ios = card.getAttribute('data-ios') || '#';
        const android = card.getAttribute('data-android') || '#';
        const target = isIOS ? ios : (isAndroid ? android : ios);
        console.log('[smartLinks] card click', { isIOS, isAndroid, ios, android, target });
        if (target && target !== '#') {
          try {
            const w = window.open(target, '_blank');
            if (w) w.opener = null;
          } catch (err) {
            console.warn('[smartLinks] navigation error', err);
          }
        }
      });
      grid.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          const card = e.target.closest('.card');
          if (!card) return;
          e.preventDefault();
          const ios = card.getAttribute('data-ios') || '#';
          const android = card.getAttribute('data-android') || '#';
          const target = isIOS ? ios : (isAndroid ? android : ios);
          console.log('[smartLinks] card keydown', e.key, { isIOS, isAndroid, ios, android, target });
          if (target && target !== '#') {
            try {
              const w = window.open(target, '_blank');
              if (w) w.opener = null;
            } catch (err) {
              console.warn('[smartLinks] navigation error', err);
            }
          }
        }
      });
    } else {
      console.log('[smartLinks] product-grid not found');
    }

    // Contact: build mailto and open client
    const copyBtn = document.getElementById('copy-email');
    if (copyBtn) {
      const email = 'contact@eyayoo.com';
      const hint = document.getElementById('copy-hint');
      copyBtn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(email);
          if (hint) { hint.textContent = '已复制：' + email; }
        } catch (e) {
          if (hint) { hint.textContent = '复制失败，请手动复制：' + email; }
        }
      });
    }

    // Formspree integration (发送邮件)
    const FORMSPREE_ENDPOINT = 'https://formspree.io/f/your_form_id'; // TODO: replace with your Formspree endpoint
    const formEl = document.getElementById('email-form');
    if (formEl) {
      const started = document.getElementById('email-started');
      if (started) started.value = String(Date.now());
    }
    const submitBtn = document.getElementById('email-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const subject = (document.getElementById('email-subject')?.value || '').trim();
        const body = (document.getElementById('email-body')?.value || '').trim();
        const hp = (document.getElementById('hp')?.value || '').trim();
        const startedVal = parseInt(document.getElementById('email-started')?.value || '0', 10);
        const submitHint = document.getElementById('submit-hint');
        // Basic validations
        if (hp) { if (submitHint) submitHint.textContent = '发送失败，请稍后再试。'; return; }
        if (Date.now() - startedVal < 2500) { if (submitHint) submitHint.textContent = '请稍后再发送…'; return; }
        // Fallback if endpoint not configured
        if (!FORMSPREE_ENDPOINT || FORMSPREE_ENDPOINT.includes('your_form_id')) {
          const href = 'mailto:contact@eyayoo.com' + (subject || body ? ('?' + [subject?('subject='+encodeURIComponent(subject)):'', body?('body='+encodeURIComponent(body)):''].filter(Boolean).join('&')) : '');
          if (submitHint) submitHint.textContent = '未配置服务，已改用邮件客户端…';
          try { window.location.href = href; } catch(e){ console.warn('mailto error', e); }
          return;
        }
        submitBtn.disabled = true; const prev = submitBtn.textContent; submitBtn.textContent = '发送中…';
        fetch(FORMSPREE_ENDPOINT, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept':'application/json' },
          body: JSON.stringify({ subject, message: body, page: location.href, ua: navigator.userAgent })
        }).then(async (res) => {
          if (!res.ok) throw new Error('HTTP '+res.status);
          if (submitHint) submitHint.textContent = '发送成功，我们会尽快回复你。';
          submitBtn.textContent = '已发送';
        }).catch((e) => {
          console.warn('formspree error', e);
          if (submitHint) submitHint.textContent = '发送失败，请直接发送邮件：contact@eyayoo.com';
          submitBtn.textContent = prev;
        }).finally(() => { submitBtn.disabled = false; });
      });
    }
  })();

})();

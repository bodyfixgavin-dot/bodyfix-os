import Link from 'next/link';

import styles from './BodyFixWebsite.module.css';

const corePhrases = [
  {
    label: 'Low Pain',
    title: '低痛感整理',
    text: '酸可以，但不需要痛到忍耐。力道會跟著身體反應調整。',
  },
  {
    label: 'Depth',
    title: '身體可接受的深度',
    text: '不是追更深、更痛，而是在身體願意放下來的深度裡工作。',
  },
  {
    label: 'No Fight',
    title: '不讓身體進入對抗',
    text: '避開硬壓痛點，降低身體防衛，讓張力慢慢鬆開。',
  },
  {
    label: 'Breathable',
    title: '可呼吸、可回來',
    text: '整理後要能接回呼吸、動作與訓練，而不只是當下放鬆。',
  },
];

const methodSteps = [
  ['01', 'Read｜判讀', '先看懂身體目前的代償壓力、張力分工失衡與使用路徑混亂。'],
  ['02', 'Reset｜整理', '以運動按摩為基礎，透過筋膜線判讀與張力分工整理，降低不必要的撐住與卡住。'],
  ['03', 'Reconnect｜整合', '把整理後的改善接回呼吸、胸廓、肩帶、骨盆與動作系統。'],
  ['04', 'Return｜接回', '讓你能真正使用身體、訓練與恢復，而不只是停在短暫放鬆。'],
];

const serviceEntrances = [
  {
    num: '01',
    title: '筋膜鏈整理',
    text: '從筋膜鏈與張力路徑開始判讀，在低痛感、可呼吸的深度裡整理身體。',
  },
  {
    num: '02',
    title: '張力判讀與動作整合',
    text: '看懂身體怎麼代償與分工，再把整理後的改變接回動作與訓練。',
  },
  {
    num: '03',
    title: '骨盆核心整理',
    text: '從骨盆、髖、呼吸與深層核心重新找回穩定。',
  },
];

const brandLevels = [
  {
    level: '01 · Body State',
    title: 'BodyFix｜身體狀態管理',
    text: 'BodyFix 是目前正式開放的服務主線。以運動按摩為基礎，透過筋膜鏈判讀與張力分工整理，在低痛感、可呼吸、身體能接受的深度裡，讓身體回到更穩定、有韌性、有彈性的狀態。',
    details: ['筋膜鏈整理', '張力判讀', '身體狀態管理與回訪追蹤'],
    cta: '預約 BodyFix 身體整理',
    href: '#booking',
  },
  {
    level: '02 · Future Extension',
    title: 'Chart Navigator｜命盤導航 Coming Soon',
    text: '這是一個正在開發中的命盤導航計畫。未來會整理紫微斗數、塔羅狀態整理與吠陀占星基礎學習內容，協助你看懂命盤結構、時間節奏與當下選擇。',
    details: ['目前保留為品牌延伸預告', '正式開放前，以內容分享與測試版工具為主'],
    cta: '查看未來規劃',
    href: '#chart-navigator',
  },
];

const chartLights = [
  ['01', '吠陀占星', '未來規劃：像門口的燈，看你帶著什麼慣性走進來。'],
  ['02', '紫微斗數', '未來規劃：像厝內的樑柱，看你人生的結構骨架。'],
  ['03', '塔羅狀態整理', '未來規劃：像手裡的手電筒，看你此刻這一步要怎麼踩。'],
];

const navigatorSteps = [
  ['01', '內容分享', '先整理基礎觀念與學習筆記，讓品牌方向逐步成形。'],
  ['02', '測試版工具', '在正式服務開放前，先用測試版工具驗證使用方式與需求。'],
  ['03', '正式開放', '完成學習與服務設計後，再公布清楚的服務內容與邊界。'],
];

const passes = [
  {
    id: 'bodyfix-pass',
    label: 'BodyFix Body State Pass',
    title: 'BodyFix 身體狀態月票',
    trial: 'NT$16,800',
    regular: 'NT$19,800',
    features: ['每月最多 8 次筋膜整理', '每週最多 2 次', '每次 60 分鐘', '包含每次整理後簡短紀錄'],
    fit: '需要穩定整理身體狀態、訓練恢復、張力追蹤的人。',
    note: '不包含：完整紫微、完整吠陀、深度命盤解析。',
  },
];

const cities = [
  ['Permanent', '台北 Taipei', '西門、國父紀念館、六張犁三個據點。可選工作室，也可依狀況討論到府整理。'],
  ['Tour', '台中 Taichung', '每月或每季安排巡迴場次，下一場時間會在 IG 與 LINE 公告。'],
  ['Tour', '高雄 Kaohsiung', '南部巡迴據點，每季彈性安排，可登記候補名單與優先預約。'],
];


export default function BodyFixWebsitePage() {
  return (
    <main className={styles.page}>
      <nav className={styles.nav} aria-label="BodyFix official website navigation">
        <div className={styles.navInner}>
          <Link className={styles.logo} href="/" aria-label="BodyFix OS 回首頁"><span className={styles.logoMark}>BF</span><span>BodyFix OS</span></Link>
          <div className={styles.navLinks}>
            <a href="#method">方法</a>
            <a href="#services">服務</a>
            <a href="#passes">身體月票</a>
            <a href="#chart-navigator">Coming Soon</a>
            <a href="#booking" className={styles.navCta}>預約</a>
          </div>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>BodyFix Service Operating System</span>
            <h1 className={styles.heroTitle}>BodyFix 身體服務作業系統</h1>
            <p className={styles.heroLead}>
              BodyFix 筋膜整理，是以運動按摩為基礎，透過筋膜線判讀與張力分工整理，
              在低痛感、可呼吸、身體能接受的深度裡，讓肌肉與外層筋膜一起回到更穩定、有韌性、有彈性的狀態。
            </p>
            <div className={styles.actions}>
              <a className={styles.primaryBtn} href="#booking">開始預約 →</a>
              <a className={styles.ghostBtn} href="#services">了解服務 →</a>
            </div>
          </div>
          <aside className={styles.heroCard}>
            <span className={styles.smallLabel}>Brand Language v1.0</span>
            <div className={styles.brandRules}>
              <span>中文負責專業。</span>
              <span>台語負責打進心裡。</span>
            </div>
            <h2>毋是愛你忍痛，是愛你的身體願意放下來。</h2>
            <p>
              我會看你身體的反應，調整力道與方向；不是要你忍住，而是在可呼吸、身體能接受的深度裡，讓張力慢慢放下來。
            </p>
          </aside>
        </div>
      </section>

      <section className={styles.coreStrip} aria-label="BodyFix 核心語言">
        <div className={`${styles.container} ${styles.coreGrid}`}>
          {corePhrases.map((item) => (
            <article className={styles.coreItem} key={item.title}>
              <span>{item.label}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`} id="method">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>01</span>
            <h2 className={styles.title}>BodyFix 的整理方法</h2>
            <span className={styles.subtitle}>— The Method</span>
          </div>
          <p className={styles.copyWide}>
            BodyFix 不是追求越痛越有效，也不是單純把緊繃揉開。核心是判讀身體目前怎麼撐住、哪裡在代償，再用身體可接受的深度讓張力重新分工。
          </p>
          <div className={styles.methodGrid}>
            {methodSteps.map(([num, title, text]) => (
              <article className={styles.methodCard} key={title}>
                <span className={styles.cardNum}>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="services">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>02</span>
            <h2 className={styles.title}>選擇你現在需要的 BodyFix 入口</h2>
            <span className={styles.subtitle}>— Services</span>
          </div>
          <p className={styles.copyWide}>
            BodyFix 目前專注在身體服務。從筋膜鏈整理、張力判讀與動作整合，到骨盆核心整理，先選最貼近現在狀態的入口，再透過預約前問卷整理需求。
          </p>
          <div className={styles.serviceGrid}>
            {serviceEntrances.map((service) => (
              <article className={styles.serviceCard} key={service.title}>
                <span className={styles.cardNum}>{service.num}</span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.brandSection}`} id="brands">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>03</span>
            <h2 className={styles.title}>BodyFix 是現在的主線</h2>
            <span className={styles.subtitle}>— Now & Next</span>
          </div>
          <div className={styles.brandIntro}>
            <p className={styles.brandStatement}>現在先把身體整理好。<br /><em>BodyFix，正式開放預約。</em></p>
            <p>BodyFix 專注筋膜鏈整理、張力判讀與身體狀態管理。Chart Navigator 暫時只保留為未來品牌分支，不是目前的正式收費服務。</p>
          </div>
          <div className={styles.brandGrid}>
            {brandLevels.map((brand) => (
              <article className={styles.brandCard} key={brand.title}>
                <span className={styles.cardNum}>{brand.level}</span>
                <h3>{brand.title}</h3>
                <p>{brand.text}</p>
                <ul>{brand.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                <a href={brand.href}>{brand.cta}<span>→</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightsSection}`} id="chart-lights">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>04</span>
            <h2 className={styles.title}>三盞燈｜未來規劃</h2>
            <span className={styles.subtitle}>— Chart Navigator</span>
          </div>
          <div className={styles.lightGrid}>
            {chartLights.map(([num, title, text]) => (
              <article className={styles.lightCard} key={title}>
                <span className={styles.lightNumber}>{num}</span>
                <div className={styles.lightIcon} aria-hidden="true"><span /></div>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className={styles.closingLine}>這些內容仍在學習與開發中，正式開放前不作為收費服務。</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.navigatorSection}`} id="chart-navigator">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>05</span>
            <h2 className={styles.title}>Chart Navigator｜命盤導航 Coming Soon</h2>
            <span className={styles.subtitle}>— Future Brand Extension</span>
          </div>
          <p className={styles.copyWide}>
            這是一個正在開發中的命盤導航計畫。未來會整理紫微斗數、塔羅狀態整理與吠陀占星基礎學習內容，協助你看懂命盤結構、時間節奏與當下選擇。目前先保留為品牌延伸預告，正式服務開放前，會先以內容分享與測試版工具為主。
          </p>
          <div className={styles.navigatorGrid}>
            {navigatorSteps.map(([num, title, text]) => (
              <article className={styles.navigatorCard} key={title}>
                <span className={styles.cardNum}>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className={styles.navigatorClosing}>目前尚未正式開放，<br />也沒有公開收費方案。</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.passSection}`} id="passes">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>06</span>
            <h2 className={styles.title}>BodyFix 身體狀態月票</h2>
            <span className={styles.subtitle}>— Body State Membership</span>
          </div>
          <p className={styles.copyWide}>目前月票區只保留 BodyFix 身體狀態管理。命盤導航與跨系統整合尚未開放收費。</p>
          <div className={styles.passGrid}>
            {passes.map((pass) => (
              <article className={styles.passCard} id={pass.id} key={pass.id}>
                <span className={styles.smallLabel}>{pass.label}</span>
                <h3>{pass.title}</h3>
                <div className={styles.priceBlock}>
                  <div><span>試營運價</span><strong>{pass.trial}</strong><small>/ 月</small></div>
                  <div><span>正式價</span><strong>{pass.regular}</strong><small>/ 月</small></div>
                </div>
                <ul>{pass.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <p className={styles.passFit}><strong>適合</strong>{pass.fit}</p>
                <p className={styles.passNote}>{pass.note}</p>
                <a className={styles.primaryBtn} href="#booking">詢問 BodyFix 身體月票 →</a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section} id="city">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>08</span>
            <h2 className={styles.title}>城市場次</h2>
            <span className={styles.subtitle}>— City Tour</span>
          </div>
          <div className={styles.cityGrid}>
            {cities.map(([label, title, text]) => (
              <article className={styles.cityCard} key={title}>
                <span className={styles.cardNum}>{label}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.booking}`} id="booking">
        <div className={`${styles.container} ${styles.bookingGrid}`}>
          <div>
            <span className={styles.eyebrow}>Booking Flow</span>
            <h2 className={styles.bookingTitle}>先<em>填問卷</em>，再私訊安排。</h2>
            <p className={styles.copyWide}>
              因為 BodyFix 不是制式按摩，每次服務都需要先看你目前的身體狀態與目的。填完問卷後，請把摘要貼到 LINE 或 IG，我會依此安排適合的服務與時間。
            </p>
            <ol className={styles.steps}>
              <li><div><strong>填寫預約前問卷</strong><span>約 3 分鐘，先整理你的狀態與目的。</span></div></li>
              <li><div><strong>複製問卷內容</strong><span>填完後系統會產生摘要，直接複製。</span></div></li>
              <li><div><strong>私訊給 Gavin</strong><span>透過 LINE 或 IG 私訊貼上問卷摘要。</span></div></li>
              <li><div><strong>確認時間與服務</strong><span>我會回覆建議服務類別與可預約時段。</span></div></li>
            </ol>
          </div>
          <aside className={styles.contactCard}>
            <span className={styles.smallLabel}>Contact Channels</span>
            <a className={styles.contactLink} href="/intake"><div><strong>填寫預約前問卷</strong><span>建議從這裡開始</span></div><span>→</span></a>
            <a className={styles.contactLink} href="https://line.me/R/ti/p/@359gzxzi" target="_blank" rel="noreferrer"><div><strong>LINE 官方帳號</strong><span>@359gzxzi</span></div><span>→</span></a>
            <a className={styles.contactLink} href="https://instagram.com/bodyfix.fascia" target="_blank" rel="noreferrer"><div><strong>Instagram 私訊</strong><span>@bodyfix.fascia</span></div><span>→</span></a>
            <a className={styles.contactLink} href="#city"><div><strong>城市場次登記</strong><span>台中、高雄與需求城市</span></div><span>→</span></a>
          </aside>
        </div>
      </section>

      <section className={`${styles.section} ${styles.faqSection}`} id="faq">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>10</span>
            <h2 className={styles.title}>服務邊界，先說清楚</h2>
            <span className={styles.subtitle}>— FAQ</span>
          </div>
          <details className={styles.faqItem} open>
            <summary>Chart Navigator 現在可以預約或購買嗎？<span>＋</span></summary>
            <div className={styles.faqAnswer}>
              <p>目前不行。Chart Navigator 仍在學習、內容整理與測試版工具開發階段，現在只作為品牌延伸預告。</p>
              <p><strong>目前正式開放的是 BodyFix 身體服務</strong>：筋膜鏈整理、張力判讀、動作使用方式與身體狀態管理。</p>
              <p>Chart Navigator 正式開放前，網站不會提供付費方案、付款或預約入口。</p>
            </div>
          </details>
        </div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.container}>
          <div className={styles.footerGrid}>
            <div>
              <h3>BodyFix.</h3>
              <p>以筋膜與張力整理為核心，把身體狀態、動作使用與日常節奏整理得更清楚。</p>
            </div>
            <div><h4>Services</h4><ul><li>身體整理</li><li>動作整合</li><li>結構與狀態</li></ul></div>
            <div><h4>Locations</h4><ul><li>台北常駐</li><li>台中巡迴</li><li>高雄巡迴</li></ul></div>
            <div><h4>Contact</h4><ul><li>LINE @359gzxzi</li><li>IG @bodyfix.fascia</li></ul></div>
          </div>
          <div className={styles.footerBottom}><span>© BodyFix 2026 · Taipei</span><span>Official website draft</span></div>
        </div>
      </footer>
    </main>
  );
}

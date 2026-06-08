import Link from 'next/link';

import styles from './BodyFixWebsite.module.css';

const chartNavigatorUrl = 'https://chart-navigator.vercel.app';

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
    title: '筋膜張力整理',
    text: '低痛感、可呼吸、身體能接受的深度。',
  },
  {
    num: '02',
    title: '教練課 / 動作整合',
    text: '判讀、整理、整合，讓訓練回到更穩定的系統。',
  },
  {
    num: '03',
    title: '骨盆核心整理',
    text: '從骨盆、髖、呼吸與深層核心重新找回穩定。',
  },
  {
    num: '04',
    title: '紫微結構解析',
    text: '用結構的眼光，看懂命盤節奏與人生配置。',
  },
  {
    num: '05',
    title: '塔羅狀態整理',
    text: '不是替你決定未來，而是幫你看清現在。',
  },
];

const brandLevels = [
  {
    level: '01 · Body State',
    title: 'BodyFix｜身體狀態管理',
    text: 'BodyFix 負責身體。以運動按摩為基礎，透過筋膜線判讀與張力分工整理，在低痛感、可呼吸、身體能接受的深度裡，讓肌肉與外層筋膜一起回到更穩定、有韌性、有彈性的狀態。',
    details: ['適合久坐與高壓的人', '訓練恢復慢', '身體反覆緊繃，按完很快又緊回來'],
    cta: '查看 BodyFix 身體方案',
    href: '#bodyfix-pass',
    external: false,
  },
  {
    level: '02 · Chart Rhythm',
    title: 'Chart Navigator｜命盤導航',
    text: 'Chart Navigator 負責命盤。不是傳統算命，而是用命盤結構、時間節奏與狀態整理，幫你看懂現在走到哪裡。吠陀像門口的燈，紫微像厝內的樑柱；一個帶你產生好奇，一個幫你建立結構。',
    details: ['吠陀占星 Jyotiṣa｜ज्योतिष｜久提沙', '紫微斗數', '塔羅狀態整理', 'AI 命盤提示'],
    cta: '查看 Chart Navigator 命盤方案',
    href: chartNavigatorUrl,
    external: true,
  },
  {
    level: '03 · All State',
    title: 'Gavin｜全狀態整合',
    text: 'Gavin 是兩套系統中間的整合者。BodyFix 看身體怎麼撐，Chart Navigator 看人生節奏怎麼走；當身體狀態、職涯選擇、關係模式與時間節奏交在一起，就把它們整理成一條比較清楚的路線。',
    details: ['不是單純按摩，也不是單純算命', '身體 × 命盤 × 當下狀態的整合管理'],
    cta: '了解 Gavin 全狀態月票',
    href: '#gavin-pass',
    external: false,
  },
];

const chartLights = [
  ['01', '吠陀占星 Jyotiṣa｜ज्योतिष｜久提沙', '像門口的燈，看你帶著什麼慣性走進來。'],
  ['02', '紫微斗數', '像厝內的樑柱，看你人生的結構骨架。'],
  ['03', '塔羅狀態整理', '像手裡的手電筒，看你此刻這一步要怎麼踩。'],
];

const navigatorSteps = [
  ['01', '看結構', '先看你天生的骨架：擅長什麼、容易卡在哪、習慣用哪種方式面對選擇。'],
  ['02', '看節奏', '再看你現在走到哪段時間：適合衝、適合收，還是先穩住。'],
  ['03', '看當下', '回到你手上這個具體問題：這一步，怎麼踩比較不會後悔。'],
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
  {
    id: 'chart-pass',
    label: 'Chart Navigator Monthly Pass',
    title: 'Chart Navigator 命盤導航月票',
    trial: 'NT$4,800',
    regular: 'NT$6,800',
    features: ['每週可提出 1 個主題', '每月包含 1 次完整狀態整理', '吠陀占星 Jyotiṣa｜ज्योतिष｜久提沙', '紫微斗數', '塔羅狀態整理與 AI 命盤提示', '流月與節奏提醒'],
    fit: '想整理關係、職涯、情緒、人生方向與時間節奏的人。',
    note: '不代替你做選擇，而是讓你看懂自己正在走到哪裡。毋是共你講命定，是共你看路按怎行較穩。',
  },
  {
    id: 'gavin-pass',
    label: 'Gavin All State Pass',
    title: 'Gavin All State Pass｜全狀態月票',
    trial: 'NT$26,800',
    regular: 'NT$32,800',
    features: ['BodyFix 身體整理：每月最多 8 次、每週最多 2 次、每次 60 分鐘', 'Chart Navigator 命盤導航：每月 1 次 40 分鐘狀態導航', '塔羅狀態整理：每週可問 1 個簡短狀態問題', '每月狀態重點紀錄'],
    fit: '高壓工作者、創作者、教練、醫護、自由工作者，以及需要同時管理身體狀態與人生節奏的人。',
    note: '同時包含 BodyFix 身體整理、Chart Navigator 命盤導航與塔羅狀態整理。',
    featured: true,
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
          <Link className={styles.logo} href="/" aria-label="BodyFix 回首頁"><span className={styles.logoMark}>BF</span><span>BodyFix</span></Link>
          <div className={styles.navLinks}>
            <a href="#method">方法</a>
            <a href="#services">服務</a>
            <a href="#brands">品牌關係</a>
            <a href="#chart-lights">三盞燈</a>
            <a href="#passes">月票</a>
            <a href="#ziwei">紫微塔羅</a>
            <a href="#booking" className={styles.navCta}>預約</a>
          </div>
        </div>
      </nav>

      <section className={styles.hero} id="top">
        <div className={`${styles.container} ${styles.heroGrid}`}>
          <div>
            <span className={styles.eyebrow}>Premium Body State Management</span>
            <h1 className={styles.heroTitle}>不是硬壓痛點，而是讓身體願意<em>放下張力</em>。</h1>
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
            五個入口對應五種狀態：身體張力、訓練動作、骨盆核心、紫微結構與塔羅狀態。先選最貼近現在的那一張，再進到預約前問卷整理需求。
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
            <h2 className={styles.title}>兩套系統，一個狀態管理入口</h2>
            <span className={styles.subtitle}>— Brand Ladder</span>
          </div>
          <div className={styles.brandIntro}>
            <p className={styles.brandStatement}>BodyFix 整理身體。<br />Chart Navigator 整理命盤。<br /><em>Gavin 整理你整個人的狀態。</em></p>
            <p>身體有張力路徑，人生也有時間節奏。我做的不是把所有東西混在一起，而是用不同系統，幫你看懂自己現在卡在哪裡。</p>
          </div>
          <div className={styles.brandGrid}>
            {brandLevels.map((brand) => (
              <article className={styles.brandCard} key={brand.title}>
                <span className={styles.cardNum}>{brand.level}</span>
                <h3>{brand.title}</h3>
                <p>{brand.text}</p>
                <ul>{brand.details.map((detail) => <li key={detail}>{detail}</li>)}</ul>
                <a href={brand.href} target={brand.external ? '_blank' : undefined} rel={brand.external ? 'noopener noreferrer' : undefined}>{brand.cta}<span>→</span></a>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.lightsSection}`} id="chart-lights">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>04</span>
            <h2 className={styles.title}>三盞燈，看不同層次的你</h2>
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
          <p className={styles.closingLine}>三套系統不是混在一起算，而是各自照亮不同層次的狀態。</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.navigatorSection}`} id="chart-navigator">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>05</span>
            <h2 className={styles.title}>命盤導航是什麼？</h2>
            <span className={styles.subtitle}>— 看結構 → 看節奏 → 看當下</span>
          </div>
          <div className={styles.navigatorGrid}>
            {navigatorSteps.map(([num, title, text]) => (
              <article className={styles.navigatorCard} key={title}>
                <span className={styles.cardNum}>{num}</span>
                <h3>{title}</h3>
                <p>{text}</p>
              </article>
            ))}
          </div>
          <p className={styles.navigatorClosing}>不是替你決定，<br />是讓你看清楚自己站在哪、要往哪走。</p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.passSection}`} id="passes">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>06</span>
            <h2 className={styles.title}>Monthly Pass｜狀態管理月票</h2>
            <span className={styles.subtitle}>— Membership</span>
          </div>
          <p className={styles.copyWide}>三個月票各有清楚邊界。從身體、命盤，到雙系統整合，選擇你現在真正需要的狀態管理方式。</p>
          <div className={styles.passGrid}>
            {passes.map((pass) => (
              <article className={`${styles.passCard} ${pass.featured ? styles.featuredPass : ''}`} id={pass.id} key={pass.id}>
                <span className={styles.smallLabel}>{pass.label}</span>
                <h3>{pass.title}</h3>
                <div className={styles.priceBlock}>
                  <div><span>試營運價</span><strong>{pass.trial}</strong><small>/ 月</small></div>
                  <div><span>正式價</span><strong>{pass.regular}</strong><small>/ 月</small></div>
                </div>
                <ul>{pass.features.map((feature) => <li key={feature}>{feature}</li>)}</ul>
                <p className={styles.passFit}><strong>適合</strong>{pass.fit}</p>
                <p className={styles.passNote}>{pass.note}</p>
                {pass.id === 'chart-pass' ? (
                  <a className={styles.ghostBtn} href={chartNavigatorUrl} target="_blank" rel="noopener noreferrer">了解命盤導航月票 →</a>
                ) : (
                  <a className={pass.featured ? styles.primaryBtn : styles.ghostBtn} href="#booking">詢問此月票 →</a>
                )}
                {pass.id === 'gavin-pass' ? (
                  <a className={styles.externalTextLink} href={chartNavigatorUrl} target="_blank" rel="noopener noreferrer">查看月票包含的 Chart Navigator 命盤導航 <span>↗</span></a>
                ) : null}
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`} id="ziwei">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>07</span>
            <h2 className={styles.title}>紫微 × 塔羅</h2>
            <span className={styles.subtitle}>— Structure & Status</span>
          </div>
          <div className={styles.ziweiGrid}>
            <p className={styles.ziweiStatement}>不是替你決定未來，<br />而是幫你<em>看清現在</em>。</p>
            <ul className={styles.ziweiList}>
              <li><strong>紫微結構解析</strong><span>看長期結構、慣性模式與選擇傾向。</span></li>
              <li><strong>塔羅狀態整理</strong><span>整理當下卡住的問題與可能的視角。</span></li>
              <li><strong>紫微 × 塔羅整合諮詢</strong><span>結構與狀態雙向整理，適合重大決策或階段轉換。</span></li>
              <li><strong>SADM 關係決策整理</strong><span>用結構視角整理自己、對方與關係動態三條線。</span></li>
            </ul>
          </div>
          <div className={styles.sectionAction}>
            <a className={styles.primaryBtn} href={chartNavigatorUrl} target="_blank" rel="noopener noreferrer">前往命盤導航 →</a>
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
            <a className={styles.contactLink} href={chartNavigatorUrl} target="_blank" rel="noopener noreferrer"><div><strong>前往命盤導航</strong><span>紫微、塔羅、吠陀請由 Chart Navigator 了解</span></div><span>↗</span></a>
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
            <summary>BodyFix 和 Chart Navigator 會不會太混雜？<span>＋</span></summary>
            <div className={styles.faqAnswer}>
              <p>不會，因為它們是兩套不同系統。</p>
              <p><strong>BodyFix</strong> 處理的是身體狀態：筋膜、張力、動作使用方式與恢復管理。</p>
              <p><strong>Chart Navigator</strong> 處理的是命盤狀態：吠陀占星 Jyotiṣa｜ज्योतिष｜久提沙、紫微斗數、塔羅與時間節奏。</p>
              <p><a className={styles.inlineExternalLink} href={chartNavigatorUrl} target="_blank" rel="noopener noreferrer">查看 Chart Navigator 完整命盤導航內容 ↗</a></p>
              <p>兩者不會互相取代。BodyFix 不會變成算命服務，Chart Navigator 也不是身體整理服務。最高階的 Gavin All State Pass，才會把兩套系統整合在一起。</p>
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

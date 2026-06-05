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

const cities = [
  ['Permanent', '台北 Taipei', '西門、國父紀念館、六張犁三個據點。可選工作室，也可依狀況討論到府整理。'],
  ['Tour', '台中 Taichung', '每月或每季安排巡迴場次，下一場時間會在 IG 與 LINE 公告。'],
  ['Tour', '高雄 Kaohsiung', '南部巡迴據點，每季彈性安排，可登記候補名單與優先預約。'],
];

const igTopics = [
  ['01', '筋膜知識', '張力分工、保護性收縮、代償壓力'],
  ['02', '骨盆核心', '骨盆與髖、深層核心、左右整合'],
  ['03', '紫微結構解析', '14 主星、宮位結構、運作模式'],
  ['04', '塔羅牌陣', '狀態整理、牌陣解讀、決策視角'],
  ['05', '關係決策', 'SADM 框架、關係動態、選擇空間'],
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
            <a href="#ziwei">紫微塔羅</a>
            <a href="#city">城市場次</a>
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

      <section className={`${styles.section} ${styles.quoteBand}`}>
        <div className={`${styles.container} ${styles.quoteLayout}`}>
          <blockquote className={styles.bigQuote}>BodyFix 不是硬壓痛點。<br />而是在身體可接受的深度裡，整理肌肉與外層筋膜的張力。</blockquote>
          <p className={styles.quoteNote}>
            筋膜像包住肌肉的潛水衣。肌肉鬆了，但外層張力沒變，身體還是容易回到緊繃。BodyFix 要處理的，就是肌肉與外層筋膜之間的張力分工。
          </p>
        </div>
      </section>

      <section className={`${styles.section} ${styles.dark}`} id="ziwei">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>03</span>
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
        </div>
      </section>

      <section className={styles.section} id="city">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>04</span>
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

      <section className={styles.section} id="instagram">
        <div className={styles.container}>
          <div className={styles.sectionHead}>
            <span className={styles.index}>05</span>
            <h2 className={styles.title}>從 IG 了解更多</h2>
            <span className={styles.subtitle}>— On Instagram</span>
          </div>
          <p className={styles.copyWide}>官網只放服務分流與預約導流。科普、案例分享、紫微結構與塔羅牌陣，都更新在 IG。</p>
          <div className={styles.igGrid}>
            {igTopics.map(([num, title, text]) => (
              <article className={styles.igCard} key={title}>
                <span className={styles.cardNum}>{num}</span>
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

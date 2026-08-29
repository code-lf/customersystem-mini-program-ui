/**
 * 精选中国风与动漫二次元头像预设库
 * 包含纯矢量 SVG 与国风/动漫精美图形，免外网依赖，全端秒开
 */

const encodeSvg = (svg) => `data:image/svg+xml;utf8,${encodeURIComponent(svg.trim())}`;

export const AVATAR_CATEGORIES = [
  { key: 'guofeng', name: '国风·中国风' },
  { key: 'anime', name: '动漫·二次元' },
  { key: 'business', name: '商务·暖通' }
];

export const PRESET_AVATAR_GROUPS = {
  guofeng: [
    {
      id: 'gf-1',
      name: '国风·赤霄墨客',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#8b1c1c"/>
              <stop offset="100%" stop-color="#2d0a0a"/>
            </linearGradient>
            <linearGradient id="gold1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#f6d365"/>
              <stop offset="100%" stop-color="#fda085"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bg1)" stroke="#d4af37" stroke-width="3"/>
          <circle cx="60" cy="60" r="50" fill="none" stroke="#d4af37" stroke-dasharray="4,4" opacity="0.4"/>
          <!-- 祥云背景 -->
          <path d="M25 80 Q35 70 45 80 Q55 70 65 80 Q75 70 85 80 Q95 70 100 80" fill="none" stroke="#d4af37" stroke-width="1.5" opacity="0.3"/>
          <!-- 人物国风发型与轮廓 -->
          <circle cx="60" cy="45" r="20" fill="#fde2d2"/>
          <path d="M38 46 C38 25 82 25 82 46 C82 32 72 20 60 20 C48 20 38 32 38 46 Z" fill="#1a1a1a"/>
          <!-- 古风发冠/头饰 -->
          <path d="M54 20 L66 20 L62 12 L58 12 Z" fill="url(#gold1)"/>
          <circle cx="60" cy="11" r="3" fill="#e74c3c"/>
          <!-- 眉眼 -->
          <path d="M48 44 Q53 42 56 45" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linecap="round"/>
          <path d="M64 45 Q67 42 72 44" stroke="#2c3e50" stroke-width="2" fill="none" stroke-linecap="round"/>
          <circle cx="53" cy="48" r="2.5" fill="#1a1a1a"/>
          <circle cx="67" cy="48" r="2.5" fill="#1a1a1a"/>
          <path d="M57 56 Q60 58 63 56" stroke="#c0392b" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <!-- 国风交领汉服 -->
          <path d="M30 105 C30 80 42 70 60 70 C78 70 90 80 90 105 Z" fill="#1f2421"/>
          <path d="M45 70 L60 88 L75 70" fill="none" stroke="url(#gold1)" stroke-width="3"/>
          <path d="M52 70 L60 82 L68 70" fill="none" stroke="#e74c3c" stroke-width="2"/>
        </svg>
      `)
    },
    {
      id: 'gf-2',
      name: '国风·青花雅韵',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#1e3c72"/>
              <stop offset="100%" stop-color="#2a5298"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bg2)" stroke="#93c5fd" stroke-width="2.5"/>
          <circle cx="60" cy="60" r="52" fill="none" stroke="#60a5fa" stroke-width="1" opacity="0.5"/>
          <!-- 青花水墨山峦 -->
          <path d="M10 95 Q35 60 60 90 Q85 65 110 95 Z" fill="#3b82f6" opacity="0.3"/>
          <!-- 人物面容 -->
          <circle cx="60" cy="46" r="20" fill="#fef0e7"/>
          <!-- 优雅长发 -->
          <path d="M36 48 C36 24 84 24 84 48 C84 32 74 18 60 18 C46 18 36 32 36 48 Z" fill="#111827"/>
          <path d="M36 48 Q32 75 42 90 Q38 65 40 50 Z" fill="#111827"/>
          <path d="M84 48 Q88 75 78 90 Q82 65 80 50 Z" fill="#111827"/>
          <!-- 簪子 -->
          <line x1="68" y1="20" x2="88" y2="14" stroke="#67e8f9" stroke-width="2.5" stroke-linecap="round"/>
          <circle cx="88" cy="14" r="3" fill="#38bdf8"/>
          <!-- 五官 -->
          <ellipse cx="52" cy="48" rx="2.5" ry="3" fill="#1f2937"/>
          <ellipse cx="68" cy="48" rx="2.5" ry="3" fill="#1f2937"/>
          <circle cx="53" cy="47" r="1" fill="#fff"/>
          <circle cx="69" cy="47" r="1" fill="#fff"/>
          <path d="M57 56 Q60 59 63 56" stroke="#f43f5e" stroke-width="2" fill="none"/>
          <!-- 国风水蓝罗裙 -->
          <path d="M28 110 C28 82 42 72 60 72 C78 72 92 82 92 110 Z" fill="#eff6ff"/>
          <path d="M42 72 L60 92 L78 72" fill="none" stroke="#2563eb" stroke-width="3"/>
        </svg>
      `)
    },
    {
      id: 'gf-3',
      name: '国风·锦鲤瑞兽',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bg3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ff7e5f"/>
              <stop offset="100%" stop-color="#feb47b"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bg3)" stroke="#fff" stroke-width="3"/>
          <!-- 醒狮/锦鲤国潮纹样 -->
          <circle cx="60" cy="50" r="28" fill="#fff" opacity="0.95"/>
          <!-- 狮耳 -->
          <path d="M38 32 C32 20 48 18 48 30 Z" fill="#ef4444"/>
          <path d="M82 32 C88 20 72 18 72 30 Z" fill="#ef4444"/>
          <!-- 萌版国潮醒狮面具大眼 -->
          <circle cx="48" cy="46" r="9" fill="#1e293b"/>
          <circle cx="72" cy="46" r="9" fill="#1e293b"/>
          <circle cx="50" cy="44" r="3.5" fill="#fff"/>
          <circle cx="74" cy="44" r="3.5" fill="#fff"/>
          <circle cx="60" cy="54" r="5" fill="#f59e0b"/>
          <path d="M52 64 Q60 72 68 64" stroke="#ef4444" stroke-width="3" fill="none" stroke-linecap="round"/>
          <path d="M40 76 Q60 66 80 76 Q60 90 40 76 Z" fill="#dc2626"/>
          <circle cx="60" cy="80" r="4" fill="#fbbf24"/>
        </svg>
      `)
    },
    {
      id: 'gf-4',
      name: '国风·松竹墨侠',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bg4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#134e4a"/>
              <stop offset="100%" stop-color="#042f2e"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bg4)" stroke="#5eead4" stroke-width="2.5"/>
          <!-- 竹叶点缀 -->
          <path d="M20 30 Q35 25 30 40 Q25 35 20 30 Z" fill="#2dd4bf" opacity="0.6"/>
          <path d="M95 35 Q80 30 85 45 Q90 40 95 35 Z" fill="#2dd4bf" opacity="0.6"/>
          <!-- 斗笠侠客 -->
          <path d="M20 48 Q60 24 100 48 Q60 38 20 48 Z" fill="#78350f" stroke="#d97706" stroke-width="1.5"/>
          <circle cx="60" cy="52" r="16" fill="#fde047" opacity="0.2"/>
          <circle cx="60" cy="54" r="14" fill="#ffedd5"/>
          <path d="M50 54 L56 54" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
          <path d="M64 54 L70 54" stroke="#1e293b" stroke-width="2" stroke-linecap="round"/>
          <path d="M57 62 Q60 64 63 62" stroke="#9a3412" stroke-width="1.5" fill="none"/>
          <path d="M32 108 C32 80 44 72 60 72 C76 72 88 80 88 108 Z" fill="#0f172a"/>
          <path d="M48 72 L60 90 L72 72" fill="none" stroke="#14b8a6" stroke-width="2.5"/>
        </svg>
      `)
    }
  ],
  anime: [
    {
      id: 'an-1',
      name: '动漫·热血少年',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="anbg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#3b82f6"/>
              <stop offset="100%" stop-color="#1d4ed8"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#anbg1)" stroke="#93c5fd" stroke-width="3"/>
          <!-- 动漫刺猬发型 -->
          <path d="M30 45 L38 24 L48 34 L60 16 L72 34 L82 24 L90 45 L95 62 L82 60 L80 40 L60 30 L40 40 L38 60 L25 62 Z" fill="#1e293b"/>
          <circle cx="60" cy="52" r="22" fill="#ffedd5"/>
          <!-- 动漫前刘海 -->
          <path d="M42 36 L48 48 L54 38 L60 52 L66 38 L72 48 L78 36 Z" fill="#1e293b"/>
          <!-- 大大的动漫眼睛 -->
          <ellipse cx="49" cy="52" rx="5" ry="6" fill="#1d4ed8"/>
          <ellipse cx="71" cy="52" rx="5" ry="6" fill="#1d4ed8"/>
          <circle cx="51" cy="50" r="2.5" fill="#ffffff"/>
          <circle cx="73" cy="50" r="2.5" fill="#ffffff"/>
          <circle cx="48" cy="54" r="1.2" fill="#93c5fd"/>
          <circle cx="70" cy="54" r="1.2" fill="#93c5fd"/>
          <!-- 阳光微笑 -->
          <path d="M54 62 Q60 68 66 62" stroke="#dc2626" stroke-width="2" fill="#ffffff" stroke-linecap="round"/>
          <!-- 潮流卫衣 -->
          <path d="M30 110 C30 82 44 76 60 76 C76 76 90 82 90 110 Z" fill="#f97316"/>
          <path d="M48 76 L60 92 L72 76" fill="#ffffff"/>
        </svg>
      `)
    },
    {
      id: 'an-2',
      name: '动漫·元气少女',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="anbg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#ec4899"/>
              <stop offset="100%" stop-color="#8b5cf6"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#anbg2)" stroke="#fbcfe8" stroke-width="3"/>
          <!-- 双马尾发髻 -->
          <circle cx="28" cy="40" r="14" fill="#fb923c"/>
          <circle cx="92" cy="40" r="14" fill="#fb923c"/>
          <circle cx="60" cy="50" r="23" fill="#fdf2f8"/>
          <!-- 橙色动漫秀发 -->
          <path d="M36 44 C36 22 84 22 84 44 C84 30 74 18 60 18 C46 18 36 30 36 44 Z" fill="#f97316"/>
          <path d="M42 34 L46 48 L52 38 L60 50 L68 38 L74 48 L78 34 Z" fill="#f97316"/>
          <!-- 萌系大眼睛与腮红 -->
          <ellipse cx="48" cy="50" rx="5.5" ry="6.5" fill="#831843"/>
          <ellipse cx="72" cy="50" rx="5.5" ry="6.5" fill="#831843"/>
          <circle cx="50" cy="48" r="2.5" fill="#ffffff"/>
          <circle cx="74" cy="48" r="2.5" fill="#ffffff"/>
          <ellipse cx="42" cy="58" rx="4" ry="2" fill="#f472b6" opacity="0.6"/>
          <ellipse cx="78" cy="58" rx="4" ry="2" fill="#f472b6" opacity="0.6"/>
          <path d="M56 60 Q60 64 64 60" stroke="#db2777" stroke-width="2" fill="none" stroke-linecap="round"/>
          <!-- 水手服领结 -->
          <path d="M32 110 C32 84 44 76 60 76 C76 76 88 84 88 110 Z" fill="#ffffff"/>
          <path d="M44 76 L60 94 L76 76" fill="#3b82f6"/>
          <circle cx="60" cy="85" r="4" fill="#ef4444"/>
        </svg>
      `)
    },
    {
      id: 'an-3',
      name: '动漫·极客工程师',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="anbg3" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#0f172a"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#anbg3)" stroke="#38bdf8" stroke-width="2.5"/>
          <!-- 科技光环背景 -->
          <circle cx="60" cy="60" r="48" fill="none" stroke="#0ea5e9" stroke-width="1.5" stroke-dasharray="6,4" opacity="0.5"/>
          <!-- 银发酷男 -->
          <circle cx="60" cy="50" r="22" fill="#ffedd5"/>
          <path d="M32 46 L40 22 L55 30 L60 15 L70 28 L82 22 L88 46 L78 35 L60 24 L42 35 Z" fill="#e2e8f0"/>
          <path d="M44 32 L48 46 L54 36 L60 48 L68 36 L74 46 L78 32 Z" fill="#cbd5e1"/>
          <!-- 酷炫科技眼镜/耳机 -->
          <rect x="42" y="46" width="16" height="10" rx="3" fill="#0284c7" opacity="0.8"/>
          <rect x="62" y="46" width="16" height="10" rx="3" fill="#0284c7" opacity="0.8"/>
          <line x1="58" y1="51" x2="62" y2="51" stroke="#38bdf8" stroke-width="2"/>
          <circle cx="36" cy="52" r="5" fill="#0ea5e9"/>
          <circle cx="84" cy="52" r="5" fill="#0ea5e9"/>
          <!-- 酷酷的表情 -->
          <line x1="56" y1="62" x2="64" y2="62" stroke="#475569" stroke-width="2" stroke-linecap="round"/>
          <!-- 机能风工装 -->
          <path d="M30 110 C30 82 44 74 60 74 C76 74 90 82 90 110 Z" fill="#334155"/>
          <path d="M50 74 L60 88 L70 74" fill="#0ea5e9"/>
        </svg>
      `)
    },
    {
      id: 'an-4',
      name: '动漫·Q版暖通萌友',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="anbg4" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#059669"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#anbg4)" stroke="#a7f3d0" stroke-width="3"/>
          <!-- 暖通工程师小熊/安全帽萌宠 -->
          <circle cx="60" cy="58" r="26" fill="#fef3c7"/>
          <!-- 萌萌小圆耳 -->
          <circle cx="38" cy="38" r="10" fill="#fde68a"/>
          <circle cx="82" cy="38" r="10" fill="#fde68a"/>
          <!-- 暖通专属小黄帽/安全帽 -->
          <path d="M34 42 Q60 18 86 42 Z" fill="#fbbf24"/>
          <rect x="30" y="40" width="60" height="7" rx="3.5" fill="#f59e0b"/>
          <circle cx="60" cy="32" r="4" fill="#ffffff"/>
          <!-- 呆萌表情 -->
          <ellipse cx="48" cy="56" rx="4" ry="5" fill="#1e293b"/>
          <ellipse cx="72" cy="56" rx="4" ry="5" fill="#1e293b"/>
          <circle cx="50" cy="54" r="1.8" fill="#fff"/>
          <circle cx="74" cy="54" r="1.8" fill="#fff"/>
          <ellipse cx="40" cy="64" rx="4" ry="2.5" fill="#fca5a5"/>
          <ellipse cx="80" cy="64" rx="4" ry="2.5" fill="#fca5a5"/>
          <ellipse cx="60" cy="62" rx="3" ry="2" fill="#78350f"/>
          <path d="M57 66 Q60 69 63 66" stroke="#78350f" stroke-width="2" fill="none"/>
          <path d="M36 110 C36 88 46 80 60 80 C74 80 84 88 84 110 Z" fill="#0284c7"/>
        </svg>
      `)
    }
  ],
  business: [
    {
      id: 'bs-1',
      name: '商务·首席工程师',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bsbg1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#2563eb"/>
              <stop offset="100%" stop-color="#1e40af"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bsbg1)" stroke="#bfdbfe" stroke-width="2.5"/>
          <circle cx="60" cy="46" r="20" fill="#ffedd5"/>
          <path d="M38 42 C38 22 82 22 82 42 C82 28 72 18 60 18 C48 18 38 28 38 42 Z" fill="#334155"/>
          <circle cx="52" cy="46" r="2.5" fill="#0f172a"/>
          <circle cx="68" cy="46" r="2.5" fill="#0f172a"/>
          <path d="M56 56 Q60 59 64 56" stroke="#b91c1c" stroke-width="1.8" fill="none" stroke-linecap="round"/>
          <!-- 西装革履领带 -->
          <path d="M28 110 C28 80 42 72 60 72 C78 72 92 80 92 110 Z" fill="#0f172a"/>
          <path d="M50 72 L60 92 L70 72" fill="#ffffff"/>
          <path d="M58 75 L62 75 L63 92 L60 96 L57 92 Z" fill="#dc2626"/>
        </svg>
      `)
    },
    {
      id: 'bs-2',
      name: '商务·金牌顾问',
      url: encodeSvg(`
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
          <defs>
            <linearGradient id="bsbg2" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stop-color="#475569"/>
              <stop offset="100%" stop-color="#1e293b"/>
            </linearGradient>
          </defs>
          <circle cx="60" cy="60" r="58" fill="url(#bsbg2)" stroke="#e2e8f0" stroke-width="2.5"/>
          <circle cx="60" cy="46" r="20" fill="#fde68a" opacity="0.3"/>
          <circle cx="60" cy="46" r="19" fill="#fef3c7"/>
          <path d="M36 46 C36 20 84 20 84 46 C84 30 74 18 60 18 C46 18 36 30 36 46 Z" fill="#1e1b4b"/>
          <circle cx="52" cy="46" r="2.5" fill="#1e293b"/>
          <circle cx="68" cy="46" r="2.5" fill="#1e293b"/>
          <path d="M56 55 Q60 58 64 55" stroke="#e11d48" stroke-width="1.8" fill="none"/>
          <path d="M28 110 C28 80 42 70 60 70 C78 70 92 80 92 110 Z" fill="#1e293b"/>
          <path d="M46 70 L60 94 L74 70" fill="#f8fafc"/>
          <circle cx="60" cy="80" r="3" fill="#eab308"/>
        </svg>
      `)
    },
    {
      id: 'bs-3',
      name: '系统·默认会员',
      url: '/static/avatars/avatar-demo.png'
    }
  ]
};

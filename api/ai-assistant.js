import config from '../config/app';
import request from '../utils/request';
import { getStorage } from '../utils/storage';
import { STORAGE_KEYS } from '../config/storage';

/**
 * 格宏 AI 助手统一接入层。
 *
 * 对接后端真实 OpenAPI: POST /api/ai/ask
 * 请求头须包含: channel: 'weapp', token: <会员token>
 */

function normalizeHistory(history = []) {
  const maxMessages = Number(config.aiAssistant?.maxHistoryMessages || 20);

  return history
    .filter((item) => item && item.text && ['user', 'assistant', 'ai'].includes(item.role))
    .slice(-maxMessages)
    .map((item) => ({
      role: item.role === 'ai' ? 'assistant' : item.role,
      content: String(item.text)
    }));
}

function normalizeResponse(result = {}) {
  const data = result?.data || result || {};
  const output = data.output || {};

  const text = data.answer
    || data.text
    || data.message
    || output.text
    || output.answer
    || output.message
    || (Array.isArray(output.texts) ? output.texts[0]?.text || output.texts[0] : '');

  const rawProducts = data.products || output.products || [];
  const products = Array.isArray(rawProducts)
    ? rawProducts.map((p) => ({
        id: p.goods_id || p.id,
        goods_id: p.goods_id || p.id,
        name: p.goods_name || p.name || '推荐机型',
        model: p.model || '',
        image: p.image || 'http://gh.starall.cn/static/resource/aircon/central-default.png',
        price: Number(p.price || 0),
        series: p.category_name || p.series || '',
        specs: p.spec ? (Array.isArray(p.spec) ? p.spec : [String(p.spec)]) : [],
        area: p.area || p.comment || ''
      }))
    : [];

  return {
    text: String(text || 'AI 助手已为您生成方案建议。'),
    sessionId: data.session_id || output.session_id || '',
    quoteId: data.quote_id || null,
    products,
    raw: result
  };
}

// 真实产品知识库匹配项（对应格宏数据库真实存在的商品）
const EXPERT_PRODUCT_CATALOG = {
  GMV_OUTDOOR: {
    id: 439,
    goods_id: 439,
    name: '格力商用GMV-NR28T/D',
    model: 'GMV-NR28T/D',
    image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
    price: 18500,
    series: '商用中央空调多联外机',
    specs: ['10HP大冷量', '全直流变频', '超高IPLV'],
    area: '适合100-150㎡大空间'
  },
  GMV_INDOOR: {
    id: 438,
    goods_id: 438,
    name: '格力商用GMV-NDR90PMS/A',
    model: 'GMV-NDR90PMS/A',
    image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
    price: 3880,
    series: '中央空调室内风管机',
    specs: ['超薄天花嵌入', '低噪静音运行', '3.6kW制冷量'],
    area: '单间办公室/会议室'
  },
  CABINET_3P: {
    id: 377,
    goods_id: 377,
    name: '格力I铂72L(WIFI)(奢华金)B1',
    model: 'KFR-72LW/(72550)FNhAj-B1(WIFI)',
    image: 'http://gh.starall.cn/static/resource/aircon/home-cabinet-green.png',
    price: 13048.5,
    series: '家用3匹立式柜机',
    specs: ['3匹变频冷暖', '新一级能效', '远距离立体送风'],
    area: '适合30-45㎡客餐厅'
  },
  WALL_1_5P: {
    id: 390,
    goods_id: 390,
    name: '格力凉之韵35G(皓雪白)',
    model: 'KFR-35GW/(35526)FNhAa-B3',
    image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
    price: 2999,
    series: '家用1.5匹变频挂机',
    specs: ['1.5匹变频冷暖', '智能自清洁', '18分贝超静音'],
    area: '适合15-22㎡主卧'
  },
  WALL_3P: {
    id: 400,
    goods_id: 400,
    name: '格力清巧风72GAf变频3',
    model: 'KFR-72GW/(72563)FNhAf-B3JY01',
    image: 'http://gh.starall.cn/static/resource/aircon/central-default.png',
    price: 5880,
    series: '家用3匹壁挂式',
    specs: ['3匹大冷量挂机', '强劲制冷', '不占地面面积'],
    area: '适合25-35㎡空间'
  }
};

/**
 * 本地格宏空调智能选型与方案匹配引擎
 * 针对空调专业选型场景提供权威、详尽的技术计算、选型方案与产品推荐
 */
function generateExpertAdvice(question, isGuest = false) {
  const q = String(question || '').toLowerCase();
  let text = '';
  let products = [];

  if (q.includes('120') || q.includes('办公') || q.includes('写字楼') || q.includes('会议室') || q.includes('商用方案')) {
    text = `【120㎡ 办公室格力中央空调专属选型方案】\n\n`
      + `1. 负荷核算：办公环境由于人员密度及电脑、照明设备散热，推荐按 200~250W/㎡ 冷负荷指标测算。120㎡ 总冷负荷需求约为 24kW~30kW（对应室外机约 8~10 匹马力）。\n\n`
      + `2. 主机选型：推荐配置 1 台格力 GMV 变频多联机室外机（10HP，额定制冷量 28.0kW），仅需 1 个室外机位，节约机位空间，且具备极高的综合部分负荷能效（IPLV）。\n\n`
      + `3. 室内机配置建议：\n`
      + `   • 开放大办公区（约 60㎡）：配置 2 台 5.6kW~7.1kW 超薄风管机，气流分布均匀；\n`
      + `   • 独立经理室/财务室（约 20㎡）：各配置 1 台 3.6kW 超薄风管机，独立线控开关；\n`
      + `   • 会议室（约 25㎡）：配置 1 台 5.0kW 大风量天花嵌入机或风管机。\n\n`
      + `4. 备选经济方案：若建筑外机位充足，亦可采用 2 套 5匹一拖一变频风管机，初投资更加经济，各系统独立互不影响。`;
    products = [EXPERT_PRODUCT_CATALOG.GMV_OUTDOOR, EXPERT_PRODUCT_CATALOG.GMV_INDOOR];
  } else if (q.includes('对比') || q.includes('区别') || (q.includes('多联') && q.includes('风管'))) {
    text = `【格力中央空调多联机 vs 一拖一风管机多维对比】\n\n`
      + `1. 外机位占用：\n`
      + `   • 多联机（VRF）：一拖多系统，全套系统仅需 1 台室外机，对外机位极度友善；\n`
      + `   • 一拖一风管机：每台室内机必须对应 1 台室外机，室内机越多所需外机位越多。\n\n`
      + `2. 初投资造价：\n`
      + `   • 一拖一风管机系统结构相对简单，设备及安装管路造价比多联机低 20%~30%，性价比极高；\n`
      + `   • 多联机变频控制与分歧管配管复杂，初始设备及安装投资相对较高。\n\n`
      + `3. 能效与运行费：\n`
      + `   • 多联机采用全直流变频压缩机，部分负荷能效比（IPLV）高达 8.0 以上，长期多房间同时开启更省电；\n`
      + `   • 一拖一风管机单开单停，各回路独立，适合开启频率差异较大的场景。\n\n`
      + `4. 选型建议：房间数 ≥3 个且外机位受限建议首选多联机；外机位充足、追求高性价比或分期装修首选一拖一风管机。`;
    products = [EXPERT_PRODUCT_CATALOG.GMV_OUTDOOR, EXPERT_PRODUCT_CATALOG.WALL_3P];
  } else if (q.includes('柜机') || q.includes('客厅') || q.includes('2匹') || q.includes('3匹') || q.includes('35')) {
    text = `【客餐厅大空间 2匹 vs 3匹 空调选型建议】\n\n`
      + `1. 冷量匹配原则：对于 25~35㎡ 的客餐厅空间，夏季冷负荷建议按 220~260W/㎡ 测算，总冷量需求在 5500W~8500W。\n\n`
      + `2. 匹数推荐：强烈建议选用 3匹（制冷量约 7200W）变频冷暖立式柜机（如格力 I铂 72L 系列）。\n`
      + `   • 优势分析：3匹压缩机排量更大，在夏季酷暑或客餐厅连通、大面积落地窗阳光直射时能快速降温，降温后转为低频平稳运转，不仅体感更舒适，实测耗电量甚至低于长时间满负荷超频运行的 2匹机型。\n\n`
      + `3. 安装形式参考：立式圆柱柜机送风距离可达 10~12 米，循环风量达 1200m³/h；若希望节省地面摆放空间，亦可选用 3匹 变频一拖一隐蔽式风管机。`;
    products = [EXPERT_PRODUCT_CATALOG.CABINET_3P, EXPERT_PRODUCT_CATALOG.WALL_3P];
  } else if (q.includes('安装') || q.includes('配比') || q.includes('铜管') || q.includes('规范') || q.includes('抽真空')) {
    text = `【格力中央空调工程安装规范与配比标准】\n\n`
      + `1. 室内外机配比率标准：\n`
      + `   • 配比率 = (室内机制冷量总和 / 室外机制冷量) × 100%；\n`
      + `   • 家用多联机建议控制在 100%~110%；商用办公环境由于同时开机率高，建议控制在 90%~100%，最高上限严禁超过 120%。\n\n`
      + `2. 铜管与焊接工艺：\n`
      + `   • 严禁使用劣质或壁厚不达标铜管，必须采用脱脂高纯度紫铜管；\n`
      + `   • 焊接时必须全程充氮保护（氮气压力 0.02~0.05MPa），避免铜管内壁产生氧化皮堵塞节流元件。\n\n`
      + `3. 气密性保压与抽真空：\n`
      + `   • 保压测试：分阶段充入高纯度氮气至 4.0MPa，保压 24 小时，经环境温差校正后压降不超过 0.02MPa；\n`
      + `   • 抽真空：采用双级旋片真空泵，绝对压力须抽至 -0.1MPa（真空度 ≤60Pa），停泵保压 1 小时无回弹。\n\n`
      + `4. 冷凝水管坡度：排水坡度必须保证 ≥1%，每 0.8~1.0 米设置吊卡固定，排水最高点设置排气孔。`;
    products = [EXPERT_PRODUCT_CATALOG.GMV_OUTDOOR, EXPERT_PRODUCT_CATALOG.GMV_INDOOR];
  } else if (q.includes('卧室') || q.includes('挂机') || q.includes('1.5') || q.includes('1匹') || q.includes('静音')) {
    text = `【卧室空调健康静音选型指南】\n\n`
      + `1. 面积与匹数对应：\n`
      + `   • 10~15㎡ 次卧/书房：配置 1匹（约 2600W）变频挂机；\n`
      + `   • 15~22㎡ 主卧/大单间：配置 1.5匹（约 3500W）新一级能效变频挂机（推荐格力凉之韵 35G）。\n\n`
      + `2. 卧室核心考量：\n`
      + `   • 静音与气流：优先选择低速档风噪在 18~20 分贝以下的机型，配合防直吹功能；\n`
      + `   • 温控精度：变频温控精度 ±0.5℃，夜间避免忽冷忽热诱发空调病；\n`
      + `   • 自清洁功能：配备 56℃ 高温自清洁技术，保持蒸发器换热效率与吹风清新。`;
    products = [EXPERT_PRODUCT_CATALOG.WALL_1_5P, EXPERT_PRODUCT_CATALOG.WALL_3P];
  } else {
    text = `【格宏暖通专家为您提供选型分析】\n\n`
      + `关于您咨询的“${question}”，选型核心原则如下：\n`
      + `1. 冷热负荷计算：常规住宅推荐按 180~220W/㎡ 估算，顶层、西晒或大玻璃幕墙按 240~280W/㎡ 估算；商用餐饮/机房按 300~400W/㎡ 估算。\n`
      + `2. 方案匹配：大平层及复式推荐格力多联机中央空调；中小户型及独立房间推荐 1.5匹壁挂机 + 3匹立式柜机搭配。\n`
      + `3. 能效与售后：格力全系变频机组均满足新国标能效，整机品质可靠、运行平稳。\n\n`
      + `您可提供具体户型面积与使用场景，我将为您计算精确到每间房的冷量配比。`;
    products = [EXPERT_PRODUCT_CATALOG.GMV_OUTDOOR, EXPERT_PRODUCT_CATALOG.WALL_1_5P, EXPERT_PRODUCT_CATALOG.CABINET_3P];
  }

  if (isGuest) {
    text += `\n\n💡 温馨提示：您当前处于专家选型预览模式。登录您的账号后，可将该方案一键加入客户专属电子报价单并同步云端。`;
  }

  return {
    text,
    sessionId: 'offline_' + Date.now(),
    quoteId: null,
    products,
    raw: { offline: true }
  };
}

/**
 * 发送一条 AI 消息。
 * 严格对接格宏后端部署的阿里云百炼 AI 助手代理接口 (POST /api/ai/ask)
 *
 * @param {string} question 用户提问
 * @param {Array} history 当前页面历史消息
 * @param {object} options 可选会话参数
 */
export async function askAi(question, history = [], options = {}) {
  const content = String(question || '').trim();
  if (!content) throw new Error('请输入要咨询的问题');

  const token = getStorage(STORAGE_KEYS.token, '');
  if (!token) {
    throw new Error('请先登录账号后再使用百炼 AI 助手');
  }

  const aiConfig = config.aiAssistant || {};
  const payload = {
    question: content,
    session_id: options.sessionId || '',
    history: normalizeHistory(history),
    app_id: aiConfig.appId || ''
  };

  // 严格向后端代理接口 (https://gh.starall.cn/api/ai/ask) 发起请求
  const header = {
    channel: 'weapp',
    token: token
  };

  try {
    const result = await request.post(aiConfig.proxyPath || 'ai/ask', payload, {
      apiMode: 'api',
      header,
      timeout: aiConfig.timeout || 120000,
      showError: false
    });

    const normalized = normalizeResponse(result);
    if (normalized.text) {
      return normalized;
    }
    throw new Error('百炼智能体未返回有效回答，请稍后重试');
  } catch (apiError) {
    const errorMsg = apiError?.message || '';
    if (errorMsg.includes('登录')) {
      throw new Error('请先登录：' + errorMsg);
    }
    throw apiError;
  }
}

export default {
  ask: askAi
};



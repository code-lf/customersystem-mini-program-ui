<template>
  <view class="quote-edit-page">
    <AppWatermark />
    <AppNavbar title="编辑报价单" />

    <view v-if="loading" class="state-card">正在读取报价单...</view>
    <view v-else-if="loadError" class="state-card">
      <text>{{ loadError }}</text>
      <button class="outline-button" @click="loadQuote">重试</button>
    </view>
    <template v-else>
      <view class="summary-card">
        <text class="quote-no">报价单号：{{ quote.quote_no || quoteId }}</text>
        <text class="summary-hint">保存后更新当前报价单，商品与金额由后端重新核算。</text>
        <text class="original-total">修改前应付：¥{{ money(quote.pay_amount) }}</text>
      </view>

      <view class="section-card">
        <view class="section-title">
          <text>设备明细（{{ items.length }} 款）</text>
          <text class="muted">至少保留 1 款</text>
        </view>
        <view v-for="(item, index) in items" :key="item.goods_id" class="goods-row">
          <view class="goods-head">
            <view class="goods-heading">
              <text class="goods-model">{{ item.model || item.name }}</text>
              <text class="goods-name">{{ item.name }}</text>
              <text class="muted">原折后单价 ¥{{ money(item.originalPrice) }}</text>
            </view>
            <button class="remove-button" :disabled="items.length <= 1" @click="removeItem(index)">移除</button>
          </view>
          <view class="field-row">
            <text>数量</text>
            <view class="stepper">
              <button @click="stepQty(item, -1)">−</button>
              <input v-model="item.quantity" type="digit" />
              <button @click="stepQty(item, 1)">＋</button>
            </view>
          </view>
          <view class="field-row">
            <text>盒数 / 箱数</text>
            <view class="pair-inputs">
              <input v-model="item.box_quantity" type="digit" placeholder="盒数" />
              <input v-model="item.carton_quantity" type="digit" placeholder="箱数" />
            </view>
          </view>
          <view class="field-row">
            <text>单品折扣</text>
            <view class="input-with-unit">
              <input v-model="item.discount_rate" type="digit" placeholder="跟随整单" />
              <text>%</text>
            </view>
          </view>
          <view class="field-row">
            <text>手动报价单价</text>
            <switch :checked="item.manual_price" color="#2468e8" @change="item.manual_price = $event.detail.value" />
          </view>
          <view v-if="item.manual_price" class="field-row">
            <text>单价</text>
            <view class="input-with-unit">
              <text>¥</text>
              <input v-model="item.quote_price" type="digit" placeholder="请输入单价" />
            </view>
          </view>
          <view class="field-row">
            <text>商品备注</text>
            <input v-model="item.remark" class="wide-input" placeholder="选填" />
          </view>
        </view>
      </view>

      <view class="section-card">
        <view class="section-title">添加设备</view>
        <view class="search-row">
          <input v-model="searchKeyword" confirm-type="search" placeholder="搜索型号或商品名称" @confirm="searchGoods" />
          <button :loading="searching" @click="searchGoods">搜索</button>
        </view>
        <view v-for="goods in searchResults" :key="goods.goods_id" class="search-result">
          <view>
            <text class="goods-model">{{ goods.model || goods.goods_name }}</text>
            <text class="goods-name">{{ goods.goods_name }}</text>
          </view>
          <button @click="addItem(goods)">加入</button>
        </view>
        <text v-if="searchDone && !searchResults.length" class="muted search-empty">未找到商品</text>
      </view>

      <view class="section-card">
        <view class="section-title">折扣与费用</view>
        <view class="field-row"><text>整单折扣率</text><view class="input-with-unit"><input v-model="globalDiscountRate" type="digit" /><text>%</text></view></view>
        <view class="field-row"><text>安装费</text><view class="input-with-unit"><text>¥</text><input v-model="installationAmount" type="digit" /></view></view>
        <view class="field-row"><text>增项费用</text><view class="input-with-unit"><text>¥</text><input v-model="additionAmount" type="digit" /></view></view>
        <view class="field-row"><text>报价备注</text><input v-model="remark" class="wide-input" placeholder="选填" /></view>
      </view>

      <view class="footer-space" />
      <view class="save-bar">
        <text>保存后由后台计算新金额</text>
        <button :disabled="saving || !editable" :loading="saving" @click="saveQuote">保存修改</button>
      </view>
    </template>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import AppWatermark from '@/components/app-watermark.vue';
import { getSolutionDetail, updateQuote } from '@/api/solution';
import { getProductList } from '@/api/product';
import { replacePage } from '@/utils/pages';

const quoteId = ref(0);
const quote = ref({});
const items = ref([]);
const loading = ref(true);
const loadError = ref('');
const editable = ref(false);
const saving = ref(false);
const globalDiscountRate = ref('100');
const installationAmount = ref('0');
const additionAmount = ref('0');
const remark = ref('');
const searchKeyword = ref('');
const searchResults = ref([]);
const searching = ref(false);
const searchDone = ref(false);

const money = (value) => Number(value || 0).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

/** 将正式报价明细转为可编辑字段；只有手动单品折扣和手动价格才作为覆盖值提交。 */
const mapItem = (item) => ({
  goods_id: Number(item.goods_id),
  name: item.goods_name_snapshot || item.goods_name || '',
  model: item.model_snapshot || item.model || '',
  originalPrice: item.quote_price ?? item.origin_price ?? 0,
  quantity: String(item.quantity ?? 1),
  box_quantity: String(item.box_quantity ?? 0),
  carton_quantity: String(item.carton_quantity ?? 0),
  // 详情未提供分类折扣配置时，将已生效的分类折扣转为单品折扣，避免保存后静默丢失。
  discount_rate: ['manual_item', 'manual_category'].includes(item.discount_source) ? String(item.discount_rate ?? '') : '',
  manual_price: item.manual_price === true || /manual/i.test(String(item.price_source || '')),
  quote_price: String(item.quote_price ?? ''),
  remark: item.remark || ''
});

/** 正式报价仅 draft/sent 可修改；详情页与保存前都检查状态。 */
const loadQuote = async () => {
  loading.value = true;
  loadError.value = '';
  try {
    if (!Number.isInteger(quoteId.value) || quoteId.value <= 0) throw new Error('报价单 ID 无效');
    const detail = await getSolutionDetail(quoteId.value);
    if (!detail || !Array.isArray(detail.items)) throw new Error('报价详情格式不正确');
    quote.value = detail;
    editable.value = ['draft', 'sent'].includes(detail.quote_status);
    if (!editable.value) throw new Error('该报价状态不允许编辑');
    items.value = detail.items.map(mapItem);
    globalDiscountRate.value = String(detail.global_discount_rate ?? 100);
    installationAmount.value = String(detail.installation_amount ?? 0);
    additionAmount.value = String(detail.addition_amount ?? 0);
    remark.value = detail.remark || '';
  } catch (error) {
    loadError.value = error?.message || '报价单加载失败';
  } finally {
    loading.value = false;
  }
};

onLoad((options) => {
  quoteId.value = Number(options?.id);
  loadQuote();
});

const stepQty = (item, delta) => {
  const current = Number(item.quantity) || 0;
  item.quantity = String(Math.max(1, current + delta));
};

const removeItem = (index) => {
  if (items.value.length > 1) items.value.splice(index, 1);
};

/** 搜索使用正式商品列表，不修改当前报价篮。 */
const searchGoods = async () => {
  const keyword = searchKeyword.value.trim();
  if (!keyword) {
    uni.showToast({ title: '请输入型号或商品名称', icon: 'none' });
    return;
  }
  searching.value = true;
  searchDone.value = false;
  try {
    const page = await getProductList({ keyword, page: 1, limit: 20 });
    searchResults.value = Array.isArray(page) ? page : (Array.isArray(page?.data) ? page.data : []);
    searchDone.value = true;
  } catch (error) {
    uni.showToast({ title: error?.message || '商品搜索失败', icon: 'none' });
  } finally {
    searching.value = false;
  }
};

const addItem = (goods) => {
  if (items.value.some((item) => item.goods_id === Number(goods.goods_id))) {
    uni.showToast({ title: '该设备已在报价单中', icon: 'none' });
    return;
  }
  items.value.push(mapItem({
    goods_id: goods.goods_id,
    goods_name: goods.goods_name,
    model: goods.model,
    origin_price: goods.price,
    quantity: 1
  }));
  searchResults.value = [];
  searchKeyword.value = '';
  searchDone.value = false;
};

const validNumber = (value, name, minimum = 0, maximum = Infinity) => {
  const number = Number(value);
  if (String(value).trim() === '' || !Number.isFinite(number) || number < minimum || number > maximum) {
    const range = maximum === Infinity ? `不小于 ${minimum}` : `${minimum}～${maximum}`;
    throw new Error(`${name}需填写${range}的数字`);
  }
  return number;
};

/** 按新 OpenAPI 组装完整 items；不提交前端计算金额，由后端重建明细并核价。 */
const buildPayload = () => {
  if (!items.value.length) throw new Error('报价单至少保留一款设备');
  const rate = validNumber(globalDiscountRate.value, '整单折扣率', 0, 100);
  return {
    global_discount_rate: rate,
    installation_amount: validNumber(installationAmount.value, '安装费'),
    addition_amount: validNumber(additionAmount.value, '增项费用'),
    remark: remark.value.trim(),
    items: items.value.map((item, index) => {
      const goodsId = Number(item.goods_id);
      if (!Number.isInteger(goodsId) || goodsId <= 0) throw new Error(`第 ${index + 1} 款设备 ID 无效`);
      const data = {
        goods_id: goodsId,
        quantity: validNumber(item.quantity, `第 ${index + 1} 款数量`, 0.01),
        box_quantity: validNumber(item.box_quantity, `第 ${index + 1} 款盒数`),
        carton_quantity: validNumber(item.carton_quantity, `第 ${index + 1} 款箱数`),
        manual_price: Boolean(item.manual_price),
        remark: item.remark.trim()
      };
      if (String(item.discount_rate).trim() !== '') {
        data.discount_rate = validNumber(item.discount_rate, `第 ${index + 1} 款折扣`, 0, 100);
      }
      if (data.manual_price) {
        data.quote_price = validNumber(item.quote_price, `第 ${index + 1} 款手动单价`);
      }
      return data;
    })
  };
};

const saveQuote = async () => {
  if (saving.value || !editable.value) return;
  let payload;
  try {
    payload = buildPayload();
  } catch (error) {
    uni.showToast({ title: error?.message || '请检查填写内容', icon: 'none' });
    return;
  }
  saving.value = true;
  uni.showLoading({ title: '正在保存报价...' });
  let saved = false;
  let saveError = null;
  try {
    const result = await updateQuote(quoteId.value, payload);
    if (Number(result?.quote_id) !== quoteId.value) throw new Error('后端未确认原报价单 ID，保存结果待核实');
    saved = true;
  } catch (error) {
    saveError = error;
  } finally {
    uni.hideLoading();
    saving.value = false;
  }
  if (!saved) {
    uni.showToast({ title: saveError?.message || '保存报价失败', icon: 'none' });
    return;
  }
  // 保存已由后端确认；本地缓存清理异常不能误报为报价保存失败。
  try {
    const localRecords = (uni.getStorageSync('solution_history_records') || []).filter(
      (record) => String(record.quote_id || record.id) !== String(quoteId.value)
    );
    uni.setStorageSync('solution_history_records', localRecords);
  } catch (error) {
    console.warn('报价本地快照清理失败:', error);
  }
  uni.showToast({ title: '报价单修改成功', icon: 'success' });
  setTimeout(() => replacePage('/pages/solution/share', { id: quoteId.value }), 500);
};
</script>

<style lang="scss" scoped>
.quote-edit-page { min-height: 100vh; padding: 0 24rpx; background: #f4f7fc; }
.state-card, .summary-card, .section-card { margin: 20rpx 0; padding: 24rpx; border-radius: 20rpx; background: #fff; }
.state-card { color: #64748b; text-align: center; }
.outline-button { margin-top: 20rpx; color: #2468e8; background: #eef4ff; }
.quote-no, .summary-hint, .original-total, .goods-model, .goods-name, .muted { display: block; }
.quote-no { color: #17233d; font-size: 28rpx; font-weight: 800; }
.summary-hint { margin-top: 12rpx; color: #64748b; font-size: 23rpx; }
.original-total { margin-top: 14rpx; color: #ef543f; font-size: 25rpx; }
.section-title { display: flex; justify-content: space-between; align-items: center; margin-bottom: 14rpx; color: #17233d; font-size: 28rpx; font-weight: 800; }
.muted { color: #94a3b8; font-size: 21rpx; font-weight: 400; }
.goods-row { padding: 20rpx 0; border-top: 1rpx solid #edf1f8; }
.goods-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 12rpx; }
.goods-heading { min-width: 0; flex: 1; }
.goods-model { color: #17233d; font-size: 26rpx; font-weight: 700; overflow-wrap: anywhere; }
.goods-name { margin: 6rpx 0; color: #64748b; font-size: 22rpx; }
.remove-button { margin: 0; padding: 0 16rpx; height: 48rpx; line-height: 48rpx; color: #ef4444; background: #fff1f2; font-size: 22rpx; }
.field-row { display: flex; align-items: center; justify-content: space-between; min-height: 72rpx; gap: 16rpx; border-bottom: 1rpx solid #f1f5f9; color: #475569; font-size: 24rpx; }
.field-row:last-child { border-bottom: none; }
.field-row > text:first-child { flex-shrink: 0; }
.wide-input, .pair-inputs input, .input-with-unit, .stepper { border: 1rpx solid #dce5f2; border-radius: 10rpx; background: #fff; }
.wide-input { height: 58rpx; flex: 1; min-width: 0; padding: 0 12rpx; text-align: right; }
.pair-inputs { display: flex; gap: 8rpx; }
.pair-inputs input { width: 110rpx; height: 58rpx; padding: 0 8rpx; text-align: center; }
.input-with-unit { display: flex; align-items: center; gap: 4rpx; padding: 0 10rpx; height: 58rpx; }
.input-with-unit input { width: 138rpx; height: 56rpx; text-align: right; }
.stepper { display: flex; align-items: center; overflow: hidden; }
.stepper button { margin: 0; padding: 0; width: 50rpx; height: 54rpx; line-height: 54rpx; font-size: 28rpx; color: #2468e8; background: #eef4ff; }
.stepper input { width: 78rpx; height: 54rpx; text-align: center; }
.search-row { display: flex; gap: 12rpx; }
.search-row input { min-width: 0; flex: 1; height: 66rpx; padding: 0 16rpx; border-radius: 10rpx; background: #f5f8fd; }
.search-row button, .search-result button { margin: 0; padding: 0 20rpx; height: 66rpx; line-height: 66rpx; color: #fff; background: #2468e8; font-size: 24rpx; }
.search-result { display: flex; align-items: center; justify-content: space-between; gap: 12rpx; padding: 15rpx 0; border-bottom: 1rpx solid #edf1f8; }
.search-result > view { flex: 1; min-width: 0; }
.search-result button { flex-shrink: 0; height: 50rpx; line-height: 50rpx; border-radius: 25rpx; }
.search-empty { margin-top: 15rpx; }
.footer-space { height: 140rpx; }
.save-bar { position: fixed; bottom: 0; left: 0; right: 0; z-index: 30; display: flex; align-items: center; justify-content: space-between; gap: 20rpx; padding: 16rpx 24rpx calc(16rpx + env(safe-area-inset-bottom)); background: #fff; box-shadow: 0 -6rpx 20rpx rgba(23,35,61,.08); }
.save-bar text { color: #64748b; font-size: 21rpx; }
.save-bar button { flex-shrink: 0; margin: 0; padding: 0 30rpx; height: 72rpx; line-height: 72rpx; border-radius: 36rpx; color: #fff; background: #2468e8; font-size: 26rpx; }
.save-bar button[disabled] { opacity: .5; }
</style>

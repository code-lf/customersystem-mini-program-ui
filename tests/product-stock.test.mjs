import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { runInNewContext } from 'node:vm';
import test from 'node:test';
import { computed, reactive } from 'vue';

const component = await readFile(new URL('../components/product-stock.vue', import.meta.url), 'utf8');
const roleSource = await readFile(new URL('../utils/member-role.js', import.meta.url), 'utf8');
const { isSalespersonAccount } = await import(`data:text/javascript,${encodeURIComponent(roleSource)}`);

// 执行组件实际计算逻辑，验证身份改变后库存随之隐藏，而非只测静态标签。
const createStockComponent = (member, loggedIn = true) => {
  const state = reactive({ member, loggedIn });
  const props = reactive({ product: { stocks: [
    { warehouse_id: 34, warehouse_name: '耕渔路仓库', quantity: 12 },
    { warehouse_id: 35, warehouse_name: '临港仓库', quantity: 0 }
  ] }, fullName: false });
  const userStore = { get isSalesperson() { return state.loggedIn && isSalespersonAccount(state.member); } };
  const context = { computed, defineProps: () => props, useUserStore: () => userStore };
  const script = component.match(/<script setup>([\s\S]*?)<\/script>/)[1].replace(/^import .*;\r?$/gm, '');
  runInNewContext(`${script}\nglobalThis.stockRows = stocks;`, context);
  return { state, props, rows: context.stockRows };
};

test('业务员列表显示仓库名前三个字及零库存，详情显示完整仓库名称', () => {
  const view = createStockComponent({ admin_account: { uid: 12, status: 1 } });
  assert.deepEqual(JSON.parse(JSON.stringify(view.rows.value)), [
    { warehouse_id: 34, name: '耕渔路', quantity: '12' },
    { warehouse_id: 35, name: '临港仓', quantity: '0' }
  ]);
  view.props.fullName = true;
  assert.equal(view.rows.value[0].name, '耕渔路仓库');
  view.props.product.stocks.push({ warehouse_id: 36, warehouse_name: '无数据仓库', quantity: null });
  assert.equal(view.rows.value.length, 2);
  view.state.loggedIn = false;
  assert.equal(view.rows.value.length, 0);
});

test('普通会员、纯经销商和禁用后台账号均隐藏库存，旧合计字段不回显', () => {
  for (const member of [{}, { is_dealer: 1 }, { admin_account: { uid: 12, status: 0 } }]) {
    const view = createStockComponent(member);
    assert.equal(view.rows.value.length, 0);
    view.props.fullName = true;
    assert.equal(view.rows.value.length, 0);
  }
  const view = createStockComponent({ admin_account: { uid: 12, status: 1 } });
  view.props.product = { stock_quantity: 100 };
  assert.equal(view.rows.value.length, 0);
});

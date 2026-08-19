/**
 * 展示层分类配置。
 * 商品 JSON 只有 category/category_name，没有完整四级分类，
 * 所以这里维护可替换的展示分类，不修改后端原始商品字段。
 */
export const PRODUCT_TAXONOMY = {
  central: [
    { id: 'multi', name: '多联机', description: '适合住宅、别墅及中小型商业空间', icon: 'grid' },
    { id: 'commercial', name: '商用空调', description: '适合办公、门店和公共空间', icon: 'home' },
    { id: 'air-energy', name: '空气能', description: '高效节能的专业设备配置', icon: 'setting' }
  ],
  home: [
    { id: 'wall', name: '壁挂式空调', description: '节能静音，适合卧室和小型空间', icon: 'home' },
    { id: 'cabinet', name: '柜式空调', description: '大风量，适合客厅和大面积空间', icon: 'list' }
  ]
};

export function getTaxonomy(type = 'central') {
  return PRODUCT_TAXONOMY[type] || [];
}

export default PRODUCT_TAXONOMY;

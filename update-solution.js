const fs = require('fs');
let content = fs.readFileSync('pages/solution/index.vue', 'utf-8');

// Replace standard VAT section with install/additional fees
const vatSectionRegex = /<!-- 税费与备注 -->[\s\S]*?(?=<!-- 最终核算价格 -->)/;
const newSection = `<!-- 附加费用与备注 -->
          <view class="form-section">
            <view class="setting-item">
              <text class="label">安装费</text>
              <input
                v-model="installFee"
                type="digit"
                class="price-custom-input"
                placeholder="0.00"
              />
            </view>
            <view class="setting-item">
              <text class="label">增项费用</text>
              <input
                v-model="additionalFee"
                type="digit"
                class="price-custom-input"
                placeholder="0.00"
              />
            </view>
            <view class="remark-box">
              <text class="label">报价备注 (选填)</text>
              <input
                v-model="quoteRemark"
                class="remark-input"
                placeholder="例如：含安装与铜管辅材费用、质保六年等..."
              />
            </view>
          </view>
          
`;

content = content.replace(vatSectionRegex, newSection);

// Add vars to setup
content = content.replace(/const customTotalInput = ref\(''\);/, `const customTotalInput = ref('');\nconst installFee = ref('');\nconst additionalFee = ref('');`);

// Update finalTotal computation
const finalTotalOld = /const finalTotal = computed\(\(\) => \{[\s\S]*?\}\);/;
const finalTotalNew = `const finalTotal = computed(() => {
  let total = 0;
  if (pricingMode.value === 'total') {
    total = Number(customTotalInput.value) || 0;
  } else {
    total = totalPrice.value - discountAmount.value;
  }
  const install = Number(installFee.value) || 0;
  const additional = Number(additionalFee.value) || 0;
  return total + install + additional;
});`;
content = content.replace(finalTotalOld, finalTotalNew);

// Update exportQuote to include fields
content = content.replace(/extra_amount: 0,/, `extra_amount: (Number(installFee.value) || 0) + (Number(additionalFee.value) || 0),\n      install_fee: Number(installFee.value) || 0,\n      additional_fee: Number(additionalFee.value) || 0,`);
content = content.replace(/totalPrice: Number\(createdQuote\.pay_amount \?\? finalTotal\.value\),/, `totalPrice: Number(createdQuote.pay_amount ?? finalTotal.value),\n      install_fee: Number(installFee.value) || 0,\n      additional_fee: Number(additionalFee.value) || 0,`);

fs.writeFileSync('pages/solution/index.vue', content);

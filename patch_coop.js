const fs = require('fs');
let content = fs.readFileSync('pages/cooperation/index.vue', 'utf-8');

const newScript = `<script setup>
import { ref, reactive } from 'vue';
import { onShareAppMessage, onShareTimeline } from '@dcloudio/uni-app';
import AppNavbar from '@/components/app-navbar.vue';
import request from '@/utils/request';

const formData = reactive({
  name: '',
  phone: '',
  company: '',
  region: '',
  address: '',
  intro: ''
});

const isSubmitting = ref(false);

const handleSubmit = async () => {
  if (!formData.name || !formData.phone || !formData.company || !formData.region || !formData.address || !formData.intro) {
    uni.showToast({ title: '请填写完整的带*必填项', icon: 'none' });
    return;
  }
  if (!/^1[3-9]\\d{9}$/.test(formData.phone)) {
    uni.showToast({ title: '手机号码格式不正确', icon: 'none' });
    return;
  }
  isSubmitting.value = true;
  try {
    const regionParts = formData.region.split(' ');
    await request.post('crm/dealer/apply', {
      dealer_name: formData.company,
      contact_name: formData.name,
      contact_phone: formData.phone,
      province: regionParts[0] || formData.region,
      city: regionParts[1] || '',
      district: regionParts[2] || '',
      address: formData.address,
      business_desc: formData.intro
    });
    uni.showToast({ title: '申请提交成功', icon: 'success' });
    Object.keys(formData).forEach(key => formData[key] = '');
  } catch(e) {}
  isSubmitting.value = false;
};

onShareAppMessage(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', path: '/pages/cooperation/index' }));
onShareTimeline(() => ({ title: '诚邀合作 - 欢迎申请成为我们的合作伙伴', query: '' }));
</script>`;

content = content.replace(/<script setup>[\s\S]*?<\/script>/, newScript);
fs.writeFileSync('pages/cooperation/index.vue', content);
console.log('patched coop');

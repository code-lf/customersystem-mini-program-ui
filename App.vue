<style lang="scss">
	/*
	 * uview-plus 的基础样式必须在 App.vue 中引入，不能放进 uni.scss。
	 * uni.scss 会被编译到每个页面，直接引入完整组件样式会明显增大包体积。
	 */
	@import "@/uni_modules/uview-plus/index.scss";
	/* 项目自己的公共布局和安全区样式，所有页面都可以直接使用。 */
	@import "@/styles/common.scss";
</style>

<script>
	import { getColleagueInviteId } from '@/utils/colleague-invite.mjs';
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function(options) {
			console.log('App Show')
			// 小程序码指向首页，冷启动和后台再次扫码都从入口参数转到邀请页。
			const parentId = getColleagueInviteId(options);
			if (parentId) {
				setTimeout(() => uni.navigateTo({ url: `/pages/marketing/colleague-bind?parent_dealer_id=${parentId}` }), 300);
			}
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

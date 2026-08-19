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
	export default {
		onLaunch: function() {
			console.log('App Launch')
		},
		onShow: function() {
			console.log('App Show')
		},
		onHide: function() {
			console.log('App Hide')
		}
	}
</script>

<template><view class="empty-state"><up-icon name="empty-page" size="56" color="#b8c2d2" /><text>{{ text }}</text></view></template>
<script setup>defineProps({ text: { type: String, default: '暂无数据' } });</script>
<style lang="scss" scoped>.empty-state { display:flex; flex-direction:column; align-items:center; justify-content:center; min-height:260rpx; color:#a1abbb; font-size:25rpx; gap:18rpx; }</style>

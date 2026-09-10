fetch("https://gh.starall.cn/api/crm/quote/product/category/tree", {
  method: "GET",
  headers: {
    "channel": "1",
    "Content-Type": "application/json"
  }
}).then(res => res.json()).then(console.log).catch(console.error);

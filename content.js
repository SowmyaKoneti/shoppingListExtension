function getProductInfo() {
    const metaOgImage = document.querySelector('meta[property="og:image"]');
    const imgSrc = metaOgImage ? metaOgImage.content : '';
    const url = window.location.href;
  
    return { url, imgSrc };
  }
  
  const productInfo = getProductInfo();
  chrome.storage.local.get('shoppingList', function(data) {
    const shoppingList = data.shoppingList || [];
    shoppingList.push(productInfo);
    chrome.storage.local.set({ shoppingList });
  });
  
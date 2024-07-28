document.addEventListener('DOMContentLoaded', function() {
  const list = document.getElementById('list');
  const listsContainer = document.querySelector('.lists');
  const topItemsContainer = document.querySelector('.top-items');
  const addListButton = document.getElementById('add-list');
  const listNameInput = document.getElementById('list-name');
  const listsElement = document.getElementById('lists');
  const backButton = document.getElementById('back');
  const captureButton = document.getElementById('capture');
  const clearButton = document.getElementById('clear');
  const currentListNameElement = document.getElementById('current-list-name');
  let currentListName = '';

  // Load saved lists
  chrome.storage.local.get('lists', function(data) {
    const lists = data.lists || {};
    for (const listName in lists) {
      addListToDOM(listName);
    }
  });

  // Add a new list
  addListButton.addEventListener('click', function() {
    const listName = listNameInput.value.trim();
    if (listName && !document.querySelector(`li[data-list-name="${listName}"]`)) {
      addListToDOM(listName);
      chrome.storage.local.get('lists', function(data) {
        const lists = data.lists || {};
        lists[listName] = [];
        chrome.storage.local.set({ lists });
      });
    }
    listNameInput.value = '';
  });

  // Show items in a list
  listsElement.addEventListener('click', function(event) {
    if (event.target.tagName === 'LI') {
      currentListName = event.target.dataset.listName;
      currentListNameElement.textContent = currentListName;
      showListItems(currentListName);
      listsContainer.style.display = 'none';
      topItemsContainer.style.display = 'block';
    }
  });

  // Back to lists view
  backButton.addEventListener('click', function() {
    listsContainer.style.display = 'block';
    topItemsContainer.style.display = 'none';
  });

  // Capture the current page
  captureButton.addEventListener('click', function() {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: getProductInfo
      }, function(results) {
        if (results && results[0] && results[0].result) {
          const newItem = results[0].result;
          addItemToList(newItem);

          // Save the new item to the storage
          chrome.storage.local.get('lists', function(data) {
            const lists = data.lists || {};
            lists[currentListName].push(newItem);
            chrome.storage.local.set({ lists });
          });
        }
      });
    });
  });

  // Clear the current list
  clearButton.addEventListener('click', function() {
    chrome.storage.local.get('lists', function(data) {
      const lists = data.lists || {};
      lists[currentListName] = [];
      chrome.storage.local.set({ lists });
      list.innerHTML = '';
    });
  });

  function addListToDOM(listName) {
    const li = document.createElement('li');
    li.textContent = listName;
    li.dataset.listName = listName;
    listsElement.appendChild(li);
  }

  function showListItems(listName) {
    list.innerHTML = '';
    chrome.storage.local.get('lists', function(data) {
      const items = (data.lists && data.lists[listName]) || [];
      items.forEach(item => addItemToList(item));
    });
  }

  function addItemToList(item) {
    const li = document.createElement('li');
    li.className = 'item';
    li.dataset.url = item.url;
    li.innerHTML = `<img src="${item.imgSrc}" alt=""><a href="${item.url}" target="_blank">${item.url}</a>`;
    list.appendChild(li);
  }

  function getProductInfo() {
    const metaOgImage = document.querySelector('meta[property="og:image"]');
    const imgSrc = metaOgImage ? metaOgImage.content : '';
    const url = window.location.href;
    return { url, imgSrc };
  }
});

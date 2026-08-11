function createOptimizedImage(src, alt = '', eager = false) {
  const url = !src.startsWith('http') ? new URL(src, window.location.href) : new URL(src);
  const { origin, pathname } = url;
  const img = document.createElement('img');
  img.setAttribute('loading', eager ? 'eager' : 'lazy');
  img.setAttribute('alt', alt);
  img.setAttribute(
    'src',
    `${origin}${pathname}`,
  );

  return img;
}

function tabChangeOnClick(button, block) {
  button.addEventListener('click', () => {
    const tabId = button.dataset.tabId;
    block.querySelectorAll('[role=tabpanel]').forEach((panel) => {
      if (panel.dataset.panelId == tabId) {
        panel.setAttribute('aria-hidden', false);
      } else {
        panel.setAttribute('aria-hidden', true);
      }
    });
      
    block.querySelectorAll('.tabs-list button').forEach((btn) => {
      if (btn.dataset.tabId == tabId) {
        btn.setAttribute('aria-selected', true);
      } else {
        btn.setAttribute('aria-selected', false);
      }
    });    
  });
}

export default function decorate(block) {

  const rows = [...block.children];
  const tabPanels = rows.filter((row) => row.querySelector('picture, img, a'));
  const [tabsBlockHeading, tabs] = rows.filter((row) => !tabPanels.includes(row));

  //Decorate Heading
  tabsBlockHeading.className = 'tabbed-menu-heading';

  // Decorate Tabs
  const ul = document.createElement('ul');
  [...tabs.children].forEach((tab, index) => {        
    if (tab.firstElementChild) {
      const p = tab.firstElementChild;
      const button = document.createElement('button');
      button.id = `tab-${index}`;
      button.className = 'tabs-tab';
      button.innerHTML = p.innerHTML;
      button.setAttribute('aria-controls', `tabpanel-${index}`);
      button.setAttribute('aria-selected', !index);
      button.setAttribute('role', 'tab');
      button.setAttribute('type', 'button');
      button.setAttribute('data-tab-id', index);
      p.replaceWith(button);
          
      tabChangeOnClick(button, block);

      const li = document.createElement('li');
      li.setAttribute('role', 'tablist');
      li.append(button);
      ul.append(li);  
    }
  });
  tabs.className = 'tabs-list';
  tabs.replaceChildren(ul);

  // Decorate TabPanels
  const tabPanelsBlock = document.createElement('div');
  tabPanelsBlock.className = 'tab-panels';
  tabPanels.forEach((tabPanel, index) => {
    [...tabPanel.children].forEach((div, divIndex) => {
      div.className = `tab-panel-sec-${divIndex+1}`;
      if (divIndex == 0) {
        div.querySelectorAll('picture > img').forEach((img) => img.closest('p').replaceWith(createOptimizedImage(img.src, img.alt, false)));
      } else if (divIndex == 1) {
        const i = document.createElement('i');
        i.className = 'link-icon';
        const link = div.querySelector('p:nth-child(2) a');
        link.append(i);
      }
    });

    tabPanel.className = 'tab-panel';
    const tabPanelWrapper = document.createElement('div');
    tabPanelWrapper.className = 'tab-panel-wrapper';
    tabPanelWrapper.id = `tabpanel-${index}`;
    tabPanelWrapper.setAttribute('aria-hidden', !!index);
    tabPanelWrapper.setAttribute('aria-labelledby', `tab-${index}`);
    tabPanelWrapper.setAttribute('role', 'tabpanel');
    tabPanelWrapper.setAttribute('data-panel-id', index);
    tabPanelWrapper.append(tabPanel)
    tabPanelsBlock.append(tabPanelWrapper);
  });

  block.append(tabPanelsBlock);
  block.querySelector('.tabs-list button:first-child').click();
}
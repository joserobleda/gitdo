(function(){
  function run(ctx) {
    ctx = ctx || document;

    if ('/issues' !== location.pathname && '/pulls' !== location.pathname) {
      return;
    }

    if (location.href.indexOf('gitdo%3A') === -1) {
      return;
    }

    const requested = get(location.href.replace('gitdo%3A', 'review-requested%3A')).then(findEntries);
    const assignee = get(location.href.replace('gitdo%3A', 'assignee%3A')).then(findEntries);

    Promise.all([requested, assignee])
      .then(combineEntries)
      .then(drawEntries);
  }

  function drawEntries(entries) {
    const ul = drawUl();

    const selected = document.querySelector('.states a.selected');
    if (selected) {
      selected.childNodes[2].data = " " + entries.length + " Open";
    }

    entries.forEach(entry => ul.appendChild(entry));
  }

  function combineEntries(sources) {
    return sources
      .reduce((all, source) => all.concat(source), [])
      .reduce((carry, entry) => carry.filter(fltr => fltr.id == entry.id).length ? carry : carry.concat(entry), []);
  }

  function findEntries(html) {
    var div = document.createElement('div');
    div.innerHTML = html;

    return Array.prototype.slice.call(div.querySelectorAll('.js-issue-row'));
  }

  function drawUl() {
    let blankslate = document.querySelector('.blankslate');
    let ul = document.createElement('ul');
    ul.className = "border-right border-bottom border-left js-navigation-container js-active-navigation-container";

    blankslate.parentNode.insertBefore(ul, blankslate);
    blankslate.parentNode.removeChild(blankslate);

    return ul;
  }

  function get(URL) {
    return fetch(URL).then(function(response) {
      return response.text();
    });
  };

  run();

  window.addEventListener('load', function () {
    setTimeout(function () {
      document.addEventListener("DOMSubtreeModified", function(e){
        if (e.target.tagName.toLowerCase() === 'div' && e.target.hasAttribute('data-pjax') === true) {
          run(e.target);
          return;
        }
      });
    }, 1000);
  }, false);
}());

(function(){
  function run(ctx) {
    ctx = ctx || document;

    if ('/issues' !== location.pathname) {
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

    document.querySelector('.states a.selected').childNodes[2].data = " " + entries.length + " Open";

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

    return Array.prototype.slice.call(div.querySelectorAll('.page-content li'));
  }

  function drawUl() {
    let blankslate = document.querySelector('.blankslate');
    let ul = document.createElement('ul');
    ul.className = "border-right border-bottom border-left js-navigation-container js-active-navigation-container";

    blankslate.parentNode.insertBefore(ul, blankslate);
    blankslate.parentNode.removeChild(blankslate);

    return ul;
  }

  function get(URL, cb) {
    return new Promise((resolve, reject) => {
      var xhr = new XMLHttpRequest();
      xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
          if (xhr.status == 200) {
            return resolve(xhr.responseText);
          }

          reject();
        }
      };

      xhr.open("GET", URL, false);
      xhr.send(null);
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

// App.dom: tiny helpers for building DOM. Text always goes in via textContent.
(function () {
  window.App = window.App || {};

  // el("button", { className: "btn", text: "Book", on: { click: fn }, attrs: { type: "button" } }, [children])
  function el(tag, props, children) {
    var node = document.createElement(tag);
    props = props || {};
    if (props.className) node.className = props.className;
    if (props.text != null) node.textContent = props.text;
    if (props.attrs) {
      Object.keys(props.attrs).forEach(function (k) {
        var v = props.attrs[k];
        if (v === false || v == null) return;
        node.setAttribute(k, v === true ? "" : v);
      });
    }
    if (props.on) {
      Object.keys(props.on).forEach(function (evt) {
        node.addEventListener(evt, props.on[evt]);
      });
    }
    append(node, children);
    return node;
  }

  function append(node, children) {
    if (children == null) return node;
    if (!Array.isArray(children)) children = [children];
    children.forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
    });
    return node;
  }

  function clear(node) {
    while (node.firstChild) node.removeChild(node.firstChild);
  }

  // Static, trusted markup only (illustrations, icons). Never pass anything a guest typed.
  function markup(str) {
    var t = document.createElement("template");
    t.innerHTML = str;
    return t.content;
  }

  App.dom = { el: el, append: append, clear: clear, markup: markup };
})();

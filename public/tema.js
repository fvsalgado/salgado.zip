/* Pré-paint, síncrono, sem inline: a CSP fica em `script-src 'self'` sem
   hashes a manter à mão. Corre antes do primeiro paint, portanto não há flash. */
(function () {
  try {
    var t = localStorage.getItem('tema')
    if (t === 'dark' || t === 'light') document.documentElement.dataset.theme = t
  } catch (e) {}
})()

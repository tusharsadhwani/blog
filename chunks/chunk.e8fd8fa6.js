let e=localStorage.getItem("lightMode");(e===null&&window.matchMedia&&window.matchMedia("(prefers-color-scheme: light)").matches||e==="true")&&(document.documentElement.dataset.theme="light");

import{e}from"./jsxRuntime.module.a54635a1.js";import"./preact.module.3b40a332.js";const s="_themeSwitch_7bdj1_1";var c={themeSwitch:s};const m=()=>{const a="switch-"+Math.floor(Math.random()*1e4),o=()=>{const t=document.documentElement;t.dataset.theme==="light"?t.dataset.theme="dark":t.dataset.theme="light"};return e("div",{className:c.themeSwitch,style:{display:"flex"},children:[e("input",{id:a,type:"checkbox",onClick:o}),e("label",{for:a})]})};export{m as default};
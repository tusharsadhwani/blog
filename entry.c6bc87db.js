import{e as t}from"./chunks/chunk.ccb43b00.js";import"./chunks/chunk.961bf7e7.js";const h="_themeSwitch_7bdj1_1";var a={themeSwitch:h};const m=()=>{const o="switch-"+Math.floor(Math.random()*1e4),c=()=>{const e=document.documentElement;e.dataset.theme==="light"?(e.dataset.theme="dark",localStorage.setItem("lightMode","false")):(e.dataset.theme="light",localStorage.setItem("lightMode","true"))};return t("div",{className:a.themeSwitch,style:{display:"flex"},children:[t("input",{id:o,type:"checkbox",onClick:c,checked:document.documentElement.dataset.theme==="light"}),t("label",{for:o})]})};export{m as default};

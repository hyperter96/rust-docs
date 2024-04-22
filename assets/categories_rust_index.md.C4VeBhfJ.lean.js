import{_ as m}from"./chunks/ArticleMetadata.B6LTgUMn.js";import{_ as p,o as r,a as c,r as h,j as f,ad as v,p as _,q as u,m as R,u as l,B as x,e,x as g}from"./chunks/framework.coFu0xgG.js";import"./chunks/theme.CAIqAJ98.js";const y={},w={class:"loading"};function k(i,t){return r(),c("div",w)}const E=p(y,[["render",k]]),V={id:"xmind-container"},$={__name:"XmindViewer",props:{url:String},setup(i){const t=h(!0),d=i;return f(async()=>{const{XMindEmbedViewer:o}=await v(()=>import("./chunks/index.II4kIuyH.js"),[]),s=new o({el:"#xmind-container",region:"cn"});s.setStyles({width:"100%",height:"100%"});const a=()=>{t.value=!1,s.removeEventListener("map-ready",a)};s.addEventListener("map-ready",a),fetch(d.url).then(n=>n.arrayBuffer()).then(n=>{s.load(n)}).catch(n=>{t.value=!1,console.log("加载xmind文件出错"),s.removeEventListener("map-ready",a)})}),(o,s)=>(r(),c("div",V,[t.value?(r(),_(E,{key:0})):u("",!0)]))}},b=e("h1",{id:"前言",tabindex:"-1"},[g("前言 "),e("a",{class:"header-anchor",href:"#前言","aria-label":'Permalink to "前言"'},"​")],-1),B={class:"xmind-container"},L=e("p",null,"Rust 程序设计语言的本质实际在于 赋能（empowerment）：无论你现在编写的是何种代码，Rust 能让你在更为广泛的编程领域走得更远，写出自信。（这一点并不显而易见）",-1),N=e("p",null,"举例来说，那些“系统层面”的工作涉及内存管理、数据表示和并发等底层细节。从传统角度来看，这是一个神秘的编程领域，只为浸润多年的极少数人所触及，也只有他们能避开那些臭名昭著的陷阱。即使谨慎的实践者，亦唯恐代码出现漏洞、崩溃或损坏。",-1),P=e("p",null,"Rust 破除了这些障碍：它消除了旧的陷阱，并提供了伴你一路同行的友好、精良的工具。想要 “深入” 底层控制的程序员可以使用 Rust，无需时刻担心出现崩溃或安全漏洞，也无需因为工具链不靠谱而被迫去了解其中的细节。更妙的是，语言设计本身会自然而然地引导你编写出可靠的代码，并且运行速度和内存使用上都十分高效。",-1),C=e("p",null,"已经在从事编写底层代码的程序员可以使用 Rust 来提升抱负。例如，在 Rust 中引入并行是相对低风险的操作，因为编译器会替你找到经典的错误。同时你可以自信地采取更加激进的优化，而不会意外引入崩溃或漏洞。",-1),M=e("p",null,"但 Rust 并不局限于底层系统编程。它表达力强、写起来舒适，让人能够轻松地编写出命令行应用、网络服务器等各种类型的代码——在本书中就有这两者的简单示例。使用 Rust 能让你把在一个领域中学习的技能延伸到另一个领域：你可以通过编写网页应用来学习 Rust，接着将同样的技能应用到你的 Raspberry Pi（树莓派）上。",-1),O=e("p",null,"本书全面介绍了 Rust 为用户赋予的能力。其内容平易近人，致力于帮助你提升 Rust 的知识，并且提升你作为程序员整体的理解与自信。欢迎你加入 Rust 社区，让我们准备深入学习 Rust 吧！",-1),A=e("p",null,"—— Nicholas Matsakis 和 Aaron Turon",-1),X=JSON.parse('{"title":"前言","description":"","frontmatter":{"title":"前言","author":"皮特ᴾᵗ","date":"2024/02/02","categories":["Rust"]},"headers":[],"relativePath":"categories/rust/index.md","filePath":"categories/rust/index.md","lastUpdated":1713807633000}'),S={name:"categories/rust/index.md"},q=Object.assign(S,{setup(i){return(t,d)=>{const o=m,s=R("ClientOnly");return r(),c("div",null,[b,l(s,null,{default:x(()=>{var a,n;return[(((a=t.$frontmatter)==null?void 0:a.aside)??!0)&&(((n=t.$frontmatter)==null?void 0:n.showArticleMetadata)??!0)?(r(),_(o,{key:0,article:t.$frontmatter},null,8,["article"])):u("",!0)]}),_:1}),e("div",B,[l($,{url:"https://rust.hyperter.top/xmind/rust-mindmap.xmind"})]),L,N,P,C,M,O,A])}}});export{X as __pageData,q as default};

import{_ as h}from"./chunks/ArticleMetadata.B6LTgUMn.js";import{_ as l,m as k,a as d,u as r,B as F,e as n,x as c,ai as g,o as t,p as o,q as y}from"./chunks/framework.coFu0xgG.js";import"./chunks/theme.CAIqAJ98.js";const x=JSON.parse('{"title":"编写测试以及控制执行","description":"","frontmatter":{"title":"编写测试以及控制执行","isOriginal":false,"author":"Sunface","date":"2024/05/30 10:11","categories":["Rust自动化测试"],"tags":["Rust","Rust基础","自动化测试"]},"headers":[],"relativePath":"categories/rust/03-Rust自动化测试/01-编写测试以及控制执行.md","filePath":"categories/rust/03-Rust自动化测试/01-编写测试以及控制执行.md","lastUpdated":1718385253000}'),D={name:"categories/rust/03-Rust自动化测试/01-编写测试以及控制执行.md"},C=n("h1",{id:"编写测试以及控制执行",tabindex:"-1"},[c("编写测试以及控制执行 "),n("a",{class:"header-anchor",href:"#编写测试以及控制执行","aria-label":'Permalink to "编写测试以及控制执行"'},"​")],-1),A=g(`<p>在 Rust 中，测试是通过函数的方式实现的，它可以用于验证被测试代码的正确性。测试函数往往依次执行以下三种行为：</p><ol><li>设置所需的数据或状态</li><li>运行想要测试的代码</li><li>判断( <code>assert</code> )返回的结果是否符合预期</li></ol><p>让我们来看看该如何使用 Rust 提供的特性来按照上述步骤编写测试用例。</p><h2 id="测试函数" tabindex="-1">测试函数 <a class="header-anchor" href="#测试函数" aria-label="Permalink to &quot;测试函数&quot;">​</a></h2><p>当使用 <code>Cargo</code> 创建一个 <code>lib</code> 类型的包时，它会为我们自动生成一个测试模块。先来创建一个 <code>lib</code> 类型的 <code>adder</code> 包：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> cargo</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> new</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> adder</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> --lib</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">     Created</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> library</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> \`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">adder</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">\`</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> project</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> cd</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> adder</span></span></code></pre></div><p>创建成功后，在 <code>src/lib.rs</code> 文件中可以发现如下代码:</p><div class="language-rust vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">#[cfg(test)]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">mod</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> tests</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[test]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> it_works</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">        assert_eq!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> +</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>其中，<code>tests</code> 就是一个测试模块，<code>it_works</code> 则是我们的主角：测试函数。</p><p>可以看出，测试函数需要使用 <code>test</code> 属性进行标注。关于属性( attribute )，我们在之前的章节已经见过类似的 <code>derive</code>，使用它可以派生自动实现的 <code>Debug 、Copy</code> 等特征，同样的，使用 <code>test</code> 属性，我们也可以获取 Rust 提供的测试特性。</p><p>经过 <code>test</code> 标记的函数就可以被测试执行器发现，并进行运行。当然，在测试模块 <code>tests</code> 中，还可以定义非测试函数，这些函数可以用于设置环境或执行一些通用操作：例如为部分测试函数提供某个通用的功能，这种功能就可以抽象为一个非测试函数。</p><p>换而言之，正是因为测试模块既可以定义测试函数又可以定义非测试函数，导致了我们必须提供一个特殊的标记 <code>test</code>，用于告知哪个函数才是测试函数。</p><h3 id="assert-eq" tabindex="-1"><code>assert_eq</code> <a class="header-anchor" href="#assert-eq" aria-label="Permalink to &quot;\`assert_eq\`&quot;">​</a></h3><p>在测试函数中，还使用到了一个内置的断言：<code>assert_eq</code>，该宏用于对结果进行断言：<code>2 + 2</code> 是否等于 4。</p><h3 id="cargo-test" tabindex="-1"><code>cargo test</code> <a class="header-anchor" href="#cargo-test" aria-label="Permalink to &quot;\`cargo test\`&quot;">​</a></h3><p>下面使用 <code>cargo test</code> 命令来运行项目中的所有测试:</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">$</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> cargo</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> test</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   Compiling</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> adder</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> v0.1.0</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (file:///projects/adder)</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    Finished</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> test</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> [unoptimized </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">+</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> debuginfo]</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> target</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">s</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">in</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> 0.57s</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">     Running</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> unittests</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> (target/debug/deps/adder-92948b65e88960b4)</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">running</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> test</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests::it_works</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ...</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ok</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> result:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ok.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> passed</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> failed</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ignored</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> measured</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> filtered</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> out</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">finished</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> in</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> 0.00s</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">   Doc-tests</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> adder</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">running</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> result:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ok.</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> passed</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> failed</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ignored</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> measured</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> filtered</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> out</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">finished</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> in</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> 0.00s</span></span></code></pre></div><p>上面测试输出中，有几点值得注意:</p><ul><li>测试用例是分批执行的，<code>running 1 test</code> 表示下面的输出 <code>test result</code> 来自一个测试用例的运行结果。</li><li><code>test tests::it_works</code> 中包含了测试用例的名称</li><li><code>test result: ok</code> 中的 <code>ok</code>表示测试成功通过</li><li><code>1 passed</code> 代表成功通过一个测试用例(因为只有一个)，<code>0 failed</code> : 没有测试用例失败，<code>0 ignored</code> 说明我们没有将任何测试函数标记为运行时可忽略，<code>0 filtered</code> 意味着没有对测试结果做任何过滤，<code>0 mesasured</code> 代表基准测试(benchmark)的结果</li></ul><p>关于 <code>filtered</code> 和 <code>ignored</code> 的使用，在本章节的后续内容我们会讲到，这里暂且略过。</p><p>还有一个很重要的点，输出中的 <code>Doc-tests adder</code> 代表了文档测试，由于我们的代码中没有任何文档测试的内容，因此这里的测试用例数为 0，关于文档测试的详细介绍请参见这里。</p><p>大家还可以尝试修改下测试函数的名称，例如修改为 <code>exploration</code>，看看运行结果将如何变化。</p><h4 id="失败的测试用例" tabindex="-1">失败的测试用例 <a class="header-anchor" href="#失败的测试用例" aria-label="Permalink to &quot;失败的测试用例&quot;">​</a></h4><p>是时候开始写自己的测试函数了，为了演示，这次我们来写一个会运行失败的:</p><div class="language-rust vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">#[cfg(test)]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">mod</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> tests</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[test]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> exploration</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">        assert_eq!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">2</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> +</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">4</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[test]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> another</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">        panic!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;Make this test fail&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>新的测试函数 <code>another</code> 相当简单粗暴，直接使用 <code>panic</code> 来报错，使用 <code>cargo test</code> 运行看看结果：</p><div class="language-bash vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">bash</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">running</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 2</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests::another</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ...</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> FAILED</span></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests::exploration</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ...</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ok</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">failures:</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">----</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> tests::another</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> stdout</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> ----</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">thread</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;main&#39;</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> panicked</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> at</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &#39;Make this test fail&#39;,</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> src/lib.rs:10:9</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">note:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> run</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> with</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> \`</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">RUST_BACKTRACE</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">\` </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">environment</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> variable to display a backtrace</span></span>
<span class="line"></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">failures:</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    tests::another</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">test</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> result: FAILED. </span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> passed; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">1</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> failed; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> ignored; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> measured; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">0</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> filtered out; </span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">finished</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> in 0.00s</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">error:</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> test failed, to rerun pass &#39;--lib&#39;</span></span></code></pre></div><p>从结果看，两个测试函数，一个成功，一个失败，同时在输出中准确的告知了失败的函数名: <code>failures: tests::another</code>，同时还给出了具体的失败原因： <code>tests::another stdout</code>。这两者虽然看起来存在重复，但是前者用于说明每个失败的具体原因，后者用于给出一眼可得结论的汇总信息。</p><div class="important custom-block github-alert"><p class="custom-block-title">提问</p><p></p><p>有同学可能会好奇，这两个测试函数以什么方式运行？ 它们会运行在同一个线程中吗？</p><p>答案是否定的，Rust 在默认情况下会为每一个测试函数启动单独的线程去处理，当主线程 <code>main</code> 发现有一个测试线程死掉时，<code>main</code> 会将相应的测试标记为失败。</p></div><p>事实上，多线程运行测试虽然性能高，但是存在数据竞争的风险，在后文我们会对其进行详细介绍并给出解决方案。</p><h2 id="测试-panic" tabindex="-1">测试 <code>panic</code> <a class="header-anchor" href="#测试-panic" aria-label="Permalink to &quot;测试 \`panic\`&quot;">​</a></h2><p>在之前的例子中，我们通过 <code>panic</code> 来触发报错，但是如果一个函数本来就会 <code>panic</code> ，而我们想要检查这种结果呢？</p><p>也就是说，我们需要一个办法来测试一个函数是否会 <code>panic</code>，对此， Rust 提供了 <code>should_panic</code> 属性注解，和 test 注解一样，对目标测试函数进行标注即可：</p><div class="language-rust vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">pub</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> struct</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> i32</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">impl</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    pub</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> i32</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> ||</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">            panic!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">&quot;Guess value must be between 1 and 100, got {}.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">, value);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> { value }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">#[cfg(test)]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">mod</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> tests</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> super</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">::*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[test]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[should_panic]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> greater_than_100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        Guess</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">new</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>上面是一个简单的猜数字游戏，<code>Guess</code> 结构体的 <code>new</code> 方法在传入的值不在 <code>[1,100]</code> 之间时，会直接 <code>panic</code>，而在测试函数 <code>greater_than_100</code> 中，我们传入的值 200 显然没有落入该区间，因此 <code>new</code> 方法会直接 <code>panic</code>，为了测试这个预期的 <code>panic</code> 行为，我们使用 <code>#[should_panic]</code> 对其进行了标注。</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span>running 1 test</span></span>
<span class="line"><span>test tests::greater_than_100 - should panic ... ok</span></span>
<span class="line"><span></span></span>
<span class="line"><span>test result: ok. 1 passed; 0 failed; 0 ignored; 0 measured; 0 filtered out; finished in 0.00s</span></span></code></pre></div><p>从输出可以看出， <code>panic</code> 的结果被准确的进行了测试，那如果测试函数中的代码不再 <code>panic</code> 呢？例如：</p><div class="language-rust vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> greater_than_100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">    Guess</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">new</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">50</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>此时显然会测试失败，因为我们预期一个 <code>panic</code>，但是 <code>new</code> 函数顺利的返回了一个 <code>Guess</code> 实例:</p><div class="language-text vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">text</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span>running 1 test</span></span>
<span class="line"><span>test tests::greater_than_100 - should panic ... FAILED</span></span>
<span class="line"><span></span></span>
<span class="line"><span>failures:</span></span>
<span class="line"><span></span></span>
<span class="line"><span>---- tests::greater_than_100 stdout ----</span></span>
<span class="line"><span>note: test did not panic as expected // 测试并没有按照预期发生 panic</span></span></code></pre></div><h3 id="expected" tabindex="-1"><code>expected</code> <a class="header-anchor" href="#expected" aria-label="Permalink to &quot;\`expected\`&quot;">​</a></h3><p>虽然 <code>panic</code> 被成功测试到，但是如果代码发生的 <code>panic</code> 和我们预期的 <code>panic</code> 不符合呢？因为一段糟糕的代码可能会在不同的代码行生成不同的 <code>panic</code>。</p><p>鉴于此，我们可以使用可选的参数 <code>expected</code> 来说明预期的 <code>panic</code> 长啥样：</p><div class="language-rust vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">rust</span><pre class="shiki shiki-themes github-light github-dark-dimmed vp-code"><code><span class="line"><span style="--shiki-light:#6A737D;--shiki-dark:#768390;">// --snip--</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">impl</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    pub</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> new</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(value</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">:</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> i32</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">) </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">-&gt;</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">        if</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&lt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 1</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">            panic!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">                &quot;Guess value must be greater than or equal to 1, got {}.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">                value</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">            );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">        } </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">else</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;"> if</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> value </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">&gt;</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> 100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">            panic!</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span></span>
<span class="line"><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;">                &quot;Guess value must be less than or equal to 100, got {}.&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">,</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">                value</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">            );</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">        }</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        Guess</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> { value }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">#[cfg(test)]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">mod</span><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;"> tests</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;"> {</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    use</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;"> super</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">::*</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">;</span></span>
<span class="line"></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[test]</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    #[should_panic(expected </span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">=</span><span style="--shiki-light:#032F62;--shiki-dark:#96D0FF;"> &quot;Guess value must be less than or equal to 100&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">)]</span></span>
<span class="line"><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">    fn</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;"> greater_than_100</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">() {</span></span>
<span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#F69D50;">        Guess</span><span style="--shiki-light:#D73A49;--shiki-dark:#F47067;">::</span><span style="--shiki-light:#6F42C1;--shiki-dark:#DCBDFB;">new</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">(</span><span style="--shiki-light:#005CC5;--shiki-dark:#6CB6FF;">200</span><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">);</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">    }</span></span>
<span class="line"><span style="--shiki-light:#24292E;--shiki-dark:#ADBAC7;">}</span></span></code></pre></div><p>这段代码会通过测试，因为通过增加了 <code>expected</code> ，我们成功指定了期望的 <code>panic</code> 信息，大家可以顺着代码推测下：把 <code>200</code> 带入到 <code>new</code> 函数中看看会触发哪个 <code>panic</code>。</p><p>如果注意看，你会发现<code> expected</code> 的字符串和实际 <code>panic</code> 的字符串可以不同，前者只需要是后者的字符串前缀即可，如果改成 <code>#[should_panic(expected = &quot;Guess value must be less than&quot;)]</code>，一样可以通过测试。</p><p>这里由于篇幅有限，我们就不再展示测试失败的报错，大家可以自己修改下 <code>expected</code> 的信息，然后看看报错后的输出长啥样。</p>`,47);function u(s,B,E,m,b,v){const e=h,p=k("ClientOnly");return t(),d("div",null,[C,r(p,null,{default:F(()=>{var i,a;return[(((i=s.$frontmatter)==null?void 0:i.aside)??!0)&&(((a=s.$frontmatter)==null?void 0:a.showArticleMetadata)??!0)?(t(),o(e,{key:0,article:s.$frontmatter},null,8,["article"])):y("",!0)]}),_:1}),A])}const w=l(D,[["render",u]]);export{x as __pageData,w as default};

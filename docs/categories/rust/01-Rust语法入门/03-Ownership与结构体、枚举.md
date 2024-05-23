---
title: Ownership与结构体、枚举
author: 皮特ᴾᵗ
date: 2024/02/05 12:22
categories:
 - Rust语法入门
tags:
 - Rust
 - Rust基础
 - 所有权
 - 借用
 - 生命周期
 - 结构体
 - 枚举
---

# Ownership与结构体、枚举

## Rust内存管理模型

- 所有权系统（Ownership System）
- 借用（Borrowing）
    - 不可变借用
    - 可变借用
- 生命周期（Lifetimes）
- 引用计数（Reference Counting）

### 所有权系统

关于所有权，我们举比较简单的例子：

```rust
fn main() {
    let c1: i32 = 1;
    let c2: i32 = c1;

    println!("{c2}"); 
}
```

上面这个`c1`和`c2`属于基本类型，在`c2`被赋值的时候执行了`copy`操作。不过如果变量不是基础类型，譬如说`String`，

```rust
fn main() {
    let s1: String = String::from("value");
    let s2: String = s1;

    println!("{s1}"); // error: borrow of moved value: `s1` value borrowed here after move
}
```

这里的`s1`将所有权转移给`s2`，之后`s1`就不存在了。所以如果想让`s1`保留，那么需要`clone`函数，

```rust
fn main() {
    let s1: String = String::from("value");
    let s2: String = s1.clone();

    println!("{s1}"); // value
}
```

#### 什么是所有权？

Rust 的核心功能（之一）是**所有权**（*ownership*）。虽然该功能很容易解释，但它对语言的其他部分有着深刻的影响。

所有程序都必须管理其运行时使用计算机内存的方式。一些语言中具有垃圾回收机制，在程序运行时有规律地寻找不再使用的内存；在另一些语言中，程序员必须亲自分配和释放内存。Rust 则选择了第三种方式：通过所有权系统管理内存，编译器在编译时会根据一系列的规则进行检查。如果违反了任何这些规则，程序都不能编译。在运行时，所有权系统的任何功能都不会减慢程序。

因为所有权对很多程序员来说都是一个新概念，需要一些时间来适应。好消息是随着你对 Rust 和所有权系统的规则越来越有经验，你就越能自然地编写出安全和高效的代码。持之以恒！

当你理解了所有权，你将有一个坚实的基础来理解那些使 Rust 独特的功能。在本章中，你将通过完成一些示例来学习所有权，这些示例基于一个常用的数据结构：字符串。

#### 所有权规则

首先，让我们看一下所有权的规则。当我们通过举例说明时，请谨记这些规则：

- Rust 中的每一个值都有一个**所有者**（owner）。
- 值在任一时刻有且只有一个所有者。
- 当所有者（变量）离开作用域，这个值将被丢弃。

#### 内存与分配

就字符串字面值来说，我们在编译时就知道其内容，所以文本被直接硬编码进最终的可执行文件中。这使得字符串字面值快速且高效。不过这些特性都只得益于字符串字面值的不可变性。不幸的是，我们不能为了每一个在编译时大小未知的文本而将一块内存放入二进制文件中，并且它的大小还可能随着程序运行而改变。

对于 `String` 类型，为了支持一个可变，可增长的文本片段，需要在堆上分配一块在编译时未知大小的内存来存放内容。这意味着：

- 必须在运行时向内存分配器（memory allocator）请求内存。
- 需要一个当我们处理完 `String` 时将内存返回给分配器的方法。

第一部分由我们完成：当调用 `String::from` 时，它的实现 (*implementation*) 请求其所需的内存。这在编程语言中是非常通用的。

然而，第二部分实现起来就各有区别了。在有 垃圾回收（*garbage collector，GC*）的语言中， GC 记录并清除不再使用的内存，而我们并不需要关心它。在大部分没有 GC 的语言中，识别出不再使用的内存并调用代码显式释放就是我们的责任了，跟请求内存的时候一样。从历史的角度上说正确处理内存回收曾经是一个困难的编程问题。如果忘记回收了会浪费内存。如果过早回收了，将会出现无效变量。如果重复回收，这也是个 bug。我们需要精确的为一个 `allocate` 配对一个 `free`。

Rust 采取了一个不同的策略：内存在拥有它的变量离开作用域后就被自动释放。下面是示例中作用域例子的一个使用 `String` 而不是字符串字面值的版本：

```rust
fn main() {
    // ANCHOR: here
    {
        let s = String::from("hello"); // 从此处起，s 是有效的

        // 使用 s
    }                                  // 此作用域已结束，
                                       // s 不再有效
    // ANCHOR_END: here
}
```

这是一个将`String`需要的内存返回给分配器的很自然的位置：当`s`离开作用域的时候。当变量离开作用域，Rust 为我们调用一个特殊的函数。这个函数叫做`drop`，在这里`String`的作者可以放置释放内存的代码。Rust 在结尾的 `}` 处自动调用`drop`。

:::warning 注意📢：
在 C++ 中，这种 item 在生命周期结束时释放资源的模式有时被称作**资源获取即初始化**（Resource Acquisition Is Initialization (RAII)）。如果你使用过 RAII 模式的话应该对 Rust 的`drop`函数并不陌生。
:::

这个模式对编写 Rust 代码的方式有着深远的影响。现在它看起来很简单，不过在更复杂的场景下代码的行为可能是不可预测的，比如当有多个变量使用在堆上分配的内存时。现在让我们探索一些这样的场景。

### 引用与借用

**引用**（*reference*）像一个指针，因为它是一个地址，我们可以由此访问储存于该地址的属于其他变量的数据。 与指针不同，引用确保指向某个特定类型的有效值。

下面是如何定义并使用一个（新的）`calculate_length`函数，它以一个对象的引用作为参数而不是获取值的所有权：

```rust
// ANCHOR: all
fn main() {
    // ANCHOR: here
    let s1 = String::from("hello");

    let len = calculate_length(&s1);
    // ANCHOR_END: here

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
// ANCHOR_END: all
```

首先，注意变量声明和函数返回值中的所有元组代码都消失了。其次，注意我们传递`&s1`给`calculate_length`，同时在函数定义中，我们获取`&String`而不是`String`。这些`&`符号就是**引用**，它们允许你使用值但不获取其所有权。图 3-1 展示了一张示意图。

<img alt="&amp;String s pointing at String s1" src="https://rust.hyperter.top/screenshot/trpl04-05.8ade0cb0.svg" class="center" />

<span class="caption">图 3-1：`&String s` 指向 `String s1` 示意图</span>

:::warning 注意📢：
与使用`&`引用相反的操作是**解引用**（*dereferencing*），它使用解引用运算符，`*`。我们将会在第八章遇到一些解引用运算符，并在第十五章详细讨论解引用。
:::

仔细看看这个函数调用：

```rust
// ANCHOR: all
fn main() {
    // ANCHOR: here
    let s1 = String::from("hello");

    let len = calculate_length(&s1);
    // ANCHOR_END: here

    println!("The length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
// ANCHOR_END: all
```

`&s1`语法让我们创建一个 指向 值`s1`的引用，但是并不拥有它。因为并不拥有这个值，所以当引用停止使用时，它所指向的值也不会被丢弃。

同理，函数签名使用`&`来表明参数`s`的类型是一个引用。让我们增加一些解释性的注释：

```rust
fn main() {
    let s1 = String::from("hello");

    let len = calculate_length(&s1);

    println!("The length of '{}' is {}.", s1, len);
}

// ANCHOR: here
fn calculate_length(s: &String) -> usize { // s是String的引用
    s.len()
} // 这里，s 离开了作用域。但因为它并不拥有引用值的所有权，
  // 所以什么也不会发生
// ANCHOR_END: here
```

变量`s`有效的作用域与函数参数的作用域一样，不过当`s`停止使用时并不丢弃引用指向的数据，因为`s`并没有所有权。当函数使用引用而不是实际值作为参数，无需返回值来交还所有权，因为就不曾拥有所有权。

我们将创建一个引用的行为称为**借用**（*borrowing*）。正如现实生活中，如果一个人拥有某样东西，你可以从他那里借来。当你使用完毕，必须还回去。我们并不拥有它。

如果我们尝试修改借用的变量呢？尝试以下的代码。

```rust
fn main() {
    let s = String::from("hello");

    change(&s);
}

fn change(some_string: &String) {
    some_string.push_str(", world");
}
```

这里是错误：

```bash
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0596]: cannot borrow `*some_string` as mutable, as it is behind a `&` reference
 --> src/main.rs:8:5
  |
7 | fn change(some_string: &String) {
  |                        ------- help: consider changing this to be a mutable reference: `&mut String`
8 |     some_string.push_str(", world");
  |     ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^ `some_string` is a `&` reference, so the data it refers to cannot be borrowed as mutable

For more information about this error, try `rustc --explain E0596`.
error: could not compile `ownership` due to previous error
```

正如变量默认是不可变的，引用也一样。（默认）不允许修改引用的值。

#### 不可变借用

符号`&`表示对资源的借用。

```rust
let y = &x          // y借用x的资源访问权。y引用了资源。
println!("{:?}",y)  // x的所有权没有转移。但已经可以通过y访问x的资源。
```

`y`被称为资源的引用。 当引用变量离开作用域，即释放对资源的引用。

Rust 默认`&`是一种不可变的借用。即借用所有权的变量不可以修改资源的值。

```rust
fn main() {
    let x: Vec<i32> = vec!(1, 2, 3);
    let y = &x;    // y借用x对资源的所有权。vec的所有权仍然是x的。
    println!("x={:?}, y={:?}", x, y);
}
```

`&x`即对`x`的Borrowing。这不会发生所有权实际的转移。所以`println`没有编译异常。

##### 不可变引用类型

借用到资源引用的变量，是一种特殊的类型。不再是资源原始的类型了。

```rust
let y = &x  // y借用x的资源访问权。y只是引用了资源。
```

若`x`的类型为`T`，则`&x`的类型为`&T`，`y`的类型为`&T`。这是一个**引用类型**。

需要有引用类型这个概念，这可以帮我们更好的理解Rust。

对于代码：

```rust
let a = 100;
let y = &a;
```

`a`的类型为`i32`，`y`的类型为`&i32`。`y`不可变，即`y`不能再与其他引用绑定。

对于代码：

```rust
let b = 200;
let mut y = &b;
```

`b`的类型为`i32`，`y`的类型为`&i32`。`y`可变，即`y`可以与其他引用绑定。

例：`y`可以与不同引用类型绑定。

```rust
fn main() {
    let a = 100;
    let b = 200;
    let mut y = &a;
    y = &b;
    println!("{:?},{:?}", a,y);
}
```

> 对于`let mut y = &a;`该语句会引发编译告警，但编译可通过。编译器认为这句语句没必要。直接写成`let mut y = &b;`即可。可以看到Rust编译器非常智能。
>
> 此处只是为了演示，真实场景不太可能写出这样的语句。

#### 可变借用

Rust也提供了一种可变资源的借用。

- 使用`&mut`符号表示对可变资源的引用。
- 若需要访问可变资源的引用，必须在变量前使用`*`来访问资源。

例：使用可变引用。

```rust
fn main() {
    let mut x: i32 = 100;

    // 可变借用
    let y: &mut i32 = &mut x;

    // y的类型是&mut i32，无法使用'+='，*y指向实际资源。使用'+='修改资源值。
    *y += 100;

    println!("{}", *y);    // 打印输出 200 。
    // 或者，可以写成。 println!("{}", y);
}
```

`&mut i32`可以看作是一种可变`i32`的引用类型。

所以`let y: &mut i32 = &mut x`，可简写为：`let y = &mut x`

这段代码最后并没有直接访问`x`，而是打印输出的`y`。为什么这段代码不直接写`println!("{:?}", x);`这是有原因的。

若上面的例子写成：

```rust
fn main() {
    let mut x: i32 = 100;
    let y: &mut i32 = &mut x;
    *y += 100;
    println!("{}", x);
}
```

编译报错。**为什么？** 要解决这个问题，需要理解如下规则。

#### 借用规则

1. 同一个作用域中，一个资源只有一个可变借用（`&mut T`），但拥有可变借用（`&mut T`）后就不能有不可变借用（`&T`）。
2. 同一个作用域中，一个资源可以有多个不可变借用（`&T`），但拥有不可变借用（`&T`）后就不能有可变借用（`&mut T`）。
3. 借用在离开作用域后释放。
4. 可变借用（`&mut T`）释放前不可访问原变量。
5. 若变量已经被借用，则变量的所有权不可再被move。

对于规则1、2：

简单来说，可变借用与不可变借用在同一作用域是互斥的，且可变结合两两互斥。

> 借用规则非常像“读写锁”。即同一时刻，同一资源，只能拥有一个“写锁”，或只能拥有多个“读锁”，不允许“写锁”和“读锁”在同一时刻同时出现。
>
> - 可变引用（`&mut T`）相当于写锁。
> - 不可变引用(`&T`)相当于读锁。

这是数据读写过程中保障一致性的典型做法。Rust在编译中完成借用的检查，保证了程序在运行时不会出错。

对于规则3，4：

> 简单来说就是：归还借用，借走不碰。
>
> 借来的东西，总是要还的。一定要注意应该在何处何时正确的“归回”引用。
>
> 东西一旦借给别人使用，自己触碰不到了。所以也无法访问。

对于规则5：

> 别人正在用的东西，我自己也不该去动。

所以，对于上面代码若需要修改正确，则需要`y`释放掉可变引用。简单的做法就是，让`y`提前在一个作用域中释放掉。

```rust
fn main() {
    let mut x: i32 = 100;
    {
        let y: &mut i32 = &mut x;
        *y += 100;           // 修改 y 指定的资源。
    }                        // 释放可变引用。
    println!("{}", x);       // 该作用域汇总，x不再有其他可变引用。所以可以访问。
}
```

#### 悬垂引用

在具有指针的语言中，很容易通过释放内存时保留指向它的指针而错误地生成一个**悬垂指针**（*dangling pointer*），所谓悬垂指针是其指向的内存可能已经被分配给其它持有者。相比之下，在 Rust 中编译器确保引用永远也不会变成悬垂状态：当你拥有一些数据的引用，编译器确保数据不会在其引用之前离开作用域。

让我们尝试创建一个悬垂引用，Rust 会通过一个编译时错误来避免：

```rust
fn main() {
    let reference_to_nothing = dangle();
}

fn dangle() -> &String {
    let s = String::from("hello");

    &s
}
```

这里是错误：

```bash
$ cargo run
   Compiling ownership v0.1.0 (file:///projects/ownership)
error[E0106]: missing lifetime specifier
 --> src/main.rs:5:16
  |
5 | fn dangle() -> &String {
  |                ^ expected named lifetime parameter
  |
  = help: this function's return type contains a borrowed value, but there is no value for it to be borrowed from
help: consider using the `'static` lifetime
  |
5 | fn dangle() -> &'static String {
  |                ~~~~~~~~

For more information about this error, try `rustc --explain E0106`.
error: could not compile `ownership` due to previous error
```

错误信息引用了一个我们还未介绍的功能：生命周期（lifetimes）。下一节会详细介绍生命周期。不过，如果你不理会生命周期部分，错误信息中确实包含了为什么这段代码有问题的关键信息：

```text
this function's return type contains a borrowed value, but there is no value
for it to be borrowed from
```

让我们仔细看看我们的`dangle`代码的每一步到底发生了什么：

```rust
fn main() {
    let reference_to_nothing = dangle();
}

// ANCHOR: here
fn dangle() -> &String { // dangle 返回一个字符串的引用

    let s = String::from("hello"); // s 是一个新字符串

    &s // 返回字符串 s 的引用
} // 这里 s 离开作用域并被丢弃。其内存被释放。
  // 危险！
// ANCHOR_END: here
```

因为`s`是在`dangle`函数内创建的，当`dangle`的代码执行完毕后，`s`将被释放。不过我们尝试返回它的引用。这意味着这个引用会指向一个无效的`String`，这可不对！Rust 不会允许我们这么做。

这里的解决方法是直接返回`String`：

```rust
fn main() {
    let string = no_dangle();
}

// ANCHOR: here
fn no_dangle() -> String {
    let s = String::from("hello");

    s
}
// ANCHOR_END: here
```

这样就没有任何错误了。所有权被移动出去，所以没有值被释放。

### 生命周期

通常我们所说的生命周期应该是存在一个循环过程的。另外，**在 Rust 中，只有引用类型才需要标注 lifetime。 lifetime 是用来保证引用类型在使用时是有效的，并且在使用结束后释放所占用的内存的一种机制。** 所以，我们可以将其翻译为引用的生存期，引用的有效期，引用的使用期等等。

我们先看一个小例子：

```rust
fn main() {
    let a;
    {
        let b = 1;
        a = &b;
    }
    println!("{}", *a);
}
```

这段代码是编译不通过的，来看下编译器给出的错误。

```text
error[E0597]: `b` does not live long enough
--> src\main.rs:6:13
  |
6 |        a = &b;
  |            ^^ borrowed value does not live long enough
7 |    }
  |    - `b` dropped value while still borrowed
8 |    println!("{}", *a);
  |                   borrow later still used here
```

字面意思就是`b 活的不够长`，很通俗易懂哈哈。简单分析下：变量`a`是一个`&i32`引用类型，我们在内部代码块中初始化`a`，但是当内部代码块执行结束后，变量`b`离开作用域被释放了，但是`a`没有被释放，这时`a`就会变成`悬垂指针`，当然这在 Rust 中是绝对不允许的。

理论上来讲，其实所有的变量都存在生存期，**变量的生命期一定是包含引用的生存期。** 先来看下面这张图片，红框所示的区域是变量a的生命期。蓝框所示的是b的作用域(生命期)。很显然b的作用域没有包含`a`，变量的生命期没有包含引用的生命期，这种做法是禁止的。

![](https://rust.hyperter.top/screenshot/lifecycle-1.png)

很显然`b`的作用域包含`a`，变量的生命期包含了引用的生命期。这段代码是可以正常编译的。

#### 生命期的使用

##### 标注生命期

只有引用类型才需要标注lifetime。因此，以`&i32`为例，标注生命期后变为`&'a i32`，在`&`后添加`'a`，通常叫做生命期`a`。`a`可以被更换，其命名规则参考变量的命名规则。

- `&'a i32`标注生命期`a`的共享引用
- `&'a mut i32`标注生命期`a`的可变引用

##### 函数/方法签名中的生命期标注

编译器通常会推断生命期，当然我们也可以标注生命期。通常我们写函数/方法时是下面的写法。

```rust
fn test(name: &str) -> &str {
    println!("{}", name);
    return name;
}
```

其实，这里是存在生命期标注的，如果编译器可以自动推断生命期时，则无需标注。上面的函数添加生命期标注后如下所示：

```rust
fn test_life<'_a>(name: &'_a str) -> &'_a str {
    println!("{}", name);
    return name;
}
```

在函数名后面，添加`<'a>`，如同泛型，在标注前先声明。然后再对每个参数或者返回值标注。

##### 为什么存在生命期？

**生命期仅用于编译器的检查。并不会更改原有生命期的长短。** 举个简单的例子，下面的代码是传入两个字符串，返回最长的那个字符串。

```rust
fn main() {
    let x = String::from("xxx");
    let y = "yyyy";
​
    let z = longest(x, y);
​
    println!("{}", z);
}
​
fn longest(x: &str, y: &str) -> &str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```
如果我们直接编译，会提示错误。

```text
error[E0106]: missing lifetime specifier
  --> src\main.rs:31:33
   |
31 | fn longest(x: &str, y: &str) -> &str {
   |               ----     ----     ^ expected named lifetime parameter
   |
   = help: this function's return type contains a borrowed value, but the signature does not say whether it is borrowed from `x` or `y`
help: consider introducing a named lifetime parameter
   |
31 | fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
   |           ++++     ++          ++          ++
​
For more information about this error, try `rustc --explain E0106`.
error: could not compile `lifetime` due to previous error
```

错误提示告诉我们，缺少生命期标识符。在当编译时期，rust 并不知道我们返回的是`x`还是`y`，因此不能确定返回的字符串的生命期。这个函数主体中，`if`块返回的是`x`的引用，而`else`块返回的是`y`的引用。所以我们需要标注生命期，来告诉编译器。

```rust
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

标注传入参数的生命期都是`a`，返回值的生命期也是`a`，所以无论返回`x`还是`y`，都是生命期`a`的`&str`。因此：**生命期仅用于编译器的检查。**

#### 引用作为函数/方法返回值

我们再看下面一个例子，编译会发现报错：

```rust
/// 拼接两个字符串
fn concat_str<'a>(x: &'a str, y: &'a str) -> &'a str {
    let s = format!("{}{}",x, y);
    return s.as_str();
}
```

下面是错误，不能返回一个局部变量：

```text
error[E0515]: cannot return reference to local variable `s`
  --> src\main.rs:36:12
   |
36 |     return s.as_str();
   |            ^^^^^^^^^^ returns a reference to data owned by the current function
​
For more information about this error, try `rustc --explain E0515`.
error: could not compile `lifetime` due to previous error
```

我们思考，假设可以通过编译，会发生什么？当函数结束后，`s`被释放，返回的引用会变成**悬垂引用**，这种做法是在 rust 中禁止的。因此我们可以得出一个结论，**当从一个函数/方法返回一个引用时，返回类型的生命期参数需要与其中一个参数的生命期参数相匹配。** 当然也存在例外，继续往下看。

#### 静态生命期

在 Rust 中，存在一种静态生命期`'static`。它表示数据在程序的整个运行期间都有效，它常用于储存全局静态数据和字符串常量。像一些字符串字面量，字节字符串字面量等等这些类似的生命期默认是`'static`。在函数里，可以直接返回`'static`的生命期。

```rust
fn get_any_str() -> &'static str {
    return "static";
}
```

## 枚举和匹配模式

### 枚举

- 枚举(*enums*)是一种用户自定义的数据类型，用于表示具有一组离散可能值的变量：

    - 每种可能值都称为“Variant”（变体）
    - 枚举名::变体名

- 枚举的好处：

    - 可以使你的代码更严谨、更易读
    - More Robust Programs

例子：

```rust
enum Color {
    Red,
    Yellow,
    Blue,
    Black,
}

fn print_color(my_color: Color) {
    match my_color {
        Color::Red => println!("Red"),
        Color::Yellow => println!("Yellow"),
        Color::Blue => println!("Blue"),
        Color::Black => println!("Black"),
    }
}

enum BuildingLocation {
    Number(i32),
    Name(String), // 不用&str
    Unknown,
}

impl BuildingLocation {
    fn print_location<'0>(&'0 self) {
        match self {
            // BuildingLocation::Number(44)
            BuildingLocation::Number(c: &i32) => println!("building number: {}", c),
            // BuildingLocation::Name("ok".to_string())
            BuildingLocation::Name(s: &String) => println!("building string: {}", s),

            BuildingLocation::Unknown => println!("building unknown"),
        }
    }
}

fn main() {
    let a: Color = Color::Red;
    print_color(my_color: a);

    let house: BuildingLocation = BuildingLocation::Name("fdfd".to_string());
    house.print_location(); // building string: fdfd
}
```

#### 常用的枚举类型：`Option`和`Result`

```rust
pub enum option<T> {
    None,
    Some(T),
}

pub enum Result<T, E> {
    Ok(T),
    Error(E),
}
```

#### 匹配模式

1. `match`关键字实现
2. 必须覆盖所有的变体
3. 可以用`_`、`..`、三元（`if`）等来进行匹配

```rust
match number {
    0 => println!("Zero"),
    1 | 2 => println!("One or Two"),
    3..=9 => println!("From three to nine"),
    n if n % 2 == 0 => println!("Even number"),
    _ => println!("Other"),
}
```

## Ownership和结构体

### 初识结构体、方法、关联函数、关联变量

结构体是一种用户定义的数据类型，用于创建自定义的数据结构，

```rust
struct Point {
    x: i32,
    y: i32,
}
```

每条数据的 (`x`和`y`) 称为属性（`field`），通过点（`.`）来访问结构体中的属性。

#### 结构体中的方法

这里的方法指，通过实例调用（`&self`、`&mut self`、`self`）

```rust
impl Point {
    fn distance(&self, other: &Point) -> f64 {
        let dx = (self.x - other.x) as f64;
        let dy = (self.y - other.y) as f64;
        (dx * dx + dy * dy).sqrt()
    }
}
```

#### 结构体中的关联函数

关联函数是与类型相关联的函数，调用时为结构体名::函数名，

```rust
impl Point {
    fn new(x: u32, y: u32) -> Self {
        Point {x, y}
    }
}
```

#### 结构体中的关联变量

这里的关联变量是，和结构体相关联的变量，也可以在特质或者枚举中，

```rust
impl Point {
    const PI: f64 = 3.14;
}
```

调用时用`Point::PI`。

#### 例子

例子一：我们定义一个结构体，
```rust
struct Drink {
    flavor: Flavor,
    price: f64,
}
```

然后定义关联变量、方法和关联函数，

```rust
impl Drink {
    // 关联变量
    const MAX_PRICE: f64 = 10.0;
    // 方法
    fn buy<'0>(&'0 self) {
        if self.price > 10.0 {
            println!("I am poor");
            return;
        }
        println!("buy it");
    }
    // 关联函数
    fn new(price: f64) -> Self {
        Drink{
            flavor: Flavor::Fruity,
            price: price,
        }
    }
}
```

打印多种口味的饮料的函数，

```rust
fn print_drink(drink: Drink) {
    match drink.flavor {
        Flavor::Fruity => println!("fruity"),
        Flavor::Sweet => println!("sweet"),
        Flavor::Spicy => println!("spicy"),
    }
    println!("{}", drink.price);
}
```

例子二：我们定义一个`Counter`结构体，

```rust
struct Counter {
    number: i32,
}
```

定义关联函数`new`、`combine`和方法`get_number`、`add`：

```rust
impl Counter {
    fn new(number: i32) -> Self {
        Self {number}
    }

    fn get_number(&self) -> i32 {
        self.number
    }

    fn add(&mut self, increment: i32) {
        self.number += increment;
    }

    fn combine(c1: Self, c2: Self) -> Self {
        Self {
            number: c1.number + c2.number
        }
    }
}
```

然后`main`函数：

```rust
fn main() {
    let mut c1 = Counter::new(11);
    println!("c1 number {}", c1.get_number()); // c1 number 11
    c1.add(2);
    println!("c1 number {}", c1.get_number()); // c1 number 13

    let c1 = Counter::new(15);
    let c2 = Counter::new(18);
    let c3 = Counter::combine(c1, c2);
    println!("c3 number {}", c3.get_number()); // c3 number 33

}
```

### 值传递语义（Value Passing Semantics）

每当将值从一个位置传递到另一个位置时，`borrow checker`都会重新评估所有权。

1. `Immutable Borrow`使用不可变的借用，值的所有权仍归发送方所有，接收方直接接收对该值的引用，而不是该值的副本。但是，他们不能使用该引用来修改它指向的值，编译器不允许这样做。释放资源的责任仍由发送方承担。仅当发送人本身超出范围时，才会删除该值。
2. `Mutable Borrow`使用可变的借用所有权和删除值的责任也由发送者承担。但是接收方能够通过他们接收的引用来修改该值。
3. `Move`这是所有权从一个地点转移到另一个地点。`borrow checker`关于释放该值的决定将由该值的接收者（而不是发送者）通知。由于所有权已从发送方转移到接收方，因此发送方在将引用移动到另一个上下文后不能再使用该引用，发送方在移动后对`value`的任何使用都会导致错误。

## 堆（Heap）和栈（Stack）

### 堆（Heap）

- 堆的规律性较差，当你把一些东西放到你请求的堆上时，你请求，请求空间，并返回一个指针，这是该位置的地址

    - 该过程被称为在堆上分配内存，有时简称为 “分配”(allocating)。
    - 接着，该指针会被推入栈中，因为指针的大小是已知且固定的，在后续使用过程中，你将通过栈中的指针，来获取数据在堆上的实际内存位置，进而访问该数据。

- 长度不确定

由上可知，堆是一种缺乏组织的数据结构。想象一下去餐馆就座吃饭: 进入餐馆，告知服务员有几个人，然后服务员找到一个够大的空桌子（堆上分配的内存空间）并领你们过去。如果有人来迟了，他们也可以通过桌号（栈上的指针）来找到你们坐在哪。

### 栈（Stack）

- 堆栈将按照获取值的顺序存储值，并以相反的顺序删除值
- 操作高效，函数作用域就是在栈上
- 堆栈上存储的所有数据都必须具有已知的固定大小数据

栈按照顺序存储值并以相反顺序取出值，这也被称作后进先出。想象一下一叠盘子：当增加更多盘子时，把它们放在盘子堆的顶部，当需要盘子时，再从顶部拿走。不能从中间也不能从底部增加或拿走盘子！

增加数据叫做进栈，移出数据则叫做出栈。

因为上述的实现方式，栈中的所有数据都必须占用已知且固定大小的内存空间，假设数据大小是未知的，那么在取出数据时，你将无法取到你想要的数据。

### 性能区别

在栈上分配内存比在堆上分配内存要快，因为入栈时操作系统无需进行函数调用（或更慢的系统调用）来分配新的空间，只需要将新数据放入栈顶即可。相比之下，在堆上分配内存则需要更多的工作，这是因为操作系统必须首先找到一块足够存放数据的内存空间，接着做一些记录为下一次分配做准备，如果当前进程分配的内存页不足时，还需要进行系统调用来申请更多内存。 因此，处理器在栈上分配数据会比在堆上分配数据更加高效。

### `Box`

`Box`是一个智能指针，它提供对堆分配内存的所有权。它允许你将数据存储在堆上而不是栈上，并且在复制或移动时保持对数据的唯一所有权。使用`Box`可以避免一些内存管理问题，如悬垂指针和重复释放。

1. 所有权转移
2. 释放内存
3. 解引用
4. 构建递归数据结构

```rust
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let box_point = Box::new(Point{x: 10, y: 20});
    println!("x:{}, y:{}", box_point.x, box_point.y); // x:10, y:20
}
```
## Copy与Move

### 变量与数据交互方式（一）：移动

在Rust中，多个变量可以采取不同的方式与同一数据进行交互。让我们看看示例中一个使用整型的例子。

```rust
fn main() {
    // ANCHOR: here
    let x = 5;
    let y = x;
    // ANCHOR_END: here
}
```

我们大致可以猜到这在干什么：“将 `5` 绑定到 `x`；接着生成一个值 `x` 的拷贝并绑定到 `y`”。现在有了两个变量，`x` 和 `y`，都等于`5`。这也正是事实上发生了的，因为整数是有已知固定大小的简单值，所以这两个 `5`被放入了栈中。

现在看看这个`String`版本：

```rust
fn main() {
    // ANCHOR: here
    let s1 = String::from("hello");
    let s2 = s1;
    // ANCHOR_END: here
}
```

这看起来与上面的代码非常类似，所以我们可能会假设他们的运行方式也是类似的：也就是说，第二行可能会生成一个 `s1` 的拷贝并绑定到 `s2` 上。不过，事实上并不完全是这样。

看看 图3-1 以了解 `String` 的底层会发生什么。`String` 由三部分组成，如图左侧所示：一个指向存放字符串内容内存的指针，一个长度，和一个容量。这一组数据存储在栈上。右侧则是堆上存放内容的内存部分。

<img alt="String in memory" src="https://rust.hyperter.top/screenshot/trpl04-01.6a1fa64a.svg" class="center" style="width: 50%;" />

<span class="caption">图 3-2：将值 `"hello"` 绑定给 `s1` 的 `String` 在内存中的表现形式</span>

长度表示`String`的内容当前使用了多少字节的内存。容量是`String`从分配器总共获取了多少字节的内存。长度与容量的区别是很重要的，不过在当前上下文中并不重要，所以现在可以忽略容量。

当我们将`s1`赋值给`s2`，`String`的数据被复制了，这意味着我们从栈上拷贝了它的指针、长度和容量。我们并没有复制指针指向的堆上数据。换句话说，内存中数据的表现如下图3-3 所示。

<img alt="s1 and s2 pointing to the same value" src="https://rust.hyperter.top/screenshot/trpl04-02.bb682764.svg" class="center" style="width: 50%;" />

<span class="caption">图 3-3：变量 `s2` 的内存表现，它有一份 `s1` 指针、长度和容量的拷贝</span>

这个表现形式看起来 并不像 图 3-4 中的那样，如果 Rust 也拷贝了堆上的数据，那么内存看起来就是这样的。如果 Rust 这么做了，那么操作`s2 = s1`在堆上数据比较大的时候会对运行时性能造成非常大的影响。

<img alt="s1 and s2 to two places" src="https://rust.hyperter.top/screenshot/trpl04-03.c8ee5708.svg" class="center" style="width: 50%;" />

<span class="caption">图 3-4：另一个 `s2 = s1` 时可能的内存表现，如果 Rust 同时也拷贝了堆上的数据的话</span>

之前我们提到过当变量离开作用域后，Rust 自动调用`drop`函数并清理变量的堆内存。不过图 3-2 展示了两个数据指针指向了同一位置。这就有了一个问题：当`s2`和`s1`离开作用域，他们都会尝试释放相同的内存。这是一个叫做**二次释放**（double free）的错误，也是之前提到过的内存安全性 bug 之一。两次释放（相同）内存会导致内存污染，它可能会导致潜在的安全漏洞。

为了确保内存安全，在 let`s2 = s1`之后，Rust 认为`s1`不再有效，因此 Rust 不需要在`s1`离开作用域后清理任何东西。看看在`s2`被创建之后尝试使用`s1`会发生什么；这段代码不能运行：

```rust
fn main() {
    // ANCHOR: here
    let s1 = String::from("hello");
    let s2 = s1;

    println!("{}, world!", s1);
    // ANCHOR_END: here
}
```

你会得到一个类似如下的错误，因为 Rust 禁止你使用无效的引用。

```text
Invalid code snippet option
```

如果你在其他语言中听说过术语**浅拷贝**（shallow copy）和**深拷贝**（deep copy），那么拷贝指针、长度和容量而不拷贝数据可能听起来像浅拷贝。不过因为 Rust 同时使第一个变量无效了，这个操作被称为**移动**（move），而不是浅拷贝。上面的例子可以解读为`s1`被 移动 到了`s2`中。那么具体发生了什么，如图 3-5 所示。

<img alt="s1 moved to s2" src="https://rust.hyperter.top/screenshot/trpl04-04.040f910e.svg" class="center" style="width: 50%;" />

<span class="caption">图 3-5：`s1` 无效之后的内存表现</span>

这样就解决了我们的问题！因为只有`s2`是有效的，当其离开作用域，它就释放自己的内存，完毕。

另外，这里还隐含了一个设计选择：Rust 永远也不会自动创建数据的 “深拷贝”。因此，任何 **自动** 的复制可以被认为对运行时性能影响较小。

### 变量与数据交互的方式（二）：克隆

如果我们 **确实** 需要深度复制 `String` 中堆上的数据，而不仅仅是栈上的数据，可以使用一个叫做 `clone` 的通用函数。第五章会讨论方法语法，不过因为方法在很多语言中是一个常见功能，所以之前你可能已经见过了。

这是一个实际使用`clone`方法的例子：

```rust
fn main() {
    // ANCHOR: here
    let s1 = String::from("hello");
    let s2 = s1.clone();

    println!("s1 = {}, s2 = {}", s1, s2);
    // ANCHOR_END: here
}
```

这段代码能正常运行，并且明确产生图 3-3 中行为，这里堆上的数据 **确实** 被复制了。

当出现 `clone` 调用时，你知道一些特定的代码被执行而且这些代码可能相当消耗资源。你很容易察觉到一些不寻常的事情正在发生。

### 只在栈上的数据：拷贝

这里还有一个没有提到的小窍门。这些代码使用了整型并且是有效的，他们是示例 3-2 中的一部分：

```rust
fn main() {
    // ANCHOR: here
    let x = 5;
    let y = x;

    println!("x = {}, y = {}", x, y);
    // ANCHOR_END: here
}
```

但这段代码似乎与我们刚刚学到的内容相矛盾：没有调用`clone`，不过`x`依然有效且没有被移动到`y`中。

原因是像整型这样的在编译时已知大小的类型被整个存储在栈上，所以拷贝其实际的值是快速的。这意味着没有理由在创建变量`y`后使`x`无效。换句话说，这里没有深浅拷贝的区别，所以这里调用`clone`并不会与通常的浅拷贝有什么不同，我们可以不用管它。

Rust 有一个叫做 `Copy` trait 的特殊注解，可以用在类似整型这样的存储在栈上的类型上。如果一个类型实现了 `Copy` trait，那么一个旧的变量在将其赋值给其他变量后仍然可用。

Rust 不允许自身或其任何部分实现了 `Drop` trait 的类型使用 `Copy` trait。如果我们对其值离开作用域时需要特殊处理的类型使用`Copy`注解，将会出现一个编译时错误。

那么哪些类型实现了 `Copy` trait 呢？你可以查看给定类型的文档来确认，不过作为一个通用的规则，任何一组简单标量值的组合都可以实现`Copy`，任何不需要分配内存或某种形式资源的类型都可以实现 `Copy` 。如下是一些`Copy`的类型：

* 所有整数类型，比如`u32`。
* 布尔类型，`bool`，它的值是`true`和`false`。
* 所有浮点数类型，比如`f64`。
* 字符类型，`char`。
* 元组，当且仅当其包含的类型也都实现`Copy`的时候。比如，`(i32, i32)`实现了`Copy`，但`(i32, String)`就没有。
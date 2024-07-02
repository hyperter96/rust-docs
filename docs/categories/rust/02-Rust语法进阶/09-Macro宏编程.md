---
title: Macro宏编程
author: 皮特ᴾᵗ
date: 2024/06/03 19:19
categories:
 - Rust语法进阶
 - Rust
tags:
 - Rust
 - Rust基础
 - 宏编程
---

# Macro宏编程

在 Rust 中宏分为两大类：**声明宏**(*declarative macros*) `macro_rules!` 和三种**过程宏**(*procedural macros*):

- `#[derive]`，在之前多次见到的派生宏，可以为目标结构体或枚举派生指定的代码，例如 `Debug` 特征
- 类属性宏(*Attribute-like macro*)，用于为目标添加自定义的属性
- 类函数宏(*Function-like macro*)，看上去就像是函数调用

如果感觉难以理解，也不必担心，接下来我们将逐个看看它们的庐山真面目，在此之前，先来看下为何需要宏，特别是 Rust 的函数明明已经很强大了。

## 宏和函数的区别

### 可变参数

Rust 的函数签名是固定的：定义了两个参数，就必须传入两个参数，多一个少一个都不行，对于从 JS/TS 过来的同学，这一点其实是有些恼人的。

而宏就可以拥有可变数量的参数，例如可以调用一个参数的 `println!("hello")`，也可以调用两个参数的 `println!("hello {}", name)`。

### 宏展开

由于宏会被展开成其它代码，且这个展开过程是发生在**编译器对代码进行解释之前**。因此，宏可以为指定的类型实现某个特征：**先将宏展开成实现特征的代码后，再被编译**。

而函数就做不到这一点，因为它直到运行时才能被调用，而特征需要在**编译期**被实现。

## 声明宏 `macro_rules!`

使用 `macro_rules!` 创建一个简单的宏，用于将输入的字符串读入缓冲区：

```rust
use std::io;

macro_rules! scanline {
    ($x: expr) => {
        io::stdin().read_line(&mut $x).unwrap();
    };
}

fn main() {
    let mut input = String::from("aaa\n bbbb");
    scanline!(input);
    println!("I read: {:?}", input);
}
```

声明宏非常类似 `match` 表达式，也是一个模式匹配的过程。

### `expr`

`($x:expr)` 中 $x 是一个标记树的变量，右侧的部分是一个规则，`expr` 是标记树类型之一，表示只能接受表达式。

```rust
macro_rules! create_array {
    () => {
        {
            let arr: [u8; 0] = [];
            arr 
        } 
    };
    ($a: expr, $b: expr) => {
        {
            let vec = vec![$a, $b];
            vec
        }
    };
}

fn main() {
    let arr1 = create_array!();
    println!("{:?}", arr1); // []
    let arr2 = create_array!(2, 3);
    println!("{:?}", arr2); // [2, 3]
}
```

如果调用宏时不指定参数，那么返回长度为 `0` 的静态数组；指定 `2` 个参数时，返回长度为 `2` 的动态数组，当然这个例子本身没啥意义。如果是函数，那么参数要定义成 `(a: T, b: T)` 的形式，在代码块内部直接使用 `a`、`b` 即可，就像使用普通变量一样。但在宏里面，参数要定义成上述代码中的形式，然后在内部通过 `$a`、`$b` 的形式使用。

然后还需要注意的是，宏本质上就是对代码的替换，所以上面的代码在编译时会被替换为如下：

```rust
fn main() {
    let result = create_array!();
    // 会被替换为如下
    let result = {
        let arr: [u8; 0] = [];
        arr
    };
    
    let result = create_array!(2, 3);
    // 会被替换为如下
    let result = {
        let vec = vec![2, 3];
        vec
    };
}
```

因此我们在定义宏的时候，**代码块使用了两个大括号，这是必须的**。如果只是返回一个普通的表达式，那么一个大括号就够了，但如果包含了 `let` 等语句，就必须再嵌套一个大括号。因为宏在被调用的地方会直接展开，直接替换为大括号里面的内容，那么结果可能会导致当前作用域的变量被污染。但如果大括号里面还有大括号，那么展开的时候，代码块就会被限定在一个单独的作用域中，不会污染外部变量。

:::warning 注意
- 外层的大括号换成小括号也是可以的，每个分支之间必须用分号分隔。
- 替换后 `$a`、`$b` 就都不存在了，它们不是变量，仅仅是个占位符
:::

宏的参数和函数的参数有着本质的不同，函数的参数是货真价实的变量，而宏的参数只是一个占位符，在调用时会被替换为具体的表达式。

### `ident`

`$v` 后面如果跟 `expr`，表示 `$v` 要接收一个表达式，但除了 `expr` 之外还可以是别的。

- `ident`：标识符，比如结构体名称、函数名称、变量名、类型名等等
- `ty`：类型名，虽然 ident 也可以表示类型名，但它的匹配范围仅限制于 `i32`、`String` 这种单个标识符，不能匹配像 `Vec<i32>`、以及带生命周期这种更复杂的类型
- `expr`：表达式

举个例子：

```rust
macro_rules! some_macro1 {
    ($var:ident) => {
        println!("{:?}", $var)
    };
}

macro_rules! some_macro2 {
    ($var:ident) => {
        // 此时的 $var 必须是含有 name 和 age 两个字段的结构体名称
        $var{name: "satori", age: 17}
    };
}

fn main() {
    let x = 666;
    // 展开后等价 println!("{:?}", x)
    some_macro1!(x);  // 666

    #[derive(Debug)]
    struct Girl {
        name: &'static str,
        age: u8
    }
    println!("{:?}", some_macro2!(Girl));  // Girl { name: "satori", age: 17 }
}
```

不难理解，如果 `$var` 后面还是 `expr`，那么这两个调用就是不合法的，因为 `expr` 要求的是编译期间可以计算的表达式。如果想传递变量（函数、结构体名称啥的都是变量），那么需要将 `expr` 换成 `ident`。

因此我们便看到了宏的强大之处，比如 `some_macro2` 里面的 `$var`，我们并不知道它是啥，但依旧可以对它做任意的操作。而我们对 `$var` 进行了结构体实例化操作，并指定了 `name` 和 `age` 两个字段，所以我们在调用时只需要传递合法的结构体即可。

### `$(...)*` 或者 `$(...),*`

Rust 的宏允许通过 `$(...)*` 或者 `$(...),*` 这样的模式来指定宏可以接收任意数量的参数，比如 `$($el:expr),*` 表示可以接收任意个表达式，表达式的名称叫做 `el`。另外通配符除了 * 之外还有 `+` 和 `?`，分别表示任意次、至少一次、零次或一次。

```rust
macro_rules! print_values {
    ($($value:expr),*) => {
        // 此时 value 不再是一个表达式，而是一系列表达式
        // 所以需要将代码放在 $()* 里面，表示对每个表达式单独处理
        $(
            println!("{:?}", $value);
        )*
    }
}

fn main() {
    print_values!(1, 2u8, "你好", vec![1, 2, 3]);
    /*
    1
    2
    "你好"
    [1, 2, 3]
     */
}
```

## 过程宏

### 派生宏`#[derive(...)]`

在Rust中，派生宏是一种特殊的宏，它允许开发者为自定义的数据类型自动实现trait。派生宏使用`proc_macro_derive`属性来定义，其基本形式如下：

```rust
use quote::quote;
use proc_macro::TokenStream;

#[proc_macro_derive(YourTrait)]
pub fn your_derive_macro(input: TokenStream) -> TokenStream {
    // 派生宏的处理逻辑
    // ...
}
```

在上述例子中，我们使用`proc_macro_derive`属性定义了一个名为`YourTrait`的派生宏。派生宏接受一个`TokenStream`参数`input`，表示派生宏调用的输入。在派生宏的处理逻辑中，我们可以根据`input`对类型上的`trait`进行自动实现，并返回一个`TokenStream`作为输出。


派生宏在Rust中具有以下几个特点：

- 自动实现`trait`：派生宏允许开发者为自定义的数据类型自动实现trait，无需手动编写trait的实现代码。这样可以大大减少重复的代码，提高代码的可读性和可维护性。
- 编译期间执行：派生宏的逻辑在编译期间执行，而不是运行时执行。这意味着`trait`的实现代码在编译时就已经确定，不会增加运行时的性能开销。
- 代码安全性：派生宏生成的`trait`实现代码必须是合法的Rust代码，它们受到Rust编译器的类型检查和安全检查。这保证了派生宏生成的`trait`实现不会引入潜在的编译错误和安全漏洞。

#### 构造派生宏和使用

我们以`hello_world`为例子，

```bash
$ cargo new hello-world
$ cd hello-world
$ cargo new hello-world-macro --lib
```

在`hello-world-macro`的`cargo.toml`添加

```toml
[dependencies]
quote = "1.0.33" // [!code ++]
syn = "2.0.39" // [!code ++]

[lib] // [!code ++]
proc-macro = true // [!code ++]
```
然后在`hello-world-macro`的`src/lib.rs`编写`Hello`的派生宏，

```rust
use quote::quote;
use proc_macro::TokenStream;

#[proc_macro_derive(Hello)]
pub fn hello(_item: TokenStream) -> TokenStream {
    let add_hello_world = quote! {
        impl Example {
            fn hello_world(&self) { // 为结构体Example实现hello_world的方法
                println!("hello, world");
            }
        }
    };
    add_hello_world.into()
}
```

那么，我们在`hello-world`的`src/main.rs`里引入`Hello`这个派生宏，要先在`cargo.toml`导入`hello-world-macro`的路径，

```toml
[dependencies]
hello-world-macro = { path = "./hello-world-macro"} // [!code ++]
```

在`src/main.rs`使用`Hello`的派生宏，

```rust
#[macro_use]
extern crate hello_world_macro;

#[derive(Hello)]
struct Example;
fn main() {
    let e = Example {};
    e.hello_world(); // hello, world
}
```

#### 带参数的派生宏

派生宏可以带有参数，让我们创建一个带有参数的派生宏（还是以`hello-world`为例子），用于根据参数生成不同类型的`trait`实现。

```rust
use proc_macro::TokenStream;

#[proc_macro_derive(Hello, attributes(attr1, attr2))]
pub fn your_trait_derive_macro(input: TokenStream) -> TokenStream {
    let output = input.to_string();
    // 解析属性参数
    let attr1 = if output.contains("attr1") {
        "impl Hello for Example {\n    // 根据attr1生成的trait实现\n}"
    } else {
        ""
    };
    let attr2 = if output.contains("attr2") {
        "impl Hello for Example {\n    // 根据attr2生成的trait实现\n}"
    } else {
        ""
    };
    let result = format!(
        "#[derive(Hello)]\n{}\n{}\n{}",
        output, attr1, attr2
    );
    result.parse().unwrap()
}
```

#### 自动实现序列化`trait`

派生宏可以用于自动实现序列化`trait`，让我们通过一个例子来演示如何使用派生宏实现`Serialize` trait。

```rust
use proc_macro::TokenStream;

#[proc_macro_derive(Serialize)]
pub fn serialize_derive_macro(input: TokenStream) -> TokenStream {
    let output = input.to_string();
    let result = format!(
        "#[derive(Serialize)]\n{}\nimpl Serialize for YourType {{\n    // 自动实现Serialize trait的代码\n}}",
        output
    );
    result.parse().unwrap()
}
```

在上述例子中，我们定义了一个名为`serialize_derive_macro`的派生宏，并使其自动实现`Serialize` trait。在宏的处理逻辑中，我们直接将输入的类型名和字段列表作为输出，并生成一个自动实现`Serialize` trait的代码块。这样一来，我们就可以通过派生宏轻松地为自定义的数据类型自动添加序列化的功能，而无需手动实现`Serialize` trait。

```rust
use serde::{Serialize, Deserialize};

#[derive(Serialize)]
struct Person {
    name: String,
    age: u32,
}

fn main() {
    let person = Person {
        name: "Alice".to_string(),
        age: 30,
    };

    let serialized = serde_json::to_string(&person).unwrap();
    println!("Serialized: {}", serialized);

    let deserialized: Person = serde_json::from_str(&serialized).unwrap();
    println!("Deserialized: {:?}", deserialized);
}
```

我们定义了一个名为`Person`的结构体，并使用派生宏`#[derive(Serialize)]`为它自动实现了`Serialize` trait。通过这个简单的派生宏，我们就能够将`Person`结构体序列化为`JSON`字符串，并成功地将`JSON`字符串反序列化回`Person`结构体。

#### 自动实现比较`trait`

派生宏还可以用于自动实现比较`trait`，让我们通过一个例子来演示如何使用派生宏实现`PartialEq`和`PartialOrd` trait。

```rust
use proc_macro::TokenStream;

#[proc_macro_derive(Comparable)]
pub fn comparable_derive_macro(input: TokenStream) -> TokenStream {
    let output = input.to_string();
    let result = format!(
        "#[derive(PartialEq, PartialOrd)]\n{}\nimpl Comparable for YourType {{\n    // 自动实现比较trait的代码\n}}",
        output
    );
    result.parse().unwrap()
}
```

我们定义了一个名为`comparable_derive_macro`的派生宏，并使其自动实现`PartialEq`和`PartialOrd` trait。在宏的处理逻辑中，我们直接将输入的类型名和字段列表作为输出，并生成一个自动实现比较`trait`的代码块。

```rust
#[derive(Comparable)]
struct Point {
    x: i32,
    y: i32,
}

fn main() {
    let p1 = Point { x: 1, y: 2 };
    let p2 = Point { x: 3, y: 4 };
    let p3 = Point { x: 1, y: 2 };

    // 使用派生的比较trait进行比较
    assert_eq!(p1, p3);
    assert_ne!(p1, p2);
    assert!(p1 < p2);
}
```

我们定义了一个名为`Point`的结构体，并使用派生宏`#[derive(Comparable)]`为它自动实现了`PartialEq`和`PartialOrd` trait。通过这个简单的派生宏，我们就能够轻松地为自定义的数据类型添加比较的功能，并使用派生的比较`trait`进行比较操作。

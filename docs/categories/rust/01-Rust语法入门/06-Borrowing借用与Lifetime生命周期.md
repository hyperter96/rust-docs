---
title: Borrowing借用 && Lifetime生命周期
author: 皮特ᴾᵗ
date: 2024/05/08 21:33
categories:
 - Rust语法入门
tags:
 - Rust
 - Rust基础
 - 借用
 - 生命周期
---

# Borrowing借用 && Lifetime生命周期

## Borrowing && Borrow Checker && Lifetime

### Borrowing

引用和借用有两种描述。

引用（Reference）：

1. 引用是一种变量的别名，通过`&`符号来创建。（非所有权）
2. 引用可以是不可变的（`&T`）或可变的（`&mut T`）
3. 引用允许在不传递所有权的情况下访问数据，它们是安全且低开销的。

借用（Borrowing）：

1. 借用是通过引用（Reference）来借用（Borrow）数据，从而在一段时间内访问数据而不拥有它。
2. 借用分为可变借用和不可变借用。可变借用（`&mut`）允许修改数据，但在生命周期内只能有一个可变借用。不可变借用（`&`）允许多个同时存在，但不允许修改数据。

:::warning 📢注意
引用更看重**对象**，借用更看重**行为**。
:::

### Borrow Checker

Borrow Checker的规则有以下：

- 不可变引用规则：在任何给定的时间，要么有一个可变引用，要么有多个不可变引用，但不能同时存在可变引用和不可变引用。这确保了在同一个时间只有一个地方对数据进行修改，或者有多个地方同时读取数据。
- 可变引用规则：在任何给定的时间，只能有一个可变引用来访问数据。这防止了并发修改相同数据的问题，从而防止数据竞争。
- 生命周期规则：引用的生命周期必须在被引用的数据有效的时间范围内。这防止了悬垂引用，即引用的数据已经被销毁，但引用仍然存在。
- 可变引用与不可变引用不互斥：可以同时存在多个不可变引用，因为不可变引用不会修改数据，不会影响到其他引用。但不可变引用与可变引用之间是互斥的。

### 手动指定Lifetime

生命周期参数在函数/结构体签名中指定：

一般情况下`Borrow Checker`会自行推断，在函数/结构体签名中使用生命周期参数允许函数声明引用的有效范围。

例子：

```rust
fn main() {
    let mut s = String::from("Hello");
    // 不可变引用，可以有多个不可变引用
    let r1 = &s;
    let r2 = &s;
    println!("{} {}", r1, r2); // Hello Hello

    // 可变引用只能有一个
    let r3 = &mut s;
    println!("{}", r3); // Hello

    let result: &str;
    {
        // result = "ff";
        let r4 = &s; // 给r4定义，r4的生命周期结束
        result = ff(r4); // 相当于给result初始化，result的生命周期还没结束
    }

    // println!("r4 {}", r4); // r4的所有权已经转移给result
    println!("{}", result); // Hello
}

fn ff<'a>(s: &'a str) -> &'a str {
    s
}
```

## Lifetime与函数

### 任何引用都是有生命周期

大多数情况下，生命周期是隐式且被推断的。

生命周期的主要目的是防止悬垂引用。

关于“悬垂引用”的概念是指，引用指向的数据在代码结束后被释放，但引用仍然存在。

- 生命周期的引入有助于确保引用的有效性，防止程序在运行时出现悬垂引用的情况
- 通过生命周期的推断，Rust能够在编译时检查代码，确保引用的有效性，而不是在运行时出现悬垂引用的错误

### 三个规则推断生命周期

编译器在没有显式注解的情况下，使用三个规则来推断这些生命周期：

1. 第一个规则是每个作为引用的参数都会得到它自己的生命周期参数
2. 第二个规则是，如果只有一个输入生命周期参数，那么该生命周期将被分配给所有输出生命周期参数（该生命周期将分配给返回值）
3. 第三个规则是，如果有多个输入生命周期参数，但其中一个是对`self`或不可变`self`的引用时。因为在这种情况下它是一个方法，所以`self`的生命周期被分配给所有输出生命参数

例子：
```rust
// 字面量的生命周期都是一样的时候，性能相对慢一些
fn longest<'a>(s1: &'a str, s2: &'a str) -> &'a str {
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}

// 返回的字面量的生命周期out是a和b的交集
fn longest_str<'a, 'b, 'out>(s1: &'a str, s2: &'b str) -> &'out str 
where
    'a: 'out,
    'b: 'out,
{
    if s1.len() > s2.len() {
        s1
    } else {
        s2
    }
}


fn no_need(s: &'static str, s1: &str) -> &'static str {
    s
}

fn main() {
    println!("longest s: {}", longest("aabb", "ab")); // longest s: aabb
    let result: &str;
    {
        let r2 = "cba";
        result = longest_str("aabbcc", r2);
        println!("longest s of out: {}", result); // longest s of out: aabbcc
    }
    println!("no need {}", no_need("hh", "")); // no need hh
}
```

## Lifetime与Struct

### 结构体中的引用

- 在结构体中的引用需要标注生命周期
- 结构体的方法（`self`等）不需要标注生命周期

例子：

```rust
struct MyString<'a> {
    text: &'a str, // 最好写String
}

impl<'a> MyString<'a> {
    fn get_length(&self) -> usize {
        self.text.len()
    }

    fn modify_data(&mut self) {
        self.text = "world";
    }
}

struct StringHolder {
    data: String,
}

impl StringHolder {
    fn get_length(&self) -> usize {
        self.data.len()
    }

    fn get_ref<'a>( &'a self) -> &'a String {
        &self.data
    }
}

fn main() {
    let str1 = String::from("value");
    let mut x = MyString{
        text: str1.as_str(),
    };
    println!("x before mod: {}", x.text); // x before mod: value
    x.modify_data();
    println!("x after mod: {}", x.text); // x after mod: world

    let holder = StringHolder{
        data: String::from("Hello"),
    };
    println!("{}", holder.get_ref()); // Hello

}
```
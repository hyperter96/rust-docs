---
title: Closures闭包
author: 皮特ᴾᵗ
date: 2024/05/22 17:35
categories:
 - Rust语法入门
tags:
 - Rust
 - Rust基础
 - 闭包
 - 特质
 - 函数式编程
---

# Closures闭包

## 闭包基础概念

闭包是一种可以捕获其环境中变量的匿名函数。

闭包的语法相对简洁灵活，同时也具有强大的功能。闭包在Rust中被广泛用于函数式编程、并发编程以及简化代码等方面。

### 如何使用闭包

定义闭包的语法类似：
- 在`||`内定义参数
- 可选地指定参数/返回类型
- 在`{}`内定义闭包体

你可以将闭包分配给一个变量
- 然后使用该变量，就像它是一个函数名，来调用闭包

```rust
#[derive(Debug)]
struct User {
    name: String,
    score: u64,
}

// sort_by_key
fn sort_score(users: &mut Vec<User>) {
    users.sort_by_key(sort_helper);
}

fn sort_helper(u: &User) -> u64 {
    u.score
}

fn sort_score_closure(users: &mut Vec<User>) {
    users.sort_by_key(|u| u.score);
}

fn main() {
    let a = User{
        name: "U1".to_owned(),
        score: 100,
    };
    let b = User{
        name: "U2".to_owned(),
        score: 80,
    };
    let c = User{
        name: "U3".to_owned(),
        score: 40,
    };
    let d = User{
        name: "U4".to_owned(),
        score: 90,
    };
    let mut users = vec![a, b, c, d];
    sort_score(&mut users);
    println!("{:?}", users); // [User { name: "U3", score: 40 }, User { name: "U2", score: 80 }, User { name: "U4", score: 90 }, User { name: "U1", score: 100 }]

    let a = User{
        name: "U1".to_owned(),
        score: 100,
    };
    let b = User{
        name: "U2".to_owned(),
        score: 80,
    };
    let c = User{
        name: "U3".to_owned(),
        score: 40,
    };
    let d = User{
        name: "U4".to_owned(),
        score: 90,
    };
    let mut users = vec![a, b, c, d];
    sort_score_closure(&mut users);
    println!("{:?}", users); // [User { name: "U3", score: 40 }, User { name: "U2", score: 80 }, User { name: "U4", score: 90 }, User { name: "U1", score: 100 }]
}
```

## 闭包获取参数by reference与by value

闭包在Rust中的实现可以近似地理解为一个实现了FnOnce、FnMut和Fn其中一个trait的匿名结构体，这个匿名结构体保存捕获的环境中的变量。通过调用trait的方法来执行闭包体中的代码。

### 获取外部参数

由Rust编译器决定用那种方式获取外部参数

1. 不可变引用`Fn`
2. 可变引用`FnMut`
3. 转移所有权`(Move) FnOnce`

闭包实现这三个trait的规则如下：

- 所有的闭包都实现了`FnOnce`。
- 如果闭包的方法移出了所捕获的变量的所有权，则只会实现`FnOnce`。
- 如果闭包的方法没有移出所捕获的变量的所有权，并且对变量进行了修改，即通过可变借用使用所捕获的变量，则会实现`FnMut`。
- 如果闭包的方法没有移出所捕获的变量的所有权，并且没有对变量进行修改，即通过不可变借用使用所捕获的变量，则会实现`Fn`。

### 所有权转移Move

Rust编译器判断captures by value，比方说在闭包手动`drop`该参数。

- 实现`Copy Trait`的对象，`move`时发生值拷贝。
- 未实现`Copy Trait`的对象，`move`关键字强制将其所有权转移到闭包。

例子一：
```rust
#[derive(Debug, Copy, Clone)]
struct FooCopy {
    value: i32,
}

impl FooCopy {
    fn new(value: i32) -> Self {
        Self { value }
    }
    
    fn get(&self) -> i32 {
        self.value
    }
    
    fn increase(&mut self) {
        self.value += 1;
    }
}

fn is_FnMut<F: FnMut()>(c: &F) {}

fn is_Copy<F: Copy>(c: &F) {}
fn main() {
    let mut foo_copy = FooCopy::new(0);
  
    let mut c_with_move = move || {
        for _ in 0..5 {
            foo_copy.increase();
        }
        
        println!("foo_copy in closure(with move): {}", foo_copy.get());
    };
    
    c_with_move(); // foo_copy in closure(with move): 5
    println!("foo_copy out of closure(with move): {}\n", foo_copy.get()); // foo_copy out of closure(with move): 0

    let mut c_without_move = || {
        for _ in 0..5 {
            foo_copy.increase();
        }
        
        println!("foo_copy in closure(without move): {}", foo_copy.get());
    };
    
    is_FnMut(&c_with_move);
    is_Copy(&c_with_move);
    
    is_FnMut(&c_without_move);
    //is_Copy(&c_without_move); // Error
    
    c_without_move(); // foo_copy in closure(without move): 5
    println!("foo_copy out of closure(without move): {}\n", foo_copy.get()); // foo_copy out of closure(without move): 5
}
```
例子中`Copy`语义的变量`foo_copy`在使用关键字`move`将其`Copy`至闭包`c_with_move`内后，对环境中的变量不再有影响。此时闭包的匿名结构体中保存的变量为`mut FooCopy`，在闭包中使用的`increase()`方法通过可变借用来进行操作，所以实现了`FnMut + Copy trait`。

在不使用关键字`move`时，闭包`c_without_move`对环境中的变量`foo_copy`进行了可变借用。此时闭包的匿名结构体内中保存的变量为`&mut FooCopy`，所以会对环境中的变量进行修改，其同样实现了`FnMut trait`，但不会实现`Copy trait`。


例子二：
```rust
fn main() {
    // Fn不可变引用获取外部参数
    let s1 = String::from("111111111");
    let s2 = String::from("222222222");

    let fn_func = |s| {
        println!("{s1}");
        println!("I am {s}");
    };
    
    fn_func("yz".to_owned()); // Fn不可变引用，所有权仍然保留
    fn_func("原子".to_owned());
    println!("{s1} {s2}"); // 111111111 222222222

    // FnMut可变引用获取外部参数，匿名函数中的外部参数存在修改
    let mut s1 = String::from("111111111");
    let mut s2 = String::from("222222222");

    let mut fn_func = |s| {
        s1.push_str("😊");
        s2.push_str("😊");
        println!("{s1}");
        println!("I am {s}");
    };
    
    fn_func("yz".to_owned()); // FnMut可变引用，所有权仍然保留
    fn_func("原子".to_owned());
    println!("{s1} {s2}"); // 111111111😊😊 222222222😊😊

    // 所有权转移
    let s1 = String::from("1111");
    let fn_Once_func = || {
        println!("{s1}");
        std::mem::drop(s1);
    };
    fn_Once_func(); // 1111
    // println!("{s1}");

    // 使用关键字move，捕获闭包外的环境变量所有权移至闭包内
    let s1 = String::from("1111");
    let move_fn = move || {
        println!("{s1}");
    };
    move_fn(); // 1111
    // println!("{s1}");
}
```

## 闭包底层是怎么工作的

1. Rust编译器将闭包放入一个结构体
2. 结构体会声明一个`call function`，而闭包就是函数，`call function`会包含闭包的所有代码
3. 结构体会生产一些属性去捕获闭包外的参数
4. 结构体会实现一些特质
    - `Fn`
    - `FnMut`
    - `FnOnce`

### `Fn`、`FnMut`、`FnOnce`对应关系

先来看看标准库中三者的定义：

```rust
// FnOnce
#[lang = "fn_once"]
#[must_use = "closures are lazy and do nothing unless called"]
pub trait FnOnce<Args> {
    type Output;
    extern "rust-call" fn call_once(self, args: Args) -> Self::Output;
}

// FnMut
#[lang = "fn_mut"]
#[must_use = "closures are lazy and do nothing unless called"]
pub trait FnMut<Args>: FnOnce<Args> {
    extern "rust-call" fn call_mut(&mut self, args: Args) -> Self::Output;
}

// Fn
#[lang = "fn"]
#[must_use = "closures are lazy and do nothing unless called"]
pub trait Fn<Args>: FnMut<Args> {
    extern "rust-call" fn call(&self, args: Args) -> Self::Output;
}
```

从这三个`trait`的声明可以看出，`Fn`是`FnMut`的子`trait`，`FnMut`是`FnOnce`的子`trait`。也就是说实现了`Fn`的闭包一定实现了`FnMut`，同样，实现了`FnMut`的闭包一定实现了`FnOnce`。

![](https://rust.hyperter.top/screenshot/closures.jpg)

```rust
fn apply_closure<F: Fn(i32, i32) -> i32>(closure: F, x: i32, y: i32) -> i32 {
    closure(x, y)
}

fn main() {
    let x = 5;
    let add_closure = |a, b| {
        println!("x is: {}", x); // x is: 5
        a + b + x
    };
    let result = apply_closure(add_closure, 5, 6);
    println!("{}", result); // 16
}
```

## 闭包类型`FnOnce`、`FnMut`和`Fn`做函数参数的实例

```rust
fn closure_fn<F>(func: F)
where
    F: Fn(),
{
    func();
    func();
}

fn closure_fn_mut<F>(mut func: F)
where
    F: FnMut(),
{
    func();
    func();
}

fn closure_fn_once<F>(func: F)
where
    F: FnOnce(),
{
    func();
}

fn main() {
    // 不可变引用只能传一种
    let s1 = String::from("11111");
    closure_fn(|| println!("{}", s1));

    // 可变引用
    let s1 = String::from("11111");
    closure_fn_mut(|| println!("{}", s1));

    let mut s2 = String::from("22222");
    closure_fn_mut(|| {
        s2.push_str("😊");
        println!("{}", s2);
    });

    // 所有权转移
    let s1 = String::from("11111");
    closure_fn_once(|| println!("{}", s1));

    let mut s2 = String::from("22222");
    closure_fn_once(|| {
        s2.push_str("😊");
        println!("{}", s2);
    });

    let s3 = "ff".to_owned();
    closure_fn_once(move || println!("{s3}")); // ff
}
```
---
title: Trait特质
author: 皮特ᴾᵗ
date: 2024/05/15 12:30
categories:
 - Rust语法入门
 - Rust
tags:
 - Rust
 - Rust基础
 - 泛型
 - 特质
 - Trait
 - Box
 - 多态
---

# Trait特质

## Trait基础

在Rust中，特质（*Traits*）是一种定义方法签名的机制。

特质允许你定义一组方法的签名，但可以不提供具体的实现（也可以提供）。这些方法签名可以包括参数和返回类型，但不包括方法的实现代码。

任何类型都可以实现特质，只要它们提供了特质中定义的所有方法。这使得你可以为不同类型提供相同的行为。

特点：

- 内置常量：特质可以内置常量（`const`），特质中定义的常量在程序的整个生命周期内是有效的
- 默认实现：特质可以提供默认的方法实现。如果类型没有为特质中的某个方法提供自定义实现，将会使用默认实现。
- 多重实现：类型可以实现多个特质，这允许你将不同的行为组合在一起。
- 特质边界：在泛型代码中，你可以使用特质作为类型约束。这被称为特质边界，它限制了泛型类型必须实现的特质。
- `Trait Alias`: Rust还支持`trait alias`，这允许你为复杂的`trait`组合创建简洁的别名，以便在代码中更轻松地引用。

例子：

```rust
trait Greeter {
    fn greet(&self);
    fn hello() {
        println!("hello");
    }
}

struct Person {
    name: String,
}

impl Greeter for Person {
    fn greet(&self) {
        println!("greet {}", self.name);
    }
}

fn main() {
    let person = Person {
        name: "Yz".to_owned(),
    };
    person.greet(); // greet Yz
    Person::hello(); // hello
}
```

## `Trait Object`与`Box`

### `Trait Object`

1. 在运行时动态分配的对象
    - “运行时泛型”
    - 比泛型要灵活的多
2. 可以在集合中混入不同类型对象
    - 更容易处理相似的数据
3. 有一些小小的性能损耗

### `dyn`关键字

`dyn`是Rust中的关键字，用于声明特质对象（`trait object`）的类型。特质对象是实现特定特质（`trait`）的类型的实例，但其具体类型在编译时是未知的。因此，为了让编译器知道我们正在处理的是特质对象，我们需要在特质名称前面加上`dyn`关键字。

`dyn`关键字的作用是指示编译器处理特质对象。

### Rust中数据传输的三种形式

- 不可变引用
    - `&dyn Trait`
- 可变引用
    - `&mut dyn Trait`
- Move语义所有权转移
    - 特质需要用`Box<dyn Trait>`实现Move，如果你需要在函数调用之间传递特质的所有权，并且希望避免在栈上分配的大量内存，可以使用`Box<dyn Trait>`。

### 创建`trait Object`的三种方式

- 第一种：

    ```rust
    let o = Object{};
    let o_obj: &dyn Object = &o;
    ```
- 第二种：

    ```rust
    let o_obj: &dyn Object = &Object{}
    ```
- 第三种：

    ```rust
    let o_obj: Box<dyn Object> = Box::new(Object{});
    ```

第一种和第二种都是创建不可变引用，第三种最常用也是最灵活，一般来说会使用`Box`和特质来组成集合元素。

例子：

```rust
struct Obj {}

trait Overview {
    fn overview(&self) -> String;
}

impl Overview for Obj {
    fn overview(&self) -> String {
        String::from("Obj")
    }
}

// 不可变引用
fn call_obj(item: &impl Overview) {
    println!("Overview {}", item.overview());
}

// Move
fn call_obj_box(item: Box<dyn Overview>) {
    println!("Overview box {}", item.overview());
}

trait Sale {
    fn amount(&self) -> f64;
}

struct Common(f64);

impl Sale for Common {
    fn amount(&self) -> f64 {
        self.0
    }
}

struct TenDiscount(f64);

impl Sale for TenDiscount {
    fn amount(&self) -> f64 {
        self.0 - 10.0
    }
}

struct TenPercentDiscount(f64);

impl Sale for TenPercentDiscount {
    fn amount(&self) -> f64 {
        self.0 * 0.9
    }
}


fn calculate(sales: &Vec<Box<dyn Sale>>) -> f64 {
    sales.iter().map(|sale|sale.amount()).sum()
}

fn main() {
    let a = Obj{};
    call_obj(&a); // Overview Obj
    println!("{}", a.overview()); // Obj
    let b_a = Box::new(Obj{});
    call_obj_box(b_a); // Overview box Obj
    // println!("{}", b_a.overview())

    let c = Box::new(Common(100.0));
    let t = Box::new(TenDiscount(100.0));
    let t2 = Box::new(TenPercentDiscount(100.0));

    let sales: Vec<Box<dyn Sale>> = vec![c, t, t2];
    println!("pay {}", calculate(&sales)) // pay 280
}
```

## `Trait Object`与泛型

### 泛型与`impl`不同的写法

- `fn call(item1: &impl Trait, item2: &impl Trait);`

    可以是不同类型
- `fn call_generic<T: Trait>(item1: &T, item2: &T);`

    可以是相同类型

### `Multiple Trait Bounds`

- `fn call(item1: &(impl Trait + AnotherTrait));`
- `fn call_generic<T: Trait + AnotherTrait>(item1: &T);`

例子：

```rust
trait Overview {
    fn overview(&self) -> String {
        String::from("Course")
    }
}

trait Another {
    fn hell(&self) {
        println!("welcome to hell")
    }
}

struct Course {
    headline: String,
    author: String,
}

// Course实现两种特质
impl Overview for Course {}
impl Another for Course {}

struct AnotherCourse {
    headline: String,
    author: String,
}

impl Overview for AnotherCourse {}

fn call_overview(item: &impl Overview) {
    println!("Overview {}", item.overview());
}

fn call_overview_generic<T: Overview>(item: &T) {
    println!("Overview generic {}", item.overview());
}

fn call_overviewT(item: &impl Overview, item1: &impl Overview) {
    println!("OverviewT {}", item.overview());
    println!("OverviewT {}", item1.overview());
}

// 只允许传入同类型结构体的引用
fn call_overviewTT<T: Overview>(item: &T, item1: &T) {
    println!("OverviewTT {}", item.overview());
    println!("OverviewTT {}", item1.overview());
}

// 多绑定
fn call_mul_bind(item: &(impl Overview + Another)) {
    println!("Overview {}", item.overview());
    item.hell();
}

// 多绑定泛型
fn call_mul_bind_generic<T>(item: &T)
where 
    T: Overview + Another,
{
    println!("Overview {}", item.overview());
    item.hell();
}

fn main() {
    let c0 = Course {
        headline: "ff".to_owned(),
        author: "yy".to_owned(),
    };
    let c1 = Course {
        headline: "ff".to_owned(),
        author: "yy".to_owned(),
    };

    let c2 = AnotherCourse {
        headline: "ff".to_owned(),
        author: "yz".to_owned(),
    };
    call_overview(&c1); // Overview Course
    call_overview_generic(&c1); // Overview generic Course
    call_overviewT(&c1, &c2); 
    // OverviewT Course
    // OverviewT Course
    call_overviewTT(&c0, &c1); // 应用范围宅一些
    // OverviewTT Course
    // OverviewTT Course
    call_overviewT(&c0, &c1);
    // OverviewT Course
    // OverviewT Course
    call_mul_bind(&c1);
    // Overview Course
    // welcome to hell
    call_mul_bind_generic(&c1);
    // Overview Course
    // welcome to hell
}
```

## 重载操作符（`Operator`）

- 只需要实现相应的特质

为结构体实现一个加减的例子：

```rust
use std::ops::Add;
use std::ops::Sub;
// 编译时
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

// T的这样类型，它可以执行相加的操作
impl<T> Add for Point <T>
    where T: Add<Output = T> 
{
    type Output = Self;
    fn add(self, rhs: Self) -> Self::Output {
        Point {
            x: self.x + rhs.x,
            y: self.y + rhs.y,
        }
    }
    
}

// 相减
impl <T> Sub for Point <T>
    where T: Sub<Output = T>
{
    type Output = Self;
    fn sub(self, rhs: Self) -> Self::Output {
        Point {
            x: self.x - rhs.x,
            y: self.y - rhs.y,
        }
    }
}
fn main() {
    let i1 = Point{x: 1, y: 2};
    let i2 = Point{x: 1, y: 3};
    let sum = i1 + i2;
    println!("{:?}", sum); // Point { x: 2, y: 5 }

    let i1 = Point{x: 1, y: 2};
    let i2 = Point{x: 1, y: 3};
    let sub = i1 - i2;
    println!("{:?}", sub); // Point { x: 0, y: -1 }
}
```

## Trait与多态和继承

Rust并不支持传统的继承的概念，但是你可以在特质中通过层级化来完成你的需求。

Rust选择了一种函数式的编程范式，即“组合和委托”而非“继承”。

编程语言的大势也是组合优于继承。

例子：

```rust
use std::collections::VecDeque;

// 多态
trait Driver {
    fn drive(&self);
}

struct Car;

impl Driver for Car {
    fn drive(&self) {
        println!("Car is driving")
    }
}
struct SUV;

impl Driver for SUV {
    fn drive(&self) {
        println!("SUV is driving")
    }
}

fn road(vehicle: &dyn Driver) {
    vehicle.drive()
}

// 继承思想
// 单向特质
trait Queue {
    fn len(&self) -> usize;
    fn push_back(&mut self, n: i32);
    fn pop_front(&mut self) -> Option<i32>;
}

// 双向特质
trait Deque: Queue {
    fn push_front(&mut self, n: i32);
    fn pop_back(&mut self) -> Option<i32>;
}

#[derive(Debug)]
struct List {
    data: VecDeque<i32>,
}

impl List {
    fn new() -> Self {
        let data = VecDeque::<i32>::new();
        Self{data}
    }
}

impl Deque for List {
    fn push_front(&mut self, n: i32) {
        self.data.push_front(n)
    }

    fn pop_back(&mut self) -> Option<i32> {
        self.data.pop_back()
    }
}

impl Queue for List {
    fn len(&self) -> usize {
        self.data.len()
    }

    fn pop_front(&mut self) -> Option<i32> {
        self.data.pop_back()
    }

    fn push_back(&mut self, n: i32) {
        self.data.push_back(n)
    }
}

fn main() {
    road(&Car); // Car is driving
    road(&SUV); // SUV is driving

    let mut l = List::new();
    l.push_back(1);
    l.push_front(0);
    println!("{:?}", l); // List { data: [0, 1] }
    l.push_front(2);
    println!("{:?}", l); // List {data: [2, 0, 1] }
    l.push_back(3);
    println!("{:?}", l); // List {data: [2, 0, 1, 3]}
    println!("{}", l.pop_back().unwrap()); // 3
    println!("{:?}", l); // List {data: [2, 0, 1] }
}
```

## 常见的Trait

- `Debug`
- `Clone`
- `PartialEq`

例如：

```rust
// Clone Copy Debug PartialEq
// 层级 打个比方，结构体里面有个枚举，那么结构体实现Clone，里面的枚举也实现Clone

// 给枚举Race实现Debug，Clone
#[derive(Debug, Clone, Copy)]
enum Race {
    White,
    Yellow,
    Black,
}

impl PartialEq for Race {
    fn eq(&self, other: &Self) -> bool {
        match(self, other) {
            (Race::White, Race::White) => true,
            (Race::Yellow, Race::Yellow) => true,
            (Race::Black, Race::Black) => true,
            _ => false,
        }
    }
}

// 给结构体User实现Debug, Clone
#[derive(Debug, Clone)]
struct User {
    id: u32,
    name: String,
    race: Race,
}

impl PartialEq for User {
    fn eq(&self, other: &Self) -> bool {
        self.id == other.id && self.name == other.name && self.race == other.race
    }
}

fn main() {
    let user = User{
        id: 3,
        name: "John".to_owned(),
        race: Race::Yellow,
    };

    println!("{:#?}", user);
    // User {
    //     id: 3,
    //     name: "John",
    //     race: Yellow,
    // }
    let user2 = user.clone();
    println!("{:#?}", user2);
    // User {
    //     id: 3,
    //     name: "John",
    //     race: Yellow,
    // }
    println!("{:#?}", user == user2); // true
}
```
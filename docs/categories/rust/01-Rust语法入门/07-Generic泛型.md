---
title: Generic泛型
author: 皮特ᴾᵗ
date: 2024/05/12 14:35
categories:
 - Rust语法入门
tags:
 - Rust
 - Rust基础
 - 泛型
---

# Generic泛型

泛型是一种编程语言的特性，它允许在代码中使用参数化类型，以便在不同地方使用相同的代码逻辑处理多种数据类型，而无需为每种类型编写单独的代码！

作用：

1. 提高代码的重复性
2. 提高代码的可读性
3. 提高代码的抽象度

泛型的应用类型：

- 泛型定义结构体/枚举
- 泛型定义函数
- 泛型与特质

## 泛型定义结构体

```rust
#[derive(Debug)]
struct Point<T> {
    x: T,
    y: T,
}

#[derive(Debug)]
struct PointTwo<T, E> {
    x: T,
    y: E,
}

fn main() {
    let c1 = Point {x: 1.0, y: 2.0};
    let c2 = Point {x:'x', y: 'y'};
    println!("c1 {:?} c2 {:?}", c1, c2); // c1 Point {x: 1.0, y: 2.0} c2 Point {x: 'x', y: 'y'}
    let c = PointTwo {x: 1.0, y: 'z'};
    println!("{:?}", c); // PointTwo {x: 1.0, y: 'z'}
    // 零成本抽象
}
```

## 泛型与函数

在Rust中，泛型也可以用于函数，使得函数能够处理多种类型的参数，提高代码的重用性和灵活性。

1. 泛型与函数
2. 泛型与结构体中的方法

例子：
```rust
// 交换
fn swap<T>(a: T, b: T) -> (T, T) {
    (b, a)
}

struct Point<T> {
    x: T,
    y: T,
}

impl<T> Point<T> {
    fn new(x: T, y: T) -> Self {
        Point{x, y}
    }

    // 方法, 加引用是为了防止当T是String的时候，返回以后所有权丢失
    fn get_coordinates(&self) -> (&T, &T) {
        (&self.x, &self.y)
    }
}
fn main() {
    let result = swap(0, 1);
    println!("{:?}", result); // (1, 0)

    let str2 = swap("hh", "tt");
    println!("str2.0 {} str2.1 {}", str2.0, str2.1); // str2.0 tt str2.1 hh
    let str2 = swap(str2.0, str2.1);
    println!("str2.0 {} str2.1 {}", str2.0, str2.1); // str2.0 hh str2.1 tt

    let i32_point = Point::new(2, 3);
    let f64_point = Point::new(2.0, 3.0);
    let (x1, y1) = i32_point.get_coordinates();
    let (x2, y2) = f64_point.get_coordinates();
    println!("i32 point: x={} y={}", x1, y1);
    println!("f64 point: x={} y={}", x2, y2);

    // 最好用String, 不用&str
    let string_point = Point::new("x".to_owned(), "y".to_owned());
    println!("string point x={} y={}", string_point.x, string_point.y);

}
```
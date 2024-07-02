---
title: Iterator迭代器
author: 皮特ᴾᵗ
date: 2024/05/17 10:37
categories:
 - Rust语法入门
 - Rust
tags:
 - Rust
 - Rust基础
 - 迭代器
---

# Iterator迭代器

## 迭代与循环

关于循环：

- 循环定义：循环是一种控制流结构，它会反复执行一组语句，直到满足某个条件。
- 控制条件：循环通常包含一个条件表达式，只有在条件为真时，循环体中的语句才会执行。
- 退出条件：循环执行直到条件不再满足，或者通过`break`语句显式中断循环。
- 使用场景：适用于需要反复执行某个操作直到满足某个条件的情况。

关于迭代：

- 迭代定义：迭代是对序列中的元素进行逐个访问的过程。
- 控制条件：迭代通常使用迭代器（*Iterator*）来实现，迭代器提供对序列元素的访问和操作。
- 退出条件：通常不需要显式的退出条件，迭代器会在处理完所有元素后自动停止。
- 使用场景：适用于需要遍历数据结构中的元素的情况，例如数组、切片、集合等。

区别：

1. 循环是一种控制流结构，它反复执行一组语句。
2. 迭代是对序列中的元素进行逐个访问的过程，通常使用迭代器实现。
3. 循环可以是有限的（通过设置退出条件）或者无限的（使用`loop`关键字）。
4. 迭代器提供了一种更抽象的方式来处理序列，使得代码更具可读性和灵活性。

在Rust中，循环和迭代性能的差距可能取决于具体的使用情况和编译器的优化。绝大多数情况下，Rust的迭代器是经过优化的，可以达到或接近手动编写循环的性能水平。

```rust
// loop

fn sum_with_loop(arr: &[i32]) -> i32 {
    let mut sum = 0;
    for &item in arr {
        sum += item;
    }
    sum
}

fn sum_with_iter(arr: &[i32]) -> i32 {
    arr.iter().sum()
}
fn main() {
    const ARRAY_SIZE: usize = 1_000;
    let array:Vec<_> = (1..=ARRAY_SIZE as i32).collect();
    let sum1 = sum_with_loop(&array);
    println!("sum loop {}", sum1);

    let sum2 = sum_with_iter(&array);
    println!("sum iter {}", sum2);
}
```

## `IntoIterator`、`Iterator`和`Iter`之间的关系

### IntoIterator Trait

`IntoInterator`是一个Rust Trait，它定义了一种将类型转换为迭代器的能力。

该Trait包含一个方法`into_iter`，该方法返回一个实现了Iterator Trait的迭代器。

通常，当你有一个类型，希望能够对其进行迭代时，你会实现IntoIterator Trait来提供将该类型转换为迭代器的方法。

### Iterator Trait

- `Iterator`是Rust标准库中的Trait，定义了一种访问序列元素的方式。
- 它包含了一系列方法，如`next`、`map`、`filter`、`sum`等，用于对序列进行不同类型的操作。
- 通过实现`Iterator` Trait，你可以创建自定义的迭代器，以定义如何迭代你的类型中的元素。

```rust
pub trait Iterator {
    type Item;
    fn next(&mut self) -> Option<Self::Item>;
}
```

### 源码中经常出现的`Iter`

- `Iter`是Iterator Trait的一个具体实现，通常用于对集合中的元素进行迭代。
- 在Rust中，你会经常看到`Iter`，特别是在对数组、切片等集合类型进行迭代时。
- 通过IntoIterator Trait，你可以获取到一个特定类型的迭代器，比如`Iter`，然后可以使用Iterator Trait的方法进行操作。

```rust
fn main() {
    // vec
    let v = vec![1, 2, 3, 4, 5]; // intoIterator特质into_iter
    // 转换为迭代器
    let iter = v.into_iter(); // move 所有权转移 Iter，类似Iter Iterator的特质对象
    let sum: i32 = iter.sum();
    println!("sum：{}", sum); // sum：15
    
    // array
    let array = [1, 2, 3, 4, 5];
    let arr_iter = array.iter();
    let sum: i32 = arr_iter.sum();
    println!("sum：{}", sum); // sum：15
    println!("{:?}", array); // [1, 2, 3, 4, 5] 所有权没有转移
    // char
    let text = "hello world!";
    let text_iter = text.chars();
    let uppercase: String = text_iter.map(|c|c.to_ascii_uppercase()).collect();
    println!("uppercase: {}", uppercase); // uppercase: HELLO WORLD!
}
```

## 获取迭代器的三种方法`iter()`、`iter_mut()`、`into_iter()`

- `iter()`

    `iter()`方法返回一个不可变引用的迭代器，用于只读访问集合的元素。该方法适用于你希望不修改集合的情况下迭代元素的场景。

- `iter_mut()`

    `iter_mut()`方法返回一个可变引用的迭代器，用于允许修改集合中的元素。该方法适用于你希望在迭代过程中修改集合元素的场景。

- `Into_iter()`

    `into_iter()`方法返回一个拥有所有权的迭代器，该迭代器会消耗集合本身，将所有权转移到迭代器。该方法适用于你希望在迭代过程中拥有集合的所有权，以便消耗性的操作，如移除元素。

```rust
fn main() {
    let vec = vec![1, 2, 3, 4, 5];
    // iter() 不可变引用的迭代器
    for &item in vec.iter() {
        println!("{}", item);
    }
    println!("{:?}", vec); // [1, 2, 3, 4, 5]

    // 可变引用
    let mut vec = vec![1, 2, 3, 4, 5];
    for item in vec.iter_mut() {
        *item *= 2;
    }
    println!("{:?}", vec); // [2, 4, 6, 8, 10]

    // 所有权转移
    let vec = vec![1, 2, 3, 4, 5];
    for item in vec.into_iter() {
        println!("{}", item);
    }
    // println!("{:?}", vec);
}
```

## 自定义类型实现`iter()`、`iter_mut()`、`into_iter()`

譬如结构体实现迭代器：

```rust
#[derive(Debug)]
struct Stack<T> {
    items: Vec<T>,
}

impl<T> Stack<T> {
    fn new() -> Self {
        Stack {items: Vec::new()}
    }

    // 入栈
    fn push(&mut self, item: T) {
        self.items.push(item);
    }

    // 出栈
    fn pop(&mut self) -> Option<T>{
        self.items.pop()
    }

    // 不可变引用
    fn iter(&mut self) -> std::slice::Iter<T> {
        self.items.iter()
    }

    // 可变引用
    fn iter_mut(&mut self) -> std::slice::IterMut<T> {
        self.items.iter_mut()
    }

    fn into_iter(self) -> std::vec::IntoIter<T> {
        self.items.into_iter()
    }
}
fn main() {
    let mut my_stack = Stack::new();
    my_stack.push(1);
    my_stack.push(2);
    my_stack.push(3);

    for item in my_stack.iter() {
        println!("Item {}", item);
    }
    println!("{:?}", my_stack); // Stack { items: [1, 2, 3] }

    for item in my_stack.iter_mut() {
        *item *= 2;
    }
    println!("{:?}", my_stack); // Stack { items: [2, 4, 6] }

    for item in my_stack.into_iter() {
        println!("{}", item);
    }
    // println!("{:?}", my_stack);
}
```
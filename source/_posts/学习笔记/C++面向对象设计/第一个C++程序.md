---
title: 1. 面向对象的基本概念
date: 2023/11/29
category_bar: true
categories: 
- 学习笔记
- 面向对象设计C++
---

# 面向对象的基本概念

{% note info %}  
这是浙江大学翁恺老师的公开课，《面向对象设计C++》  
视频地址：  
https://www.bilibili.com/video/BV1yQ4y1A7ts/?spm_id_from=333.337.search-card.all.click&vd_source=3074f6f6ab43a114c5af8727fa4f7255

本节对应视频01-03部分。  

{% endnote %}

## 第一个C++程序：输出和输入
### 输出示例
```cpp
#include <iostream>
using namespace std;
int main()
{
    cont<<"Hello,World!I am"<<18<<"Today!"<<endl; // output
    return 0;
}
```
对第一个C++程序的分析：  
- 头文件中的`#include <isotream>`是引用内容，具体会在后面的课程中解释。但是根据C语言的学习，`#include<>`中引用的一定是一个文件，只不过文件的后缀名在此处没有给出。  
- 第二行：`using namespace std;`中`using`和`namespace`均为关键词，代表引用了名字空间“standard”，具体意思后面进行解释。  
- C++是C-like语言，所以主函数部分的结构和C语言类似，都是`int main() {  return 0;}`。  
  `cout`是standard output的缩写，代表标准输出。`<<`在C语言中是左移，在C++中仍然是左移，但是`<<`的左边是`cout`的时候可以理解为将后面的字符串向着`cout`进行输出。其余内容表示插入词。`endl`是end of the line 的缩写，表示输出的结束。  

{% note info %}  
实际操作过程中的提示：  
类似于Visio Studio，所有的集成开发环境，IDE需要创建project，程序所有的运行操作都是在project当中发生的。在project中代码需要先进行编译才能运行。  
{% endnote %}  

在Linux发行版终端中，可以用vim等等文本编辑器编写cpp文件，使用`g++ filename.cpp`运行写好的C++代码。 通过`ls -l`观察编译和输出文件，找到`*.out`文件后（比如一些环境中输出默认是`a.out`），直接使用`./a.out`输出结果。  

### 输入示例
```cpp
#include <iostream>
using namespace std;

int main()
{
  int number;

  count << "Enter a decimal number:";
  cin >> number;
  count << "the number you entered is" << number << "." << endl;

  return 0;
}
```
`cin`是C++中的标准输入函数，此处需要用右移`>>`将输入内容传给变量`number`。和C语言相同，使用变量之前需要声明变量的类型。  

## 面向对象的定义
面向对象(object-oriented)的含义是从对象出发来考虑问题，解决问题。对象，即实体。对象是可见也可以是不可见的，无论那种心态，对象一定是可以被记录、加工和处理的。在程序设计语言中，对象就一种变量。在程序设计中，变量用于储存数据，变量的类型决定了存放的数据类型。和变量一样，对象也具有类型。  
从另外一个角度看，对象是属性(attributes)和服务(services)的总和。对象可以由下图表示：  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231130201423.png width=50%>    

对象里面有数据，表示对象是什么样的，包括了对象的属性或者状态。数据可能有静态和动态之分。外面将数据“包裹”的，是对象可以对外提供的服务，是对象的功能(function)。向外提供的服务通过接口进行。无法直接访问数据，而是通过操作访问数据。——这是面向对象程序设计的基本原则。  
程序解决问题的过程可以看做是将问题空间到解决空间中的映射过程。程序则是描述这一映射过程的方法。在程序设计中，描述这样的映射过程的方式有两种：一种是向C语言一样，重在描述过程；而C++中，重在描述对象，重在描述问题空间中有什么对象，对象之间的关系是什么样的。  

{% note info %}  
一个形象的例子是，如果像C语言一样描述授课的过程，描述会按照时间顺序描述授课过程中事件发生的先后顺序进行描述。  
如果像C++一样描述授课的过程，则会首先定义一个教室，然后定义“教室中有老师和学生，老师进行授课，学生进行听课，老师和学生之间的关系是师生关系。”
{% endnote %}

在程序设计中，如果要用C语言描述一个点的坐标并且输出，程序如下：  
```C
typedef struct Point3d {
    float x;
    float y;
    float z;
} Point3d;

void Point3d_print(const Point3d* pd); // 设计一个函数打印出这个结构的变量，需要接受这个结构的一个变量指针作为输入
Point3d a; // 定义一个结构体a
a.x=1; a.y=2; a.z=3;
Point3d_print(&a); //用&取出a的地址后交给Point3d_print这个函数
```

在C++语言中，这样的任务程序为：  
```cpp
class Point3d { 
public:
   Point3d(float x, float y, float z);
   print();

private:
   float x;
   float y;
   float z;
};

Point3d a(1,2,3);
a.print();
```

`class`可以看做是c++中的`struct`（但是略有一些不同，后面会细讲），`public`中是对象`Point3d`所可以提供的服务，此处首先会将`Point3d`这一类对象的对外表示给写出来。它会提供`print()`这个服务。  
而这一类对象本身内部的数据（也就是`private`后的内容）是三个浮点型变量`x`，`y`，和`z`。（对象里面是可以存在其他对象的。）这部分数据无法直接进行访问。  
而后程序创建了一个类为`Point3d`的对象`a`，这个`a`中三个浮点数据分别为1,2,3。使用C++中`.`访问对象`a`可以提供的服务，虽然`a`中只有`print()`这一个服务。  
两种写法进行对比，C语言结构体中只存在数据，对结构体的操作是放在结构体之外进行的。  
对C++版本，操作是在类中描述的。  
类功能是C++最初版本的核心功能。  

总结，面向对象是一种用于组织设计和组织实现的方法。设计是解决问题的方法，和使用的程序语言无关，实现是用代码将解决问题的过程实现。面向对象的核心是对象，关注的是这个问题空间中有什么，不是数据流也不是操作。  

## 面向对象的基本概念
### 消息
对象之间的交互是通过消息(message)进行的。消息被发送者组成，被接收者解读，被方法执行。(Messages are composed by the sender, interpreted by the receiver, implemented by methods.)  
也就是说，消息内部包含的可执行信息（如何做，怎么做）是由接收者决定，而非发送方决定。对象对另一个对象的交互只能以外部的方式进行，对消息的执行方式是由接收者决定的。在程序中，消息的执行方式是由函数实现的。  
消息可能会让接收者改变状态，也可能返回一些结果（可以理解成对消息执行的直接反馈）。  

### 类
类/类型(class)在面向对象中指的是对象的种类，是囊括一类对象的概念，而并非是某种实体。类会对这一类中的所有对象的所具有的全部属性进行定义。  
类和对象的关系可以概括为： **类定义了对象，对象是某一类的实体**。  

### 面向对象的原则
- Everything is an object. 
  一切都是对象。  
- A program is a bunch of objects telling each other what to do by sending messages. 
  程序是一堆以发送消息的方式告诉其他人需要做什么的对象。  
  C++程序运行的过程中有相当多的对象在相互之间发送消息。这句话中需要强调的是“what to do”而非“how to do”，因为消息如何被接收者执行是由接收者自己决定的。  
- Each object has its own memory made up of other objects.  
  每个对象有自己的内存，内存中是其他的对象（是可分的，对象是由另一些对象组成的）。  
- Every object has a type.  
  每个对象都要有对应的类归属。对于面向对象来说，任何对象都应该是由类型定义出来的，不可能是先有对象后有类型。  
- All objects of a particular type can receive the same messages.  
  一个特定类型的所有对象都能接收同一个消息。  
  反过来说，所有能接收同一个消息的对象都是一个类型。  

### 接口
对象中对外提供的操作构成了访问对象内部数据的接口(interface)。对象都是以接口与外界进行沟通的。接口也同样定义了对象的类型，具有完全相同的一些接口的对象属于同一类型。  
接口的好处是，当设计的对象内容遵循接口时，对象的数据可以更换。具有相同接口的可以对象可以交流(communication)，同时接口保护了对象的结构，使得对象具有发生变化的可能；同时接口也保护了对象内部的数据，使其无法进行外部直接的访问。   

### 封装
封装(encapsulation)是指将数据和处理这些数据的方法捆绑在一个对象中，同时对外隐藏内部数据的细节和指令，外界只能访问到公开的部分。  
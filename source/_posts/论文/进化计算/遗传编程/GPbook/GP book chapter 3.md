---
title: 03. 控制器的自动综合
date: 2023/12/19
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
- 遗传编程 IV： 例程化的可比拟人类的机器智能
---

# 控制器的自动综合

{% note info %}  
这是对《Genetic Programming IV: Routine Human-Competitive Machine Intelligence》的笔记，本页对应第三章： Chapter 3： Automatic Synthesis of Controllers.   
这一章讲述了如何使用遗传编程完成控制器的自动设计。  
  
  
原书的免费公开版本在作者Koza本人的Research gate主页上：https://www.researchgate.net/publication/243776894_Genetic_Programming_IV_Routine_Human-Competitive_Machine_Intelligence  
这本书也可以在Springer 购买电子版： https://link.springer.com/book/10.1007/b137549  
或者在亚马逊英国购买纸质版：  https://www.amazon.co.uk/Genetic-Programming-IV-Human-Competitive-Intelligence/dp/0387250670  
{% endnote %}  

人类工程师进行设计的过程涉及到对各种考量的权衡，因此可以说设计的过程是需要使用到人类的智能的。这一章讲自动设计控制器(controller)作为例子讲述遗传编程在设计领域的应用，这一章包括了使用遗传编程设计如下的控制器：  
- 二阶滞后补偿器  
- 三阶滞后补偿器  
  - 带有时延的三阶滞后补偿器  
- 非最小相位系统  

## 控制器背景
### 控制器原理
使用控制器的目的是为了让系统原型(plant)、也就是控制器控制的目标系统的响应能够与一个设计者所期望的响应尽可能的匹配。此后作者举了一个控制车速的巡航控制器(cruise control device)的例子来说明控制器是如何工作来控制系统的。简单来说，控制器对系统的作用不是一蹴而就的，而是需要时间让整个系统不断调整自己的输出。在控制器控制系统原型的过程中，控制器需要通过监控系统原型的输出，并且比较和参考信号(reference signal)之间的误差(error signal)来调整原型系统的输入，从而让整个系统的输出你能够更加贴近参考信号。这样通过接收输出、改进输出、再将改进后的输出作为输入的控制方法称为反馈控制(feedback control)。如果反馈控制通过误差信号作为原型的下一次输入，那么这样的反馈控制称为负反馈控制(negative feedback control)。  
含有反馈的控制系统也称为闭环控制系统（closed-loop control system），输入与反馈信号比较后的差值（即误差信号）加给控制器，然后再调节受控对象的输出，从而形成闭环控制回路。所以，闭环系统又称为反馈控制系统，这种反馈称为负反馈。与开环系统相比，闭环系统具有突出的优点，包括精度高、动态性能好、抗干扰能力强等。它的缺点是结构比较复杂，价格比较贵，对维修人员要求较高。   
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20220301095016.png width=60%>  

{% note info %}  
更多关于控制论的内容请参考学习笔记中的控制系统课程。  
{% endnote %}  

现实世界当中大部分的控制器都是手动的（比如阀门、手动控制的开关等等），但是这本书中强调的控制器都是自动控制器，也就是自动根据反馈输入调整系统输出的控制器。  

### 控制器的设计指标  
在设计时需要考虑的控制器的特征非常多，下面列出了常见的一些控制器的设计指标，这些指标都和系统的阶跃响应有关(step response，指系统输入为单位阶跃信号时系统的时域输出变化)。  

- 上升时间和调节时间  
设计控制器的过程中最常见的考虑因素是让系统响应表现为理想响应的时间尽可能小。这一设计指标通常被诠释为上升时间$t_r$（rise time）或者是调节时间$t_s$(settling time)。  
上升时间是指定义为阶跃响应曲线从稳态值的10%第一次上升到90%所需的时间。  
调节时间是指阶跃响应达到并永远保持在一个允许误差范围(误差带：通常取±5%或±2%)内，所需的最短时间。  

- ITAE  
控制工程中喜欢使用参考信号和系统原型的响应之差的绝对值在时间上的积分(the integral of the time-weighted absolute error)来衡量控制器的性能。  
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
控制工程中喜欢使用参考信号和系统原型的响应之差的绝对值在时间上的积分(the integral of the time-weighted absolute error)来衡量控制器的性能。由于按照时间的加权中会对比较晚出现的误差有更大的惩罚、应用ITAE作为适应度有助于迅速减小误差。  

- 过冲率  
过冲率$M_p$(overshoot)是指的系统原型的响应超出参考信号的最大百分比。过冲会消耗大量能量，设计时需要尽可能的考虑减小过冲。  

- 鲁棒性  
在现实中还会出现干扰（disturbance）。这种干扰对系统的影响通常被建模为在系统原型输出端的加性噪声。鲁棒性可以表示为系统对于噪声的灵敏度，即系统输出对噪声的偏微分：   
  $$\frac{∂S_{output}}{∂N}$$  
  好的控制系统可以对噪声表现出高鲁棒性，也就是输出对噪声的灵敏度不高。  

- 稳定性  
稳定性(stability)是指系统随着输入信号微小变化的响应程度。如果整个系统的性能随着系统原型的微小变化而变化很大，那么这个系统可能毫无用处甚至会有危险。


这些设计指标在系统的阶跃响应图上表现如下：  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20220301212556.png width=80%>  

### 控制器的基本组成
一个控制器电路通常可能会用到如下的器件：  
放大器(gain)、积分器(integrator)、差分器(differentiator)、加法器(adder)、减法器(substractor)、超前补偿(laed)、滞后补偿(lag)、延时器(delay)、翻转器(invertor)、取绝对值(absolute)、限制器(limitor)、乘法器(multiplier)、分配器(divider)、开关(switch)。  

控制器的拓扑结构可以描述为：  
- 控制器内部用到的器件数
- 用到的器件类型
- 控制器内部器件的输入和输出的连接方式
- 控制器的外部输入和外部输出

### PID控制器
PID控制器是控制系统中最常用的控制器类型，它由基本的三个控制器：P控制器、I控制器、D控制器组成。  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231220105903.png width=60%>    

三个部分都对PID控制器整体的输出有对应的贡献。  
- P控制器(proportional controller)，又称为比例段，它的作用是将参考信号和原型系统的输出之间的误差直接反馈给系统。  
- I控制器(integral controller)，又被称为积分段，它的作用是使得控制器在稳态时候的误差更小。  
- D控制器(derivative controller)，又被称为微分段。由于比例段提供的误差补偿总是滞后的，利用这一点P控制器可以通过求误差信号的斜率来预测未来误差信号的变化情况。  

PID控制器的作用用PID控制器的发明者Callender和Stenvenson的说法是：  
“本发明的一个具体目的是提供一种系统，该系统将产生一种补偿效果，该补偿效果受与偏差的总范围、偏差率和给定期间内偏差的总和成比例的因素所支配。”   
> A specific object of the invention is to provide a system which will produce a compensating effect governed by factors proportional to the totoal extent of the deviation, the rate of the deviation, and the summation of the deviation during a given period.  

尽管PID控制器在现在的工业界应用非常广泛，但是对更好的控制器的需求从来没有停止过。在Astrom和Hagglund(1995)的论文中提到，只有20%的控制器工作的比较好。  

## 控制器的智能设计方法论
### 智能设计方法总述
对控制器的智能设计，或者说智能综合需要设同时计控制器的拓扑结构和相应的参数的值，来满足用户指定的高阶的设计需求。下面列出了一些常见的对设计需求的高阶表达：  
- 优化要求  
  比如最小化ITAE  
- 时域要求  
  比如最小化过冲、最大化抗噪性等等  
- 频域要求  
  比如系统带宽、随着噪声的衰减等等
- 稳定性要求  
- 鲁棒性要求  
- 对特定信号的值的限制  

用传统的设计方法（比如说状态空间设计、根据波特图的设计等等）很难同时满足上述几个设计要求的任意组合，因此需要使用到智能算法来进行优化。下面的几种启发式的方法可能可以解决这样的设计要求：  
- 爬山算法 (hill climbing)和基于梯度的算法(gradient methods)
- 模拟退火算法(simulated annealing)
- 进化计算(\*这本书写作之时还没有进化计算这个概念，原书中写的是evolutionary methods)  

上述的这些方法都是启发式学习的方法，这些方法的迭代操作都类似，高层级的语言表示如下：  
1. 从搜索空间中的一个或者几个点上开始搜索，衡量这一个或者几个点的表现  
2. 通过改变现有的搜索点的结构来创建新的备选点  
3. 衡量新的备选点的表现，并得到一个指标  
4. 用这个指标对备选点进行选择  
5. 重复上述操作

{% note info %}  
整个人工智能算法大致可以分为两类：启发式学习（又分为构造算法和改进算法，改进算法中包括了贪心算法和非贪心算法）和精确方法(比如专家系统、统计回归等等)。  
{% endnote %}  

不管是何种搜索算法，搜索行为的主要动力来源于对个体表现的衡量，用于衡量的函数以代价的形式（越低越好）或者以适应度的形式（越高越好）出现。并且通常新的个体是基于现有的个体产生的，下面将详述这几种算法的搜索行为。  

#### 爬山算法和基于梯度的算法
爬山算法开始于整个搜索空间的一个个体，对这个个体指定适应度后再创建新的个体，指定这个新的个体的适应度，然后通过适应度的衡量决定选择原来的个体还是新创建的个体。新个体的创建方式依照问题的不同而不同。  
梯度下降可以看做是使用梯度作为适应度衡量的爬山算法。  
爬山算法是一种点对点的贪心算法。在每一个循环中，爬山算法会无条件拒绝没有任何改进的个体，同时也会无条件接受具有改进的个体。(\*形象的形容为：猴子搬玉米)在单次尝试当中，爬山算法容易陷入局部最优。如果问题允许多次尝试，那么多次尝试可能会找到全局最优。但是每一次尝试都是独立的，新一次的搜索并不会继承原来的搜索(\*找不找得到全凭运气)。  
爬山算法的另一个问题是并行化，虽然有并行化的爬山算法，但是并行线程之间的工作是独立的，并没有信息交流。  
{% note info %}  
遗传算法并行化过程的信息交流参考[并行遗传算法](https://l61012345.top/2023/04/13/%E8%AE%BA%E6%96%87/%E8%BF%9B%E5%8C%96%E8%AE%A1%E7%AE%97/%E9%81%97%E4%BC%A0%E7%AE%97%E6%B3%95/%E5%B9%B6%E8%A1%8C%E9%81%97%E4%BC%A0%E7%AE%97%E6%B3%95/)  
{% endnote %}  

#### 模拟退火算法
模拟退火算法也是一种点对点的搜索算法。这种算法也使用了一种特定问题的修改操作来基于现有个体产生新的个体，但是与爬山算法和梯度下降算法不同的是，模拟退火算法中使用了Metropolis算法和玻尔兹曼算法来来决定是否保留那些没有任何改进的个体。  
此外，模拟退火运用了一个变量温度(temperature)$T$来控制算法的运行过程和收敛情况，$T$在运行过程中指数单调递减，并且影响Metropolis算法和玻尔兹曼算法对个体是否保留的抉择。在$T$很高的时候，算法更倾向于接收那些没有任何改进的个体，随着算法迭代次数的增加，$T$很低的时候，算法更倾向于拒绝那些没有任何改进的个体，以加快算法的收敛，但是为了保证全局性，算法也不会完全拒绝任何个体。  

#### 进化计算
进化计算的搜索方法并不是贪心的，而是一种全局的搜索方式。并且，进化计算的操纵对象是群，因此是一种群智能搜索方法，而非点对点的搜索方法。在运行过程中，进化计算会在一开始会产生大量的个体，但是在趋于收敛时只有一小部分的个体生成。  
遗传编程对于控制器的设计方法会在之后详述。  

### 使用遗传编程的自动控制器综合方法
这本书中的控制器设计方法包含对拓扑和器件参数两方面的设计，包括：  
- 建立一种可以被遗传编程逐步解读的个体表示的方法  
- 设计一种可以诠释高层级设计需求的适应度评估方法 

#### 遗传编程中树的进化方法
本书的作者想出了三种针对控制器设计用树形结构来表达个体的方法。  
- 第一种方法是每个个体代表一种指示构建的方法，也就是说个体并不直接操纵电路，而是将个体编写为操纵电路的指令或者程序，由翻译好的程序对电路进行搭建。在这种方法下，程序的不同部分的运行顺序需要有先后：ADF需要先运行，然后再运行主程序。  
- 第二种方法是首先考虑设计出一个基板电路(embryo，\*这里作者用了生物学的胚胎指代基板电路，那么个体的操作可以认为是对这个胚胎的发育过程，从而将胚胎发育成完全发育的结构)，这个基板电路上有一些可以被指令操纵的结点。遗传编程中的每个个体代表一种修改这个基板电路的方式。通过将程序树中的函数逐步应用于基板电路结构，从而将基板电路变成完整的可以实现功能的控制器电路。与第一种方法一样，程序中的函数按照指定的评估顺序分别执行。  
- 第三种方法是每一个树代表一种控制器电路的连接方式，函数节点为各种电路器件，从而直接将树转化为整个控制器电路。这种方法没有先后运行的顺序。  

本书在设计中用到的是第三种方法。如此，进化过程中个体会被直接翻译为控制器电路，然后带入仿真软件中运行，最后将仿真的特性作为个体的适应度。  

#### 基函数集、端点集和强类型
##### 基函数集
设计中用到的基函数及其功能如下表所示：   

| 器件 | 功能 | 数学表达 | 参数 |
|:-|:-|:-:|:-|
|`GAIN`|用一个常数放大时域信号|$Asin(ωt)$| 1. 常数 <br> 2.时域信号 |
|`INTEGRATOR`|时域上对一个信号进行积分<br>在频域上对信号乘$1/s$ | $\int Asin(ωt) ⇔\frac{1}{s}[S]_s$ | 1.时域信号 |
| `DIFFERENTIATOR` | 对时域信号作差分<br>为表示简便，在频域上对信号乘$s$ |$s[f]_s$ | 1.时域信号 |
| `ADD_SIGNAL` <br> `SUB_SIGNAL` <br> `MULT_SIGNAL` | 分别对应对信号的加减乘一个常数 |$f_1 [·] f_2$<br>$[·]∈\{+,-,×\}$| 1. 时域信号 <br> 2. 时域信号 |
| `ADD_3_SIGNAL` | 三个时域信号相加 | $f_1+f_2+f_3$ | 1. 时域信号 <br> 2. 时域信号 <br> 3.时域信号 |
| `DIFFERENTIAL_INPUT_INTEGRATOR` | 时域上对两个信号的误差积分 | $∫(f_1-f_2)dt$| 1. 时域信号 <br> 2. 时域信号 |
|`INVERTER`| 反转信号 | $-f$ | 1.时域信号 |
|`LEAD` | 频域上与$1+τs$相乘 | $(1+τs)[f]_S$ |1.时域信号 <br> 2.常数$τ$|
| `LAG` |频域上与$1/1+τs$相乘 | $\frac{1}{1+τs}[f]_S$ |1.时域信号 <br> 2.常数$τ$|
|`LAG2` |频域上与$ω_0^2/s^2+2ζω_0s+ω_0^2$相乘 | $\frac{ω_0^2}{s^2+2ζω_0s+ω_0^2}[f]_S$ |1.时域信号 <br> 2.常数$ω$<br>3.常数$ζ$|
|`ABS`|对时域信号取绝对值 |$\lvert f \rvert$ |1.时域信号 |
|`LIMITER` | 限制信号在某一区间 | $[f]_{capped}$ | 1.时域信号 <br> 2.下界 <br> 3.上界 |
|`DIV`|两个时域信号相除并限制 | $[\frac{f_1}{f_2}]_{capped}$ | 1.时域信号 <br> 2.时域信号 <br> 3下界 <br> 4.上界 |
|`DELAY`|对信号进行时延|$[f]_se^{-sT}$|1.时域信号 <br> 2.时延$T$|
|`IF_POSITIVE` |开关，运算结果为正时输出某个声明，反之输出另一个声明 | $\begin{cases} f_1, f_0>0 \\ f_2,f_0 ≤0\end{cases}$ |1. 时域信号 <br> 2. 时域信号 <br> 3.时域信号 |
|`+,-,×,÷`| 数值运算 | - | 1.常数<br>2.常数|

此外还有ADF。  

##### 端点集
端点集中包括了如下的端点：  

| 标识 | 意义 | 类型 |
|:-:|:-:|:-:|
|`REFERENCE_SIGNAL`|参考信号 | 信号 |
|`PLANT_OUTPUT`|系统原型的输出|信号|
|`CONTROLLER_OUTPUT`|控制器的输出信号|信号|
|`STATE_0`,`STATE_1`,...|系统的内部状态 | 信号|
|`CONSTANT_0`|恒定为0的信号，用于干扰遗传编程，展示用|信号|
|$\mathfrak{R}$|实数|实数|

##### 强类型
强类型是值和拓扑结构实现统一进化最关键的机制。每个个体表达的树中的函数集和端点集分类如下：  
- 信号处理函数
- ADF
- 表示时域信号的端点
- 用于表示算术子树的端点和函数（算术子树用于进行数值运算，在下面会详细解释）

#### 系统原型的表示
如果系统原型的结构是设计者可以了解到的，那么控制器的行为和特点可以通过仿真系统原型和控制器一并得到。如果原型结构无法被了解（\*黑盒），那么遗传编程可以根据原型的输入输出生成一个符合的系统原型，再与控制器一并仿真。  

#### 自动定义函数在设置控制器上的使用
在这个设计任务中，ADF不止可以通过重用函数来节省计算量，更重要的是ADF可以表示电路的两种结构：  
- 并联结构  
  ADF可以视作是打包好的字电路。由于重用，ADF函数的输出信号可以传递到不同的模块中，这就相当于是电路的并联。  
  <img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231220145437.png width=40%> 

  {% note info %}  
  如果不使用ADF的话，可以在函数集中添加一个表示并联的函数来实现并联。  
  {% endnote %}  

- 反馈结构  
  ADF的递归结构可以视为是将上一次ADF的输出又重新返回到ADF的输入中，这样的操作在电路中是一种内部反馈。  
  <img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231220151633.png width=40%>   

#### 调试器件参数的方法
如之前所说，对控制器的设计包括拓扑结构的设计和器件参数调试两方面。器件之间的拓扑结构可以通过树内部的端点和函数的连接来表示，但是在进化过程中演化器件拓扑结构的同时调整器件参数却并没有那么容易做到。这本书中介绍了三种进化过程中同时达成这两个目标的方法。需要注意的是，这三种方法都需要借助强类型实现。  

##### 算数子树
第一种方法是：使用一种专门进行算术演算的子树结构，书中称为算术子树(arithmetic-performing subtree)，这种子树结构包含多个数值运算的函数并以自然常数作为端点。  
具体而言，第一种方法下，端点上的数值从$[-5,5]$中选择，这个值在某个个体中被确定之后，在这个个体的运行过程中将不再发生变化。这个端点的值在运行过程当中使用非线性映射(NLM,none-linear mapping)转化，并在算数子树的运行过程中表达。  
对数形式的非线性映射可使相差几个数量级的常数得到有效进化。除非另有说明，本书中使用的非线性映射将-5到5之间的数值转换为超过 10 个数量级的数值。  
一个非线性映射函数的例子如下：  
$$NLM(x)=\begin{cases}
  10^0,\text{ if }x<-100\\
  10^{-\frac{100}{19}-\frac{1}{19}x},\text{ if }-100≤x<-5\\
  10^x,\text{ if }-5≤x≤5\\
  10^{\frac{100}{19}-\frac{1}{19}x},\text{ if }5<x≤100\\
  10^0,\text{ if }x>100\\
\end{cases}$$
从图像上可以看出，这个函数的作用是成倍放大-5到5之间的$x$的值。  
<img src=https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231220155339.png width=40%> 

{% note info %}  
此处使用非线性映射的原因个人认为是原本的搜索空间太过稀疏造成的。使用非线性映射可以让之前的搜索在一个较为均匀的搜索空间中进行，然后在放回到原来稀疏的空间中。  
{% endnote %}  

{% note info %}  
因此目前掌握的让搜索空间更加均匀的方式有三种：  
1. 从个体编码的设计上让各个信息在空间中均匀分布  
2. 使用排名
3. 使用映射函数
{% endnote %}  

<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223103455.png width=50%>   

使用第一种方法加上参数变换操作的控制参数设置如下：  

| 参数 | 值 |
|:-:|:-:|
|单后代交叉 | 86.5% |
|复制|10%|
|普通突变|1%|
|子程序复制|1%|
|子程序创建|1%|
|子程序删除|0.5%|

第一种方法被认为效率较低，原因是算树子树的交叉是一种近似于随机突变的操作。 

{% note info %}  
需要注意的是，使用算数子树虽然搜索的进程并不是直观的，但是从结构上仍然应当是在逐步逼近期望的值的结构。但是本书的作者认为这种方法下在搜索空间中每一次搜索的跳变太大了。  
但是究竟跳变有多大，并没有一个实际的度量。这种情况下一种个人觉得可行的方法是将每个节点看做变量对适应度函数求偏微分得到该处跳变的灵敏度。  
{% endnote %}  

##### 可扰数值
第二种方法是，子树中直接将可扰数值(perturbable numberical value)作为一个节点。所谓可扰数值是指该数值为从某个正态分布（书中方差为1，均值跟随进化）中的一个抽样。    
具体而言，在第0代中的数值端点都会随机地从$[-5,5]$中选择，然后在接下来迭代中这些值会被施加按照以该值为均值，方差为1的一个正态分布中所抽样的一个值替代。在表达时同样使用非线性映射。此后这种方法使用了一种特殊的突变方式，称为高斯突变(Gaussian mutation)。在整个搜索过程中，这个些端点的值的变化并不会非常大。

<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223105202.png width=50%>  

{% note info %}  
使用可扰数值的原因个人认为是为了控制突变造成的影响。  
{% endnote %}

使用第二种方法的控制参数设置如下：  

| 参数 | 值 |
|:-:|:-:|
|对可扰数值的高斯突变 | 20% |
|对除了可扰数值外的子树内部节点的单后代交叉| 48.5% |
|对除了可扰数值外的端点的单后代交叉 | 9% |
|对可扰数值的单后代交叉| 9% |
|复制|10%|
|普通突变|1%|
|子程序复制|1%|
|子程序创建|1%|
|子程序删除|0.5%|


第二种方法的好处是可以进行普通的交叉操作，即插入一个可扰动的数值来代替选定的其他可扰动的数值。  

##### 算术子树和可扰数值作为端点
第三种方法是算术子树中的端点都为可扰数值，这种方法综合了前两种方法，提供了一种“中等等级”的突变造成的影响。在这种情况下，树形结构可以提供一定的突变能力，同时可扰数值限制了交叉时对个体的扰动不会过大。而且第三种方法允许自由变量加入，也因此允许引入自动定义函数机制。  

<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223124901.png width=50%>  

{% note info %}  
除了这三种方法外，还有GEP-GA混合架构的应用，参考[^1]。大致是使用GEP或者GP先找到拓扑结构，然后对每个个体代表的拓扑结构使用GA找到器件的数值，然后再返回到GEP或者GP的个体中统一衡量。  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223123903.png width=50%>  
这种方法是目前的一种权宜之计，即先把拓扑结构的空间确定，再确定值的空间。但是GA的应用无法保证每个拓扑结构中器件的值的信息分布是均匀的，因此效果有限。以原教旨主义的观点，仍然是GEP/GP中值随着进化过程一同进行才能得出最佳的搜索结果。  

{% endnote %}

[^1]:J. Wan, H. Yin, K. Liu, C. Zhu, X. Guan and J. Yao, "A Hybrid Genetic Expression Programming and Genetic Algorithm (GEP-GA) of Auto-Modeling Electrical Equivalent Circuit for Particle Structure Measurement With Electrochemical Impedance Spectroscopy (EIS)," in IEEE Sensors Journal, vol. 23, no. 5, pp. 4344-4351, 1 March1, 2023, doi: 10.1109/JSEN.2021.3106160. 

#### 控制器的表示方法
{% note info %}  
这一小节中讲了使用传递函数、LISP语言、程序树、Mathematica语言、连接清单、SPICE 网表表示控制器电路的方法。   
这里的笔记中只介绍后面会用到的表示方法。  
{% endnote %}

##### LISP语言和程序树
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223133342.png width=80%>    

在LISP语言中一个PID控制器的例子表示上图的控制器和原型电路：  
```LISP
( PROGN
  ( DEFUN ADF0 ()
    ( VALUES
      (- REFERENCE_SIGNAL PLANT_OUTPUT))) ;表示并联区域信号的输入和输出
    ( VALUES
      ( +
        (GAIN 214.0 ADF0) ;P控制器
        (INTEGRATOR (GAIN 1000.0 ADF0 )) ;I控制器
        (DERIVATIVE (GAIN 15.5 ADF0 )))) ;D控制器
)
```

{% note warning %}  
此处书中有一个印刷错误，程序的第8行应该是`INTEGRATOR`，第9行应该是`DERIVATIVE`，此处已经纠正过来了。  
{% endnote %}

LISP语言采用的S-expression方法可以和程序树互转，因此上面的程序也可以表示为：  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223133047.png width=80%>    

##### 连接清单
连接清单(connection list)是一个记录电路元件之间连接关系的列表，包括元件的名称、引脚号、连接方式等信息。在电路仿真中，连接清单可以帮助用户更好地理解电路的结构和工作原理，方便用户进行电路的设计和调试。  
连接清单基本结构是一行一个器件：每一行的开头为器件的输入节点，最后一个节点编号对应输出节点。然后紧随器件模块的名称和对应的声明。  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223152000.png width=80%>  
比如对于上面的电路，连接清单表示如下：  

```SPICE
#输入   输出 模块
508 596 512 SUBTRACT
#输入输出 模块 声明
512 538 GAIN 214.0
512 548 GAIN 1000.0
548 568 INTEGRATOR
512 558 GAIN 15.5
558 578 DERIVATIVE
538 568 578 590 ADDITION
590 626 LIMITER 40.0 40.0
626 636 LAG 1.0
636 596 LAG 1.0
```

##### SPICE网表
在这个设计例子中，每一个个体最终都会被翻译为SPICE网表(SPICE netlist)然后进入SPICE仿真。SPICE网表的命令包括如下几个成分：  
- 电路器件的命名
- 需要仿真的电路的网表
- 让SPICE进行何种仿真的指令
- 子电路定义
- `END`结束符

但是原始的SPICE仿真软件中的器件库太少，因此还需要自己对一些器件的功能和结构进行定义。  
<img src = https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20231223152000.png width=80%>  
下面的SPICE指令用于构建上图的电路并且进行仿真。  

```ltspice-symbol
.PID CONTROLLER, TWO-LAG PLANT, AND ITAE CALCULATOR
*
* THE PID CONTROLLER
* THE OUTPUT OF CONTROLLER (CONTROL VARIABLE) IS AT 590
* THE REFERENCE SIGNAL IS AT 508
* THE PLANT OUTPUT (FEEDBACK TO CONTROLLER) IS AT 596
X1 508 596 512 SUBV_SUBCKT * V(512)=V(508)-V(596)
B2 538 0   V=V(512)*214.0  * V=V(512)-GND
B3 548 0   V=V(512)*1000.0
X4 548 0   568 DII_SUBCKT  * X表示这一行用到了Subcircuit
B5 558 0   V=V(512)*15.5
X6 558 578 DIFFB_SUBCKT
X7 538 568 578 590 ADD3_SUBCKT
*
* THE TWO-LAG PLANT
* THE PLANT INPUT IS AT 590
* THE PLANT OUTPUT (FEEDBACK TO CONTROLLER) IS AT 594
X8 590 626 622 624 LIMIT_SUBCKT
X9 626 632 636 LAG_SUBCKT
X10 636 642 594 LAG_SUBCKT
V11 622 0 DC 40 * V表示供电，下同
V12 624 0 DC 40
V13 632 0 DC 1.0 * 这是LAG的供电
V14 642 0 DC 1.0
*
* 没有积分器的器件，需要自己写一个，下同
* CALCULATION OF INTEGRAL OF TIME-WEIGHTED ABSOLUTE ERROR (ITAE)
X15 508 594 508 7 ITAE_SUBCKT
* 表示V(508) - V(594)的时域积分，V(508)是参考信号，V(594)是原型输出
*
* 产生的参考信号的描述
* REFERENCE SIGNAL 508
VP16 508 0 PULSE(0.0 1 0.1 0.001 0.001 10 15) 
* 参考信号是一个持续15秒，脉宽为10秒，上升沿下降沿各0.001秒，间隔0.1秒的方波脉冲信号
*
* SPICE的仿真和画图
* COMMANDS TO SPICE FOR TRANSIENT ANALYSIS AND PLOT
.TRAN 0.08 9.6 0.0 0.04 UIC
* 以0-9.6秒，每0.08一个step进行时域分析
.PLOT TRAN V(7)
* 画出V(7)的时域图
*
* SUBCIRCUIT DEFINITION FOR SUBV
.SUBCKT SUBV 1 2 3 * 有三个输入输出端口
B1 3 0  V=V(1)–V(2) * B表示一个理想电压/电流源，VCC=3V，VDD=0V
.ENDS SUBV * 定义结束
* SUBCIRCUIT DEFINITION FOR TWO-ARGUMENT ADDV
.SUBCKT ADDV 1 2 3
B1 3 0 V=V(1)+V(2)
.ENDS ADDV
*
* SUBCIRCUIT DEFINITION FOR THREE-ARGUMENT ADD3
.SUBCKT ADD3 1 2 3 4
B1 4 0 V=V(1)+V(2)+V(3)
.ENDS ADD3
*
* SUBCIRCUIT DEFINITION FOR INVERTER
.SUBCKT INVERTER_SUBCKT 1 2
B1 2 0 V= V(1)
.ENDS INVERTER_SUBCKT
*
* SUBCIRCUIT DEFINITION FOR MULV
.SUBCKT MULV 1 2 3
B1 3 0 V=V(1)*V(2)
.ENDS MULV
*
* SUBCIRCUIT DEFINITION FOR DIVV
.SUBCKT DIVV 1 2 3
B1 3 0 V=V(1)/V(2)
.ENDS DIVV
*
* SUBCIRCUIT DEFINITION FOR ABSV
.SUBCKT ABSV 1 2
B1 2 0 V=ABS(V(1))
.ENDS ABSV
*
* SUBCIRCUIT DEFINITION FOR DIFFB (DERIVATIVE)
.SUBCKT DIFFB_SUBCKT 1 2
G1 4 0 1 0 1.0 * G表示VCCS
L1 4 0 1.0     * L表示电感
B1 2 0 V= V(4) * B表示电压源
.ENDS DIFFB_SUBCKT
*
* SUBCIRCUIT DEFINITION FOR DII
.SUBCKT DII_SUBCKT 1 2 3
G1 4 0 1 2 1.0
R1 4 0 1000MEG
C1 4 0 1.0 IC=0V
X1 4 3 INVERTER_SUBCKT
.ENDS DII_SUBCKT
*
* SUBCIRCUIT DEFINITION FOR LAG
.SUBCKT LAG_SUBCKT 1 2 3
X1 1 3 4 DII_SUBCKT
X2 4 5 3 MULV
X3 6 2 5 DIVV
V1 6 0 DC 1.0
.ENDS LAG_SUBCKT
*
* SUBCIRCUIT DEFINITION FOR LEAD
.SUBCKT LEAD_SUBCKT 1 2 3
X1 1 4 DIFFB_SUBCKT
X2 2 4 5 MULV
X3 1 5 3 ADDV
.ENDS LEAD_SUBCKT
*
.SUBCKT LAG2_SUBCKT 1 2 3 4
X1 1 4 5 DII_SUBCKT
B2 6 0 
+ V=0.5*V(5)*V(2)/V(3)
X3 6 7 4 LAG_SUBCKT
B1 7 0 V=1/(2*V(2)*V(5))
.ENDS LAG2_SUBCKT
*
* SUBCIRCUIT DEFINITION FOR LIMIT
.SUBCKT LIMIT_SUBCKT 1 2 3 4
B1 2 0
+ V=URAMP(V(1)–V(4))+V(4)-URAMP(V(1)–V(3))
.ENDS LIMIT_SUBCKT
*
* MODEL FOR SSW
.MODEL SSW SW()
*
* SUBCIRCUIT DEFINITION FOR ITAE
.SUBCKT ITAE_SUBCKT 31 32 34 33
VOSPCT 3 0 DC 0.02V
VOSPEN 11 0 DC 10V
X1 6 34 4 DIVV
V2 10 0 DC 1.0 
X3 9 12 7 MULV
S4 11 9 4 3 SSW
S5 14 13 31 0 SSW
V6 14 0 DC 1.0
X7 15 34 33 DIVV
X8 7 18 17 MULV
X9 6 12 ABSV
X10 32 31 6 SUBV
X11 13 0 18 DII_SUBCKT
X12 17 0 15 DII_SUBCKT
R13 9 10 1K
R14 0 13 1K
R15 0 33 1K
.ENDS ITAE_SUBCKT
*
* END COMMAND FOR SPICE INPUT FILE
.END
```

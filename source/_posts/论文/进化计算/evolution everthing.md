---
title: 从进化计算到万物进化
date: 2023/10/20
category_bar: true
categories: 
- 研究
- 进化计算
---

# 从进化计算到万物进化 
进化计算(EC, Evolutionary Computation)[^1]包括了进化编程(evolutionary programming),进化策略(evolution strategies)， 遗传算法(genetic algorithm)和之后的遗传编程(genetic programming)。  这一计算分支最早出现于90年代，在过去20年中被统称为进化计算。它们被广泛地用于建模、优化和设计等计算任务。许多研究已经证明进化计算在知识挖掘领域(knowledge discrovery)具有强大的性能，例如对各种物理系统生成的动作追踪数据使用进化计算进行建模挖掘。随着自动化技术的发展，进化计算将从生物层面到软件实现，再到未来与自动化技术结合在物理系统层面上的实现。这篇综述主要简单介绍人工进化和自然进化的区别，然后讨论一些进化计算的应用领域并讨论现在的研究趋势，最后对未来的研究提出展望。   
[^1]: Agoston E., Jim Smith., From evolutionary computation to the evolution of things, *Nature*, 2015.  

## 进化计算理论的讨论
### 设计思路和适用性
对一个特定的目标问题，进化计算的设计分为三步：  

-  确定用于描述问题的解的数据结构
-  确定一种方式用于定义一个解的对解决问题的满足程度  
-  确定一种合适的选择和突变（或者说“变化”，也就是遗传操作）方式  

对于自然界进化的模拟，目前的进化计算达到了两个层面：在高级层面（指对原问题的描述, original problem context）上，需要对表现型(phenotype，指问题对应的备选解的表示)进行评估衡量。选择机制用于从每一代的亲本池中选择并决定哪一些亲本会被用于产生后代到下一代中。在低层面上，基因型作为表现型的客体(objectives)用于将表现型浓缩为便于遗传操作的数据结构，或者说表现形式。其中突变随机作用于一个亲本并改变这个亲本中的某些值，重组用于通过结合两个亲本的值产生后代。最后，一个对整个进化的控制器(execution manager)用于控制整体的进化过程。控制器控制了初代种群的生成方式，以及算法的终止条件。  
进化计算可以很容易地将对一个问题的应用迁移到另一个问题上，这是因为整个进化计算过程中只有两个要素是因目标问题而异的：其一是适应度函数，另一个是基因型到表现型的映射方式。过去的进化计算表明：在数据结构合适的前提下，若干非常简单的数据结构可以描述相当多的不同问题的解。也就是说，有可能相对少数的基因型可以容纳下非常多的表现型。对于一个特定的问题而言，只要依问题不同而变的表现型可以被设计映射到通用的基因型上，对这个问题的进化计算就可以被很容易的设计出来。作者认为，这是进化计算的适应性(suitability)。  
需要注意的是，进化计算的适应性只是说它可以在特定问题的解的空间里面找到合适的解，但是并未保证搜索过程的效率。  

### 人工进化和自然进化
从历史的角度来看，人类对自然进化的影响范围非常有限，只能够干扰自然进化的选择和繁殖过程。而对于自然进化的其他部分，例如设计基因型或者是特定的突变和重组机制，改变这些部分远远超出了人类的能力范围。随着计算机的发明，这种情况发生了改变，因为计算机提供了创造数字世界的可能性，而数字世界非常灵活，比我们生活的物理现实更容易控制。再加上人们对进化背后的遗传机制有了更多的了解，这就提供了使人类能够成为掌握进化过程、成为进化的主人的机会，而这些进化过程完全是由人类实验者在顶层进行设计和执行的。  
也许学界会质疑进化计算并非是自然进化的完全模拟（下表列出了自然进化和进化计算的不同之处），但是进化计算的的确确是一种进化。
> 这个观点由哲学家丹尼尔·丹尼特(Daniel Clement Dennett)的自由进化论思想佐证。“如果拥有变异、继承和选择，那么一定会得到进化。”(If you have variation, heredity, and selection, you must get evolution. )  

|| 自然进化 | 进化计算 |
|:-:|:-|:-|
|适应度 | 观察者看到的、选择和繁殖的**后验**结果 | 选择和繁殖的**先前**驱动力 |
| 选择 | 基于环境条件、种内竞争和种间竞争的多因素作用的结果。生存能力（幸存者的选择过程）是持续测试的，可繁殖性（亲本的选择过程）是在间断的时间中被测试的 | 随机的遗传算子作用于依照适应度选择后的结果。幸存者的种群和亲本的种群是在同一间断的时间内完成的。|
| 基因型和表现型的映射 | 受环境影响的发展过程，在生物学上具有高复杂度 | 基本上就是简单的数学变换和参数匹配过程，只有一小部分算法可以做到基因型和表现型的映射|
| 变异 | 单性繁殖和两性繁殖创造后代，横向基因(同一代的)转移可以积累更多个体的基因 | 不受限制的纵向基因转移。后代可以从任意数量的亲本中产生 |
| 过程 | 并行的、去中心化的过程。出生和死亡并非同步进行 | 通常是中心化的过程，且出生（下一代的产生）和死亡（上一代的消去）是同时进行的 |
| 种群 | 种群是结构化的（具有地理分布特征）。种群数量会跟随出生和死亡的相对数发生改变。种群可能会灭绝 | 种群是非结构化的（不存在空间分布和空间产生的生殖隔离）。所有的个体都是潜在的伴侣。种群数量通过同步出生和死亡的时间保持恒定。|

从计算机科学的角度来看，进化计算遵循“生成-测试”法则(generate-and-test princple)：产生足够多的后代使得搜索到达搜索空间中未遍历的点，然后使用适应度函数测试找到的点。在计算机科学中，进化计算比其他的算法独特的点在于以种群的形式在内存中保存备选解。  

### 描述进化计算的三个维度
作者使用了完成度(completness)、最优性(optimality)、效率(efficiency)三个维度来描述进化计算。  

- 完成度  
完成度指算法是否可以生成所有的可能解。进化计算可以通过设置合适的个体表达和遗传算子来实现高完成度。  
- 最优性和效率  
  最优性指算法是否可以保证找到最优解。只要遗传原则（相似的个体具有相似的适应性）成立，进化算法的基本本能会展示出来——随着时间的推移，当前种群的适应度会增加。因为选择算子总会倾向于选择更适合繁殖和生存的个体。因此，如果能根据要解决的问题来设计适应度函数，那么进化算法总会倾向于找到具有最佳适应度（或者接近最佳适应度）的解。这就意味着进化计算可以解决任何优化问题，或者可以等效为优化问题的问题。不过需要注意的是，进化计算并不是寻找最优解的优化器，而是不断逼近最优解的近似器，因为人们并不知道进化计算的最优化结果是否是实际上的最优解。  

## 进化计算的应用领域
进化计算在非常多的领域被应用，用于解决设计和优化问题，如文章中提到的例子下表所示：  

| 领域 | 案例 |
|:-:|:-:|
| 航空航天设计 | 设计NASA ST5航空器的X-band 天线|
| 生物信息 | 通过挖掘ChEML数据库设计药物的化学结构 |
| 对其他算法的优化 | 神经进化算法 |


这一部分提到的一些重点总结如下:  

- 在多目标和高复杂度的搜索空间中，进化计算被证明是非常有效的解决手段。进化计算可以一次性生成帕累托前沿中的多种trade-off的解。  
- 数值和组合表达的优化是进化计算的重要应用领域。比如对于黑盒问题，传统的数值分析和基于梯度的优化方式只能够通过采样解来不断接近最优化。如果问题的复杂度本身比较简单，也就是评估的总次数较少，那么数值分析的性能将会优于进化计算。但是如果问题所需要的计算量预估比较大，那么结果则是相反的。  
- 进化策略适用于那些仅有少数个体可供评估的优化任务。  
- 进化计算被证明在贪心算法和局部搜索算法的优化中有效。用其他进化计算设计其他算法的方法比用经验手工设置要有效得多。  
- 许多混合的算法被证明相比于单纯的使用进化算法在解的搜索上更有效。  

除此之外，作者还提到用进化计算设计物理实体，比如机械控制器或者机器人是另外一个值的深究的应用领域。这一领域被称作进化控制(Evolutionary Robotics)。相比于其他应用领域，进化控制还需要额外面对两个问题： 第一个是原数据的噪声更多，相关性更低。同时，进化除了需要设计基因型和表现型的映射之外，还需要给定表现型到机械动作的映射。新增加的这一步映射看似好像把机械动作看做了表现型，但是有些学者也认为这是基因型，因为机械动作需要组合放在机器实体中进行衡量。如果使用传统方式设计自适应和连续的控制器是相当困难的，但是进化计算让自适应和连续控制器的通用设计方法成为了可能。
一些实验已经可以证明使用进化计算进行控制器设计的有效性：最初机器人可能会展现出毫无关联的动作，但是几百代之后机器人的行为已经非常有效[^2]。  

[^2]: Floreano,D & Keller, L. Evolution of adaptive behaviour in robots by means of Darwinian selection, 2010.  


## 进化计算的特点
### 进化计算的优点

- 不需要先验知识  
  进化计算的算法是无假设的(assumption free)， 因为应用进化算法只需指定备选解的表示方法，并提供一个外部函数用于衡量备选解的有效程度。另一个角度来讲，进化计算自身的设计不需要对问题有任何的假设。  
- 灵活  
  进化计算的灵活度相当高，它可以和相当多的既有算法混合。尤其是当进化计算和某些局部搜索算法结合时，性能表现会更好，因为这两者采用的搜索策略是不一样的。  
- 鲁棒性高  
  进化计算采用的选择和变异的机制保证了进化计算的全局搜索性，比起其他算法更不容易落入局部最优解当中。  
- 无需预训练  
  因为进化计算每一次进化中并不专注于某个特定解，而是一个种群，因此算法的操作者并不需要通过提前预设权重的方式（也就是预训练）来表示偏好。相反地，可以有偏向性地在最后的种群中筛选出特定的解。  

### 没有免费午餐理论在进化计算上的体现
数学分析可以揭示某些特性，但即使是数字进化过程也表现出非常复杂的动态性，只能形成有限的理论，尽管从定量遗传学到统计物理学都有各种不同的工具和方法。其中的一个重要的理论产物是没有免费午餐理论。  
进化计算并不是通用的超级求解器（虽然其他方法也不是，这世界上就不存在通用超级求解器），但是用进化计算求解问题永远是问题解决的第二备选方案。换句话讲，对特定的问题而言，精心设计的求解器一定可以找到这个问题的最优解并且完美的解决问题，但是可能要花成百上千年的时间设计这样的求解器。进化计算领域一个重要的问题是算法收敛性，早期的研究包括了使用马尔科夫链描述进化过程等等。  

## 研究趋势

- 自动设计和调整进化计算  
- 使用替代模型(surrogate model)  
  有时进化计算为了找到最优解所消耗的时间和计算量太大了，因此学界尝试找到进化计算的替代模型。  
- 个体表达设计  
  基因型到表现型的映射目前还是单纯的翻译，学界尝试设计一些个体的表达放大表现型的复杂度，使其可以更精确的描述系统的行为。  


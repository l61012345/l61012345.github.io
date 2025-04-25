---
title: 遗传编程中的模块化
date: 2024/04/28
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
---

# 遗传编程中的模块化




在遗传编程（GP）中，与个体有意义的片段的保存和遗传有关的研究被称为模块性 [^1].  在系统工程方面，GP 中的模块性研究可以帮助识别可能描述子系统行为的子树，并评估它们对主要输出和系统行为的贡献和敏感性。此外，对模块性的研究还可以为我们提供从简单系统开发复杂系统的方法[^2]。 迄今为止，该领域的研究可按封装实体分为三层，即宏(macro)、函数(function)和块(block)。宏对程序函数进行操作，允许将函数作为参数输入。块是从种群间的树中抽象出来的子实体。  
  
![Image 1](https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240428154053.png)
![Image 2](https://cdn.jsdelivr.net/gh/l61012345/Pic/img/20240428154121.png)


## 函数层的模块化
许多研究都侧重于函数层的模块化。在这些研究中，子树，或者说，函数是需要封装和保护的目标。对函数层模块化的研究源于对 GP 模块化的最初研究，即 Koza 的自动定义函数（ADF）[^3]。 Koza 在他的书中提到，GP 中的自动定义函数可以保护个体的有用部分，并通过重复使用遗传物质来减少冗余，就像程序编码中的子程序或函数一样。后来，他用分层结构改进了 ADF [^4]以及由类型保护遗传操作提供的 ADF 进化机制 [^4].到目前为止，基于 Koza 对 ADF 的研究，模块化的研究主要集中在改进 ADF 的机制，使其能够在种群中有效地识别或进化出更多有益的部分，同时防止缺乏多样性。这一层的研究主要是为了解决三个难题：识别有用的函数、防止低多样性和处理类型冲突。   
关于如何找到有益的子树，一些工作如 AAO 中的子程序创建和模块获取（MA）中的压缩操作[^5]。 [^5]使用随机封装，并将识别任务交给演化过程。要封装的子树是随机选择的。例如，在 Koza 的 ADF 改进版中，进化过程中的类型保护遗传操作与选择相结合，用于搜索函数中更有用的部分。 另一方面，其他关于模块化的研究都认为，需要封装对解决方案贡献最大的有益子实体，以保护这些部分免受遗传操作的破坏性影响，同时通过重复使用它们来降低复杂性。例如，GLiB [^6]使用子程序在群体/个体中被调用的次数/频率来评估子树的贡献；Co-ADF [^7]和 EDF [^8] [^9]提出了根据每个函数可能解决的适应度案例数来包含局部适应度的方法，以直接评估子树。 [^10]在统计特征方面，[^10] 尝试应用相关性和灵敏度等统计特征来表示段的贡献。但事实证明，这两种特征并不有效。 
群体多样性是 GP 模块化研究的另一个研究课题，它指的是搜索空间中被搜索个体的分布程度。多样性越高，说明搜索范围越广，搜索到全局最优的几率越大。问题是，多样性和模块化之间需要权衡：多样性能使 GP 避免过早收敛和局部最优，但会增加 GP 的复杂性；模块化用于降低问题的复杂性和保护有用的片段，但过强的保护效果会导致 GP 多样性降低和陷入局部最优。有几种方法认为，只有当群体缺乏多样性时，才需要对子树进行封装。基于这一观点，有几项研究集中于种群多样性的监控技术。首先，它是通过监测种群本身的特征来实现的：例如，在最初的自适应表征学习（ARL）中使用的种群熵[^11]。 该方法使用信息熵来表示种群的多样性。其次，可以通过进化过程中的一些指标来监控多样性，如 MaxFit[^10]：如果个体的最大适应度在几代内没有变化，则引入一个新模块。EDF [^9]中也采用了类似的机制：当所有EDF的唤醒次数较低时，就会引入一个新模块。   
类型冲突通常发生在将封装的子树作为类型化系统中的函数插入到个体中时：即上层函数请求的类型与下层终端或函数的返回类型不匹配。在 [^3]中，Koza 将约束类型作为 GP 的高级函数引入了演化过程。在这里，函数集中的所有主函数和 ADF 都有分离的终端集，其中包含类型正确的终端。虽然这种方法解决了类型冲突问题，但一些文献批评说，约束类型不仅增加了处理不同数据类型的难度，而且还增加了计算的难度。 [^12]而且还引入了更多的先验知识来为不同的函数设计不同的终端集，这与 Koza 自己的想法相矛盾 [^13].因此，Montana 设计了强类型遗传编程（STGP）。 [^12]其中所有元素（终端和函数）都有各自的类型。在演化过程中，将执行通过查找链接表实现的类型检查程序。此外，STGP 还引入了通用函数和通用类型。遗传函数可以对多种类型而不是特定类型进行操作。泛型类型不是数据类型，而是泛型函数支持的可能数据类型的集合。在树生成过程中，泛型被视为数据类型，但在评估过程中，由于实例化的原因，泛型被视为具体值。使用泛型的目的是消除基因运算中可能存在的非法性，同时减少对先验知识的依赖和可能存在的先验偏差（避免因指定数据类型而产生偏差）。PolyGP [^14] [^15]借鉴了 STGP 中参数多态性的思想，对其进行了进一步扩展，并使用罗宾逊统一算法（Robinson's Unification Algorithm）改善了 STGP 中创建个体时造成的链表结构问题，使其符合类型合法性。PolyGP 最大的变化是将 Koza 标准遗传算法中的个体表示法从 LISP 语言的 S 表达式迁移到 Lambda 微积分，并根据新表示法中 Currying 个体的结构将交叉迁移到新表示法中。这些改变使 GP 能够学习程序的结构，而不受变量和变量类型的限制。  

## 区块层的模块化
进化计算中的 块 通常是指构件的概念，这一定义源自模式理论[^15]。 遗传算法（GA）中的定义。在遗传算法（GA）中，积木指的是低阶、短小和高契合度的模式，被命名为模式 [^15].构件可被视为基因片段，有助于寻找理想的解决方案。 [^16].这一层工作的制约因素是如何识别和提取构件。Building Block Program（BBP） [^17]利用数学上可分离的 [^18]找到可加/可乘的部分，并将个体划分为称为building blocks的子函数，然后将它们重新组合为所需的个体。 [^18]从迁移学习中汲取了灵感。在他们的研究中，两个已经解决的与目标问题类似的 GP 任务中的最佳个体被进行比较，然后子树上的共同片段将被提取出来作为building blocks，然后封装成通用函数转移到目标领域。Zahra 等人 [^19]得到了一种类似的提取构建块的方法，但比较和提取是在单个问题的抽样模式中进行的。此外 [^19]在评估中使用了从具有相似行为的优秀个体中提取的语义构件。这些构件将作为一个聚类来呈现一个语义模式，并使用实例化函数来描述语义构件在每个语义模式中的分布。之后、 [^20]应用这种方法提取了语义图式，语义图式中的个体将获得更高的进化机会，并产生新的后代。同时 [^20]对基于出现频率的遗传算子进行了修改，以平衡搜索程序的范围和深度。  

## 宏层的模块化
宏指的是函数的操作。宏指令通过控制参数的评估，可以简化循环和条件选择的执行。Spector [^21] 将 ADF 机制转换为宏，旨在减少重复执行函数的复杂性，而对结构只做少量修改。由于宏会延长评估个体的执行时间，因此这方面的研究关注较少。PolyGP 中使用的高阶函数也是一种宏，它只被视为零参数函数 [^22].  

## 总结
GP 中的模块化研究为系统建模和优化提供了新的视角。在函数层，模块化可以通过 分而治之 的思想来研究和解释系统的内部行为。同时，多态性方法可以为不同的子系统提取目标子模型，这些子系统可能行为相似，但工作在不同的领域。例如，在抽象柴油发动机如何驱动设备时，可以从抽象柴油发动机中学习电气发动机的描述。在模块层，解决方案被分解成更小的部分，这就为我们提供了一个机会，利用迁移学习等技术在不同子系统之间迁移相似部分的描述。宏层模块化研究可提供更简单的方法来操作函数和调整系统间的关系。  

[^1]:G. Gerules and C. Janikow, A survey of modularity in genetic programming, in 2016 IEEE Congress on Evolutionary Computation (CEC), 24-29 July 2016 2016, pp. 5034-5043, 

[^2]:A. K. Saini and L. Spector, Modularity metrics for genetic programming, presented at the Proceedings of the Genetic and Evolutionary Computation Conference Companion, Prague, Czech Republic, 2019. 

[^3]:J. R. Koza, D. Andre, F. H. Bennett, and M. A. Keane, Genetic Programming III: Darwinian Invention & Problem Solving. Morgan Kaufmann Publishers Inc., 1999.

[^4]:J. Koza, F. Bennett Iii, D. Andre, and M. Keane, Reuse, Parameterized Reuse, and Hierarchical Reuse of Substructures in Evolving Electrical Circuits Using Genetic Programming, 1996, 

[^5]:J. R. Koza, Evolving the Architecture of a Multi-part Program in Genetic Programming Using Architecture-Altering Operations, in Evolutionary Programming, 1995. 

[^6]:P. J. Angeline and J. B. Pollack, The Evolutionary Induction of Subroutines, 1997. 

[^7]:M. Ahluwalia and T. C. Fogarty, Co-evolving hierarchical programs using genetic programming, presented at the Proceedings of the 1st annual conference on genetic programming, Stanford, California, 1996.

[^8]:M. Ahluwalia and L. Bull, Co-evolving Functions in Genetic Programming: Dynamic ADF Creation Using GLiB, in Evolutionary Programming, 1998. 

[^9]:M. Ahluwalia and L. Bull, Coevolving functions in genetic programming, Journal of Systems Architecture, vol. 47, no. 7, pp. 573-585, 2001, 

[^10]:A. Dessi, A. Giani, and A. Starita, An Analysis of Automatic Subroutine Discovery in Genetic Programming, in Annual Conference on Genetic and Evolutionary Computation, 1999. 

[^11]:J. Rosca, Hierarchical Learning with Procedural Abstraction Mechanisms,  1997.

[^12]:D. J. Montana, Strongly Typed Genetic Programming, Evolutionary Computation, vol. 3, no. 2, pp. 199-230, 1995, 

[^13]:J. Koza, M. Keane, M. Streeter, W. Mydlowec, J. Yu, and G. Lanza, Genetic Programming IV: Routine Human-Competitive Machine Intelligence, 2003, 

[^14]:J. H. Holland, Adaptation in natural and artificial systems: an introductory analysis with applications to biology, control, and artificial intelligence, 1st MIT Press ed. (no. Book, Whole). London;Cambridge, Mass;: MIT Press (in English), 1992.

[^15]:D. E. Goldberg, Genetic Algorithms in Search Optimization and Machine Learning, 1988. 

[^16]:D. O. Neill, H. Al-Sahaf, B. Xue, and M. Zhang, Common subtrees in related problems: A novel transfer learning approach for genetic programming, in 2017 IEEE Congress on Evolutionary Computation (CEC), 5-8 June 2017 2017, pp. 1287-1294, 

[^17]:C. Chen, C. Luo, and Z. Jiang, Block building programming for symbolic regression, Neurocomputing, vol. 275, pp. 1973-1980, 2018, 

[^18]:C. Luo, C. Chen, and Z. Jiang, A divide and conquer method for symbolic regression, ArXiv, vol. abs/1705.08061, 2017.

[^19]:Z. Zojaji and M. M. Ebadzadeh, Semantic schema modeling for genetic programming using clustering of building blocks, Applied Intelligence, vol. 48, pp. 1442-1460, 2018.

[^20]:Z. Zojaji, M. M. Ebadzadeh, and H. Nasiri, Semantic schema based genetic programming for symbolic regression, Applied Soft Computing, vol. 122, p. 108825, 2022, 

[^21]:L. Spector and D. Macros, Evolving Control Structures with Automatically, 1995. 

[^22]:T. Yu and C. D. Clack, PolyGP: a polymorphic genetic programming system in Haskell, 1997. 


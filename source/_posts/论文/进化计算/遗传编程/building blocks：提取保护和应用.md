---
title: GP模块化的再讨论——Building Blocks：探测、提取、应用
date: 2024/12/18
category_bar: true
categories: 
- 研究
- 进化计算
- 遗传编程
---


# GP模块化的再讨论——Building Blocks：探测、提取、应用

Building Blocks的两种搜索方法是模块化和迁移：模块化的目的是为了将进化过程中进化过程自己产生的可能有用的遗传碎块给保护起来。研究迁移学习的目的是从别的什么地方将building blocks转移到当前的任务上。无论是哪一种研究，核心是将自己或者是其他任务中可能存在的这个任务中的building blocks给识别和保护起来，并且通过某种方法重新加入到现在的进化过程中，以引导进化过程重视对识别到的building blocks的区域的搜索。由于Building blocks是“关于最终解信息的一部分”[^Zojaji, Z., Ebadzadeh, M. Semantic ,2018]，因此重视Building blocks区域的搜索可以直接引导GP搜索含有最终解信息的区域（这个过程中带有对最终解精度的可接受的损失），加速GP的搜索进程。

化用Prototype Probability Tree (PPT)[^M. A. Ardeh, Y. Mei and M. Zhang, 2020]一篇中对于知识迁移的描述，关于Building blocks的研究中的关键问题可以分成三个：Building Blocks的表示,  提取和应用。 和[^M. A. Ardeh, Y. Mei and M. Zhang, 2020]一篇不同的是，在Knowledge Presentation在技术上的表示表现为Knowledge Detection：找到合适的Building blocks的表示的过程就是一种对于building blocks的探测。因此这篇评论将使用Building blocks的探测而不是表示一词。

### 什么是Building blocks

#### Schema  

Schema是一种搜索空间中子空间的划分方式。可以依据各种各样的分类标准将个体归纳为子空间。对于Schema的归纳方式可以分为按照语义和按照语构进行划分。目前大部分对于schema的定义都是基于语构的，也就是拓扑结构相似的一组子树。这也是最早的对GP中schema的定义。这样定义的原因是，交叉和突变都完全基于语构进行，采用语义的schema无法清楚的描述交叉产生的后代和亲本之间的关系[^O’Reilly, Una-May and Franz Oppacher,1994]。[^Z. Zojaji et al,2022] 中采用了一种强制限定语义值的方式才能勉强实现在保证亲本和后代关系的前提下对语义进行归纳。  

#### Building Blocks  

 [^O’Reilly, Una-May and Franz Oppacher,1994]中对GP的Building Blocks的认知基本上照搬GA：“building blocks是低阶、受扰乱程度低、并且可以存活数代的schema”。Poli则认为Building Blocks是交叉过程中两个亲本必须各自持有、才能在后代中产生某个更高阶的Schema[^R. Poli et al,2004]。[^Zojaji, Z., Ebadzadeh, M. Semantic ,2018]中认为Building Blocks是对应语义值出现频率高的子树。前两者都是基于语构定义的building blocks，最后一个则是基于语义的Building blocks。不管对于Building Blocks具体的定义为何，GP中对Building Blocks存在两点共识：  

- Building Blocks是比Schema粒度更细的进化单元，它既是Schema又是其他的高阶Schema的一部分。  
- Building Blocks上携带了Schema/个体的遗传信息。这些遗传信息有利于子种群进化。  



### Building blocks的探测

当Building blocks的定义是一种大多数关于Modularity的研究也认为Building blocks应该是某种抽象的/或者是具象的子树或者是子树的合集。探测building blocks也就是如何判断某些子树具有设计者所期望的building blocks所具有的特征。[^Dessi, Antonello et al, 1999]中已经介绍了一部分探测building blocks的方法，这里对其评论进行补充。对于Building blocks的探测，这里大概可以分成几种： 

- 利用自身在进化中的表现

  一个子树在进化中最直接的表现就是fitness，但是一般而言，子树的fitness和整体fitness之间的关系需要进行界定。最简单的方式认为，如果这个个体的表现很好，那么有概率可以从表现好的个体中提取到有用的信息，比如[^T. T. Huong Dinh, T. H. Chu and Q. U. Nguyen,2015]中的*Best Gen*和*FullTree*，但是GP的schema具有高方差的特性[^O’Reilly, Una-May and Franz Oppacher,1994]，整体的fitness不能够反映局部的表现[^Kinnear,1994]，个体中到底哪一个子树对于个体起到了至关重要的贡献迄今没有一个明确的结论和探测方法。为了确保个体中的携带了对目标有用的遗传信息的子树被提取，后续的[^Brandon Muller, Harith Al-Sahaf, Bing Xue, and Mengjie Zhang,2019]甚至提取了源问题域中表现好的个体中的所有的子树，这种方法需要划分提取所有的子树。在种群中个体表示非常复杂的情况之下，这种方法的开销非常大。
  
  另一种更好的方法是采用局部的fitness来衡量：即采用另一种设计的evaluation方法来衡量子树的表现，比如Adaptive Representation(AR)[^Justinian Rosca, 1997]中采用的fit block方法：每个building blocks用和全局一样的fitness function，但是只衡量一部分数据集。局部fitness的研究围绕着如何设计局部评估的方式，包括：使用降维的fitness function或者是降维的数据集[^Justinian Rosca, 1997]、利用先验知识区分子问题和全局问题之间的评估 [^]、以及co-ADF/EDF中每个子树解决的fitness cases的个数等等，这些研究试图寻找子问题和全局问题之间的关系，并依赖这种关系设计出局部评估的方式。对于降维的方法，某个问题的最优解可以从同一问题中规模较小的完整解中建立的假设受到质疑，而另一种方法则由于专业知识的需要而无法做到domain dependent[^Dessi, Antonello et al, 1999]。
  
  除了使用fitness作为提取子树的标准之外，频率是一种building blocks贡献程度的间接体现方式。以子树在种群中的出现频率作为探测building blocks的依据是Holland提出的Schema Theory[^John. Holland, 1992]：如果一个schema是有用的，那么其采样率下界会在数代之内呈指数上升，也就是在进化过程中的出现频率升高。这种方法的问题在于，如果在进化的过程中根据频率提取building blocks，对于当前代数而言frequency是一个局部的指标：倘若在进化过程还没有稳定的情况下，完全有可能后续突然出现的新的building blocks其迅速地占据生态位，当前的进化过程无法感知到这种情况是否会在未来发生。这可能是对[^Justinian Rosca, 1997]观察到的进化过程中期frequency高的building blocks很少可以出现在最后一代的个体中的现象的一个解释。在迁移学习中这种问题可以通过迁移源问题最后一代的解来缓解这种局部性[^M. A. Ardeh, Y. Mei and M. Zhang,2019]，这种方法的可行性应当建立在源问题的最终解和目标问题的最终解具有结构上的相似度的基础上。Frequency的另一个问题是，由于高frequency的schema在现在的种群中占有主要的生态位，倘若使用了不当的植入building blocks到种群中的方法使得进化丧失了进一步挖掘潜在更好个体的能力（比如过度地创建个体来替代原来种群），这种方法会容易使进化陷入局部最优解。不过一些基于frequency的延伸参数仍然可以帮助引导进化，比如[^Anil Kumar Saini and Lee Spector,2019]中提出的Reuse和Repetition在有限的实验中说明在可能是一种有效的引导进化以更加模块化的方式进行的方法。
  
  另外一种可能可行的方法是以植入building blocks之后的个体行为变化来判断其是否有用，比如知识驱动合成[^He, Yifan,2023]中使用的用植入前后个体fitness有无改进来判断知识是否有用的方法，或者是hGP中比较某个module存在和不存在时候的个体fitness差异[^Banscherus, Dirk et al,2001]。与之类似的是Adaptive Representation Learning(ARL)[^Justinian Rosca, 1997]中使用的DiffFitness：观察交叉后子代和亲本之间的fitness的改进来确定潜在的提取building blocks的个体，这种方法其实观察的是隐性基因在交叉后转变成显性基因的程度。另一种利用交叉来识别building blocks的方式是由于building blocks具有稳定性，因此[^O’Reilly, Una-May and Franz Oppacher,1994]认为数代交叉之后还能够保持不变的子树部分为building blocks.

- 统计学方法

  许多研究利用子树的统计特征来识别哪些子树可能是潜在的building blocks。这个领域中的许多研究潜在的表明，数据的分布才是反映子树和目标之间的强相关的特征。因此，若干的研究都是计算的子树产生的数据和数据集中的真实数据之间的统计量，比如相关性、灵敏度[^Dessi, Antonello et al, 1999]和互信息[^Zojaji, Z., Ebadzadeh, M. Semantic ,2018]。这种方法的合理性在于个体可能携带不同的关于最终解的数据分布重合的部分（或者说相关性强的部分）有可能拼凑出最终的数据分布。相比于frequency，由于真实数据分布和全局解具有非常强的关系，这种方法的全局性更高，因此在很多场景下这些方法的效果都比探测frequency更好。使用统计学方法存在的问题是，无论是相关性还是互信息，这些都是对于个体的高层次描述，这些描述因为完全忽略了个体的结构而变得过度抽象。这样的描述使得我们无法得知两个同时具有高统计特征量的building blocks它们对目标信息的覆盖情况：在有用信息分布不均匀的情况下，或许有个子树的互信息很高，但是其并没有覆盖到关键信息；又或者我们无从得知是两个高互信息的子树对目标信息的覆盖其实是完全相同或者是完全不同。一个building blocks$f_i$和已经选择到的building blocks的集合$S$、以及真实输出数据($C$)的条件互信息$I(f_i;C|S)$虽然可以从理论上进一步的探测building blocks提供信息的冗余，但是根据理论推演无论是直接计算三项互信息还是利用二项互信息进行近似，其所需要的计算量都是巨大的[^Vergara, J.R., Estévez, P.A.,2014]。

- 先验知识

  上面的想法都是利用启发式的方法自行搜索和提取可能的building blocks，人类预知的先验知识也可以作为一种building blocks被利用，如果我们知道某个系统的一部分子系统的表达，那么将这部分子系统以building blocks的方式进行植入或许也是一种可行的方案，一个早期的尝试是[^Tackett, Walter Alden,1993]中直接利用设计好的一些features的组合来演化提取图像特征的程序。先验知识的一种具象化的表现是指人类提前知道目标解中的一部分的结构，比如知道主系统中某个子系统的表示。如果将这部分视为一个schema，根据building blocks hypothesis，如果满足如下的几个条件：1) size较小 2)恰当的评估手段（子系统对主系统的贡献是可分辨的）下，携带这部分schema的个体始终保持较高的fitness，因此可以有较大概率存活并且在种群中快速扩散。然而先验知识构建出的子系统很有可能长度非常长，在这种情况下，如果选择使用定义函数（类ADF的方式）将整个子系统浓缩成一个节点，其受到交叉和突变被扰乱的概率为0，条件1)即可被满足。那么再来看条件2)，但是GP具有高方差的特性，携带schema的个体的fitness分布过于广泛，因此即便是携带和目标最相关的那部分信息，其个体表现也有可能不好，因此也有可能提前消散。前述将先验知识的部分打包为函数的方法也可以缓解这种问题，但根本上对这个schema的评估问题仍然没有解决。
  
  另一个问题是先验知识也有可能并非完全正确，解决这个问题的方法是：1）设定评估指标来衡量和选择使用哪些先验知识[^He, Yifan,2023]，2）采用适应的方法通过进化对先验知识进行微调，比如koza在ADF-GP中提出的一系列architecture altering operation（AAO）结构变换方法[^Koza, John R. and Andre, David. 1995]，或者是植入种群成为个体的一部分，具体的方式还会在“Building blocks的应用”一章中介绍。
  
  
## Building blocks的提取

前文所属的大部分Building blocks的提取方法都是直接提取的子树。对于另一些building blocks的方法而言，识别到building blocks之后还需要对其进行泛化。泛化可以理解为是对遗传信息的进一步纯化和浓缩。泛化的方法一般是采用一些更高维度的表述语言来描述building blocks的结构特征。那么泛化结果，即浓缩的知识中必然带有对building blocks上携带的不同信息类型的注意力分配，也就是强调个体上的某一部分信息，象征性忽略结构上的另一部分信息：比如提取中层子树的时候往往需要将实际参数变成形式参数就是一种非常基本的泛化，只关注某一个部分的具体结构而不关注输入变量的具体值。 再比如PPT建立了节点的概率分布[^M. A. Ardeh, Y. Mei and M. Zhang, 2020]：对于个体树上的每个节点和端点集中的每个primitives，这个节点的位置上有多少概率是某个primitive，这个定义中将具体树节点的意义进行了泛化，而强调种群中节点的整体分布。不过这个泛化方法存在诸多问题：比如它忽略了节点之间存在的相互作用，以及当种群缺乏diversity时，PPT其实已经和某个具体的个体没有太大的区别，由于GP天生的节点固化性质[^Whiate David Robert et al, 2019]，这种情况下引入实例化的PPT可能因为过分强调在种群中固化的节点反而为加重局部收敛。另一种可能可行的方法是化用各种Schema Theory当中对于buidling blocks的去参数化方法，比如[^R. Poli et al,2004]中的upper building blocks和lower building blocks的定义，upper building blocks的下端参数被“=”通配符化为形式参数、lower building blocks用"\*"和“=”将上端函数的形态结构进行了固定。可以发现，虽然两种不同的building blocks都共同含有位置和表现两种信息，但是lower building blocks更强调子树和整个个体中的相对位置（因为GP中改变了植入子树的位置之后子树的行为表现会发生巨大变化），upper building blocks则更强调表现（因为个体上端对树的影响更大）。引入这两种building blocks可能会适度缓解子树迁移之后的context-dependent的问题。



## Building blocks的应用

Building blocks的应用是指提取到的building blocks如何去抽象地还原到种群当中。目前较多的三种方法是作为函数集中的一部分引入、实例化个体、作为突变时随机生成子树时可用的函数/或者是直接植入。这些方法在引入的时候需要考虑：1）对原有问题搜索空间的影响，2）对当前搜索进程的影响。

- 实例化的个体

  实例化个体是将子树添加一些其他的部分成为个体（或者是用子树替换掉随机生成的个体的一部分）。对这种方法而言，进一步的可以按照时机来细分。一种是在进化的最开头生成初始个体的时候就强制让一部分个体携带子树，称为initial population biasing[^D. O'Neill, H. Al-Sahaf, B. Xue and M. Zhang,2017]。这种方法的好处是，如果将搜索空间定义为"size-frequency-fitness"构成的空间[^Langdon, W.B., Poli, R.,2002]，那么这种引入的方法并不会更改搜索空间中解的分布，而是在一开始让搜索的注意力放在某些包含目标building blocks的高维空间当中。这种方法的缺点也在于限制了初始搜索的随机性，有一些通过随机初始化可能可以探索到的子空间因为刻意地引导导致进化可能需要相当多的精力才能找到、或者永远也找不到，使用者无法知道这些无法探测到的子空间对于最终解的搜索是否重要。并且[^M. A. Ardeh, Y. Mei and M. Zhang,2019]认为由于这种方法只修改了初始种群，完全不关心后续的搜索，因此无法对进化做到持续的改进，因此初始种群中具有的优势极有可能在后续的进化中丧失。这篇论文的依据是提取出来的building blocks没有一个出现在最后种群中，问题的原因有可能有三个方面:1）进化本身就会适应地修改迁移的结构、2）fitness function无法正确识别building blocks的价值、3）提取的子树本来就并不是真正的building blocks。

  采用initial population biasing的方法有[^T. T. Huong Dinh, T. H. Chu and Q. U. Nguyen,2015],[^M. A. Ardeh, Y. Mei and M. Zhang,2019]等等。

  另一种方法则是在进化过程中（比如在进化中探测到Loss Diverisity[^Justinian Rosca, 1997]）将一部分表现差的个体替换为实例化的个体。这种方法类似于精英主义。和精英主义一样，这种方法破坏了表现差的个体中可能含有的隐性基因，牺牲了算法全局性。和精英主义不同的是，实例化个体除了目标子树以外的部分很多时候是通过随机生成的，也就是说搜索进度上很有可能落后于现有的种群而并非领先，因此其促进收敛速度的效果可能不如使用最佳个体替换的精英主义。进一步的来说，相比于精英主义，击毁后部分重建随机重建对全局性的牺牲更小，但是收敛速度也会减慢。Semantic Buidling blocks GP (SBGP) [^Zahra et al., 2022]在缺少diverisity时引入实例化的个体，但是原有种群中的个体和实例化后的个体由于采用的genetic operator的类型不同而分别进化，实例化的个体参与锦标赛选择，以选择的方式概率性替换种群中表现得差的个体，这种方法比前述更加温和。（虽然SBGP更大的贡献在于从“基因型”（语义）的角度上进行了进化）

- 作为函数

  另一种方式是将building blocks作为函数添加到function set中，这种方法相当于将building blocks作为更高阶的Primitives来使用。那么有一个问题是”如何保证进化过程一定会使用这些节点？“如果将GA式的Schema thoery[^O’Reilly, Una-May and Franz Oppacher,1994]中的schema的节点数量退回到1，那么答案是总体上进化会倾向于信息密度（‘fitness’/size）高的节点进行进化。因为根据building blocks hypothesis，fitness越高的单个节点其在进化过程中的扩散速度和采样率将会越来越高。但是如同[^O’Reilly, Una-May and Franz Oppacher,1994]所说，GA式的schema thoery的问题在于schema下的个体的fitness 方差太高，换言之并不能根据fitness识别到底哪些schema对于进化是有用的。所以如前“先验知识”一小节所述，当满足fitness function是schema对个体的贡献是可分辨的时候，上述结论是成立的。那么在当下无法设计这种贡献的角度下，适当的（保证不大面积损毁遗传信息的前提下）结合其他的植入方法强制让函数节点在进化中扩散或许是一个方法。  另有批评作为函数虽然表面上简化了结构（这很重要，因为size减少了），但是计算量并没有得到简化[^M. A. Ardeh, Y. Mei and M. Zhang,2019]。

  有关作为函数引入的另一个需要探究的地方是这种机制对搜索空间的影响，[^Justinian Rosca, 1997]中对koza的ADF机制对搜索空间的影响做了一些研究，结论是ADF可以拉长搜索空间的分布（引入ADF可以增加在size较小的时候某些子空间被采样到的概率），但是不会改变搜索空间的分布特性。作为函数植入的building blocks相当于有定向起点、不再/可以有进化的ADF，在这种情况下对于搜索空间的影响仍待研究。

- 突变

  突变是指提取到的子树作为突变所生成子树的端点集，或者直接将某个个体的某个节点下的子树替换为提取到的building blocks。比如[^He, Yifan,2023]的知识驱动合成中所使用的ARM则是随机选择PushGP中的一段，然后用提取到的知识进行替换。这样的问题在于GP上下文的结构导致我们无法得知被替换丢失的内容对于进化的价值，以及随机插入的building blocks对于进化的价值。如果将提取到的子树作为突变所生成子树的端点集，则不太能保证移植的个体数量可否满足进化的最低的可以留存的量。




## Open Problem

### Building blocks 为何物

迄今为止学界就Building blocks是否以有效的方式存在，或者说building blocks的存在形式仍然有争议。大部分关于Building blocks的定义都认为Building blocks应当携带两类信息：Building blocks内部的拓扑结构和其在个体中的位置。  

- Building Blocks的拓扑结构由内部有意义的部分确定，这部分的拓扑不允许修改，这部分确定了Building blocks自身的语义；  

- Building blocks在个体当中的哪个位置则由通配符来提供。Building blocks当中的通配符部分描述了Building blocks和树当中的其他部分的相对位置关系。这其中关于Building blocks的定义又分为两种：building blocks的根节点为通配符和非通配符的定义。  

  - 当building blocks的根节点是通配符时，building blocks在个体中的位置并没有被固定下来，它可以连接一个树的任何一个部分 [^O’Reilly, Una-May and Franz Oppacher,1994]。事实上， [^O’Reilly, Una-May and Franz Oppacher,1994]认为的building blocks完全和相对位置无关，其对building blocks的定义是语法树和其需要出现一个个体当中必须的出现次数。  
    这种定义的根据是认为GP的搜索动力学特性与GA的搜索动力学特性相似：第一阶段找到Building blocks，第二阶段通过Crossover将building blocks整合到高阶的schema中，第三阶段将高阶的Schema扩散到整个种群中 [^Forrest S. and M. Mitchell, 1992] 。在这个过程中，在前两个阶段crossover的作用都只是把building blocks凑齐，这个过程并没有考虑位置关系。  
    这样定义的问题是，由于搜索中语义和语构的非统一，Fitness Function对个体的语构非常敏感，因此凑齐了building blocks的高阶Schema中的个体未必具有高fitness可以让这个schema扩散到种群当中。（很有可能在很短的数代之内就已经消散了）。  
  - 当building blocks的根节点不是通配符时，代表着building blocks描绘了一整个个体和building blocks之间的相对位置关系，比如[^R. Poli et al,2004]中提出的Hyper schema和[^Whiate David Robert et al, 2019]当中的结点schema。 


因此本身building blocks的有效存在就不确定的前提下，识别、提取和应用building blocks的理论根基出现动摇，因此很难去说识别到的东西是不是就是building blocks，即真正对进化有用的遗传信息的结构载体。那么对于理论共识的部分，如上面的介绍所说，building blocks应该同时携带结构和位置两类信息，但是现在基于直接子树迁移的方法基本上都忽略了位置信息，即building blocks相对于整个个体的位置，因此哪怕识别到的就是真的building blocks，由于在植入的时候缺乏位置信息（当然，这个部分可以通过植入方式中含有的随机性进行补正），移植进入个体的子树到底还是不是移植前的子树这个问题无法得到回答。



### 搜索进程干预和Schema Theory

任何的提取和应用方式都应当遵循Holland提出的Schema Theory[^John. Holland, 1992]，才能够从理论上说明这些building blocks在种群中具有快速扩散的能力。换言之，手动干预，比如替换最差个体和初始种群引导搜索等等，这些改变搜索途径的方式对于GP的适应过程的影响超出了schema thoery的解释范畴，由于适应过程本身的随机性（Koza认为是模拟的人类的非逻辑化的灵光一闪[^John. R Koza, 1992]），这些篡改搜索过程的方法对于进化过程/适应过程的影响难以解释。那么对于前述的应用方法，剩下的只有加入函数集和并行实例化没有人工干预搜索过程。下表中列出了笔者认为的一些building blocks的应用方式符合/超过schema thoery的解释范畴的具体理由。

| 方法                                   | 标记 | 理由                                                         |
| -------------------------------------- | ---- | ------------------------------------------------------------ |
| 强制替换最差个体                       | 超过 | 损失了搜索过程中潜在的隐性基因（当前代中没有表现出来优秀，但是后续会表现出优秀的片段） |
| 初始种群偏置                           | 超过 | 人为缩小了初始搜索的范围                                     |
| ARM[^He, Yifan,2023]                   | 超过 | 损害了原始突变具有的全局性                                   |
| 加入突变生成子树的函数集               | 符合 | 没有干预原本的搜索过程，只是扩大了原始突变的全局性，让原始突变可以在允许的size limit下搜索到更广的子空间 |
| 加入初始函数集                         | 符合 | 没有干预原本的搜索过程，只是改变了对问题基本表述的定义       |
| 并行的实例化种群<br />后加入轮盘赌选择 | 符合 | GP本身的原种群进化没有受到干预，只是额外的增加了搜索的通道   |

但是，具体问题具体分析，超过schema解释范围的方法也不一定性能就差，反之亦是如此。超过解释范围的方法大多数通过干预简化了适应过程，因此很有可能可以进一步加速搜索，但是搜索速度的加快和相对应地牺牲的准确度是否值得，还需要具体问题具体分析。



### 语义空间和语构空间的混乱映射、表现型和基因型

GP中Building blocks的移植存在语境关联的问题，同一个building blocks在不同的个体中的表现非常不一致。如前所述，提取到和移植后的building blocks究竟还是否是同一个“building blocks”？这样的问题是因为在GP中同一个schema实例化得到的个体的fitness差距非常大。GP的个体结构和个体行为之间的映射是混乱的，既不是一对一的，也不是均匀的。如果我们把个体的表面结构视为表现型，个体的行为视为基因型。在基因型和表现型完全分离的条件下，对基因型做building blocks的保护，再实例化为表现型进行应用才可以回答上面的这个问题。

那么，如何将基因型和表现型进行一对一地统一？前人的不少工作是重新设计GP的结构，让GP的结构以GA一样的线性方式出现，比如linear GP，PushGP等等，这些重新设计的GP可以简化语义和语构空间的映射，但是笔者认为并没有完全分离表现型和基因型。

如果返回到基因型的定义上来，基因型应当是个体含有的所有的遗传物质的总和。更深层次地，真正影响个体行为的那些结构可以被视为基因型。因此，[^Justinian Rosca, 1997]认为如果把进化中的一个个体结构视为表现型，基因型应当是个体的最简化。[^Zojaji, Z., Ebadzadeh, M. Semantic ,2018]认为基因型应当是一个个体含有的若干互信息值的片段。对building blocks的提取和实例化应当建立在基因型之上而非对表现型进行提取，这样的工作才可以从理论上（而非实验证明）说明是有效的。





[^M. A. Ardeh, Y. Mei and M. Zhang, 2020]: M. A. Ardeh, Y. Mei and M. Zhang, "Genetic Programming Hyper-Heuristics with Probabilistic Prototype Tree Knowledge Transfer for Uncertain Capacitated Arc Routing Problems," 2020 IEEE Congress on Evolutionary Computation (CEC), Glasgow, UK, 2020, pp. 1-8
[^Zojaji, Z., Ebadzadeh, M. Semantic ,2018]: Zojaji, Z., Ebadzadeh, M. Semantic schema modeling for genetic programming using clustering of building blocks. *Appl Intell* **48**, 1442–1460 (2018).
[^Vergara, J.R., Estévez, P.A.,2014]: Vergara, J.R., Estévez, P.A. A review of feature selection methods based on mutual information. *Neural Comput & Applic* **24**, 175–186 (2014).
[^T. T. Huong Dinh, T. H. Chu and Q. U. Nguyen,2015]: T. T. Huong Dinh, T. H. Chu and Q. U. Nguyen, "Transfer learning in genetic programming," *2015 IEEE Congress on Evolutionary Computation (CEC)*, Sendai, Japan, 2015
[^Brandon Muller, Harith Al-Sahaf, Bing Xue, and Mengjie Zhang,2019]: Brandon Muller, Harith Al-Sahaf, Bing Xue, and Mengjie Zhang. 2019. Transfer learning: a building block selection mechanism in genetic programming for symbolic regression. In Proceedings of the Genetic and Evolutionary Computation Conference Companion (GECCO '19).
[^O’Reilly, Una-May and Franz Oppacher,1994]: O’Reilly, Una-May and Franz Oppacher. “The Troubling Aspects of a Building Block Hypothesis for Genetic Programming.” *Foundations of Genetic Algorithms* (1994).
[^John. Holland, 1992]: John. Holland, Adaptation in Natural and Artificial Systems, MIT Press, 1992
[^Dessi, Antonello et al, 1999]:  Dessi, Antonello et al. “An Analysis of Automatic Subroutine Discovery in Genetic Programming.” *Annual Conference on Genetic and Evolutionary Computation* (1999).
[^M. A. Ardeh, Y. Mei and M. Zhang,2019]: M. A. Ardeh, Y. Mei and M. Zhang, "Transfer Learning in Genetic Programming Hyper-heuristic for Solving Uncertain Capacitated Arc Routing Problem," *2019 IEEE Congress on Evolutionary Computation (CEC)*, Wellington, New Zealand, 2019
[^Justinian Rosca, 1997]: J. Rosca, Hierarchical Learning with Procedural Abstraction Mechanisms, 1997.
[^R. Poli et al,2004]:R. Poli et al. Exact Schema Theory and Markov Chain Models for Genetic Programming with Homologous Crossover, 2004.  
[^Z. Zojaji et al,2022]: Z. Zojaji et al, Semantic Schema based genentic programming for symbolic regression, 2022.
[^Whiate David Robert et al, 2019]: Whiate David Robert et al., Modeling Genetic Programming as a Simple Sampling Algorithm, 2019.
[^Forrest S. and M. Mitchell, 1992]: Forrest S. and M. Mitchell, Relative Building-Block Fitness and the Building Block Hypothesis, 1992.
[^He, Yifan,2023]: He, Yifan. (2023). Adaptive Transfer of Genetic Knowledge in Evolutionary Optimization and Program Synthesis. 10.13140/RG.2.2.20098.86724.
[^Banscherus, Dirk et al,2001]: Banscherus, Dirk et al. “Hierarchical Genetic Programming using Local Modules.” (2001).
[^Kinnear,1994]: Kinnear K E, Advances in Genetic Programming, MIT Press, 1994.
[^Tackett, Walter Alden,1993]: Tackett, Walter Alden. “Genetic Programming for Feature Discovery and Image Discrimination.” *International Conference on Genetic Algorithms* (1993).
[^Anil Kumar Saini and Lee Spector,2019]: Anil Kumar Saini and Lee Spector. 2019. Modularity metrics for genetic programming. In Proceedings of the Genetic and Evolutionary Computation Conference Companion (GECCO '19)
[^Koza, John R. and Andre, David. 1995]: Koza, John R. and Andre, David. 1995. Evolution of both the architecture and the sequence of work-performing steps of a computer program using genetic programming with architecture-altering operations. In Siegel, Eric (editor). *Proceedings of AAAI-95 Fall Symposium Series - Genetic Programming*. Menlo Park, CA: AAAI Press.
[^Langdon, W.B., Poli, R.,2002]: Langdon, W.B., Poli, R. (2002). The Genetic Programming Search Space. In: Foundations of Genetic Programming. Springer, Berlin, Heidelberg.
[^D. O'Neill, H. Al-Sahaf, B. Xue and M. Zhang,2017]: D. O'Neill, H. Al-Sahaf, B. Xue and M. Zhang, "Common subtrees in related problems: A novel transfer learning approach for genetic programming," *2017 IEEE Congress on Evolutionary Computation (CEC)*, Donostia, Spain, 2017.
[^Zahra et al., 2022]: Zahra et al., Semantic schema based genetic programming for symbolic regreSion, Applied Soft Computing, 2022.
[^John. R Koza, 1992]: Genetic Programming, MIT Press, 1992

---
title: 02. GEP的实体
date: 2025/4/23
category_bar: true
categories: 
- 论文
- 进化计算
- 遗传编程
- 基因表达式编程：通过人工智能的数学建模
---
# 02. GEP的实体
{% note info %}  
这是对《Gene Expression Programming: Mathematical Modeling by an Artificial Intelligence》的笔记，本页对应第2章： Chapter 2： The Entities of Gene Expression Programming
  
本书可以在斯普林格购买纸质版或者电子版：https://link.springer.com/book/10.1007/3-540-32849-1
{% endnote %}  

GEP具有两种实体形态，chromosome和expression trees. Expression Tree含有chromosome的遗传信息。在GEP中从chromosome编译为expression tree的过程称为翻译。  
GEP中树和线性符号串的相互转化通过Karva language实现，非常容易。  

## 基因型
### 翻译过程
基因型，或者说chromosome是线性的表示，可以含有一个或者多个基因。自然界的基因的读取从起始密码子到终止密码子，这样的组织方法称为Open Reading Frames(ORFs)。GEP的chromosome在终止密码子后面有非表现区段，这个区段不会影响expression tree的语义，因此GEP中基因的起始密码子始终是染色体的第一个符号，但是终止密码子不一定是染色体的最后一个符号。  
在翻译过程中，每个chromosome，或者说每一个K-expression按照从上到下、从左到右、**广度优先**的方式来组成语法树结构。  

{% note info %}
注意在语法进化(Grammertical Evolution)中，语法树的展开顺序是**深度优先**的。GE认为深度优先的好处是可以直接通过线性结构就知道子树的组成。  
另外K-expression的表示和GP的代码实现中的前缀表达式或者后缀表达式亦有区别：前缀表达式和后缀表达式中operator和operands并没有分开。而K-expression中的operator和operands通过结构设计进行了区分（虽然边界仍然有可能不是很明显，尤其是在非Full结构的树上）。  
{% endnote %}
GEP中从chromosome到expression tree进行翻译的过程描述如下：  
1. chromosome的第一位始终为语法树的根节点  
2. 然后按照chromosome的顺序填入后面的节点直到这一行的arity全被填满
3. 重复这个过程直到Expression Tree的某一层全是端点  

### 非编码区段
GEP的一个基因由两部分组成：head和tails。头部的线性结构会被表示为语法树，包含端点和函数；尾部只包含端点，不会被表示。GEP的整个个体的长度虽然是固定的，但是在每个个体中头部和尾部的长度并不相同：头部的长度取决于表达式的长度以及表达式所需要的arity的个数。当基因的头部表达式因为genetic opeartor导致表达式长度和arity的个数发生变化时，编译过程会自动从原来的尾部中的第一个符号开始继续填入头部，直到头部的树合法。  
如此，在genetic operator的变化下，genetic operator永远不会产生非法个体，个体的语法永远是正确的。于语法树始终合法，如此genetic operator便可以没有任何限制的产生合法个体，这种情况下的搜索具有更广的搜索范围。过去的GP为了满足合法性要么限制了搜索要么花费了大量的时间来检查语构的合规性，而GEP不需要这么做。  
ORF机制的好处在于GEP的基因长度是固定的，保证了遗传信息密度的持续积累，并且可以持续提供足够的选择压力。另外一方面，ORF是可变长度的，为GEP带来了非显性区段，非显性区段为GEP提供了一种可以暂时隐藏某些有价值的结点的方法，造成了GEP个体基因型和表现型的差异，从而突破了phenotype threshold.  
通过进化行为，GEP可以适应性地将非编码区段转化为编码区段。作者给出了一个例子，在这个例子下，只是单纯的语法树上的某个结点发生了改变，从而导致非编码区段中大量的信息被翻出表达在语法树中。GEP的大部分genetic operator都可以将非编码区段转化为编码区段、或者是将编码区段转化为非编码区段。在非编码区段的作用下，GEP的进化过程可以暂时冻结某些building blocks，由于K-expression的表示性质，符号和符号之间的相对位置并不会发生变化，但是符号所连结的端点内容却发生了变化。  
这种方法相比于GP中的MA等等保护building blocks的方法更加自然。  

## 多基因
GEP的另一个特性是，每个个体可以不止拥有一个基因。每个个体/chromosome上可以存在多个基因，每个基因对应一个ORF和一个子树。基因之间通过通过linking function设计基因之间如何拼凑成最终的个体表示。每个基因既可以独立的拥有fitness，也可以使用整体的fitness进行进化。  
多基因的两种工作方式：  
- 子树之间通过linking function共同作用  
  多基因下每个子树逐个翻译，并且用一个特定的linking function进行连接。  
- 子树共同解决一个问题，但是彼此之间没有关联  
  这种情况下子树各自输出自己的，并没有存在物理上的连接关系。  
多输出的subtree之间的合作来自于评估的共同考虑（协同进化），而单输出的multi-subtree则在linking function中进行连接。  

基因和基因之间出现可以通过设计linking function或者端点引用形成层级性关系，不同层级上的Gene可以表示出不同的复杂度。  
翻译之后，子树可以是为由更小的子树组成的多基因树，也可以是单独的树。 

### 多基因的相互作用
linking function的作用是将子树组合起来，使其在进化过程中可以彼此交流。在标准GEP中，linking function是通过先验知识提前确定好的。linking function的args的数目会让搜索变得更加的复杂：$n$个args的linking function需要$n^n$个子树才能表现出层级性。  
多基因系统中的每个基因可以视为是一个building blocks。  

### Cells
linking function也可以自动进化：可以编码一个新的基因区段，这个区段指定了不同的子树如何组合在一起。在自然界中，有一种基因成为Hox基因，这种同源异性基因定义了身体各部分的是如何组成的。在GEP中，Hox基因和其他基因的结构一样，有头部和尾部，但是尾部的端点集包含的是对其他基因的索引。   
如此，将linking function也作为基因加入chromosome后，linking function拥有自己进化的能力，这样的好处有二：  
- 允许linking function自我进化
- 允许代码重用  
  代码重用的意义在于让ADF尝试与其他多个ADF建立联系，如此同一个ADF可以在不同的位置反复多次出现。  

如果使用多个Hox基因，那么GEP会形成若干个main programme，从而进化出层级性。如此ADFs可以支持多输出建模。  

### 随机常数
GEP提供了一种将随机常数序列也编码为一个基因的方式。在其他基因中，随机常数出现的位置以$?$表示，在编译过程中，问号会被随机常数基因中的元素逐个填入，并且随着chromosome一同进化。  





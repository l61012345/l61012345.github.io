---
title: Hexo搭建博客记录
category_bar: true
date: 2021/02/20
categories: 技术杂谈
---
# Hexo搭建博客记录
搭建这个博客前前后后花了大概一周左右的时间，基本上把能踩的雷全都踩过了，现在记录一下搭建过程中的问题和解决办法。

## Github Pages 相关问题
### Github Pages 无法创建页面 显示“Pages build faild” 但是没有任何报错信息
第一个遇到的问题是Github Pages 始终反馈无法创建（build）页面，反馈邮件当中没有任何关于错误的信息。   
debug非常多次之后发现是由于Git 把所有的代码都同步到了项目里：   
自己用的VS Code来写的博客。自己的VS Code里面本来就设置好了git，因此就直接用VS Code里面的git把项目里面所有的文件都提交上去了……     
所以解决办法是不要用VS Code里面的git来提交代码，正确的做法是用git bash里的`hexo g`生成文件后，用`hexo d`提交。  

### Github Pages 反馈邮件“You are attempting to use a Jekyll theme, which is not supported by GitHub Pages.”
本地build正常，但是同步到github pages后会收到来自github的邮件：   
> You are attempting to use a Jekyll theme, which is not supported by GitHub Pages. Please visit https://pages.github.com/themes/ for a list of supported themes. If you are using the “theme” configuration variable for something other than a Jekyll theme, we recommend you rename this variable throughout your site. For more information, see https://help.github.com/en/articles/adding-a-jekyll-theme-to-your-github-pages-site.      

这个问题是由更换主题时直接clone的主题，导致项目下面有两个repo造成的。  
解决方法有两个：
1. 直接在主题的release页面中下载发布的压缩包，解压之后放theme里【推荐】
2. 在git中使用submodule：`git submodule add url`

### Github Pages 显示 404 “There isn't a GitHub Pages site here.”
这个问题是由Github 里博客对应的项目名称不是username.github.io造成的，解决方法是把项目的名字命名为username.github.io     

### Github Pages 显示“The custom domain for your GitHub Pages site is pointed at an outdated IP address. You must update your site's DNS records if you'd like it to be available via your custom domain.”
原因是因为在云解析DNS控制台中没有加入github给的DNS或DNS已经失效。  
解决方法是在[https://docs.github.com/en/github/working-with-github-pages/managing-a-custom-domain-for-your-github-pages-site]页面的
"6 To confirm that your DNS record configured correctly, use the dig command, replacing EXAMPLE.COM with your apex domain. Confirm that the results match the IP addresses for GitHub Pages above. "中找到github提供的DNS，然后加入到云解析DNS控制台的解析记录中。  
同时还要删除很多教程中提到的用`ping username.github.io`ping出来的ip地址。  

### Github Pages 显示“Domain's DNS record could not be retrieved.”
原因是网站的解析设置有问题造成的，在解析控制台中的解析记录要注意解析类型和主机记录的对应关系：
A类对应@，CNAME对应www或者别的。   
还有可能是项目中的CNAME文件和github settings中custom domain设置的域名前面加了www.等其他东西。   
同时解析线路一定要选择默认。    

## 博客访问问题
### 无梯访问username.github.io 显示“已拒绝连接”
解决办法是更换为自己的域名，可以在阿里云，腾讯云之类的地方购买自己的域名，然后在github上对应项目的设置中Custom domain一项中填写自己买的域名（前面不要加www.之类的，就是纯域名）。  
同时解析线路一定要选择默认。   
### 访问博客显示“连接已关闭”   
通常是由于github pages在build和分发的过程中出错导致的，要去github上对应的项目的设置中看github pages的报错信息，具体问题具体分析。  

## 其他
### git 频繁要求输入邮箱和用户名
  这个问题是由于_config.yml末尾的deploy: repo:中设置的是https网址导致的  
  正确的填写方法是用SSH链接：  
  ```JAVA
  deploy:
  type: 'git'
  repo: git@github.com:username/username.github.io.git
  branch: master
  ```

### 博客中的LaTeX/MathJaX公式显示混乱
这个是由于renderer-marked的转义与markdown本身出现了冲突所造成的。    
解决方法：  
1. 卸载原来的公式渲染引擎改用kramed
   ```bash
   npm uninstall hexo-renderer-marked --save
   npm install hexo-renderer-kramed --save
   ```
2. 然后在node_modules\kramed\lib\rules\inline.js目录下把第11行的escape变量的值做相应的修改：
    ```java
    //  escape: /^\\([\\`*{}\[\]()#$+\-.!_>])/,
    escape: /^\\([`*\[\]()#$+\-.!_>])/
    ```
    这一步是在原基础上取消了对\,{,}的转义(escape)。  
    同时把第20行的em变量也要做相应的修改。   
    ```java
    //  em: /^\b_((?:__|[\s\S])+?)_\b|^\*((?:\*\*|[\s\S])+?)\*(?!\*)/,
    em: /^\*((?:\*\*|[\s\S])+?)\*(?!\*)/
    ```
3. 执行`hexo clean`再用`hexo g`重新生成

另一个办法是改用pandoc作为renderer，但是同样有踩坑点。
首先在电脑上安装最新版的pandoc，然后在hexo目录下执行：  
```bash
npm install hexo-renderer-pandoc --save
npm install hexo-renderer-mathjax --save
npm install hexo-filter-mathjax --save
```
这个时候渲染pandoc可能无法识别`\frac{}{}`和`\begin{}`这种高级语法，需要更改pandoc的渲染设置。  
打开node_modules\hexo-renderer-pandoc\lib\parseArgs.js，找到：  
```java
const defaultArgs = ['-M', 'pagetitle=dummy'];
```
把这一行改成：  
```java
const defaultArgs = ['-M', 'pagetitle=dummy',"--mathjax"];
```
此时还有一个问题是当markdown文件的列表的上一行不是回车符时，在pandoc渲染时不会将其识别为列表。  
这个时候继续修改这个文件，加上更多的常数：  
```java
const defaultArgs = ['-M', 'pagetitle=dummy',"--mathjax","--from=markdown+lists_without_preceding_blankline+footnotes+smart","--wrap=none"];
```
添加其他的参数是为了保证不冲突。
执行`hexo clean`再用`hexo g`重新生成即可。


### 页面中的LaTeX/MathJaX矩阵无法换行，只有一列
1. 行内矩阵不能用`\begin{matrix}`，要用`\begin{smallmatrix}`，括号用`\left[`和`\right]`表示
2. 由于渲染问题，换行符`\\`要改为`\\\` 同时注意前后都要空格

### 页面中的表格无法显示
这是由于mathjax不支持markdown中的表格语法造成的，正确的写法是用数组array代替:
```
$$
\begin{array}{c|lcr}
n & \text{Left} & \text{Center} & \text{Right} \\
\hline
1 & 0.24 & 1 & 125 \\
2 & -1 & 189 & -8 \\
3 & -20 & 2000 & 1+10i
\end{array}
$$
```
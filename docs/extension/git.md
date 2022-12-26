# Git

## 命令行操作

首先 我们需要了解几个单词。这几个单词有一些去掉原音发音 aoeiu 后就形成了命令行操作指令

file 文件 list 列表 touch 触摸

make 制作 relursive 递归 change 改变

move 移动 link 链接 directory 目录

remove 删除 find 寻找 force 强制

copy 拷贝 echo 回声

缩写：去掉 aoeiu 后形成命令（大部分取两个字母，所以例如 copy，去掉原音 o 只留 cp）

mk 制作 cd 改变目录--change directory

mv 移动 ln 链接

rm 删除

cp 拷贝

ls 列表

所有的程序都是围绕增删改查进行的，那么我们来了解一下命令行操作的增删改查

在操作前，可以先了解一下如何进入桌面，代码是

```bash
cd ~/Desktop  //~代表的是用户users的简写 .代表当前目录

pwd 查看当前目录的绝对路径

ls 查看当前目录内容

q 退出当前文件

ls （路径） 查看该路径的内容

ls -l 查看当前目录的所有信息情况（不包含隐藏文件）

ls -a 查看当前目录下所有文件(包括隐藏文件)

ls -al 查看所有文件（包括隐藏文件）的信息情况
```

### 增

增分三种 创建文件 创建目录 创建

1. 创建文件：touch 命令 可以 touch 一个空的文件 例如：touch b.txt

   同时创建多个文件 touch a.txt b.txt

   往文件中创建内容 echo haha>a.txt 往文件中写入 haha 内容 但是会覆盖

   往文件中追加内容 echo hahahaha>>a.txt

   往文件中追加多行内容 echo -e '1\n2' >a.txt

2) 创建目录： 同时创建多个文件夹 mkdir a b c

   同时创建多个有层级的文件夹 mkdir -p a/b/c 1/2/3

3. 拷贝文件：将 1.txt 拷贝到 2.txt cp 1.txt 2.txt

   将 a 文件夹拷贝到 b 文件夹 cp -r a b

### 查

查看文件和查看目录

1. 查看文件： less 1.txt 可以查看到文件内的所有内容，会分页查看

   cat 1.txt 查看文件内所有内容，不会分页

   head -n 10 1.txt 查看前 10 行内容 默认 10 行 默认写法：head 1.txt

   tail -n 10 1.txt 查看后 10 行内容 同上

2. 查看当前路径： pwd

3. 查看目录内容：ls 查看当前目录中有哪些内容

   ls -lt 查看当前目录中的内容包含时间

   ls -l 查看当前目录下详细信息

### 删

包含删除文件和删除目录

rm 1.txt 删除文件

rm -r a b 删除 a 和 b 目录

rm a/b/c/1.txt 删除该目录下的文件

### 改

我们可以通过默认模式或者指定 vscode 打开相应文件

默认模式打开：start 1.txt 或者 mac 下用 open 1.txt 打开

vscode 打开：code 1.txt 这种方法需要设置一下 vscode

设置方法：

> 安装：打开 VSCode –> command+shift+p –> 输入 shell command –> 点击提示 Shell Command: Install ‘code’ command in PATH 运行

> 使用：打开终端，cd 到要用 VSCode 打开的文件夹，然后输入命令 code .即可打开

移动文件到指定目录

mv 1.txt a 移动文件到 a 文件夹

mv a/b/c . 移动文件到当前目录 .代表当前目录

更新文件时间 touch 1.txt 没错 又是 touch

修改名字 mv 1.txt 2.txt 把同目录中的 1.txt 修改名字为 2.txt 没错 用的是 mv 你可以理解为把当前目录中 1.txt 移动到当前目录下的 2.txt 就改名了。。。不知道发明这个的逻辑～～

将文件内容清空 echo '' > 1.txt

## git 基础

全局设置邮箱跟姓名

```bash
/* 全局 */
git config –-global user.name 'your name'

git config –-global user.email 'email@xxx.com'

/* 某个具体的仓库 */

git config –-local user.name 'your name'

git config –-local user.email 'email@xxx.com'
```

其他配置

```bash
git config --global push.default simple //发送单个分支到远程而不是默认的matching全部发送
git config --global core.quotepath false
git config --global core.editor "code --wait"
git config --global core.autocrlf input
```

查看 config 的配置

```bash
git config --list --global
git config --list --local
```

其次就可以开启 git 在本地仓库的一些应用了，实际上 git 本地仓库就是在你需要版本管理的目录下增加一个.git 目录，来帮助你版本管理 注意这个目录不要是桌面 以免将你的桌面设置一个 git 目录，会传入很多桌面文件到 git 上去

提交

```bash
cd git-demo-1
git init /* git仓库初始化，增加xxx目录下.git目录 */
git add .
git commit -m 'xxxxx'
```

git 分三个区域：工作目录，暂存区，版本历史区

其中暂存区用 git add 命令提交文件。进入暂存区后文件会被 git 管控

版本历史区则需要 git commit 提交文件。

查看文件在哪个状态（是否跟 git 关联，目前是否在备选区）

```bash
git status
git status -sb 查看简化的冲突信息
```

git 重命名，重命名后可以直接 git commit

```bash
git mv beforName afterName
```

查看版本历史

```bash
git log  查看当前版本历史
git log --oneline  简略查看
git log -n4 --oneline  简略查看最近4条
git log --all --graph  图形化查看所有版本历史 包括分支
git reflog 查看所有切换过版本的情况以及切换过的操作情况用 也可看到commit后的版本号
/*区别*/
git reflog会记录所有信息，包括你穿越reset后的操作信息，git log只显示你当前版本到原始版本的信息
```

分支操作

```bash
git branch -v  查看所有分支
git branch -vv  查看所有分支与远程分支的关联情况
git branch xx分支 创建xx分支
git branch -d xxx  删除xxx分支
git branch -D xxx  强制删除xxx分支
git branch | grep -v 'master' | xargs git branch -D 删除除了 master 以外的所有本地分支
git checkout -b xxx  创建并切换到xxx分支
git checkout xxx  切换到xxx分支
git checkout -b xx分支 origin/xx分支  从远程xx分支创建并切换到xx分支
git branch --set-upstream-to=origin/[remote branch]  本地分支跟远程分支关联
```

修改 message

```bash
git commit --amend --message 'xxxx' 修改最新分支的message
git rebase -i xxx commit字符串xxx  修改历史分支的message 需要pick r 命令后修改
git rebase -I XX commit字符串xxx 合并多次提交到一次 需要pick s 命令后修改
```

> xxx commit 字符串代表要以 xxxcommit 为基础进行 rebase。rebase 是基于这个 commit 的，所以可 pick 的 commit 不会取 rebase 的那一级。但 pick 是可添加的，如果希望包含以 rebase 为基础的 commit， 则可以添加 pick xxx commit 字符串，然后 git rebase - -continue
>
> s 命令代表跟选中的上一级进行合并，可 pick 分支至少留一个否则 rebase 失败。

贮藏

```bash
git stash
git stash pop  弹出最后一个贮藏
git stash apply 弹出最后一个贮藏 但贮藏区还在
git stash list 查看贮藏列表
```

恢复

```bash
git reset HEAD  取消被暂存的内容
git reset --hard xxx版本号 切换版本 这个操作需要add过的文件都commit 否则会删除掉add过的文件
git reset --hard HEAD 恢复成上次提交的commit
git reset HEAD^ 恢复到上一个版本
git reset --soft HEAD^ 恢复到上一个版本，但是 commit依然保留
```

删除

```bash
git rm file 删除某个文件 删除后可以直接commit
```

合并

```bash
git merge x 合并当前线与分支x
```

> 如果产生了冲突，会提示 conflict，那么我们可以通过 git status -sb 指令来查看哪些产生了冲突的简化信息。找到冲突的文件，会发现 git 已经帮助识别冲突的地方 对冲突的内容作出处理，处理结束后切记要 add 到备选状态。然后 git status -sb 找到下一个冲突的文件，改了继续 add 全部修改完后 git commit 一下 这时候不需要-v 或者-m

## 远程仓库

git 文件可以放在云端进行管理，一般我们都会选择与 github 进行关联。

在与 github 关联前，需要做一些配置工作。为了方便我们上传，可以通过 ssh key 来关联本地仓库与 github 仓库的关系。

这种方式实际上就是在自己的电脑上放私有钥匙，github 上放公有钥匙进行配对。

前提条件：需要电脑上已安装 git

配置步骤：

```bash
ssh-keygen -t rsa -b 4096 -C 邮箱 一直回车 三次

cat ~/.ssh/id_rsa.pub              # 得到公钥内容 在users目录内会有.ssh目录
```

然后复制公钥的内容，粘贴到 github 的 setting--ssh key 中

测试是否已连接

```bash
ssh -T git@github.com
```

提示会问你 yes or no 填 yes 即可。这个步骤是 github 给你返回了一个公钥来确认你是你

## 上传代码

首先在 github 上面创建一个代码仓库 然后点击 ssh（这个步骤很重要，不要点 https 因为我们用了 ssh key！！）

下面会提示两行代码

```bash
git remote add origin git@xxxxxx //表示在本地添加远程地址 仓库的名字默认origin

git push -u origin main //推送本地的分支到远程的main分支 写过一次这个代码 那么下次就不需要写全了
```

下次如果要提交就用 git push 即可

如果遇到 git pull 那就输入 git pull 一下 一般需要 git pull 的情况是远程仓库发生了变动 需要与本地做合并

**如何上传其他分支**

```bash
$ git push origin x:x
```

方法 2:

```bash
$ git checkout x

$ git push -u origin x
```

**如何修改远程 url 地址：**

```bash
$ git remote set-url origin xxxxx
$ git remote get-url origin
```

**下载别人的代码**

```bash
git clone git@xxxxxxx 如果是自己的代码 可以用ssh 如果是别人的 可以用http的码
```

如果是不同机器 需要另外安装 ssh 一个机子一个 key

GitHub Gist: 7bad0ac857fb1a92b886e1aa5cbbd2bb309a944c

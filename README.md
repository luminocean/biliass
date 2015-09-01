# Biliass

Bilibili的ASS字幕下载与生成工具
Biliass可以根据B站某视频的地址下载xml格式字幕，然后转换成ass格式的字幕。
可以由各种主流播放器加载显示，呈现出弹幕效果。

配合Bilidown食用风味更佳。

![演示](./demo.gif)

### 基本用法

在bin目录下可以找到可执行文件biliass

Usage: biliass [options]

  Options:

    -h, --help               output usage information
    -V, --version            output the version number
    -u, --url [url]          The url of the video page
    -d, --dir [directory]    The directory to which the ass subtitle will be saved (absolute or relative). Default to the current execution directory.
    -n, --nth [page_number]  The number of the subpage you want to download the subtitle from.(In the case where one video page has multiple subpages) Default to 1

示例（先创建subtitles文件夹）：
bin/biliass -d ./subtitles -n 2 -u http://www.bilibili.com/video/av2474781/

这行命令将把该视频part 2的弹幕的ass格式下载到当前目录下的subtitles文件夹下

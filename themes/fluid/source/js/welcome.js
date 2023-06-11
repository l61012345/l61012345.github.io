function welcome(){
    $(document).ready(function() {
        var newVisitor = isNewVisitor();// 如果是新访客
        if(newVisitor === true)
        {
        // 动画弹出消息框
        let welcome_text = '注意事项\n'
        if(document.referrer!==''){
            let referrer=document.referrer.split("/")[2];
            welcome_text="欢迎你，来自"+referrer.toUpperCase()+"的用户！\n";//获取用户来源域名
        }
        swal({
            title: "嗨,",
            text: welcome_text+'\n图片加载不出来记得挂梯子！！\n  ◆◆◆◆◆◆ \n '+'本网站中所有的内容（中/英）均接入wiseflow \n 如果要引用内容，请注意使用正确的引用格式\n (如果一直弹出这条消息，那么需要在浏览器设置中允许本站的保存cookie权限)',//欢迎文本，可自行修改
            imageUrl: "/img/welcome.jpg",//图片，自行修改位置对应source下文件
            timer: 30000,//弹出时间
            showConfirmButton: true
        }).then(
        swal({
            title: "警告",
            text: '不要觉得我的网站可以帮助你节省听课的时间——  \n 重要的事情说三遍：\n  如果你只看我网站复习但是上课不听课，那是肯定会挂科的！！！！ \n 如果你只看我网站复习但是上课不听课，那是肯定会挂科的！！！！ \n 如果你只看我网站复习但是上课不听课，那是肯定会挂科的！！！！ \n 血的教训，希望大家尊重课堂和甘愿为学生付出辛勤工作的老师们。  ',
            imageUrl: "/img/warning.png",//图片，自行修改位置对应source下文件
            timer: 30000,//弹出时间
            showConfirmButton: true
        }));
        // 标记：已经向该访客弹出过消息。5天之内不要再弹
        setCookie("yilin-visited","true", 5);
        }else{
        }
     });
}

$(document).ready(()=>{//若未引用JQuery，请引用
    welcome()
})

 function isNewVisitor() {
 // 从cookie读取“已经向访客提示过消息”的标志位
     var flg = getCookie("yilin-visited");
     if (flg === "") {
         return true;
     } else {
         return false;
     }
 }

 // 写字段到cookie  (手动设置一个字段到cookie中，这样每次只判断是否有这个字段即可)
 function setCookie(cname, cvalue, exdays) {
     var d = new Date();
     d.setTime(d.getTime() + (exdays*24*60*60*1000));
     var expires = "expires="+d.toUTCString();
     document.cookie = cname + "=" + cvalue + "; " + expires +";path=/";
 }
 // 读cookie
 function getCookie(cname) {
     var name = cname + "=";
     var ca = document.cookie.split(';');
     for(var i=0; i<ca.length; i++) {
       var c = ca[i];
       while (c.charAt(0)==' ') c = c.substring(1);
       if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
     }
     return "";
 }








function welcome(){
    let welcome_text = '注意事项\n'
    if(document.referrer!==''){
        let referrer=document.referrer.split("/")[2];
        welcome_text="欢迎你，来自"+referrer.toUpperCase()+"的用户！\n";//获取用户来源域名
    }
    swal({
        title: " 欢迎！",
        text: welcome_text+'图片加载不出来记得挂梯子！！\n 本网站中所有的内容（中/英）均接入wiseflow \n 如果要引用内容，请注意使用正确的引用格式',//欢迎文本，可自行修改
        imageUrl: "/img/avatar.png",//图片，自行修改位置对应source下文件
        timer: 30000,//弹出时间
        showConfirmButton: true
    });
}
$(document).ready(()=>{//若未引用JQuery，请引用
    welcome()
})
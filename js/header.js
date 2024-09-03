//退出登录
$(".logout").click(function (e) {
    sessionStorage.clear();
    location.reload();
});
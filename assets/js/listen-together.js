$(document).ready(()=>{

    function copyToClipboard(element) {
        var temp = $("<input>");
        $("body").append(temp);
        temp.val(element).select();
        document.execCommand("copy");
        temp.remove();
      }

    let url = new URL(document.URL)
    $("#click-here").html(`Click <a href="./ROOM${decodeURI(url.hash)}" target="_blank">HERE</a>`)
    $("#roomId").text(`ROOM${decodeURI(url.hash)}`)
    $("#copy").click(e=>{
        e.preventDefault();
        copyToClipboard(`ROOM${decodeURI(url.hash)}`)
    })
})
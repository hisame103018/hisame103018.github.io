var coll = document.getElementsByClassName('collapsible');

for(let i = 0; i < coll.length; i++){
    coll[i].addEventListener("click", function (){
        this.classList.toggle("active");
        var content = this.nextElementSibling;

        if(content.style.maxHeight){
            content.style.maxHeight = null;
        }else {
            content.style.maxHeight = content.scrollHeight+ 'px';
        }
    });
}


function getTime(){
    let today = new Date();
    hours = today.getHours();
    minutes = today.getMinutes();

    if(hours <10){
        hours = "0" +hours
    }
    if (minutes <10){
        minutes = "0" + minutes
    }
    let time = hours+ ":" + minutes;
    return time;
}

function  firstBotMessage(){
    let firstMessage = "안녕하세요, 여행이야기입니다. 저희 여행이야기는 여행관련 자료안내사이트입니다. 어디로 떠나가볼까요? 1. 서울 2. 강릉 3. 군산 4. 부산"
    document.getElementById("botStarterMessage").innerHTML="<p class='botTest'><span>" + firstMessage + '</span></p>';

    let time = getTime();

    $('#chat-timestamp').append(time);
    document.getElementById("userInput").scrollIntoView(false);

}

firstBotMessage();

function getHardResponse(userText){
    let botResponse = getBotResponse(userText);
    let botHTML = '<p class="botText"><span>'+ botResponse + '</span></p>';
    $("#chatbox").append(botHTML);

    document.getElementById("chat-bar-bottom").scrollIntoView(true);

}

function getResponse(){
    let userText = $("#textInput").val();

    if(userText == ""){
        userText = "오늘도 행복한하루 보내세요^^";
    }

    let userHTML = '<p class = "userText"><span>'+ userText + '</span></p>';

    $("#textInput").val("");
    $("#chatbox").append(userHTML);
    document.getElementById("chat-bar-bottom").scrollIntoView(true);

    setTimeout(() =>{
        getHardResponse(userText);
    }, 1000)
}

    function buttonSendText(sampleText){
        let userHTML = '<p class="botText"><span>'+sampleText+'</span></p>';

        $("#textInput").val("");
        $("#chatbox").append(userHTML);
        document.getElementById("chat-bar-bottom").scrollIntoView(true);
    }
    function sendButton(){
        getResponse();
    }

    function heartButton(){
        buttonSendText("Heart clicked!")
    }

    $("#textInput").keypress(function (e){
        if(e.which == 13){
            getResponse();
        }
    });

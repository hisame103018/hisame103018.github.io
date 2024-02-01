var waitingTeam_2 = parseInt(document.getElementById("waiting_team_2").innerText);
var waitingTime_2 = parseInt(document.getElementById("waiting_time_2").innerText);

var ctx_2 = document.getElementById("myLineChart_2").getContext('2d');
var data_2 = {
    labels: [],
    datasets: [{
        label: '웨이팅',
        borderColor: 'rgba(150, 0, 192, 1)',
        data: [],
        fill: false
    }]
};

var options_2 = {
    scales: {
        x: {
            title: {
                display: true,
                text: '대기시간 (분)'
            }
        },
        y: {
            title: {
                display: true,
                text: '대기팀 수'
            }
        }
    }
};

var myLineChart_2 = new Chart(ctx_2, {
    type: 'line',
    data: data_2,
    options: options_2
});

setInterval(function () {
    var randomWaitingTeam_2 = Math.floor(Math.random() * 10) + 1;
    var randomWaitingTime_2 = Math.floor(Math.random() * 60) + 1;

    document.getElementById("waiting_team_2").innerText = randomWaitingTeam_2;
    document.getElementById("waiting_time_2").innerText = randomWaitingTime_2;

    data_2.labels.push(randomWaitingTime_2); // x 축으로 대기시간 추가
    data_2.datasets[0].data.push(randomWaitingTeam_2); // y 축으로 대기팀 수 추가

    if (data_2.labels.length > 10) {
        data_2.labels.shift();
        data_2.datasets[0].data.shift();
    }

    myLineChart_2.update();
}, 2000);
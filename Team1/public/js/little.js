var waitingTeam_1 = parseInt(document.getElementById("waiting_team_1").innerText);
var waitingTime_1 = parseInt(document.getElementById("waiting_time_1").innerText);

var ctx_1 = document.getElementById("myLineChart_1").getContext('2d');
var data_1 = {
    labels: [],
    datasets: [{
        label: '웨이팅',
        borderColor: 'rgba(225, 192, 192, 1)',
        data: [],
        fill: false
    }]
};

var options_1 = {
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

var myLineChart_1 = new Chart(ctx_1, {
    type: 'line',
    data: data_1,
    options: options_1
});

setInterval(function () {
    var randomWaitingTeam_1 = Math.floor(Math.random() * 10) + 1;
    var randomWaitingTime_1 = Math.floor(Math.random() * 60) + 1;

    document.getElementById("waiting_team_1").innerText = randomWaitingTeam_1;
    document.getElementById("waiting_time_1").innerText = randomWaitingTime_1;

    data_1.labels.push(randomWaitingTime_1); // x 축으로 대기시간 추가
    data_1.datasets[0].data.push(randomWaitingTeam_1); // y 축으로 대기팀 수 추가

    if (data_1.labels.length > 10) {
        data_1.labels.shift();
        data_1.datasets[0].data.shift();
    }

    myLineChart_1.update();
}, 2000);
var waitingTeam_3 = parseInt(document.getElementById("waiting_team_3").innerText);
var waitingTime_3 = parseInt(document.getElementById("waiting_time_3").innerText);

var ctx_3 = document.getElementById("myLineChart_3").getContext('2d');
var data_3 = {
    labels: [],
    datasets: [{
        label: '웨이팅',
        borderColor: 'rgba(200, 100, 50, 1)',
        data: [],
        fill: false
    }]
};

var options_3 = {
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

var myLineChart_3 = new Chart(ctx_3, {
    type: 'line',
    data: data_3,
    options: options_3
});


setInterval(function () {
    var randomWaitingTeam_3 = Math.floor(Math.random() * 10) + 1;
    var randomWaitingTime_3 = Math.floor(Math.random() * 60) + 1;

    document.getElementById("waiting_team_3").innerText = randomWaitingTeam_3;
    document.getElementById("waiting_time_3").innerText = randomWaitingTime_3;

    data_3.labels.push(randomWaitingTime_3);
    data_3.datasets[0].data.push(randomWaitingTeam_3);

    if (data_3.labels.length > 10) {
        data_3.labels.shift();
        data_3.datasets[0].data.shift();
    }

    myLineChart_3.update();
}, 2000);

var waitingTeam = parseInt(document.getElementById("waiting_team").innerText);
var waitingTime = parseInt(document.getElementById("waiting_time").innerText);

var ctx = document.getElementById("myLineChart").getContext('2d');
var data = {
    labels: [],
    datasets: [{
        label: '웨이팅',
        borderColor: 'rgba(150, 192, 192, 1)',
        data: [],
        fill: false
    }]
};

var options = {
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

var myLineChart = new Chart(ctx, {
    type: 'line',
    data: data,
    options: options
});

setInterval(function () {
    var randomWaitingTeam = Math.floor(Math.random() * 10) + 1;
    var randomWaitingTime = Math.floor(Math.random() * 60) + 1;

    document.getElementById("waiting_team").innerText = randomWaitingTeam;
    document.getElementById("waiting_time").innerText = randomWaitingTime;

    data.labels.push(randomWaitingTime); // x 축으로 대기시간 추가
    data.datasets[0].data.push(randomWaitingTeam); // y 축으로 대기팀 수 추가

    if (data.labels.length > 10) {
        data.labels.shift();
        data.datasets[0].data.shift();
    }

    myLineChart.update();
}, 2000);
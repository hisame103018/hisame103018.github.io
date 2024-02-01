    // 데이터 설정
    var touristData = {
    labels: ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'],
    datasets: [{
    data: [120, 90, 100, 120 , 110, 130, 150, 180, 160, 120, 110, 150 ],
    backgroundColor: [
    'rgba(75, 0, 130, 1)',
    'rgba(75, 0, 130, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(75, 0, 130, 1)'
    ],
    borderColor: [
    'rgba(75, 0, 130, 1)',
    'rgba(75, 0, 130, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(255, 99, 132, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(0, 191, 255, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(160, 82, 45, 1)',
    'rgba(75, 0, 130, 1)'
    ],
    borderWidth: 1
}]
};

    var areaData = {
    labels: ['해운대', '감천문화마을', '광안리'],
    datasets: [{
    label: 'Area Estimation',
    data: [500, 300, 400],
    backgroundColor: [
    'rgba(0, 0, 139, 1)',
    'rgba(220, 20, 60, 1)',
    'rgba(0, 100, 0, 1)'
    ],
    borderColor: [
    'rgba(0, 0, 139, 1)',
    'rgba(220, 20, 60, 1)',
    'rgba(0, 100, 0, 1)'
    ],
    borderWidth: 1
}]
};

    // 차트 생성
    var touristChart = new Chart(document.getElementById('touristEstimation').getContext('2d'), {
    type: 'bar',
    data: touristData,
    options: {
    scales: {
    y: {
    beginAtZero: true
}
}
}
});

    var areaChart = new Chart(document.getElementById('areaTourist').getContext('2d'), {
    type: 'doughnut',
    data: areaData,
    options: {
    scales: {
    y: {
    beginAtZero: true
}
}
}
});
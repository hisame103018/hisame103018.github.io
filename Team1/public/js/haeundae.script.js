let currentBox = 0;
const boxSlider = document.querySelector('.box-slider');
const boxes = document.querySelectorAll('.box');

function showBox(index) {
    if (index < 0) {
        currentBox = boxes.length - 1;
    } else if (index >= boxes.length) {
        currentBox = 0;
    } else {
        currentBox = index;
    }

    const newTransformValue = -currentBox * 100 + '%';
    boxSlider.style.transform = 'translateX(' + newTransformValue + ')';
}

function nextBox() {
    showBox(currentBox + 1);
}

function prevBox() {
    showBox(currentBox - 1);
}

// 자동 박스 슬라이드 기능 추가
setInterval(nextBox, 3000);
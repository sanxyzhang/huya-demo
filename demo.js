import '@babel/polyfill';
import 'jquery';

const mockData = [
    [3, 10, 17, 29, 1],
    [12, 111, 99, 31, 109],
    [121, 1111, 991, 311, 1091],
    [1210, 1119, 9991, 3110, 1099],
]

const config = {
    childH: 30,
    childBottom: 10,
}

function movePosition(ele, posIndex) {
    $(ele).css("position", "absolute");
    $(ele).animate({
        top: config.childH * (posIndex - 1) + config.childBottom * (posIndex - 1) + 'px'
    }, 300);
}

function sortChild(sortArr) {
    let eleArr = $(".child");
    eleArr.map((index, item) => {
        movePosition(item, sortArr[index])
    })
}

function initChildPosition() {
    let eleArr = $(".child");
    eleArr.map((index, item) => {
        $(item).css({
            position: "absolute",
            top: config.childH * (index) + config.childBottom * (index) + 'px'
        });

    })
}

function createChild(num) {
    let parent = $(".parent"), index = 1;
    while (num) {
        let child = document.createElement("div"),
            innerHtml = '<span>' + '张' + num + '</span><span class="num num' + index + '">' + num + '</span>';
        child.setAttribute('class', 'child');
        child.innerHTML = innerHtml;
        parent.append(child);
        num--;
        index++;
    }
}

function numUp(numArr) {
    numArr.forEach((val, index) => {
        let target = document.getElementsByClassName(`num${index + 1}`)[0]
        let options = {
            useEasing: false,
            useGrouping: true,
            separator: ',',
            decimal: '.',
            prefix: '',
            suffix: ''
        };
        numUpObj = new CountUp(target, 0, val, 0, 1.5, options);
        numUpObj.start();
    })
}

function compareCreateSort(arr) {
    let cloneArr = JSON.parse(JSON.stringify(arr));
    arr = arr.sort((a, b) => b - a);
    return cloneArr.map((item) => {
        return arr.findIndex((val) => val == item) + 1;
    })
}

createChild(5);
initChildPosition();
for (let i = 0; i < mockData.length; i++) {
    setTimeout(() => {
        numUp(mockData[i]);
        let sortedArr = compareCreateSort(mockData[i]);
        sortChild(sortedArr)
    }, 1000)
}


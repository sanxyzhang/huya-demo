import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import CountUp from 'react-countup';
import './index.hycss'

const { View, Text, BackgroundImage, Button, Modal } = UI

const config = {
    childH: 30,
    childBottom: 24,
}

const mockData = [
    [3, 7, 17, 29, 1],
    [12, 11, 21, 32, 100],
    [15, 111, 99, 39, 109],
    [121, 1111, 991, 311, 1091],
    [1210, 1119, 9991, 3110, 1099],
];

class LeaderBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemTopArr: [0, 54, 108, 162, 216],
            itemValArr: [],
            started: false,
        }
        this.initTop()
    }

    roomEventListenr = () => {
        //监听其他人进入房间，离开房间
        hyExt.observer.on('roomStatus', (data) => {
            if (data.type = "join") {
                this.setState({
                    itemValArr: [...itemValArr, data]
                })
            } else {
                let _cloneArr = JSON.parse(JSON.stringify(this.state.itemValArr));
                let deleteIndex = _cloneArr.findIndex((item) => item.uniCode == data.uniCode);
                _cloneArr.splice(deleteIndex, 1);
                this.setState({
                    itemValArr: _cloneArr
                })
            }
        })
    }

    //通过获取的礼物汇总数据刷新itemValArr
    parseData = (data) => {
        let cloneValArr = JSON.parse(JSON.stringify(itemValArr));
        cloneValArr.map((item, index) => {
            data.map((dItem, index) => {
                if (dItem.userId == item.userId) {
                    item.totalPay = dItem.totalPay;
                }
            })
        })
        this.setState({
            itemValArr: cloneValArr
        })
    }

    giftEventListen = () => {
        hyExt.observer.on('giftEvent', (data) => {

        })
    }

    initTop() {
        let { num } = this.props;
        this.setState({
            itemTopArr: this.state.itemTopArr.slice(0, num)
        })
    }

    componentDidMount() {
        for (let i = 0; i < mockData.length; i++) {
            setTimeout(() => {
                let sortedArr = this.compareCreateSort(mockData[i]);
                console.log(mockData[i], sortedArr)
                this.changeStateTop(sortedArr)
            }, i * 1100);
            setTimeout(() => {
                this.setState({
                    itemValArr: mockData[i]
                })
            }, i * 1000)
        }
    }

    componentWillUnmount() {
        hyExt.observer.off('roomStatus', () => { });
        hyExt.observer.off('giftEvent', () => { })
    }
    changeStateTop(newSort) {
        let { itemTopArr } = this.state;
        newSort.forEach((order, index) => {
            let newTop = (order) * (config.childH + config.childBottom);
            this.changeItemTop(index, itemTopArr[index], newTop);
        })

    }

    changeItemTop(index, preTop, newTop) {
        let { itemTopArr } = this.state;
        let newItemTopArr = itemTopArr;
        newItemTopArr.splice(index, 1, newTop);
        this.setState({
            itemTopArr: newItemTopArr
        })
    }

    compareCreateSort(arr) {
        let cloneArr = JSON.parse(JSON.stringify(arr));
        cloneArr = cloneArr.sort((a, b) => b - a);
        return arr.map((item) => {
            return cloneArr.findIndex((val) => val == item);
        })
    }

    //每次top有变化则render
    renderBoardItemList() {
        let { num } = this.props, childArr = [], index = 0;
        let { itemTopArr, itemValArr } = this.state;
        while (index < num) {
            childArr.push(
                <BackgroundImage className="boardItem" style={{ top: itemTopArr[index] }}
                    src={require("../../../img/img_list01.png")}>
                    <View className="boardContent">
                        <Image src={require("../../../img/xiaoguotu01.png")} className="groupImg"></Image>
                        <Text className="userName">张{index}</Text>
                        <Text className="itemNum"><CountUp end={itemValArr[index]} /></Text>
                    </View>
                </BackgroundImage>
            );
            index++;
        }
        return childArr;
    }

    comfirm = () => {
        this.props.toPage1();
        //发送退出房间请求
    }

    clickStart = () => {
        //发送请求开始游戏
        this.setState({
            started: true
        })
    }



    render() {
        let { isRoomOwner } = this.props,
            { started } = this.state;
        //人数要大于1，才能开始；
        let canStartGame = !started && isRoomOwner;
        return (
            <View>
                <View className="topInfo">
                    <Text className="roomText">当前房间密码：201548</Text>
                    <BackgroundImage className="textLine" src={require("../../../img/img_line01.png")}></BackgroundImage>
                </View>
                <View className="LeaderBoardMain">
                    {this.renderBoardItemList()}
                </View>
                <View>
                    <BackgroundImage className="textLine" src={require("../../../img/img_line01.png")}></BackgroundImage>
                    <Text className="gameRuleTitle">
                        游戏规则
                    </Text>
                    <Text className="gameRuleContent">
                        游戏第一名可以指定其他参与者做任何事情，但不可太过分
                    </Text>
                </View>
                {
                    canStartGame && <BackgroundImage className="startBtnBg" src={require("../../../img/btn_little01.png")}>
                        <View>
                            <Button className="startBtn" onPress={this.clickStart}>开始</Button>
                        </View>
                    </BackgroundImage>
                }
                <BackgroundImage className="leaveBtnBg" src={require("../../../img/btn_little02.png")}>
                    <View>
                        <Button className="leaveBtn" onPress={this.clickLeave}>退出</Button>
                    </View>
                </BackgroundImage>
                <Modal
                    ref={(c) => { this._modal = c; }}
                    cancelable={true}
                    className="confirmLeave"
                >
                    <BackgroundImage className="confirmLeaveBg" src={require("../../../img/img_bg02.png")}>
                        <View>
                            <Text className="wihteCommonText">退出后将解散本次比赛队伍</Text>
                            <Text className="wihteCommonText">您确认要退出？</Text>
                        </View>
                        <View className="modalBtnGroup">
                            <BackgroundImage className="modalLeaveBtnBg" src={require("../../../img/btn_little02.png")}>
                                <View>
                                    <Button className="modalLeaveBtn" onPress={this.comfirm}>退出</Button>
                                </View>
                            </BackgroundImage>
                            <BackgroundImage className="modalCancelBtnBg" src={require("../../../img/btn_little01.png")}>
                                <View>
                                    <Button className="modalCancelBtn" onPress={this.cancelComfirm}>取消</Button>
                                </View>
                            </BackgroundImage>
                        </View>
                    </BackgroundImage>
                </Modal>
            </View>
        )
    }

    clickLeave = () => {
        this._modal.open();
    }
    cancelComfirm = () => {
        this._modal.close();
    }
}

export default LeaderBoard;

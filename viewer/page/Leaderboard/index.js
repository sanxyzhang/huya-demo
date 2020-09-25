import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import CountUp from 'react-countup';
import './index.hycss'

const { View, Text, BackgroundImage, Button, Modal, Image, Tip } = UI

const config = {
    childH: 30,
    childBottom: 24,
}


let interval1 = null,
    interval2 = null;

class LeaderBoard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            itemTopArr: [0, 54, 108, 162, 216],
            itemValArr: [],
            started: false,
            over: false,
            lastTime: 60 * 20,
            roomNumber: null
        }
    }

    roomEventListenr = () => {
        //监听其他人进入房间，离开房间
        hyExt.observer.on('joinRoom', (res) => {
            console.log('joinRoom', res);
            data = (JSON.parse(res)).data;
            let members = data && data.members;
            let roomNumber = data && data.roomNumber;
            this.state.itemValArr.map((item) => {
                let index = members.findIndex(mItem => mItem.userId == item.userId);
                console.log(index)
                if (index >= 0) {
                    members.splice(index, 1);
                }
            })
            console.log(members);
            this.setState({
                itemValArr: [...this.state.itemValArr, ...members],
                roomNumber: roomNumber
            })
        });
        hyExt.observer.on('createRoom', (res) => {
            console.log('createRoom', res);
            data = (JSON.parse(res)).data;
            let members = data && data.members;
            let roomNumber = data && data.roomNumber;
            this.state.itemValArr.map((item) => {
                let index = members.findIndex(mItem => mItem.userId == item.userId);
                console.log(index)
                if (index >= 0) {
                    members.splice(index, 1);
                }
            })
            console.log(members);
            this.setState({
                itemValArr: [...this.state.itemValArr, ...members],
                roomNumber: roomNumber
            })
        })
        hyExt.observer.on('leaveRoom', (res) => {
            console.log('leaveRoom', res);
            let data = (JSON.parse(res)).data;
            if (data.owner) {
                this.setState({
                    over: true
                })
                Tip.show('游戏结束', 2000, false, 'center');
                setTimeout(() => {
                    window.location.reload();
                }, 2000)
            } else {
                let _cloneArr = JSON.parse(JSON.stringify(this.state.itemValArr));
                let deleteIndex = _cloneArr.findIndex((item) => item.userId == data.userId);
                _cloneArr.splice(deleteIndex, 1);
                this.setState({
                    itemValArr: _cloneArr
                })
            }

        })
    }

    //通过获取的礼物汇总数据刷新itemValArr
    parseData = (data) => {
        let newItemValArr = JSON.parse(JSON.stringify(this.state.itemValArr));
        newItemValArr.map((item, index) => {
            data.map((dItem, index) => {
                if (dItem.userId == item.userId) {
                    item.totalPay = dItem.totalPay;
                }
            })
        })
        this.setState({
            itemValArr: newItemValArr
        })
        let newArrSort = this.compareCreateSort(newItemValArr);
        this.changeStateTop(newArrSort);
    }


    componentDidMount() {
        this.roomEventListenr()
    }

    UNSAFE_componentWillMount() {
        hyExt.observer.off('roomStatus', () => { });
        hyExt.observer.off('giftEvent', () => { })
    }
    changeStateTop(newSort) {
        newSort.forEach((order, index) => {
            let newTop = (order) * (config.childH + config.childBottom);
            this.changeItemTop(index, newTop);
        })

    }

    changeItemTop(index, newTop) {
        let { itemTopArr } = this.state;
        let newItemTopArr = itemTopArr;
        newItemTopArr.splice(index, 1, newTop);
        this.setState({
            itemTopArr: newItemTopArr
        })
    }

    compareCreateSort(arr) {
        let cloneArr = JSON.parse(JSON.stringify(arr));
        cloneArr = cloneArr.sort((a, b) => b.totalPay - a.totalPay);
        return arr.map((item) => {
            return cloneArr.findIndex((_item) => _item.userId == item.userId);
        })
    }

    //每次top有变化则render
    renderBoardItemList() {
        let { itemTopArr, itemValArr } = this.state;
        return itemValArr.map((item, index) => {
            return (
                <BackgroundImage className="boardItem" key={item.userId} style={{ top: itemTopArr[index] }}
                    src={require("../../../img/img_list01.png")}>
                    <View className="boardContent">
                        <Image src={item.avatarUrl} className="groupImg"></Image>
                        <Text className="userName">{item.nickName}</Text>
                        <Text className="itemNum"><CountUp end={item.totalPay} /></Text>
                    </View>
                </BackgroundImage>
            )
        })
    }

    comfirm = () => {
        //发送退出房间请求
        this.setState({
            over: true
        });
        this.clearAllInterval();
        console.log(this.state.roomNumber);
        hyExt.request({
            method: 'POST',
            url: ' http://19581e7a2913.ngrok.io/leaveRoom',
            data: {
                userId: this.props.userInfo.userId,
                roomNumber: this.props.roomNumber || this.state.roomNumber
            },
            dataType: 'json'
        }).then((res) => {
        })
        setTimeout(() => {
            window.location.reload();
        }, 2000)
    }

    clearAllInterval = () => {
        clearInterval(interval1);
        clearInterval(interval2);
    }

    clickStart = () => {
        let { userInfo } = this.props;
        //发送请求开始游戏
        this.setState({
            started: true
        })
        hyExt.request({
            method: 'POST',
            url: ' http://19581e7a2913.ngrok.io/startRoom',
            data: {
                userId: userInfo.userId,
                roomNumber: this.state.roomNumber
            },
            dataType: 'json'
        }).then((res) => {
            // this.setState({
            //     roomList: res.data
            // })
        })

        interval1 = setInterval(() => {
            if (this.state.lastTime > 0) {
                this.setState({
                    lastTime: --this.state.lastTime
                })
            }
        }, 1000);

        interval2 = setInterval(() => {
            if (!this.state.over) {
                hyExt.request({
                    method: 'POST',
                    url: ' http://19581e7a2913.ngrok.io/totalPay',
                    header: { "timeout": 10000 },
                    data: {
                        roomNumber: this.state.roomNumber
                    },
                    dataType: 'json'
                }).then((res) => {
                    console.log(res);
                    this.parseData(res.data.data);
                })
            }
        }, 6000);


        setTimeout(() => {
            hyExt.observer.off('roomStatus', () => { });
            Tip.show('游戏结束', 2000, false, 'center');
            this.clearAllInterval()
            this.setState({
                over: true
            })
        }, 20 * 60 * 1000);

        setTimeout(() => {
            Tip.show('游戏结束', 2000, false, 'center');
        }, 3000)
    }

    render() {
        let { isRoomOwner, roomNumber } = this.props,
            { started, lastTime } = this.state;
        //人数要大于1，才能开始；
        let canStartGame = !started && isRoomOwner;
        let second = lastTime % 60 < 10 ? '0' + lastTime % 60 : lastTime % 60;
        let min = (lastTime - second) / 60 < 10 ? '0' + (lastTime - second) / 60 : (lastTime - second) / 60;
        return (
            <View>
                <View className="topInfo">
                    <Text className="roomText">
                        {
                            !started ? `当前房间密码：${roomNumber || this.state.roomNumber}` :
                                lastTime == 0 ? '游戏已结束' : `剩余时间: ${min}:${second}`
                        }

                    </Text>
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
                            <Button className="startBtn" onPress={this.clickStart}>
                                <Text className="white_24">开始</Text>
                            </Button>
                        </View>
                    </BackgroundImage>
                }
                <BackgroundImage className="leaveBtnBg" src={require("../../../img/btn_little02.png")}>
                    <View>
                        <Button className="leaveBtn" onPress={this.clickLeave}><Text className="white_24">退出</Text></Button>
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
                                    <Button className="modalLeaveBtn" onPress={this.comfirm}><Text className="white_24">退出</Text></Button>
                                </View>
                            </BackgroundImage>
                            <BackgroundImage className="modalCancelBtnBg" src={require("../../../img/btn_little01.png")}>
                                <View>
                                    <Button className="modalCancelBtn" onPress={this.cancelComfirm}><Text className="white_24">取消</Text></Button>
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

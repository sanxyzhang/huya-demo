import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import CountUp from 'react-countup';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage, Button, Modal, Image, Tip, ScrollView } = UI

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
            oldItemValArr: [],
            started: false,
            over: false,
            lastTime: 60 * 20,
            roomNumber: '',
            modalContent: 'leave',
            wb: false,
            wbId: null,
            wbMsg: ''
        }
        hyExt.env.getInitialParam().then(param => {
            hyExt.logger.info('获取当前小程序初始化参数成功，返回：' + JSON.stringify(param))
            if (param.wb) {
                // 初始化参数包含wb参数，说明处于独立白板模式
                this.setState({
                    wb: true
                })
                hyExt.stream.onExtraWhiteBoardMessage({
                    // 接收到数据，刷新视图
                    callback: data => {
                        console.log("接受独立白板成功");
                        let _state = JSON.parse(data)
                        this.setState({ ..._state, wb: this.state.wb });
                    }
                })
            }
        })
    }
    createWb = () => {
        let width = 375;
        let height = 700;
        // 创建独立白板
        hyExt.stream.addExtraWhiteBoard({
            width, height
        }).then(({ wbId }) => {
            // 返回独立白板id，发送数据的时候需要带上这个参数，所以state里要加上这东西
            console.log('白班id' + wbId)
            this.state.wbId = wbId
        }).catch((err) => {
            console.log(err)
        })
    }

    componentWillReceiveProps(props) {
        if (props.currentPage == 'page3') {
            this.createWb();
        } else {
            hyExt.stream.removeExtraWhiteBoard({ wbId: this.state.wbId }).then(() => {
                hyExt.logger.info('移除小程序独立白板成功')
            }).catch(err => {
                hyExt.logger.info('移除小程序独立白板失败，错误信息：' + err.message)
            })
        }
    }
    componentDidUpdate() {
        console.log(this.state);
        this.sendToWb();
    }

    sendToWb() {
        let { wbId } = this.state
        // this.emitMessage(data);
        // 发送数据到独立白板
        if (this.state.wbId) {
            hyExt.stream.sendToExtraWhiteBoard({
                wbId,
                data: JSON.stringify(this.state)
            })
            console.log("发送到独立白板成功");
        }
    }

    roomEventListenr = () => {
        //开始游戏，各个主播开始倒计时
        hyExt.observer.on('startRoom', (res) => {
            console.log('startRoom', res);
            this.createEventLoop();
        })
        //监听其他人进入房间，离开房间
        hyExt.observer.on('joinRoom', (res) => {
            console.log('joinRoom', res);
            let data = (JSON.parse(res)).data;
            if (JSON.parse(res).err) {
            } else {
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
            }
        });
        hyExt.observer.on('createRoom', (res) => {
            console.log('createRoom', res);
            let data = (JSON.parse(res)).data;
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
                if (!this.state.started) {
                    let _cloneArr = JSON.parse(JSON.stringify(this.state.itemValArr));
                    let deleteIndex = _cloneArr.findIndex((item) => item.userId == data.userId);
                    console.log(deleteIndex);
                    _cloneArr.splice(deleteIndex, 1);
                    this.setState({
                        itemValArr: _cloneArr
                    })
                }
            }

        })
    }

    createEventLoop = () => {
        this.setState({
            started: true
        })
        interval2 = setInterval(() => {
            if (!this.state.over) {
                hyExt.request({
                    method: 'POST',
                    url: 'http://jingjichang.evaaide.com:7001/totalPay',
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
        }, 3000);

        interval1 = setInterval(() => {
            if (this.state.lastTime >= 0) {
                this.setState({
                    lastTime: --this.state.lastTime
                })
            }
        }, 1000);

        setTimeout(() => {
            this.removeRoomEvent()
            Tip.show('游戏结束', 2000, false, 'center');
            this.clearAllInterval()
            this.setState({
                over: true
            })
        }, 20 * 60 * 1000 + 1000 * 2);
    }

    //通过获取的礼物汇总数据刷新itemValArr
    parseData = (data) => {
        if (data) {
            let newItemValArr = JSON.parse(JSON.stringify(this.state.itemValArr));
            newItemValArr.map((item, index) => {
                data.map((dItem, index) => {
                    if (dItem.userId == item.userId) {
                        item.totalPay = dItem.totalPay;
                    }
                })
            })
            this.setState({
                itemValArr: newItemValArr,
                oldItemValArr: this.state.itemValArr
            })
            let newArrSort = this.compareCreateSort(newItemValArr);
            this.changeStateTop(newArrSort);
        }
    }


    componentDidMount() {
        this.roomEventListenr();
        setTimeout(() => {
            if (!this.state.started) {
                this.comfirm();
            }
        }, 15 * 1000 * 60);
        setInterval(() => {
            this.sendToWb();
        }, 1000);
    }

    removeRoomEvent() {
        hyExt.observer.off('joinRoom', () => { });//
        hyExt.observer.off('createRoom', () => { });
        hyExt.observer.off('leaveRoom', () => { })
    }
    UNSAFE_componentWillMount() {
        this.removeRoomEvent()
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
        let { itemTopArr, itemValArr, oldItemValArr } = this.state;
        return itemValArr.map((item, index) => {
            item.avatarUrl = item.avatarUrl && item.avatarUrl.replace('http://', 'https://') || ''
            return (
                <BackgroundImage className="boardItem" key={item.userId} style={{ top: itemTopArr[index] }}
                    src={require("../../../img/img_list01.png")}>
                    <View className="boardContent">
                        <Image src={item.avatarUrl} className="groupImg"></Image>
                        <Text className="userName">{item.nickName || '小虎牙'}</Text>
                        <Text className="itemNum">
                            <CountUp
                                start={(oldItemValArr[index] && oldItemValArr[index].totalPay) || 0}
                                end={item.totalPay} />
                        </Text>
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
        setTimeout(() => {
            window.location.reload();
        }, 1500);
        
        hyExt.request({
            method: 'POST',
            url: 'http://jingjichang.evaaide.com:7001/leaveRoom',
            data: {
                userId: this.props.userInfo && this.props.userInfo.userId,
                roomNumber: this.props.roomNumber || this.state.roomNumber
            },
            dataType: 'json'
        }).then((res) => {
        })
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
            url: 'http://jingjichang.evaaide.com:7001/startRoom',
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
    }

    render() {
        let { isRoomOwner, roomNumber } = this.props,
            { started, lastTime, itemValArr, modalContent } = this.state;
        //人数要大于1，才能开始；
        let canStartGame = !started && isRoomOwner && itemValArr.length > 1;
        let second = lastTime % 60 < 10 ? '0' + lastTime % 60 : lastTime % 60;
        let min = (lastTime - second) / 60 < 10 ? '0' + (lastTime - second) / 60 : (lastTime - second) / 60;
        if (this.state.wb) {
            console.log(this.state);
            return <View>
                <View className="topInfo">
                    <Text className="roomText">
                        {
                            !started ? `当前房间密码：${roomNumber || this.state.roomNumber}` :
                                lastTime <= 0 ? '游戏已结束' : `剩余时间: ${min}:${second}`
                        }
                    </Text>
                    <BackgroundImage className="textLine" src={require("../../../img/img_line01.png")}></BackgroundImage>
                </View>
                <View className="LeaderBoardMain">
                    {this.renderBoardItemList()}
                </View>
            </View>
        } else {
            return (
                <View>
                    <View className="topInfo">
                        <Text className="roomText">
                            {
                                !started ? `当前房间密码：${roomNumber || this.state.roomNumber}` :
                                    lastTime <= 0 ? '游戏已结束' : `剩余时间: ${min}:${second}`
                            }

                        </Text>
                        <BackgroundImage className="textLine" src={require("../../../img/img_line01.png")}></BackgroundImage>
                    </View>
                    <View className="LeaderBoardMain">
                        {this.renderBoardItemList()}
                    </View>
                    <BackgroundImage className="textLine" src={require("../../../img/img_line01.png")}></BackgroundImage>
                    <View className="btnGroup">
                        {
                            <TouchableWithoutFeedback className="guideViewTouch" onPress={this.clickLeave.bind(this, 'rule')}>
                                <View className="guideView">
                                    <Text className="white_20">游戏规则</Text>
                                    <BackgroundImage className="guide" src={require("../../../img/Btn_yindao_1.png")}></BackgroundImage>
                                </View>
                            </TouchableWithoutFeedback>
                        }
                        <TouchableWithoutFeedback className="guideViewTouch" onPress={this.clickLeave.bind(this, 'phone')}>
                            <View className="guideView">
                                <Text className="white_20">联系客服</Text>
                                <BackgroundImage className="guide" src={require("../../../img/Btn_yindao_1.png")}></BackgroundImage>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    {!this.state.wb && <View className="btnGroup">
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
                                <Button className="leaveBtn" onPress={this.clickLeave.bind(this, 'leave')}><Text className="white_24">退出</Text></Button>
                            </View>
                        </BackgroundImage>
                    </View>}
                    <Modal
                        ref={(c) => { this._modal = c; }}
                        cancelable={true}
                        className="confirmLeave"
                    >
                        <BackgroundImage className="confirmLeaveBg" src={require("../../../img/img_bg02.png")}>
                            {
                                modalContent == 'phone' && <View>
                                    <Text className="wihteCommonText">联系客服 QQ群:737956370</Text>
                                    <Text className="wihteCommonText">邮箱:support@evaaide.com</Text>
                                </View>
                            }
                            {
                                modalContent == 'rule' && <View>
                                    <ScrollView className="scrollView">
                                        <Text className="wihteCommonText">
                                            游戏说明<br />
                                    可供2~5位主播同场竞技的小游戏<br />
                                    比赛20分钟内谁收到的礼物分值更高<br />
                                    【除上上签与礼盒本身之外，<br />
                                    其他所有礼物都会算分，1荧光棒=10分】<br />
                                    创建房间可以选择公开或隐藏房间<br />
                                    公开的房间所有主播<br />
                                    均可以加入到房间内一起比赛。<br />
                                    推荐与视频连麦功能一并使用，<br />
                                    以达到优秀的节目效果<br />
                                        </Text>
                                    </ScrollView>
                                </View>
                            }
                            {
                                modalContent == 'leave' && <View>
                                    <Text className="wihteCommonText">退出后将解散本次比赛队伍</Text>
                                    <Text className="wihteCommonText">您确认要退出？</Text>
                                </View>
                            }
                            {
                                modalContent !== 'leave' && <View className="onlyBtn">
                                    <BackgroundImage className="modalLeaveBtnOnlyBg" src={require("../../../img/btn_little02.png")}>
                                        <View>
                                            <Button className="modalLeaveBtn" onPress={this.cancelComfirm}><Text className="white_24">确定</Text></Button>
                                        </View>
                                    </BackgroundImage>
                                </View>
                            }
                            {
                                modalContent == 'leave' && <View className="modalBtnGroup">
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
                            }
                        </BackgroundImage>
                    </Modal>
                </View>
            )
        }
    }

    clickLeave = (key) => {
        this.setState({
            modalContent: key
        }, () => {
            this._modal.open();
        })

    }
    cancelComfirm = () => {
        this._modal.close();
    }
}

export default LeaderBoard;

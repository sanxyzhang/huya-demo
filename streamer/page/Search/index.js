import { UI } from '@hyext/hy-ui';
import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage, ScrollView, Image, Tip, Input } = UI


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomNumber: '',
            roomList: [
            ],
            checkRoomNum: null,
        }
    }
    
    componentDidMount() {
        this.getList();
        hyExt.observer.on('joinRoom', (res) => {
            console.log('joinRoom', res);
            data = (JSON.parse(res)).data;
            if (JSON.parse(res).err) { 
                Tip.show(data.msg, 2000, false, 'center')
                this.getList();
            } else {
                this.props.toPage3();
            }
        })
    }
    componentWillReceiveProps(nextProps) {
        if (nextProps.currentPage) {
            this.getList();
        }
    }
    getList = () => {
        hyExt.request({
            method: 'POST',
            url: 'http://jingjichang.evaaide.com:7001/roomList',
            data: {},
            dataType: 'json'
        }).then((res) => {
            console.log(res.data.data);
            this.setState({
                roomList: res.data.data
            })
        })
    }

    checkRoom = (roomNumber) => {
        this.setState({
            roomNumber: roomNumber,
            checkRoomNum: roomNumber
        })
    }

    joinGame = () => {
        let { userInfo, changeGlobalVal } = this.props;
        console.log(userInfo);
        changeGlobalVal('roomNumber', this.state.roomNumber);
        changeGlobalVal('isRoomOwner', false);
        hyExt.request({
            method: 'POST',
            url: 'http://jingjichang.evaaide.com:7001/joinRoom',
            data: {
                ...userInfo,
                roomNumber: this.state.roomNumber
            },
            dataType: 'json'
        }).then((res) => {
        })
    }

    renderGroupImg = (imgList) => {
        return <View className="groupImg">
            {imgList && imgList.map((item, index) => {
                return <Image src={item} className="groupImgitem" key={index}></Image>
            })}
        </View>
    }

    renderRoomList = () => {
        let { roomList, checkRoomNum } = this.state;
        return roomList && roomList.map((item, index) => {
            let roomItemClass = (item.roomNumber == checkRoomNum) ? "roomItem checked" : "roomItem"
            return <TouchableWithoutFeedback key={index} onPress={this.checkRoom.bind(this, item.roomNumber)}>
                <View key={index}>
                    <BackgroundImage className={roomItemClass} src={require("../../../img/img_list01.png")}>
                        <View className="boardContent">
                            <Image src={item.ownerImg} className="ownerImg"></Image>
                            <Text className="userName">{item.ownerName||'小虎牙'}</Text>
                            {this.renderGroupImg(item.memberImgs)}
                        </View>
                    </BackgroundImage>
                </View>
            </TouchableWithoutFeedback>

        })
    }

    render() {
        let { toPage1 } = this.props;
        return (
            <View className="searchContent">
                <BackgroundImage className="searchInput" src={require("../../../img/img_input01.png")}>
                    <View>
                        <Input
                            className="realInput"
                            textAlign='left'
                            value={this.state.roomNumber}
                            placeholder='请输入房间密码'
                            onChange={(value) => {
                                if (Number.isNaN(+value)) {
                                    this.setState({ roomNumber: '' })
                                } else {
                                    this.setState({ roomNumber: value })
                                }
                            }}
                            inputStyle={{ color: 'white', fontSize: 20}}
                        />

                    </View>
                </BackgroundImage>
                <ScrollView className="roomScroll">
                    {this.renderRoomList()}
                </ScrollView>
                <View className="btnView">
                    <BackgroundImage className="entryBtn" src={require("../../../img/btn_little01.png")}>
                        <TouchableWithoutFeedback onPress={this.joinGame}>
                            <View className="btnWarpView"><Text className="btnText">加入</Text></View>
                        </TouchableWithoutFeedback>
                    </BackgroundImage>
                    <BackgroundImage className="returnBtn" src={require("../../../img/btn_little02.png")}>
                        <TouchableWithoutFeedback onPress={toPage1}>
                            <View className="btnWarpView"><Text className="btnText">返回</Text></View>
                        </TouchableWithoutFeedback>
                    </BackgroundImage>
                </View>
            </View>
        )
    }
}

export default Search

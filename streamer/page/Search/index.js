import { UI } from '@hyext/hy-ui';
import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage, ScrollView, Image, Tip } = UI


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomNumber: '',
            roomList: null,
            checkRoomNum: null,
        }
    }

    componentDidMount() {
        this.getList();
    }

    getList = () => {
        hyExt.request({
            method: 'POST',
            url: 'http://91ccd8e7b540.ngrok.io/roomList',
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
        let { toPage3, userInfo } = this.props;
        hyExt.request({
            method: 'POST',
            url: 'http://91ccd8e7b540.ngrok.io/joinRoom',
            data: {
                ...userInfo,
                roomNumber: this.state.roomNumber
            },
            dataType: 'json'
        }).then((res) => {
            if (res.err) {
                Tip.show(res.msg, 2000, false, 'center')
                this.getList();
            } else {
                toPage3()
            }
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
            return <TouchableWithoutFeedback onPress={this.checkRoom.bind(this,item.roomNumber)}>
                <View key={index}>
                    <BackgroundImage className={roomItemClass} src={require("../../../img/img_list01.png")}>
                        <View className="boardContent">
                            <Image src={item.ownerImg} className="ownerImg"></Image>
                            <Text className="userName">{item.ownerName}</Text>
                            {this.renderGroupImg(item.membersImgs)}
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
                        <input
                            className="realInput"
                            placeholder='请输入房间号'
                            onChange={(value) => {
                                this.setState({ roomNumber: value })
                            }}
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

import { UI } from '@hyext/hy-ui';
import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage, ScrollView, Image } = UI


class Search extends Component {
    constructor(props) {
        super(props);
        this.state = {
            roomId: '',
            roomList: null,
            checkRoomNum: null,
        }
    }

    componentDidMount() {
        hyExt.request({
            method: 'get',
            url: 'https://www.qunar.com/hotel/mustTry?city=beijing_city'
        }).then((res) => {
            this.setState({
                roomList: res.data
            })
        })
    }

    joinGame = () => {
        let { toPage3, userInfo } = this.props;
        hyExt.request({
            method: 'POST',
            url: 'https://www.qunar.com/hotel/mustTry?city=beijing_city',
            data: userInfo,
            dataType: 'json'
        }).then((res) => {
            toPage3()
        })

    }

    renderGroupImg = (imgList) => {
        return <View className="groupImg">
            {imgList.map((item, index) => {
                return <Image src={require("../../../img/xiaoguotu01.png")} className="groupImgitem"></Image>
            })}
        </View>
    }

    renderRoomList = () => {
        let { roomList, checkRoomNum } = this.state;
        return roomList.map((item, index) => {
            let roomItemClass = (item.roomNum == checkRoomNum) ? "roomItem checkd" : "roomItem"
            return <TouchableWithoutFeedback onPress={(item) => {
                this.setState({checkRoomNum: item.roomNum})
            }}>
                <View className={roomItemClass} key={index} onPress={() => { console.log(111) }}>
                    <BackgroundImage className="boardItem" src={require("../../../img/img_list01.png")}>
                        <View className="boardContent">
                            <Image src={require("../../../img/xiaoguotu01.png")} className="ownerImg"></Image>
                            <Text className="userName">张{index}</Text>
                            {this.renderGroupImg([1, 2, 3])}
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
                                this.setState({ roomId: value })
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

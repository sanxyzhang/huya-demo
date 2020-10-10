import { UI } from '@hyext/hy-ui';
import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage, Tip } = UI

class App extends Component {
    constructor(props) {
        super(props)
    }

    createGame = () => {
        let { toPage3, userInfo, changeGlobalVal } = this.props;
        //请求生成房间号，并传递主播信息
        hyExt.request({
            method: 'POST',
            url: 'http://jingjichang.evaaide.com:7001/createRoom',
            data: { ...userInfo },
            header: { "timeout": 10000 },
            dataType: 'json',
            isDirect: true
        }).then((res) => {
            console.log(res)
            if (res.err) {
                Tip.show(res.msg, 2000, false, 'center')
            } else {
                changeGlobalVal('roomNumber', res.data.roomNumber);
            }
        })

        toPage3();
    }

    joinGame = () => {
        let { toPage2 } = this.props;
        toPage2()
    }

    render() {
        
        return (
            <View className="entryContent">
                <BackgroundImage className="createGameBtn" src={require("../../../img/btn_big01.png")}>
                    <TouchableWithoutFeedback onPress={this.createGame}>
                        <Text className="btnText">创建比赛</Text>
                    </TouchableWithoutFeedback>
                </BackgroundImage>
                <BackgroundImage className="entryGameBtn" src={require("../../../img/btn_big02.png")}>
                    <TouchableWithoutFeedback onPress={this.joinGame}>
                        <Text className="btnText">加入比赛</Text>
                    </TouchableWithoutFeedback>
                </BackgroundImage>
            </View>
        )
    }
}

export default App;

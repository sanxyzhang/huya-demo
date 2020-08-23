import { UI } from '@hyext/hy-ui';
import React, { Component } from 'react';
import { TouchableWithoutFeedback } from 'react-native'
import './index.hycss'

const { View, Text, BackgroundImage } = UI

class App extends Component {
    constructor(props) {
        super(props)
    }

    createGame = () => {
        let { toPage3, userInfo, changeGlobalVal } = this.props;
        //请求生成房间号，并传递主播信息
        hyExt.request({
            method: 'POST',
            url: 'https://www.qunar.com/hotel/mustTry?city=beijing_city',
            data: { userInfo },
            dataType: 'json'
        }).then((res) => {
            changeGlobalVal('roomNum', res.data.roomNum);
            toPage3();
        })

    }

    joinGame = () => {
        let { toPage2 } = this.props;
    }
    render() {

        return (
            <View className="entryContent">
                <BackgroundImage className="createGameBtn" src={require("../../../img/btn_big01.png")}>
                    <TouchableWithoutFeedback onPress={toPage3}>
                        <Text className="btnText">创建比赛</Text>
                    </TouchableWithoutFeedback>
                </BackgroundImage>
                <BackgroundImage className="entryGameBtn" src={require("../../../img/btn_big02.png")}>
                    <TouchableWithoutFeedback onPress={toPage2}>
                        <Text className="btnText">加入比赛</Text>
                    </TouchableWithoutFeedback>
                </BackgroundImage>
            </View>
        )
    }
}

export default App;

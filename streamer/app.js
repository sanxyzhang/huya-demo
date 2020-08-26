import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import LeaderBoard from './page/Leaderboard';
import Entry from './page/Entry';
import Search from './page/Search';
import './app.hycss'
import './global.css'
const { View, Text, BackgroundImage } = UI

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPage: 'page1',
			userInfo: null,
			roomInfo: null,
			isRoomOwner: false,
		}
	}

	UNSAFE_componentWillMount() {
		hyExt.context.getUserInfo().then(userInfo => {
			hyExt.logger.info('获取当前用户（观众/主播）信息成功，返回：' + JSON.stringify(userInfo));
			hyExt.context.getStreamerInfo().then(roomInfo => {
				this.setState({
					userInfo: {
						userId: userInfo.userUnionId,
						nickName: userInfo.userNick,
						avatarUrl: userInfo.userAvatarUrl,
						roomId: roomInfo.streamerRoomId
					}
				})
			})
		}).catch(err => {
			hyExt.logger.info('获取当前用户（观众/主播）信息失败，错误信息：' + err.message)
		})

	}

	setStorageAndState = (val) => {
		hyExt.storage.setItem("currentPage", val)
		this.setState({
			currentPage: val
		})
	}

	changeGlobalVal = (key, val) => {
		this.setState({
			[key]: val
		})
	}

	toPage3 = () => {
		this.setState({
			isRoomOwner: true
		})

		this.setStorageAndState('page3')
	}
	toPage2 = () => {
		this.setStorageAndState('page2')
	}
	toPage1 = () => {
		this.setStorageAndState('page1')
	}

	renderCurrentPage = () => {
		const { currentPage, userInfo, isRoomOwner } = this.state;
		switch (currentPage) {
			case 'page1':
				return <Entry toPage2={this.toPage2} toPage3={this.toPage3} userInfo={userInfo} changeGlobalVal={this.changeGlobalVal} />
			case 'page3':
				return <LeaderBoard num={5}
					toPage1={this.toPage1}
					userInfo={userInfo}
					isRoomOwner={isRoomOwner}
					changeGlobalVal={this.changeGlobalVal}
				/>
			default:
				return <Search toPage1={this.toPage1} toPage3={this.toPage3} userInfo={userInfo} />
		}
	}
	render() {
		return (
			<BackgroundImage className="pageBody" src={require("../img/img_bg01.png")}>
				<BackgroundImage className="titleText" src={require("../img/text_name01.png")}></BackgroundImage>
				<View className="pageContent">
					{this.renderCurrentPage()}
				</View>
			</BackgroundImage>
		)
	}
}

export default App

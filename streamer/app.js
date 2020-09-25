import { UI } from '@hyext/hy-ui'
import React, { Component } from 'react'
import LeaderBoard from './page/Leaderboard';
import Entry from './page/Entry';
import Search from './page/Search';
import './app.hycss'
// import './global.css'
const { View, Text, BackgroundImage } = UI

class App extends Component {
	constructor(props) {
		super(props);
		this.state = {
			currentPage: 'page1',
			userInfo: null,
			roomInfo: null,
			isRoomOwner: true,
			roomNumber: null,
			wbId: '',
			wbMsg: '',
			wb: false
		}
		hyExt.env.getInitialParam().then(param => {
			// 初始化参数包含wb参数，说明处于独立白板模式
			console.log('param');
			console.log(param);
			if (param.wb) {
				this.setState({
					wb: true
				})
			}
		})
		// this.createWb();
	}

	// createWb() {
	// 	let args = [];
	// 	args[0] = {};
	// 	args[0].x = 1;
	// 	args[0].y = 2;
	// 	args[0].width = 375;
	// 	args[0].height = 600;
	// 	hyExt.logger.info('创建小程序EXE白板：' + JSON.stringify(args));
	// 	hyExt.stream.addWhiteBoard(args[0]).then(() => {
	// 		hyExt.logger.info('创建小程序EXE白板成功')
	// 	}).catch(err => {
	// 		console.log(err);
	// 		hyExt.logger.info('创建小程序EXE白板失败，错误信息：' + err.message)
	// 	})
	// }

	// createWb () {
	//     let width = 375;
	//     let height = 600;
	//     // 创建独立白板
	//     hyExt.stream.addExtraWhiteBoard({
	//       width, height
	//     }).then(({ wbId }) => {
	// 	  // 返回独立白板id，发送数据的时候需要带上这个参数，所以state里要加上这东西
	// 		console.log('白班id'+ wbId)
	//       this.state.wbId = wbId
	//     }).catch((err)=>{
	//       console.log(err)
	//     })
	// }

	// componentDidUpdate() {
	// 	this.sendToWb(+new Date())
	// }

	// sendToWb (data) {
	// 	let { wbId } = this.state
	// 	// this.emitMessage(data);
	// 	// 发送数据到独立白板
	// 	if(this.state.wbId){
	// 	  hyExt.stream.sendToExtraWhiteBoard({
	// 		wbId,
	// 		data: data
	// 	  })
	// 	  console.log("发送到独立白板成功");
	// 	}
	// }

	componentWillMount() {
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
				console.log(userInfo);
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
		this.setStorageAndState('page3')
	}
	toPage2 = () => {
		this.setStorageAndState('page2')
	}
	toPage1 = () => {
		this.setStorageAndState('page1')
	}

	renderCurrentPage = () => {
		const { currentPage, userInfo, isRoomOwner, roomNumber } = this.state;
		return <View>
			<View style={{ display: (currentPage == 'page1' ? 'block' : 'none') }}>
				<Entry toPage2={this.toPage2} toPage3={this.toPage3} userInfo={userInfo}
					changeGlobalVal={this.changeGlobalVal}
				/>
			</View>
			<View style={{ display: (currentPage == 'page3' ? 'block' : 'none') }}>
				<LeaderBoard num={5}
					toPage1={this.toPage1}
					userInfo={userInfo}
					currentPage={currentPage}
					isRoomOwner={isRoomOwner}
					changeGlobalVal={this.changeGlobalVal}
					roomNumber={roomNumber}
				/>
			</View>
			<View style={{ display: (currentPage == 'page2' ? 'block' : 'none') }}>
				<Search toPage1={this.toPage1}
					toPage3={this.toPage3}
					userInfo={userInfo}
					changeGlobalVal={this.changeGlobalVal}
					currentPage={currentPage == 'page2'}
				/>
			</View>
		</View>
	}
	render() {
		if (this.state.wb) {
			const { userInfo, isRoomOwner, roomNumber } = this.state;
			return <BackgroundImage className="pageBody" src={require("../img/img_bg01.png")}>
				<BackgroundImage className="titleText" src={require("../img/text_name01.png")}></BackgroundImage>
				<View className="pageContent" name={this.state.wbMsg}>
					<LeaderBoard num={5}
						toPage1={this.toPage1}
						userInfo={userInfo}
						isRoomOwner={isRoomOwner}
						changeGlobalVal={this.changeGlobalVal}
						roomNumber={roomNumber}
					/>
				</View>
			</BackgroundImage>

		}
		return (
			<BackgroundImage className="pageBody" src={require("../img/img_bg01.png")}>
				<BackgroundImage className="titleText" src={require("../img/text_name01.png")}></BackgroundImage>
				<View className="pageContent" name={this.state.wbMsg}>
					{this.renderCurrentPage()}
				</View>
			</BackgroundImage>
		)
	}
}

export default App

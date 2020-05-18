/*
 * Created by dashan~changjiang on 2020/4/14 10:21.
 */
'use strict'


const extractFrame = require('ffmpeg-extract-frame')

var { getMetaData, getMetaDuration, takeScreenshots } = require('./ffmpegMethod')




async function aaa(){

}




(async ()=>{
	
	let url = "http://223.223.180.17/video/iqy/%e6%bf%80%e6%83%85%e7%9a%84%e5%b2%81%e6%9c%88/%e6%bf%80%e6%83%85%e7%9a%84%e5%b2%81%e6%9c%8830a.mp4"
	// let url = './video.mp4'
	
	let metainfo2 = await getMetaData(url)
	const FrameRate = metainfo2.video.r_frame_rate.split('/')[0]
	let durationMS = metainfo2.video.duration * 1000

	
	let baseStepTime = 1000 / FrameRate
	
	let beginTime = 1
	
	console.log('帧率为：' + FrameRate + '; 总时长：' + metainfo2.video.duration + '秒'  )
	
	
	while( beginTime < durationMS ){
		console.log("doing..............");
		
		
		let  screenShotsConf = {
			media_addr:url,
			timemarks :beginTime,
			filename:`./img/${beginTime}.png`,
			folder:'./img/'
		}
		
		let res = await takeScreenshots(screenShotsConf)
		
		console.log( res );
		console.log(screenShotsConf);
		
		
		// await extractFrame({
		// 	input: url,
		// 	output: `./aaaa-%s.png`,
		// 	offset: beginTime // seek offset in milliseconds
		// })
		
		
		
		console.log( `${ durationMS } -------> ${beginTime}` );
		beginTime = beginTime + baseStepTime
	
	}
	
	
	
})()



async function doExtractFrame({input,output,offset}){
	
	await extractFrame({
		input: input,
		output: output,
		offset: offset // seek offset in milliseconds
	})
	
}
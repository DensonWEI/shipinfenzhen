/*
 * Created by dashan~changjiang on 2020/3/6 11:58.
 */
'use strict'

var ffmpeg = require('fluent-ffmpeg')
const os = require('os');


if( os.type() == "Windows_NT" ){
	let FfprobePath = "D:\\ffmpeg-20200424-a501947-win64-static\\bin\\ffprobe.exe"
	let FfmpegPath = "D:\\ffmpeg-20200424-a501947-win64-static\\bin\\ffmpeg.exe"
	ffmpeg.setFfprobePath( FfprobePath );
	ffmpeg.setFfmpegPath( FfmpegPath )
}else{
	// ffmpeg 设置
	let FfprobePath = "/usr/bin/ffprobe"
	let FfmpegPath = "/usr/bin/ffmpeg"
	ffmpeg.setFfprobePath( FfprobePath );
	ffmpeg.setFfmpegPath( FfmpegPath )
}



const path = require("path")


async function ffmpegClipsForVid({ video_id, clips_id, media_addr,clipsVideoPath }){
	
	
	console.log("################  ffmpegClipsForVid  come in #################");
	
	return new Promise( (resolve, reject) => {
		
		let logList = []
		
		logList.push( { video_id, clips_id, media_addr,clipsVideoPath } )
		
		const outputName = path.join( clipsVideoPath, clips_id+".mp4" )
		let startCS = (clips_id.split("_")[0]/1000).toFixed(3)
		let endCS = (clips_id.split("_")[1]/1000).toFixed(3)
		let duration = endCS - startCS
		
		// console.log( outputName );
		// console.log( startCS );
		// console.log( endCS );
		// console.log( duration );
		
		
		var command  = new ffmpeg();
		command
			.input(media_addr)
			.seekInput(startCS)
			.duration(duration)
			// .videoCodec('libx264')
			// .videoBitrate('1000k')  比特率不影响 合成
			// .fps(24)
			.size('1280x720').autopad('#000000')
			.outputOptions('-strict -2')
			.on('start', function(commandLine) {
				console.log( commandLine );
				console.log('Start:' + commandLine)
			})
			.on('progress', function(progress) {
			
					let progressstr = 'Processing: ' + progress.percent + '% done'
					console.log(progressstr);
					// logList.push(progressstr)
			})
			.on('error', function(err, stdout, stderr) {
					
					let errstr = 'Cannot process video: ' + err.message
					console.log(err);
					console.log(errstr)
					resolve(  { status:false,logList:logList }  )
			})
			.on('end', function(stdout, stderr) {
				// console.log(stdout);
				// console.log(stderr);
				
				// console.log( stdout );
				// console.log('Transcoding succeeded !');
				console.log('Transcoding succeeded !')
				
				resolve( { status:true,logList:logList } )
			}).save( outputName ,function () {
				console.log(" save !!!!!!!!!!!!!")
			})
		
			
	});
	
}


async function margeClips( list, mergeFileUrl ){
	
	// console.log( list );
	// console.log( mergeFileUrl );
	
	return new Promise( (resolve, reject) => {
		
		let logList = []
		logList.push( { list:JSON.stringify( list ), mergeFileUrl:mergeFileUrl } )
		
		var mergedVideo = ffmpeg();
		
		list.forEach (function(videoName){
			mergedVideo = mergedVideo.addInput(videoName);
		});
		
		
		
		mergedVideo
			.outputOptions('-strict -2')
			.on('start', function(commandLine) {
				console.log(commandLine);
				logList.push('Start:' + commandLine )
			})
			.on('progress', function(progress) {
				console.log( progress );
				// console.log('Processing: ' + progress.percent + '% done');
			})
			.on('error', function(err) {
				console.log('An error occurred: ' + err.message);
				console.log( err );
				logList.push('Error:' + err.message )
				resolve(  { status:false , logList:logList }  )
			})
			.on('end', function() {
				console.log('Merging finished !');
				logList.push('Merging finished !')
				resolve(  { status:true , logList:logList }  )
			})
			.mergeToFile( mergeFileUrl );
	})
	
}



// 分帧程序
async function takeScreenshots( { media_addr , timemarks , filename, folder } ){
	
	return new Promise( (resolve, reject) => {
		
		ffmpeg(media_addr)
			.seekInput( parseInt(timemarks)/1000 )
			.noAudio()
			.outputOptions(
				'-threads','5',
				'-vframes','1',
				'-f', 'image2'
			).output(filename)
		.on('start', function(commandLine) {
			console.log(commandLine);
		})
		.on('progress', function(progress) {
			
			// console.log( progress );
			// console.log('Processing: ' + progress.percent + '% done');
			console.log('Processing: ' + JSON.stringify(progress) );
		})
		.on('error', function(err) {
			console.log('An error occurred: ' + err.message);
			console.log( err );
			resolve( false )
		})
		.on('end', function() {
			console.log('finished !');
			resolve( true )
		}).run();
		
		
		
		
		/*
		ffmpeg(media_addr)
			.outputOptions(
				'-threads','15',
				'-vframes','1',
				'-f', 'image2'
			)
			.screenshots({
				timemarks :[timemarks/1000],
				filename:filename,
				folder:folder
			})
			.on('start', function(commandLine) {
				console.log(commandLine);
			})
			.on('progress', function(progress) {
				
				// console.log( progress );
				// console.log('Processing: ' + progress.percent + '% done');
				console.log('Processing: ' + JSON.stringify(progress) );
			})
			.on('error', function(err) {
				console.log('An error occurred: ' + err.message);
				console.log( err );
				resolve( false )
			})
			.on('end', function() {
				console.log('finished !');
				resolve( true )
			})
		 */
		
		
	})
	
}





// 一般视频时长  video.duration * 1000
// 一般帧数      video.nb_frames

async function getMetaData( fileurl ){
	
	return new Promise( (resolve, reject) => {
		
		ffmpeg.ffprobe( fileurl , function(err, metadata) {
			
			if(err) {
				console.log( err );
				resolve(false)
			}
			
	
			
			if( metadata && metadata['streams'] && metadata['streams'].length > 0 ){
				
				// console.log(metadata['streams'])
				
				let video = {}
				let voice = {}
				
				Object.assign(video,metadata['streams'][0] )
				Object.assign(voice,metadata['streams'][1] )
				
				let finalInfo  = {video,voice}
				console.log(finalInfo);
				resolve( finalInfo )
			
			}else{
				console.log( new Error("metadata['streams'] is error! ") );
				resolve(false)
			}
			
		});
	})
	
}


// 返回视频时长信息
async function getMetaDuration(fileurl){
	
	return new Promise( (resolve, reject) => {
		
		ffmpeg.ffprobe( fileurl , function(err, metadata) {
			
			if(err) {
				console.log( err );
				resolve(false)
			}
			
			console.log( metadata['format'].duration * 1000 );
			resolve( metadata['format'].duration * 1000 )
		});
	})
	
}





/*
(async ()=>{
	
	let res = await metadata("http://123.103.4.98/files/baofeng/02记录/匪帮说唱传奇(1080P)_2304769_94513.mp4")
	console.log(res);
	
	
	
	// ffmpeg.ffprobe( "http://gslb.miaopai.com/stream/71lnfSpgykv6OXcX97NE~YLNlX3sfsDB.mp4" , function(err, metadata) {
	//
	// 	if(err) {
	// 		console.log( err );
	// 	}
	// 	console.log( metadata );
	// });
	
	
})()
*/







/*



(async ()=>{

	let clipsRes= await ffmpegClipsForVid({
		video_id:"4e72bb7fe9e22123143a046a5e9e4888",
		clips_id:"341160_343160",
		media_addr:"http://223.223.180.17/video/tx/%e5%88%9b%e9%80%a0101/%e5%88%9b%e9%80%a0101%e7%ac%ac10%e6%9c%9f.mp4",
		clipsVideoPath:"./tmp/4e72bb7fe9e22123143a046a5e9e4888"
	})
	
	
	await ffmpegClipsForVid( clipsRes )
	
	// console.log( clipsRes );
	
	// let videoNames = 	[
	// 	'../cut_dingshi/tmp/4e72bb7fe9e22123143a046a5e9e4888/4541160_4543160.mp4',
	// 	'../cut_dingshi/tmp/4e72bb7fe9e22123143a046a5e9e4888/4241160_4243160.mp4',
	// 	'../cut_dingshi/tmp/4e72bb7fe9e22123143a046a5e9e4888/4541160_4543160.mp4'
	// ]
	//
	//  let  res = await margeClips(videoNames,'../cut_dingshi/tmp/merged.mp4')
	//
	//  console.log( res );
	
	
})()
 
 */








module.exports   = {
	ffmpegClipsForVid:ffmpegClipsForVid,
	margeClips:margeClips,
	getMetaData:getMetaData,
	takeScreenshots:takeScreenshots
}
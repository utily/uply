#!/usr/bin/env node

import * as isoly from "isoly"
import { performance } from "perf_hooks"
import { default as fetch } from "node-fetch"
import * as fs from "fs"

(async () => {
	// Do something before delay
	console.log('before delay')
	let testNumber = 0
	const numberOfTests = 24
	let latestTimePayfunc = performance.now()
	let latestTimeCardfunc = performance.now()
	let latestTimeDiffPayfunc = 0
	let latestTimeDiffCardfunc = 0
	let shortestPayfunc = 100000
	let shortestCardfunc = 100000
	let longestPayfunc = 0
	let longestCardfunc = 0
	const payFuncLog: string[] = []
	const cardFuncLog: string[] = []
	let log = ""

	while (testNumber < numberOfTests) {
		latestTimePayfunc = performance.now()
		latestTimeCardfunc = performance.now()
		const startTime = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
		Promise.all([pingServer("https://api.payfunc.com/version/").then(n => {
			latestTimeDiffPayfunc = performance.now() - latestTimePayfunc
			shortestPayfunc = latestTimeDiffPayfunc < shortestPayfunc ? latestTimeDiffPayfunc : shortestPayfunc
			longestPayfunc = latestTimeDiffPayfunc > longestPayfunc ? latestTimeDiffPayfunc : longestPayfunc
			const logEntry = "Status: " + n + " time: " + latestTimeDiffPayfunc + " timestamp: " + isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
			// payFuncLog.push(logEntry)
			// return '"' + isoly.DateTime.now() + '";' + latestTimeDiffPayfunc
			console.log("Payfunc: ", logEntry)
			return n + ';' + latestTimeDiffPayfunc
		}),
		pingServer("https://api.cardfunc.com/version/").then(n => {
			latestTimeDiffCardfunc = performance.now() - latestTimeCardfunc
			shortestCardfunc = latestTimeDiffCardfunc < shortestCardfunc ? latestTimeDiffCardfunc : shortestCardfunc
			longestCardfunc = latestTimeDiffCardfunc > longestCardfunc ? latestTimeDiffCardfunc : longestCardfunc
			const logEntry = "Status: " + n + " time: " + latestTimeDiffCardfunc + " timestamp: " + isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
			// cardFuncLog.push(logEntry)
			// console.log("Cardfunc: ", logEntry)
			console.log("Cardfunc: ", logEntry)
			return n + ';' + latestTimeDiffCardfunc
		})]).then(arr => {
			log += startTime + ";" + arr[0] + ";" + arr[1] + "\r\n"
		})
		await delay(3000)
		testNumber++
		if (testNumber >= numberOfTests) {
			let logEntry = "Shortest time diff: " + shortestPayfunc + " longest: " + longestPayfunc
			payFuncLog.push(logEntry)
			console.log("Payfunc: ", logEntry)
			logEntry = "Shortest time diff: " + shortestCardfunc + " longest: " + longestCardfunc
			cardFuncLog.push(logEntry)
			console.log("Cardfunc: ", logEntry)
		}
	}

	const timeStamp = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
	if (fs.existsSync("responseTimes.txt"))
		fs.renameSync("responseTimes.txt", "OLD_responseTimes_" + timeStamp + ".txt")
	fs.writeFileSync("responseTimes.txt", log)
	// if (fs.existsSync("responseTimesPayfunc.txt"))
	// 	fs.renameSync("responseTimesPayfunc.txt", "OLD_responseTimesPayfunc_" + timeStamp + ".txt")
	// fs.writeFileSync("responseTimesPayfunc.txt", payFuncLog.map(s => { return "\r\n" + s }).toString())
	// if (fs.existsSync("responseTimesCardfunc.txt"))
	// 	fs.renameSync("responseTimesCardfunc.txt", "OLD_responseTimesCardfunc_" + timeStamp + ".txt")
	// fs.writeFileSync("responseTimesCardfunc.txt", cardFuncLog.map(s => { return "\r\n" + s }).toString())

	console.log('done?')
})()

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function pingServer(address: string): Promise<number> {
	return fetch(address).then(async (r) => { return r.status })
}

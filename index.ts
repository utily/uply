#!/usr/bin/env node

import * as isoly from "isoly"
import { performance } from "perf_hooks"
import { default as fetch } from "node-fetch"
import * as fs from "fs"

(async () => {

	let testNumber = 0
	const numberOfTests = 300

	const testData = [
		{
			name: "pf.azure",
			url: "https://payfunc.azurewebsites.net/version/",
			latestTime: performance.now(),
			latestTimeDiff: 0,
			shortest: 100000,
			longest: 0,
			log: "",
		},
		{
			name: "pf3.azur",
			url: "https://payfunc3.azurewebsites.net/version/",
			latestTime: performance.now(),
			latestTimeDiff: 0,
			shortest: 100000,
			longest: 0,
			log: "",
		}
	]

	let log = ""

	while (testNumber < numberOfTests) {
		const startTime = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
		testData.map(data => data.latestTime = performance.now())
		Promise.all(testData.map(async data =>
			pingServer(data.url).then(n => {
				data.latestTimeDiff = performance.now() - data.latestTime
				data.shortest = data.latestTimeDiff < data.shortest ? data.latestTimeDiff : data.shortest
				data.longest = data.latestTimeDiff > data.longest ? data.latestTimeDiff : data.longest
				const logEntry = "Status: " + n + " time: " + data.latestTimeDiff.toFixed() + " timestamp: " + isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
				console.log(data.name, ": ", logEntry)
				return data.latestTimeDiff.toFixed()
			})
		)).then(arr => {
			log += startTime + ";" + arr.join(";") + "\r\n"
		})
		await delay(2000)
		testNumber++
		if (testNumber >= numberOfTests) {
			testData.map(data => {
				const logEntry = "Shortest time diff: " + data.shortest + " longest: " + data.longest
				data.log += logEntry
				console.log(data.name, ": ", logEntry)
			})
		}
	}

	const timeStamp = isoly.DateTime.localize(isoly.DateTime.parse(isoly.DateTime.now()), "sv")
	if (fs.existsSync("responseTimes.txt"))
		fs.renameSync("responseTimes.txt", "OLD_responseTimes_" + timeStamp + ".txt")
	fs.writeFileSync("responseTimes.txt", log)
})()

function delay(ms: number) {
	return new Promise(resolve => setTimeout(resolve, ms))
}

async function pingServer(address: string): Promise<number> {
	return fetch(address).then(async (r) => { return r.status })
}

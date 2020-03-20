#!/usr/bin/env node

import * as isoly from "isoly"
import { performance } from "perf_hooks"
import { default as fetch } from "node-fetch"

const argument = process.argv.slice(2)

let interval = Number.parseInt(argument[0])
if (interval == Number.NaN)
	interval = 3600
else
	argument.shift()
const endpoints = argument

if (endpoints.length == 0)
	console.error("No endpoint url:s given.")
else {
	console.error("starting")
	console.log(["started", ...endpoints].join(","))
	const timer = setInterval(async () => {
		const started = isoly.DateTime.now()
		const start = performance.now()
		const responses = await Promise.all(endpoints.map(async url => {
			const response = await fetch(url)
			const _ = await response.text()
			return performance.now() - start
		}))
		console.log([started, ...responses].join(","))
	}, interval)

	process.once("SIGINT", _ => {
		clearInterval(timer)
		console.error("shutting down")
	})
}
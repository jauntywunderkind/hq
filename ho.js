#!/usr/bin/env node
"use module"
import Jsdom from "jsdom"

export async function readStdin( opts= {}){
	if( opts.text){
		return opts.text
	}
	let stdin= opts.stdin
	if( !stdin){
		let process_= opts.process
		if( !process_){
			process_= process
		}
		stdin= process_.stdin
	}

	let buf= []
	for await( const b of stdin){
		buf.push( b)
	}
	return buf.join("")
}

function attr( attrs){
	if( !attrs){
		return
	}
	let value= {}
	for( let attr of attrs){
		value[ attr.name]= attr.value
	}
	return value
}

const map= Array.prototype.map

export function ho( frag){
	if( !frag.tagName&& frag.children&& frag.children.length=== 1){
		return ho( frag.children[ 0])
	}
	return [
		frag.tagName && frag.tagName.toLowerCase(),
		attr( frag.attributes),
		...map.call( frag.children, ho)
	]
}

export async function main( opts= {}){
	const
		text= await readStdin( opts),
		dom= new Jsdom.JSDOM( text),
		out= ho( dom.window.document)
	console.log( JSON.stringify( out, null, "\t"))
}
if( typeof process!== "undefined"&& `file://${ process.argv[ 1]}`=== import.meta.url){
	main()
}

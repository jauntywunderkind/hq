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

function findFragment( html){
	if( html.querySelectorAll){
		return html
	}
	if( html.window&& html.window.document){
		return html.window.document.body
	}
	throw new Error( "no document")
}

export function htmlQuerySelector( htmls, ...selectors){
	if( !htmls.length){
		htmls=[ htmls]
	}
	let
		cur= htmls,
		next
	for( let selector of selectors){
		next= []
		for( let html of cur){
			if( !html.querySelectorAll){
				if( html.window.document.body){
					html= html.window.document.body
				}else{
					throw new Error( "could not find fragment")
				}
			}
			let found= html.querySelectorAll( selector)
			next.push( ...found)
		}
		cur= next
	}
	return cur
}

export async function main( opts= {}){
	let selectors= opts.selectors
	if( !selectors){
		let argv= opts.argv
		if( !argv){
			let process_= opts.process
			if( !process_){
				process_= process
			}
			if( !process_){
				throw new Error( "could not find selectors")
			}
			argv= process.argv
		}
		selectors=argv.slice( 2)
	}

	const
		text= await readStdin( opts),
		dom= new Jsdom.JSDOM( text),
		out= htmlQuerySelector( dom, ...selectors)
	for( let o of out){
		console.log( findFragment( o).outerHTML)
	}
}
if( typeof process!== "undefined"&& `file://${ process.argv[ 1]}`=== import.meta.url){
	main()
}

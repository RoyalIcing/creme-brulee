const Remarkable = require('remarkable')

const md = new Remarkable('full', {
	html: false,
	xhtmlOut: false,
	breaks: false,
})

const renderMarkdown = (input) => md.render(input) 

module.exports = renderMarkdown 

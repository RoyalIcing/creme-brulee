import R from 'ramda'
import React from 'react'
import seeds, { Seed } from 'react-seeds'
import rgba from 'react-sow/rgba'
import repeatString from 'lodash/repeat'

import { renderTreeUsing } from './render'
import divider from './divider'
import JSONComponent from './JSONComponent'

const isPassword = (tags, mentions, title) => (
	[
		R.has('password', tags),
		R.test(/\bpassword\b/i, title)
	].some(Boolean)
)

export const field = (tags, mentions, title) => (
	<label>
		<span children={ title } style={{ display: 'block' }} />
		<input type={ isPassword(tags, title) ? 'password' : 'text' } />
	</label>
)

export const button = (tags, mentions, title) => (
	<Seed Component='button'
		shrink={ 0 }
		margin={{ bottom: '0.5rem' }}
		maxWidth='20em'
		children={ title }
	/>
)
export const cta = button

const wrapTextForTags = (tags, element, renderContent) => {
	if (R.has('link', tags)) {
		const url = renderContent(tags.link)
		//const url = tags.link.text
		return (
			<a href={ url } children={ element } />
		)
	}
	else {
		return element
	}
}

const wrapInInline = (tags, element) => {
	if (R.has('small', tags)) {
		element =  (
			<small children={ element } />
		)
	}

	return element
}

export const text = (tags, mentions, content, children, Element, renderContent) => {
	const [Component, fontSize, textAlign] = (
		R.has('primary', tags) ? (
			['h1', '2em', 'center']
		) : R.has('secondary', tags) ? (
			['h2', '1.5em', 'center']
		) : R.has('tertiary', tags) ? (
			['h3', '1.25em', 'center']
		) : (
			['p', '1em', 'left']
		)
	)

	return wrapTextForTags(
		tags,
		(
			<Seed Component={ Component }
				maxWidth='30rem'
				margin={ 0 }
				text={{ align: textAlign }}
				font={{ size: fontSize }}
				children={ wrapInInline(tags, content) }
			/>
		),
		renderContent
	)
}

const imageHeight = 150
const imageBackground = { color: rgba.whiteValue(0, 0.1) }

const unsplashURLForKeywords = R.pipe(
	R.ifElse(
		R.is(String),
		(keywords) => `/800x600?${keywords}`,
		R.always(`/800x600?`)
	),
	R.concat('https://source.unsplash.com')
)

const UnsplashImage = React.createClass({
	getInitialState() {
		const url = unsplashURLForKeywords(this.props.category)
		return {
			url,
			refreshCount: 0
		}
	},

	onRefresh() {
		this.setState(({ refreshCount }, { category }) => {
			refreshCount += 1
			const url = `${ unsplashURLForKeywords(category) }${ repeatString(',', refreshCount) }`
			return ({
				url,
				refreshCount
			})
		})
	},

	render() {
		const { text } = this.props
		const { url, refreshCount } = this.state;
		return (
			<img key={ refreshCount } src={ url } alt={ text }
				style={{ width: '100%', height: 'auto' }}
				onClick={ this.onRefresh }
			/>
		)
	}
})

const imageContent = (tags, text, resolveContent) => {
	if (R.has('unsplash', tags)) {
		return (
			<UnsplashImage category={ resolveContent(tags['unsplash']) } text={ text } />
		)
	}
	else {
		return (
			<Seed column justifyContent='center'
				minHeight={ imageHeight }
				font={{ style: 'italic' }}
				background={ imageBackground }
				children={ text }
			/>
		)
	}
}

export const image = (tags, mentions, text, children, Element, resolveContent) => {
	return (
		<Seed Component='figure' column
			grow={ 1 } width='100%'
			text={{ align: 'center' }}
			children={(
				R.has('nocaption', tags) ? (
					imageContent(tags, text, resolveContent)
				) : ([
					imageContent(tags, null, resolveContent),
					<Seed key='caption' Component='figcaption'
						text={{ lineHeight: '1.3' }}
						font={{ style: 'italic' }}
						children={ text }
					/>
				])
			)}
		/>
	)
}

export const video = (tags, mentions, content) => (
	<Seed Component='figure' column
		grow={ 1 } alignItems='center' justifyContent='center'
		width='100%' height={ 0 }
		padding={{ top: `${9 / 16 / 2 * 100}%`, bottom: `${9 / 16 / 2 * 100}%` }}
		background={{ color: rgba.whiteValue(0, 0.1) }}
		children='▶'
	/>
)

export const quote = (tags, mentions, text) => (
	<Seed Component='blockquote' children={ text } />
)

export const code = (tags, references, text, children, Element, resolveContent) => (
	<Seed Component='pre'
		maxWidth='100%'
		overflow='scroll'
	>
		<Seed Component='code'
			children={ references[0] || text }
		/>
	</Seed>
)

const hexColorRegex = /^[a-fA-F09]{3,6}$/

export const swatch = (tags, mentions, content, children, Element, renderContent) => (
	<Seed
		width={
			R.cond([
				[ R.has('width'), R.pipe(R.prop('width'), renderContent) ],
				[ R.has('size'), R.pipe(R.prop('size'), renderContent) ],
				[ R.T, R.always(32) ]
			])(tags)
		}
		height={
			R.cond([
				[ R.has('height'), R.pipe(R.prop('height'), renderContent) ],
				[ R.has('size'), R.pipe(R.prop('size'), renderContent) ],
				[ R.T, R.always(32) ]
			])(tags)
		}
		background={{
			color: R.when(
				R.isEmpty,
				R.always(R.find(R.test(hexColorRegex), tags)),
				content
			)
		}}
	/>
)

export const list = (tags, mentions, content, children, Element) => {
	const Component = R.propEq('ordered', true, tags) ? 'ol' : 'ul'
	return (
		<Seed Component={ Component } margin={ 0 } padding={ 0 }>
		{
			children.map((element, index) => (
				<li key={ index }>
					<Element { ...element } />
				</li>
			))
		}
		</Seed>
	)
}

export const nav = (tags, mentions, content, children, renderElement, renderContent) => (
	<Seed Component='nav'
		row reverse={ R.has('reverse', tags) } justifyContent='center'
	>
	{ // Render content, interleaving an optional divider
		R.pipe(
			R.converge(R.concat, [
				R.pipe(
					R.init,
					R.chain(R.pipe(
						renderElement,
						R.of,
						R.append(divider(
							R.defaultTo(8, R.unless(
								R.isNil,
								renderContent,
								tags['divider']
							))
						))
					))
				),
				R.pipe(
					R.last,
					renderElement
				)
			])
		)(children)
	}
	</Seed>
)

export const columns = (tags, mentions, content, children, Element) => (
	<Seed row wrap reverse={ R.has('reverse', tags) } justifyContent='space-around'>
	{
		children.map((element, index) => (
			<Element key={ index } { ...element } />
		))
	}
	</Seed>
)

export const record = (tags, mentions, text, children, Element, renderContent) => {
	if (mentions.length > 0) {
		return (
			<JSONComponent isDeserialized={ true } json={ mentions[0] } />
		)
	}
	else {
		return (
			<JSONComponent isDeserialized={ true } json={ text } />
		)
	}
}

export const gist = (tags, mentions, text, children, Element, renderContent) => (
	<script src={ (mentions[0] || text) + '.js' } />
)

export const fallback = (tags, mentions, content, children, Element, renderContent) => (
	R.isEmpty(mentions) ? (
		text(tags, mentions, content, children, Element, renderContent)
	) : R.allPass([R.propEq('length', 1), R.propSatisfies(R.is(String), 0)])(mentions) ? (
		text(tags, [], mentions[0], children, Element, renderContent)
	) : (
		record(tags, mentions, content, children, Element, renderContent)
	)
)

const elementRendererForTags = R.cond([
	[ R.has('field'), R.curry(field) ],
	[ R.has('button'), R.curry(button) ],
	[ R.has('cta'), R.curry(cta) ],
	[ R.has('quote'), R.curry(quote) ],
	[ R.has('image'), R.curry(image) ],
	[ R.has('video'), R.curry(video) ],
	[ R.has('text'), R.curry(text) ],
	[ R.has('code'), R.curry(code) ],
	[ R.has('swatch'), R.curry(swatch) ],
	[ R.has('columns'), R.curry(columns) ],
	[ R.has('nav'), R.curry(nav) ],
	[ R.has('list'), R.curry(list) ],
	[ R.has('record'), R.curry(record) ],
	[ R.has('gist'), R.curry(gist) ],
	[ R.T, R.curry(fallback) ]
])

export const Preview = renderTreeUsing({
	elementRendererForTags
})

export function init() {
}

export const title = 'Vanilla'

export function head() {
	return (
		<head>
			<style children={`
html {
	height: 100%;
	background-color: #fdfdfd;
}
html, h1, input, button {
	font-family: 'Lato', sans-serif;
}
body {
	height: 100%;
	margin: 0;
}
`} />
		</head>
	)
}

export function deinit() {
}

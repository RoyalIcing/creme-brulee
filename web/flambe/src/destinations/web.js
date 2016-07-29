import R from 'ramda'
import React from 'react'
import seeds, { Seed } from 'react-seeds'
import rgba from 'react-sow/rgba'

import resolveReferences from '../resolveReferences'

const isPassword = (tags, mentions, title) => (
	R.test(/\bpassword\b/i, title)
)

export const field = (tags, mentions, title) => (
	<label>
		<span children={ title } style={{ display: 'block' }} />
		<input type={ isPassword(tags, title) ? 'password' : 'text' } />
	</label>
)

export const button = (tags, mentions, title) => (
	<Seed Component='button'
		margin={{ bottom: '0.5rem' }}
		children={ title }
	/>
)
export const cta = button

export const text = (tags, mentions, content) => (
	<span children={ content } />
)

export const heading = (tags, mentions, content) => {
	const Component = (
		R.contains('#primary', mentions) ? (
			'h1'
		) : (
			'h2'
		)
	)

	return (
		<Seed Component={ Component }
			children={ content }
			margin={ 0 }
		/>
	)
}

export const image = (tags, mentions, content) => (
	<Seed column
		grow={ 1 } width='100%' minHeight={ 150 }
		background={{ color: rgba.whiteValue(0, 0.1) }}
	/>
)

export const video = (tags, mentions, content) => (
	<Seed column
		grow={ 1 } alignItems='center' justifyContent='center'
		width='100%' minHeight={ 150 }
		background={{ color: rgba.whiteValue(0, 0.1) }}
		children='▶'
	/>
)

export const fallback = (tags, mentions, content) => (
	R.isEmpty(mentions) ? (
		text(tags, mentions, content)
	) : (
		mentions[0]
	)
)

const elementRendererForTags = R.cond([
	[ R.contains('#field'), R.curry(field) ],
	[ R.contains('#button'), R.curry(button) ],
	[ R.contains('#cta'), R.curry(cta) ],
	[ R.contains('#image'), R.curry(image) ],
	[ R.contains('#video'), R.curry(video) ],
	[ R.contains('#heading'), R.curry(heading) ],
	[ R.contains('#text'), R.curry(text) ],
	[ R.T, R.curry(fallback) ]
])

const Line = (elements) => (
	<Seed column alignItems='center' children={ elements } />
)

const Section = (elements) => (
	<Seed Component='section'
		column margin={{ bottom: '2rem' }}
		children={ elements }
	/>
)

export function renderTree({ ingredients, contentTree }) {
	return R.map(R.pipe( // sections
		R.map(R.converge( // elements
			R.call, [
				R.pipe(
					R.prop('tags'),
					elementRendererForTags
				),
				R.pipe(
					R.prop('references'),
					resolveReferences(ingredients)
				),
				R.prop('name')
			]
		)),
		Section
	))(contentTree)
}

export function init() {

}

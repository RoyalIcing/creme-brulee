const R = require('ramda')
const URL = require('url')
const Joi = require('joi')
const replyPromise = require('./pre/replyPromise')
const joiPromise = require('../utils/joiPromise')
const validations = require('./validations')
const preItemContent = require('./pre/itemContent')
const { promiseItemContent, promiseStreamOfItemContent } = require('../services/cloudant/find')
const { autoRenderer } = require('../renderers')
const { conformerForFormat } = require('../conformers') 
const { applyTransforms } = require('../transforms')
const defaultTemplate = require('../templates/default')

const v = '1'

module.exports = [
	{
		method: 'POST',
		path: `/${v}/transform/{inputFormat}/@{organization}/{sha256}`,
		config: {
			pre: [
				{
					method: replyPromise(preItemContent('organization', 'sha256')),
					assign: 'itemContent' 
				}
			],
			validate: {
				payload: Joi.compile({
					transforms: validations.transforms
				})
			}
		},
		handler(request, reply) {
			reply(
				Promise.resolve(request.pre.itemContent)
				.then(
					conformerForFormat(request.params.inputFormat, {})
				)	
				.then(
					applyTransforms(request.payload.transforms)
				)
			)
		}
	},
	{
		method: 'POST',
		path: `/${v}/transform/{inputFormat}/preview/@{account}/{sha256}`,
		handler(request, reply) {
			reply(
				promiseItemContent(request.params)
				.then(
					conformerForFormat(request.params.inputFormat, {})
				)
				.then(
					applyTransforms(request.payload.transforms || [])
				)
				.then(
					autoRenderer({
						imgixURLForImagePath: (imagePath, options) => (
							URL.format({
								pathname: `/${v}/preview/image/find/@${request.params.account}/${request.query.index}/${imagePath}`,
								query: options
							})
							/*imgix.buildURL(
								`/${v}/find/@${request.params.account}/${request.query.index}/${imagePath}`,
								options
							)*/
						),
						title: request.params.sha256,
						theme: 'gardenWhite',
					})
				)
				.then(defaultTemplate)
				.catch((error) => {
					console.error(error)
					throw error
				})
			)
		}
	}
]
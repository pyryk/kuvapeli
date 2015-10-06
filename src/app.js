import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';
import styles from './app.css';
import _ from 'lodash';

function h2(selector, ...args) {
	let [element, ...ids] = selector.split('.');
	

	return h.apply(h, [element + ids.map(id => '.' + styles[id])].concat(args));
}

const debug = (label) => (...args) => console.log.apply(console, [label].concat(args));

const images = _.shuffle([
	{
		url: 'http://pkroger.org/pkro-futu-mv.jpg',
		answer: 'pyry'
	},
	{
		url: 'https://avatars2.githubusercontent.com/u/631969?v=3&s=460',
		answer: 'pyry taas'
	},
	{
		url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Sunflower_sky_backdrop.jpg/1024px-Sunflower_sky_backdrop.jpg',
		answer: 'auringonkukka'
	}

let value;
]);

function main({DOM}) {
	let inputValue$ = DOM.select('#answer').events('input')
		.map(ev => { console.log('inputValue$'); return ev.target.value; })
		.startWith('')
		.map(v => { value = v; return v; });

	let submit$ = DOM.select('#answer').events('keypress')
		.map(ev => ev.keyCode)
		.filter(code => {
			console.log('submit', code);
			return code === 13;
		});

	let image$ = submit$
		.do(debug('afterSubmit'))

		.map((code, i) => i)
		.do(debug('afterMapI'))

		.map(count => images[count % images.length])
		.do(debug('afterMapImage'))

		//.scan((prev, current) => { console.log('scan', prev, current); return prev; })
		//.do(debug('afterScan'))

		.filter(image => {
			console.log(image && image.answer, value);
			return !image || image.answer === value; // TODO toLowerCase trim
		})
		.do(debug('afterFilter'))

		.map(image => images[(images.indexOf(image) + 1) % images.length])
		.do(debug('afterMapToNext'))

		.startWith(images[0]);
	
	let state$ = Cycle.Rx.Observable.combineLatest(
		inputValue$,
		image$
	).map(([value, image]) => {
			return {value, image};
		});

	return {
		DOM: state$.map(({value, image}) => {
			console.log('render', {value, image});
			return h2('div.app', [
				h('div', [
					h2('img.question-image', {src: image.url})
				]),
				h('div', [
					h2('h2.question', ['Mikä on kuvassa?']),
					h('input#answer', {value})
				])
			]);
		})
	};
}

var drivers = {
	DOM: makeDOMDriver('#app')
};

Cycle.run(main, drivers);

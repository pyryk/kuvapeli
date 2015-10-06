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
]);

function main({DOM}) {
	let inputValue$ = DOM.select('#answer').events('input')
		.map(ev => { console.log('inputValue$'); return ev.target.value; })
		.startWith('')
		.map(v => { return v; });

	let submit$ = DOM.select('#answer').events('keypress')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.withLatestFrom(inputValue$, (code, value) => value);

	let image$ = submit$
		.do(debug('afterSubmit'))

		.map((code, i) => i)
		.do(debug('afterMapI'))

		.map(count => images[count % images.length])
		.do(debug('afterMapImage'))

		.do(debug('afterFilter'))

		.map(image => images[(images.indexOf(image) + 1) % images.length])
		.do(debug('afterMapToNext'))

		.startWith(images[0]);

	let previousImage$ = image$
		.pairwise()
		.map(([previous]) => previous);

	let correctAnswer$ = submit$
		.withLatestFrom(
			previousImage$,
			(value, image) => image.answer === value
		).startWith(false);
	
	let state$ = Cycle.Rx.Observable.combineLatest(
		inputValue$,
		image$,
		correctAnswer$
	).map(([value, image, correct]) => {
			return {value, image, correct};
	});

	return {
		DOM: state$.map((props) => {
			console.log('render', props);
			return h2('div.app', [
				h('div', [
					h2('img.question-image', {src: props.image.url})
				]),
				h('div', [
					h2('h2.question', ['Mikä on kuvassa?']),
					h2(`p.answer-correct-status.${props.correct ? 'good' : 'bad'}`, [props.correct ? 'Oikein!' : 'Väärin!']),
					h2('input#answer', {value: props.value})
				])
			]);
		})
	};
}

var drivers = {
	DOM: makeDOMDriver('#app')
};

Cycle.run(main, drivers);

import Cycle from '@cycle/core';
import Rx from 'rx';
import { h, makeDOMDriver } from '@cycle/dom';
import styles from './app.css';
import { tabs } from './tabs';
import { setup } from './setup';
import vdomCss from './css-modules-vdom';
import ss from 'seededshuffle';

const h2 = vdomCss(styles);

const debug = (label) => (...args) => console.log(...[label].concat(args));

// NOTE this is a quick workaround for a bug which causes image$ and
// previousImage$ to go out of sync when the shuffling is indeterministic
const shuffleSeed = Date.now();

function main({ DOM }) {
	const setupPanel = setup({ DOM });

	const shuffledImages$ = setupPanel.value$
		.map(images => ss.shuffle(images, shuffleSeed, true));

	const inputValue$ = DOM.select('#answer').events('input')
		.map(ev => ev.target.value)
		.startWith('');

	console.log(DOM.select('#answer'));
	const submit$ = DOM.select('#answer').events('keyup')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.withLatestFrom(inputValue$, (code, value) => value)
		.startWith(null);

	const image$ = submit$
		.do(debug('submit'))
		.map((code, i) => i)
		.combineLatest(shuffledImages$, (count, images) => { console.log('current images', images); return images[count % images.length]; })
		.startWith(undefined);

	const previousImage$ = image$
		.pairwise()
		.map(([previous]) => previous)
		.do(debug('previousImage'));

	const correctAnswer$ = previousImage$
		.withLatestFrom(
			inputValue$,
			(image, value) => image ? image.answer === value : undefined
		);

	const state$ = Rx.Observable.combineLatest(
		inputValue$,
		image$,
		previousImage$,
		correctAnswer$
	).map(([value, image, previousImage, correct]) => {
		return { value, image, previousImage, correct };
	});

	// TODO extract actual game
	function tabChildren(props, setupDOM) {
		console.log('props', props);
		return [
			h('div', [
				setupDOM
			]),
			h('div', getGame(props))
		];
	}

	function getGame(props) {
		return [
			h('div', [
				props.image ? h2('img.question-image', { src: props.image.url }) : 'Lisää kuvia setup-välilehdeltä'
			]),
			h2('h2.question', ['Mikä on kuvassa?']),
			props.correct !== undefined ?
				h2(`p.answer-correct-status.${props.correct ? 'good' : 'bad'}`,
					[props.correct ? 'Oikein!' : `Väärin! Oikea vastaus oli ${props.previousImage.answer}.`]) :
				h(`p.answer-correct-status`),
			h2('input#answer', { autofocus: true })
		];
	}

	const tabProps$ = state$.combineLatest(setupPanel.DOM,
		(props, setupVTree) => ({ default: 'tab1', children: tabChildren(props, setupVTree) }));
	const tabPanel = tabs({ DOM, props$: tabProps$ });

	return {
		DOM: state$.combineLatest(tabPanel.DOM, (props, tabsVTree) => {
			return h2('div.app', [
				h('h1', 'Kuvapeli'),
				tabsVTree
			]);
		})
	};
}

const drivers = {
	DOM: makeDOMDriver('#app')
};

Cycle.run(main, drivers);

import Cycle from '@cycle/core';
import Rx from 'rx';
import { h, makeDOMDriver } from '@cycle/dom';
import styles from './app.css';
import { tabs } from './tabs';
import { setup } from './setup';
import vdomCss from './css-modules-vdom';

const h2 = vdomCss(styles);

const debug = (label) => (...args) => console.log(...[label].concat(args));

function main({ DOM }) {
	const setupPanel = setup({ DOM, props$: Rx.Observable.just({ label: 'Height', unit: 'cm', initial: [] }) }, '.height');

	const inputValue$ = DOM.select('#answer').events('input')
		.map(ev => ev.target.value)
		.startWith('');

	const submit$ = DOM.select('#answer').events('keypress')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.throttle(200)
		.do(debug('enter pressed'))
		.withLatestFrom(inputValue$, (code, value) => value)
		.startWith(null);

	const image$ = submit$
		.do(debug('submit'))
		.map((code, i) => i)
		.combineLatest(setupPanel.value$, (count, images) => images[count % images.length])
		.startWith(undefined);

	const previousImage$ = image$
		.pairwise()
		.do(a => console.log('previousImage', a))
		.map(([previous]) => previous);

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
		console.log('state:', arguments);
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
			h2('input#answer', { value: props.value, autofocus: true })
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

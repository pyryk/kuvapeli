import Cycle from '@cycle/core';
import { h, makeDOMDriver } from '@cycle/dom';
import styles from './app.css';
import { tabs } from './tabs';
import { setup } from './setup';
import vdomCss from './css-modules-vdom';

const h2 = vdomCss(styles);

const debug = (label) => (...args) => console.log(...[label].concat(args));

function main({ DOM }) {
	const setupPanel = setup({ DOM, props$: Cycle.Rx.Observable.just({ label: 'Height', unit: 'cm', initial: [] }) }, '.height');

	const startGame$ = DOM.select('.start-game').events('click')
		.map(() => true)
		.do(debug('startGame'))
		.startWith(false);

	const inputValue$ = DOM.select('#answer').events('input')
		.map(ev => { console.log('inputValue$'); return ev.target.value; })
		.startWith('');

	const submit$ = DOM.select('#answer').events('keypress')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.withLatestFrom(inputValue$, (code, value) => value);

	const image$ = submit$
		.merge(startGame$, (image) => image) // trigger re-render with every startGame click
		.map((code, i) => i)
		.withLatestFrom(setupPanel.value$, (count, images) => images[count % images.length])
		.startWith(undefined);

	const previousImage$ = image$
		.pairwise()
		.map(([previous]) => previous);

	const correctAnswer$ = submit$
		.withLatestFrom(
			previousImage$,
			(value, image) => image.answer === value
		).startWith(undefined);

	const state$ = Cycle.Rx.Observable.combineLatest(
		inputValue$,
		image$,
		previousImage$,
		correctAnswer$,
		startGame$
	).map(([value, image, previousImage, correct, startGame]) => {
		return { value, image, previousImage, correct, startGame };
	});

	// TODO extract actual game
	function tabChildren(props, setupDOM) {
		console.log(props);
		return [
			h('div', [
				setupDOM
			]),
			h('div', props.startGame ? getGame(props) : h('input.start-game', { type: 'button', value: 'Aloita peli' }))
		];
	}

	function getGame(props) {
		return [
			h('div', [
				h2('img.question-image', { src: props.image.url })
			]),
			h2('h2.question', ['Mikä on kuvassa?']),
			props.correct !== undefined ?
				h2(`p.answer-correct-status.${props.correct ? 'good' : 'bad'}`,
					[props.correct ? 'Oikein!' : `Väärin! Oikea vastaus oli ${props.previousImage.answer}.`]) :
				undefined,
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

import Cycle from '@cycle/core';
import {h, makeDOMDriver} from '@cycle/dom';
import styles from './app.css';
import {tabs} from './tabs';
import {setup} from './setup';
import vdomCss from './css-modules-vdom';

const h2 = vdomCss(styles);

const debug = (label) => (...args) => console.log(...[label].concat(args));

function main({DOM}) {
	let setupPanel = setup({DOM, props$: Cycle.Rx.Observable.just({label: 'Height', unit: 'cm', initial: []})}, '.height');

	let startGame$ = DOM.select('.start-game').events('click')
		.map(() => true)
		.do(debug('startGame'))
		.startWith(false);

	let inputValue$ = DOM.select('#answer').events('input')
		.map(ev => { console.log('inputValue$'); return ev.target.value; })
		.startWith('');

	let submit$ = DOM.select('#answer').events('keypress')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.withLatestFrom(inputValue$, (code, value) => value);

	let image$ = submit$
		.merge(startGame$, (image) => {
			return image;
		})
		.do(debug('afterSubmit'))

		.map((code, i) => i)
		.do(debug('afterMapI'))

		.withLatestFrom(setupPanel.value$, (count, images) => images[count % images.length])
		.do(debug('afterMapImage'))

		.do(debug('afterFilter'))

		.do(debug('afterMapToNext'))

		.startWith(undefined);

	let previousImage$ = image$
		.pairwise()
		.map(([previous]) => previous);

	let correctAnswer$ = submit$
		.withLatestFrom(
			previousImage$,
			(value, image) => image.answer === value
		).startWith(undefined);
	
	let state$ = Cycle.Rx.Observable.combineLatest(
		inputValue$,
		image$,
		correctAnswer$,
		startGame$
	).map(([value, image, correct, startGame]) => {
		return {value, image, correct, startGame};
	});

	// TODO extract actual game
	function tabChildren(props, setup) {
		console.log(props);
		return [
			h('div', [
				setup
			]),
			h('div', props.startGame ? getGame(props) : h('input.start-game', {type: 'button', value: 'Aloita peli'}))
		];
	}

	function getGame(props) {
		return [
			h('div', [
				h2('img.question-image', {src: props.image.url})
			]),
			h2('h2.question', ['Mikä on kuvassa?']),
			props.correct !== undefined ?
				h2(`p.answer-correct-status.${props.correct ? 'good' : 'bad'}`, 
					[props.correct ? 'Oikein!' : 'Väärin!']) :
				undefined,
			h2('input#answer', {value: props.value, autofocus: true})
		];
	}

	let tabProps$ = state$.combineLatest(setupPanel.DOM, 
		(props, setupVTree) => ({default: 'tab1', children: tabChildren(props, setupVTree)}));
	let tabPanel = tabs({DOM, props$: tabProps$});

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

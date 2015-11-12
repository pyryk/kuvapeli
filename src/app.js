import Cycle from '@cycle/core';
import Rx from 'rx';
import { h, makeDOMDriver } from '@cycle/dom';
import styles from './app.css';
import { tabs } from './tabs';
import { setup } from './setup';
import vdomCss from './css-modules-vdom';
import ss from 'seededshuffle';

const h2 = vdomCss(styles);

const correctStates = {
	CORRECT: 'CORRECT',
	PARTLY: 'PARTLY',
	INCORRECT: 'INCORRECT'
};

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

	const submit$ = DOM.select('#answer').events('keyup')
		.map(ev => ev.keyCode)
		.filter(code => code === 13)
		.withLatestFrom(inputValue$, (code, value) => value)
		.startWith(null);

	const image$ = submit$
		.do(debug('submit'))
		.map((code, i) => i)
		.combineLatest(shuffledImages$, (count, images) => {
			if (count < images.length || images.length === 0) {
				return images[count];
			} else {
				return { done: true, answer: '', url: '' };
			}
		})
		.startWith(undefined);

	const previousImage$ = image$
		.pairwise()
		.map(([previous]) => previous);

	const correctAnswer$ = previousImage$
		.withLatestFrom(
			inputValue$,
			(image, value) => {
				if (image) {
					const imageNormalized = image.answer.normalize();
					const valueNormalized = value.normalize();
					if (imageNormalized === valueNormalized) {
						return correctStates.CORRECT;
					} else if (imageNormalized.indexOf(valueNormalized) > -1 || valueNormalized.indexOf(imageNormalized) > -1) {
						return correctStates.PARTLY;
					} else {
						return correctStates.INCORRECT;
					}
				} else {
					return undefined;
				}
			}
		);

	const stats$ = correctAnswer$
		.filter(value => value !== undefined)
		.do(debug('stats filter'))
		.scan((memo, value) => { console.log(memo, value); return memo.concat(value); }, [])
		.do(debug('stats scan'))
		.startWith([])
		.do(debug('stats values'))
		.map(values => ({
			correct: values.filter(v => v === correctStates.CORRECT).length,
			partly: values.filter(v => v === correctStates.PARTLY).length,
			total: values.length }));

	const state$ = Rx.Observable.combineLatest(
		inputValue$,
		image$,
		previousImage$,
		correctAnswer$,
		stats$
	).map(([value, image, previousImage, correct, stats]) => {
		return { value, image, previousImage, correct, stats };
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

	function getImageEl(props) {
		if (props.image) {
			if (props.image.done) {
				return h2('div.game-over', `Peli ohi! Sait oikein ${props.stats.correct} ${props.stats.partly > 0 ? `( + ${props.stats.partly})` : ''} / ${props.stats.total} kuvaa.`);
			} else {
				return h2('img.question-image', { src: props.image.url });
			}
		} else {
			return 'Lisää kuvia setup-välilehdeltä';
		}
	}

	function getCorrectEl(correct, previousAnswer) {
		if (correct === undefined) {
			return h2(`p.answer-correct-status`);
		} else {
			const correctClasses = {
				[correctStates.CORRECT]: 'good',
				[correctStates.PARTLY]: 'semi',
				[correctStates.INCORRECT]: 'bad'
			};
			const correctTexts = {
				[correctStates.CORRECT]: 'Oikein!',
				[correctStates.PARTLY]: `Melkein! Oikea vataus oli ${previousAnswer}`,
				[correctStates.INCORRECT]: `Väärin! Oikea vataus oli ${previousAnswer}`
			};

			return h2(`p.answer-correct-status.${correctClasses[correct]}`, correctTexts[correct]);
		}
	}

	function getGame(props) {
		return [
			h('div', [
				getImageEl(props)
			]),
			h2('h2.question', ['Mikä on kuvassa?']),
			getCorrectEl(props.correct, props.previousImage ? props.previousImage.answer : undefined),
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

import { Rx } from '@cycle/core';
import { h } from '@cycle/dom';
import styles from './app.css';
//import vdCss  from './css-modules-vdom';
import hh from 'hyperscript-helpers';

const { div, h2, textarea } = hh(h);

//const h2 = vdCss(styles);

function generateAnswer(url) {
	return decodeURIComponent(url.substring(url.lastIndexOf('/') + 1, url.lastIndexOf('.')));
}

function dragenter(e) {
	console.log('dragenter', e);
	e.stopPropagation();
	e.preventDefault();
}

function dragover(e) {
	console.log('dragover', e);
	e.stopPropagation();
	e.preventDefault();
}

export function setup({ DOM, props$ }) {
	const initialValue$ = props$.map(props => props.initial).first();

	const newValue$ = DOM.select(`textarea`).events('change')
		.map(ev => ev.target.value.split(/\n/))
		.map(values => values.filter(v => !!v.trim()))
		.map(values => values.map(v => ({ url: v, answer: generateAnswer(v) })));

	const clicks$ = DOM.select('.drop-target').events('click').map((e, i) => i + 1).startWith(0);
	const dragEnter$ = DOM.select('.drop-target').events('dragenter').map(dragenter).startWith(undefined);
	const dragOver$ = DOM.select('.drop-target').events('dragover').map(dragover).startWith(undefined);

	console.log(clicks$);

	const dropped$ = DOM.select('.drop-target').events('drop')
		.map(e => {
			e.preventDefault();
			e.stopPropagation();
		})
		.map(() => 'public/sandels.jpg')
		.startWith([]);
	const value$ = initialValue$.concat(newValue$);
	const vtree$ = Rx.Observable.combineLatest(props$, value$, clicks$, dropped$, dragEnter$, dragOver$, (props, value, clicks, dropped) =>
		div(`.setup`, [
			h2('.label', [
				'Kuvat'
			]),
			textarea(`.${styles.images}`, {
				value: value.map(v => v.url).join('\n')
			}),
			div(`.${styles['drop-target']}.drop-target`, ['Tai raahaa tiedostot tähän', `Clicks: ${clicks}`, `${dropped}`])
		])
	);

	return {
		DOM: vtree$,
		value$
	};
}

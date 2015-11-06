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

export function setup({ DOM, props$ }) {
	const initialValue$ = props$.map(props => props.initial).first();
	const newValue$ = DOM.select(`textarea`).events('change')
		.map(ev => ev.target.value.split(/\n/))
		.map(values => values.filter(v => !!v.trim()))
		.map(values => values.map(v => ({ url: v, answer: generateAnswer(v) })));
	const value$ = initialValue$.concat(newValue$);
	const vtree$ = Rx.Observable.combineLatest(props$, value$, (props, value) =>
		div(`.setup`, [
			h2('.label', [
				'Kuvat'
			]),
			textarea(`.${styles.images}`, {
				value: value.map(v => v.url).join('\n')
			})
		])
	);

	return {
		DOM: vtree$,
		value$
	};
}

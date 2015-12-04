import Rx from 'rx';
import { h } from '@cycle/dom';
import vc from './css-modules-vdom';
import styles from './app.css';

const h2 = vc(styles, 'tab1', 'tab2');

export function tabs({ DOM, props$ }) {
	const initialValue$ = props$.map(props => props.default).first();

	// TODO make tab-number independent
	const tab1$ = DOM.select('.tab1').events('click').map(() => 'tab1');
	const tab2$ = DOM.select('.tab2').events('click').map(() => 'tab2');

	const value$ = initialValue$.concat(Rx.Observable.merge(tab1$, tab2$)).do(v => console.log(v));

	const vtree$ = Rx.Observable
		.combineLatest(props$, value$, (props, value) =>
			h(`div.tabs-container`, [
				h('div.container', value === 'tab1' ? props.children[0] : props.children[1]),
				value === 'tab1' ? h2(`button.to-game.tab2`, { disabled: !props.showNextButton }, ['Peli »']) : null
			])
		);

	return {
		DOM: vtree$,
		value$
	};
}

import { h } from '@cycle/dom';
import hh from 'hyperscript-helpers';
import styles from './hint.css';
import _ from 'lodash';

const { div, span, button } = hh(h);

const generateHint = (answer) => _.map(answer, (char, i) => {
	if (i === 0) {
		return char;
	} else if (char === ' ') { // TODO regex with all relevant letters?
		return char;
	} else {
		return '_';
	}
}).join('');

export function hint({ DOM, props }) {

	const show$ = DOM.select('.hint-display').events('click')
		.map(() => true)
		.startWith(false)
		.combineLatest(props.image$, (showHint, image) => ({ image: image ? image.answer : null, showHint }))
		.pairwise()
		.do((value) => console.log('hint value pre', value))
		.map(([previous, current]) => previous.image !== current.image ? false : current.showHint)
		.do((value) => console.log('hint value post', value))
		.startWith(false);

	const vtree$ = show$.combineLatest(props.image$, (value, image) => {
		console.log('hint vtree', value);
		return div(`.hint-container`, [
			span('.hint',
				value ? [
					'Vihje: ',
					span(`.actual-hint.${styles['actual-hint']}`, `${generateHint(image.answer)}`)
				] : ''
			),
			value ? null : button(`.hint-display.${styles['hint-display']}`, 'Näytä vihje')
		]
		);
	});

	return {
		DOM: vtree$,
		showing$: show$
	};
}

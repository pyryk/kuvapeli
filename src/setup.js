import Rx from 'rx';
import { h } from '@cycle/dom';
import styles from './app.css';
//import vdCss  from './css-modules-vdom';
import hh from 'hyperscript-helpers';

const { div, h2, textarea, img, a, ul, li } = hh(h);

//const h2 = vdCss(styles);

function generateAnswer(url, isUrlEncoded = true) {
	const nameStart = url.lastIndexOf('/') === -1 ? 0 : (url.lastIndexOf('/') + 1);
	const nameEnd = url.lastIndexOf('.') === -1 ? (url.length) : url.lastIndexOf('.');
	if (isUrlEncoded) {
		return decodeURIComponent(url.substring(nameStart, nameEnd));
	} else {
		return url.substring(nameStart, nameEnd);
	}
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

export function setup({ DOM }) {

	const written$ = DOM.select(`textarea`).events('change')
		.map(ev => ev.target.value.split(/\n/))
		.map(values => values.filter(v => !!v.trim()))
		.map(values => values.map(v => ({ url: v, answer: generateAnswer(v, true) })))
		.do((values) => console.log('written', values))
		.startWith([]);

	const dragEnter$ = DOM.select('.' + styles['drop-target']).events('dragenter').map(dragenter).startWith(undefined);
	const dragOver$ = DOM.select('.' + styles['drop-target']).events('dragover').map(dragover).startWith(undefined);

	const dropped$ = DOM.select('.' + styles['drop-target']).events('drop')
		.map(e => {
			e.preventDefault();
			e.stopPropagation();
			return Array.from(e.dataTransfer.files);
		})
		.do(files => console.log('drop', files))
		.map(files => files.map(file => ({ url: URL.createObjectURL(file), answer: generateAnswer(file.name, false) })))
		.startWith([]);

	const value$ = written$
		.combineLatest(dropped$, (written, dropped) => written.concat(dropped))
		.do((...args) => console.log('setup images', ...args));

	const showFiles = (images) => {
		if (images && images.length > 0) {
			return ul(
				images.map(image => li([
					a({ href: image.url, target: '_blank' }, image.answer)
				]))
			);
		} else {
			return '';
		}
	};

	const vtree$ = Rx.Observable.combineLatest(value$, written$, dropped$, dragEnter$, dragOver$, (value, written, dropped) =>
		div(`.setup`, [
			h2('.label', [
				'Kuvat'
			]),
			div(`.${styles['drop-target']}.drop-target`, ['Raahaa tiedostot tähän ', showFiles(dropped)]),
			div(`.${styles['image-list']}.image-list`, value.map(image => img({ src: image.url, title: image.answer }))),
			div('.textarea-hint', 'Tai syötä kuvien URL:t alle'),
			textarea(`.${styles.images}`, {
				value: written.map(v => v.url).join('\n')
			})
		])
	);

	return {
		DOM: vtree$,
		value$
	};
}

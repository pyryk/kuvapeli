import Rx from 'rx';
import { h } from '@cycle/dom';
import styles from './app.css';
import hh from 'hyperscript-helpers';
import { preview } from './preview';

const { div, h2, h3, ol, ul, li, p } = hh(h);

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
				images.map((image, i) => li([
					preview({ DOM, props: { image$: Rx.Observable.just(image) }, i }).DOM
				]))
			);
		} else {
			return '';
		}
	};

	const vtree$ = Rx.Observable.combineLatest(value$, written$, dropped$, dragEnter$, dragOver$, (value, written, dropped) =>
		div(`.setup`, [
			h2('.label', [
				'Lisää kuvat'
			]),
			p('.instructions', 'Toistaiseksi kuvapeli toimii ainoastaan käyttäjän omilla tiedostoilla.'),
			h3('Ohjeet'),
			ol(`.instructions`, [
				li('.instructions-entry', 'Nimeä kuvat siten, että tiedostonimi on haluamasi vastaus (esim. jos kuvan oikea vastaus on "hauki", muuta tiedoston nimeksi hauki.jpg)'),
				li('.instructions-entry', 'Raahaa kaikki haluamasi kuvat alla olevaan laatikkoon'),
				li('.instructions-entry', 'Paina yläpuolelta Peli-nappia')
			]),
			div(`.${styles['drop-target']}.drop-target`, ['Raahaa kuvatiedostot tähän ', showFiles(dropped)])
		])
	);

	return {
		DOM: vtree$,
		value$
	};
}

import { h } from '@cycle/dom';
import hh from 'hyperscript-helpers';
import styles from './preview.css';

const { div, img } = hh(h);

export function preview({ props }) {

	const vtree$ = props.image$.map((image) => {
		return div(`.preview-container`, [
			div(`.preview-trigger.${styles['preview-trigger']}`, [
				image.answer,
				div(`.preview-image-container.${styles['preview-image-container']}`,
					img(`.preview-image.${styles['preview-image']}`, { src: image.url })
				)
			])
		]);
	});

	return {
		DOM: vtree$
	};
}

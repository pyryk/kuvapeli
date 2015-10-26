import {h} from '@cycle/dom';

export default (styles) => function h2(selector, ...args) {
	let [element, ...ids] = selector.split('.');
	

	return h.apply(h, [element + ids.map(id => '.' + styles[id])].concat(args));
};
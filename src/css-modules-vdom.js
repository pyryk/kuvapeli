import {h} from '@cycle/dom';

function classIsReplaced(ignoredClasses, className) {
	return ignoredClasses.indexOf(className) === -1;
}

function getClassName(className, styles, ignoredClasses) {
	return classIsReplaced(ignoredClasses, className) ? ('.' + styles[className]) : ('.' + className);
}


export default (styles, ...ignoredClasses) => function h2(selector, ...args) {
	let [element, ...ids] = selector.split('.');
	

	return h.apply(h, [element + ids.map(id => getClassName(id, styles, ignoredClasses))].concat(args));
};
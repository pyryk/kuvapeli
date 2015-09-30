import Cycle from '@cycle/core';
import CycleDOM from '@cycle/dom';
import styles from './app.css';

function main() {
	return {
		DOM: Cycle.Rx.Observable.interval(1000)
			.startWith(0)
			.map(i => CycleDOM.h(
				`h1.${styles.app}`, '' + (i) + ' sekuntia kulunut'
			))
	};
}

var drivers = {
  DOM: CycleDOM.makeDOMDriver('#app')
};

Cycle.run(main, drivers);